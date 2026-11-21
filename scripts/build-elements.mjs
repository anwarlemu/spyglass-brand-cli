// registry/elements -> apps/www/public/elements: the web component flavor as prebuilt ES modules, served from the
// registry host and copied by `add` into an app's static folder, so a page with no build step needs only brand.css and
// <script type="module" src="/<assetBase>/elements/button.js">.
//
//   elements/shared.js             Lit and registry/elements/lib, loaded once by every element
//   elements/<name>.js             one module per component file (registry/elements/components/<group>/<name>.ts),
//                                  defining <elementPrefix>-<name>; it imports ./shared.js and the modules of the
//                                  elements it renders
//   elements/<name>.d.ts           its types (the element class and HTMLElementTagNameMap)
//   elements/custom-elements.json  the custom elements manifest (attributes, properties, events, slots, parts)
//
// Each element's shadow styles are compiled here with Tailwind 4's compile API: the classes in its own file (scanned
// with Tailwind's scanner) plus a sibling <name>.css, against the brand theme (build/theme.css). The shared base sheet
// is Tailwind's preflight and brand/base.css's element rules (not html or body: the host inherits the page's type).
//
//   node scripts/build-elements.mjs        (the registry build runs it)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, posix, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reg = join(root, 'registry');
const elDir = join(reg, 'elements');
export const elementsOut = join(root, 'apps', 'www', 'public', 'elements');
const brand = JSON.parse(readFileSync(join(root, 'brand', 'brand.json'), 'utf8'));
export const prefix = brand.elementPrefix;

const walk = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])) : []);
/** Every element component file, as { name, file (absolute), path (registry-relative) }. */
export function elementFiles() {
	return walk(join(elDir, 'components'))
		.filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))
		.map((file) => ({ name: basename(file, '.ts'), file, path: posix.join(...relative(reg, file).split(/[\\/]/)) }))
		.sort((a, b) => a.name.localeCompare(b.name));
}
export const tagOf = (name) => `${prefix}-${name}`;

// ----- Tailwind -----

async function tailwind() {
	const { compile, optimize } = await import('@tailwindcss/node');
	const { Scanner } = await import('@tailwindcss/oxide');
	const theme = join(root, 'build', 'theme.css');
	if (!existsSync(theme)) throw new Error('build/theme.css is missing: run `bun run build` first');
	const head = `@layer theme, base, components, utilities;\n@import "tailwindcss/theme.css" layer(theme);\n`;
	const themeImport = `@import "${theme}";\n`;
	const run = async (css, candidates) => {
		const compiler = await compile(css, { base: root, onDependency() {} });
		return compiler.build(candidates);
	};
	const candidatesOf = (text, extension) => new Scanner({ sources: [] }).scanFiles([{ content: text, extension }]);
	return {
		/** The shared base: preflight (minus its :host rule) and the brand's element defaults. */
		async base() {
			const brandBase = readFileSync(join(root, 'brand', 'base.css'), 'utf8')
				.replace(/\/\*[\s\S]*?\*\//g, '')
				.replace(/\n\s*(html|body)\s*\{[^}]*\}/g, '');
			// The scroll fade (fade-y, fade-x), and the same rules for a host that is itself the scroll box: it sets
			// data-fade="y", "x" or "both" on itself (a class on the host belongs to the page).
			const fade = readFileSync(join(root, 'brand', 'fade.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
			const hostFade = fade
				.replace(/@(property|keyframes)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}\n?/g, '')
				.replaceAll('.fade-y.fade-x', ':host([data-fade="both"])')
				.replaceAll('.fade-y', ':host([data-fade="y"])')
				.replaceAll('.fade-x', ':host([data-fade="x"])');
			let css = await run(`${head}@import "tailwindcss/preflight.css" layer(base);\n${themeImport}${brandBase}\n${fade}\n${hostFade}\n`, []);
			// Preflight sets the font, line height and tab size on `html, :host`: on a host that would replace what it inherits
			// from the page, where a Vue or React component inherits it. The host inherits instead.
			css = css.replace(/(^|\n)(\s*)html,\s*:host\s*\{/g, '$1$2html {');
			css += `\n:host { display: contents; }\n:host([hidden]) { display: none !important; }\n`;
			return css;
		},
		/** One element's sheet: its classes and its sibling CSS, compiled against the theme. */
		async element(text, extra) {
			const candidates = candidatesOf(`${text}\n${extra}`, 'ts');
			const css = await run(`${head}@import "tailwindcss/utilities.css" layer(utilities);\n${themeImport}${extra}\n`, candidates);
			return css;
		},
		optimize: (css) => optimize(css, { minify: true }).code,
	};
}

/** Tailwind's @property rules, as CSS.registerProperty definitions (a shadow root ignores @property). */
function properties(css) {
	const out = new Map();
	for (const m of css.matchAll(/@property\s+(--[\w-]+)\s*\{([^}]*)\}/g)) {
		const body = m[2];
		const get = (k) => body.match(new RegExp(`${k}\\s*:\\s*([^;]+)`))?.[1]?.trim();
		const def = { name: m[1], syntax: (get('syntax') ?? '"*"').replace(/^["']|["']$/g, ''), inherits: get('inherits') === 'true' };
		const initial = get('initial-value');
		if (initial !== undefined) def.initialValue = initial;
		out.set(m[1], def);
	}
	return out;
}
const stripProperties = (css) => css.replace(/@property\s+--[\w-]+\s*\{[^}]*\}\s*/g, '').replace(/@layer properties\s*\{[\s\S]*?\n\}\n?/g, '');

// ----- Icons in example markup -----

let lucideNodes;
const pascal = (s) => s.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
/**
 * Example markup names icons as <i data-lucide="key-round" data-size="14" data-stroke-width="1.5" ...></i>; this
 * expands each to the svg lucide-vue-next renders (same attributes and classes), keeping the <i>'s class and aria-*.
 */
export async function expandIcons(html, file = 'example') {
	lucideNodes ??= await import(pathToFileURL(join(root, 'node_modules', 'lucide', 'dist', 'esm', 'lucide.js')).href);
	// data-lucide may come anywhere among the attributes (<i slot="start" data-lucide="search">).
	return html.replace(/<i((?:\s+[\w:-]+(?:="[^"]*")?)*?)\s+data-lucide="([\w-]+)"([^>]*)><\/i>/g, (_, before, name, after) => {
		const rest = `${before}${after}`;
		const node = lucideNodes[pascal(name)];
		if (!node) throw new Error(`${file}: no Lucide icon named ${name}`);
		const attr = (k) => rest.match(new RegExp(`\\s${k}="([^"]*)"`))?.[1];
		const size = attr('data-size') ?? '24';
		// Every other attribute (aria-*, hidden, id, style...) passes to the svg as written.
		const extra = [...rest.matchAll(/\s([\w:-]+)(?:="([^"]*)")?/g)].filter((m) => !/^(data-size|data-stroke-width|class)$/.test(m[1])).map((m) => [m[1], m[2] ?? '']);
		const cls = ['lucide', `lucide-${name}`, attr('class')].filter(Boolean).join(' ');
		const attrs = [`xmlns="http://www.w3.org/2000/svg"`, `width="${size}"`, `height="${size}"`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="${attr('data-stroke-width') ?? '2'}"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `class="${cls}"`, ...extra.map(([k, v]) => (v === '' && k === 'hidden' ? k : `${k}="${v}"`))];
		const children = node.map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}></${tag}>`).join('');
		return `<svg ${attrs.join(' ')}>${children}</svg>`;
	});
}

// ----- Build -----

/** An element's build error in words: an import the shared chunk lacks names the file to add it to. */
export function explainBuildError(path, message) {
	const missing = [...message.matchAll(/No matching export in "shared:[^"]*" for import "([^"]+)"/g)].map((m) => m[1]);
	if (missing.length) return `elements: ${path}: imports ${[...new Set(missing)].join(', ')}, which the shared chunk does not export; add ${missing.length > 1 ? 'them' : 'it'} to registry/elements/lib/index.ts`;
	return `elements: ${path}: ${message}`;
}

/** Builds every element. Returns { names, errors }. */
export async function buildElements({ out = elementsOut } = {}) {
	const errors = [];
	if (!prefix || !/^[a-z][a-z0-9]*$/.test(prefix)) return { names: [], errors: ['brand.json needs an elementPrefix (lowercase letters and digits), the start of every tag name'] };
	const files = elementFiles();
	const seen = new Map();
	for (const f of files) {
		if (seen.has(f.name)) errors.push(`elements: ${f.path} and ${seen.get(f.name)} share the name ${f.name} (tags are <${prefix}-name>)`);
		seen.set(f.name, f.path);
		if (!/^[a-z][a-z0-9-]*$/.test(f.name)) errors.push(`elements: ${f.path} must be kebab-case (the Vue file's name: PixelButton.vue -> pixel-button.ts)`);
	}
	if (errors.length) return { names: [], errors };
	const esbuild = await import('esbuild');
	const tw = await tailwind();
	rmSync(out, { recursive: true, force: true });
	mkdirSync(out, { recursive: true });

	// The base's own @property rules (the scroll fade's) are registered on the document like Tailwind's.
	const baseCss = await tw.base();
	const props = properties(baseCss);
	const base = tw.optimize(stripProperties(baseCss));
	const define = { __DS_PREFIX__: JSON.stringify(prefix) };
	const tsconfigRaw = { compilerOptions: { useDefineForClassFields: false, experimentalDecorators: false, target: 'es2022' } };
	const alias = { '@': reg };

	// One sheet per element file, compiled before bundling so the property registrations are known to the shared chunk.
	const sheets = new Map();
	for (const f of files) {
		const text = readFileSync(f.file, 'utf8');
		const sibling = f.file.replace(/\.ts$/, '.css');
		const extra = existsSync(sibling) ? readFileSync(sibling, 'utf8') : '';
		try {
			const css = await tw.element(text, extra);
			for (const [k, v] of properties(css)) props.set(k, v);
			sheets.set(f.file, tw.optimize(stripProperties(css)));
		} catch (error) {
			errors.push(`elements: ${f.path}: Tailwind: ${error.message}`);
		}
	}
	if (errors.length) return { names: [], errors };

	const cssModule = (css) => `import { unsafeCSS } from 'lit';\nexport default unsafeCSS(${JSON.stringify(css)});\n`;
	const virtuals = () => ({
		name: 'ds-virtual',
		setup(build) {
			build.onResolve({ filter: /^virtual:(tw|ds-base|ds-properties)$/ }, (a) => ({ path: a.path === 'virtual:tw' ? a.importer : a.path, namespace: a.path.slice('virtual:'.length) }));
			build.onLoad({ filter: /.*/, namespace: 'tw' }, (a) => {
				const css = sheets.get(a.path);
				if (css === undefined) return { errors: [{ text: `virtual:tw imported from ${relative(root, a.path)}, which is not an element component file` }] };
				return { contents: cssModule(css), loader: 'js', resolveDir: root };
			});
			build.onLoad({ filter: /.*/, namespace: 'ds-base' }, () => ({ contents: cssModule(base), loader: 'js', resolveDir: root }));
			build.onLoad({ filter: /.*/, namespace: 'ds-properties' }, () => ({ contents: `export default ${JSON.stringify([...props.values()])};`, loader: 'js' }));
		},
	});

	// The shared chunk.
	const common = { bundle: true, format: 'esm', target: 'es2022', minify: true, legalComments: 'none', define, tsconfigRaw, alias, logLevel: 'silent', absWorkingDir: root };
	let sharedExports = [];
	try {
		const r = await esbuild.build({ ...common, entryPoints: { shared: join(elDir, 'lib', 'index.ts') }, outdir: out, plugins: [virtuals()], metafile: true });
		sharedExports = Object.values(r.metafile.outputs).flatMap((o) => o.exports ?? []);
	} catch (error) {
		return { names: [], errors: [`elements: shared chunk: ${error.message}`] };
	}

	// The elements: Lit and the lib come from ./shared.js, other elements from their own modules, icons are inlined.
	const named = sharedExports.filter((n) => n !== 'staticHtml').join(', ');
	const shim = (spec) => (spec === 'static' ? `export { staticHtml as html, unsafeStatic, literal } from './shared.js';` : `export { ${named} } from './shared.js';`);
	const linker = {
		name: 'ds-link',
		setup(build) {
			build.onResolve({ filter: /^(lit|lit\/.*|@lit\/.*|lit-html.*|@\/elements\/lib\/.*)$/ }, (a) => ({ path: a.path === 'lit/static-html.js' ? 'static' : 'all', namespace: 'shared' }));
			build.onLoad({ filter: /.*/, namespace: 'shared' }, (a) => ({ contents: shim(a.path), loader: 'js', resolveDir: out }));
			build.onResolve({ filter: /^\.\/shared\.js$/ }, () => ({ path: './shared.js', external: true }));
			build.onResolve({ filter: /^@\/elements\/components\// }, (a) => {
				if (a.importer && !a.importer.startsWith(join(elDir, 'components')) && a.namespace === 'file') return undefined;
				return { path: `./${basename(a.path).replace(/\.ts$/, '')}.js`, external: true };
			});
		},
	};
	for (const f of files) {
		try {
			await esbuild.build({ ...common, entryPoints: { [f.name]: f.file }, outdir: out, plugins: [virtuals(), linker] });
		} catch (error) {
			errors.push(explainBuildError(f.path, error.message));
		}
	}
	return { names: files.map((f) => f.name), errors };
}

// ----- Manifest and types -----

/** The custom elements manifest (via the analyzer), with each element's tag, and a .d.ts per module. */
export function buildManifest({ out = elementsOut } = {}) {
	const files = elementFiles();
	if (!files.length) {
		writeFileSync(join(out, 'custom-elements.json'), `${JSON.stringify({ schemaVersion: '1.0.0', modules: [] }, null, 2)}\n`);
		return { errors: [] };
	}
	const tmp = join(root, 'node_modules', '.cache', 'ds-cem');
	mkdirSync(tmp, { recursive: true });
	try {
		execFileSync(join(root, 'node_modules', '.bin', 'cem'), ['analyze', '--litelement', '--globs', ...files.map((f) => relative(root, f.file)), '--outdir', relative(root, tmp), '--quiet'], { cwd: root, stdio: 'pipe' });
	} catch (error) {
		return { errors: [`elements: custom elements manifest: ${error.stderr?.toString() || error.message}`] };
	}
	const cem = JSON.parse(readFileSync(join(tmp, 'custom-elements.json'), 'utf8'));
	const byPath = new Map(files.map((f) => [relative(root, f.file), f]));
	const checked = typeProgram(files);
	const modules = [];
	for (const mod of cem.modules) {
		const f = byPath.get(mod.path);
		if (!f) continue;
		const declarations = (mod.declarations ?? []).filter((d) => d.kind === 'class');
		const main = declarations.find((d) => d.customElement || d.superclass);
		if (!main) continue;
		main.customElement = true;
		main.tagName = tagOf(f.name);
		// Private and protected members, and Lit's internals, are not the element's API.
		main.members = (main.members ?? []).filter((m) => m.privacy !== 'private' && m.privacy !== 'protected' && !m.static && !m.name.startsWith('_') && !['internals', 'form'].includes(m.name));
		modules.push({
			kind: 'javascript-module',
			path: `elements/${f.name}.js`,
			declarations: [main],
			exports: [{ kind: 'custom-element-definition', name: main.tagName, declaration: { name: main.name, module: `elements/${f.name}.js` } }],
		});
		// The types first: they also correct the manifest's member types (the analyzer's guesses, such as `array`).
		writeFileSync(join(out, `${f.name}.d.ts`), typesOf(main, f.file, checked));
		// An attribute's type is its field's.
		for (const a of main.attributes ?? []) {
			const field = main.members.find((m) => m.name === a.fieldName);
			if (field?.type) a.type = field.type;
		}
	}
	writeFileSync(join(out, 'custom-elements.json'), `${JSON.stringify({ schemaVersion: '1.0.0', readme: '', modules }, null, 2)}\n`);
	return { errors: [] };
}

// ----- Types -----
// Each element's .d.ts is written from the TypeScript checker, so it carries the types its members really have: a
// field's or method's type as the source declares or infers it, and every type it names (its own, one imported from
// another element or from lib/: Align, ComboOption) declared in the file, so the file stands alone with no import of
// Lit or the library. Types from the DOM are global; anything else outside the registry (Lit's) is unknown.

const require = createRequire(import.meta.url);

/** The checker over every element file, with the registry's compiler options. */
function typeProgram(files) {
	const ts = require('typescript');
	const config = ts.getParsedCommandLineOfConfigFile(join(root, 'tsconfig.registry-elements.json'), {}, { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} });
	const program = ts.createProgram(files.map((f) => f.file), { ...config.options, noEmit: true });
	return { ts, program, checker: program.getTypeChecker() };
}

/** The element's class, its public members' types and the declarations of the types they name. */
function typesOf(decl, file, { ts, program, checker }) {
	const sf = program.getSourceFile(file);
	const cls = sf.statements.find((s) => ts.isClassDeclaration(s) && s.name?.text === decl.name);
	const F = ts.TypeFormatFlags;
	const flags = F.NoTruncation | F.UseAliasDefinedOutsideCurrentScope;
	const inRegistry = (d) => d.getSourceFile().fileName.startsWith(join(root, 'registry'));
	const isLib = (d) => program.isSourceFileDefaultLibrary(d.getSourceFile());
	// Types named in the members, resolved to their declarations, then the types those name, until none are new.
	const wanted = new Map();
	const unknown = new Set();
	const named = (d) => ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d) || ts.isEnumDeclaration(d);
	function addDecl(name, d) {
		if (isLib(d)) return;
		if (!inRegistry(d)) return void unknown.add(name);
		if (wanted.has(name)) return;
		wanted.set(name, d);
		refsIn(d);
	}
	// The types a declaration's text names (`state?: DownloadState`), followed through imports to where they are
	// declared: a union with undefined loses its alias on the type, but not in the source.
	function refsIn(node) {
		node.forEachChild(function inner(n) {
			if (ts.isTypeReferenceNode(n) || ts.isExpressionWithTypeArguments(n)) {
				let sym = checker.getSymbolAtLocation(ts.isTypeReferenceNode(n) ? n.typeName : n.expression);
				if (sym && sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
				const d = sym?.declarations?.[0];
				if (d && named(d)) addDecl(sym.name, d);
			}
			n.forEachChild(inner);
		});
	}
	const visitType = (type) => {
		const seen = new Set();
		const walk = (t) => {
			if (!t || seen.has(t)) return;
			seen.add(t);
			const sym = t.aliasSymbol ?? t.getSymbol();
			const d = sym?.declarations?.[0];
			if (d && !isLib(d) && sym.name !== '__type' && sym.name !== '__object' && sym.name !== '__function' && (ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d) || ts.isClassDeclaration(d) || ts.isEnumDeclaration(d))) {
				addDecl(sym.name, d);
				if (t.aliasTypeArguments) t.aliasTypeArguments.forEach(walk);
				return;
			}
			if (t.isUnion?.() || t.isIntersection?.()) t.types.forEach(walk);
			if (checker.isArrayType?.(t) || checker.isTupleType?.(t)) checker.getTypeArguments(t).forEach(walk);
			for (const sig of t.getCallSignatures?.() ?? []) {
				sig.getParameters().forEach((p) => walk(checker.getTypeOfSymbolAtLocation(p, cls)));
				walk(sig.getReturnType());
			}
			for (const a of t.aliasTypeArguments ?? []) walk(a);
		};
		walk(type);
	};
	const text = (type) => checker.typeToString(type, cls, flags).replace(/import\("[^"]*"\)\./g, '');
	const fields = [];
	const methods = [];
	const classType = checker.getTypeAtLocation(cls);
	for (const m of decl.members) {
		const sym = classType.getProperty(m.name);
		if (!sym) continue;
		const type = checker.getTypeOfSymbolAtLocation(sym, cls);
		for (const d of sym.declarations ?? []) if (inRegistry(d)) refsIn(d);
		if (m.kind === 'method') {
			const sig = type.getCallSignatures()[0];
			if (!sig) continue;
			visitType(type);
			const params = sig.getParameters().map((p) => {
				const pd = p.declarations?.[0];
				const optional = pd && ts.isParameter(pd) && (!!pd.questionToken || !!pd.initializer);
				return `${p.name}${optional ? '?' : ''}: ${text(checker.getTypeOfSymbolAtLocation(p, cls))}`;
			});
			const ret = text(sig.getReturnType());
			m.parameters = sig.getParameters().map((p, i) => ({ ...(m.parameters?.[i] ?? {}), name: p.name, type: { text: params[i].replace(/^[^:]*:\s*/, '') } }));
			m.return = { type: { text: ret } };
			methods.push(`  ${m.name}(${params.join(', ')}): ${ret};`);
		} else {
			visitType(type);
			const t = text(type);
			m.type = { text: t };
			const optional = /\bundefined\b/.test(t) && !!(sym.flags & ts.SymbolFlags.Optional || /\|\s*undefined|undefined\s*\|/.test(t));
			fields.push(`  ${m.name}${optional ? '?' : ''}: ${t};`);
		}
	}
	// A form-associated element (DsFormElement) has the form field API too: its form and its validity, as a native field.
	if (classType.getProperty('internals')) {
		const have = new Set(decl.members.map((m) => m.name));
		const api = [['form', 'HTMLFormElement | null'], ['validity', 'ValidityState'], ['validationMessage', 'string'], ['willValidate', 'boolean']];
		for (const [name, t] of api) if (!have.has(name)) fields.push(`  readonly ${name}: ${t};`);
		for (const name of ['checkValidity', 'reportValidity']) if (!have.has(name)) methods.push(`  ${name}(): boolean;`);
	}
	// The named types, as written in their source (exported here), and stand-ins for those outside the registry.
	const decls = [...wanted].filter(([name]) => name !== decl.name).map(([name, d]) => {
		if (ts.isClassDeclaration(d)) return `export type ${name} = HTMLElement`;
		// An alias built from a value (keyof typeof SIZES) names something the .d.ts does not have: write what it resolves to.
		if (ts.isTypeAliasDeclaration(d) && /\btypeof\b/.test(d.type.getText())) return `export type ${name} = ${checker.typeToString(checker.getTypeAtLocation(d.name), undefined, F.NoTruncation)}`;
		const src = d.getText().replace(/^(export\s+)?(declare\s+)?/, 'export ');
		return src;
	});
	const stand = [...unknown].filter((n) => !wanted.has(n)).map((n) => `export type ${n} = unknown`);
	const events = (decl.events ?? []).map((e) => ` * @fires ${e.name}${e.description ? ` ${e.description}` : ''}`);
	const slots = (decl.slots ?? []).map((s) => ` * @slot ${s.name || '(default)'}${s.description ? ` ${s.description}` : ''}`);
	return `${[...stand, ...decls].map((x) => `${x}\n`).join('')}/**\n * <${decl.tagName}>${decl.description ? `: ${decl.description}` : ''}\n${[...events, ...slots].join('\n')}\n */\nexport declare class ${decl.name} extends HTMLElement {\n${[...fields, ...methods].join('\n')}\n}\ndeclare global {\n  interface HTMLElementTagNameMap {\n    '${decl.tagName}': ${decl.name};\n  }\n}\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
	const { names, errors } = await buildElements();
	if (!errors.length) errors.push(...buildManifest().errors);
	if (errors.length) {
		console.error(errors.join('\n'));
		process.exit(1);
	}
	console.log(`elements: ${names.length} modules -> ${relative(root, elementsOut)}`);
}
