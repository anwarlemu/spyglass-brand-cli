// The React and web component flavors of the registry, for scripts/build-registry.ts. React is the source: each item
// lists its React files (registry/react/components/<group>/<Name>.tsx, hooks, and framework-free registry/lib/*.ts) and
// has examples at registry/react/examples/<item>/<Example>.tsx. Its web components are ported from them:
//
//   elements  registry/elements/components/<group>/<name>.ts (kebab-case of the React file, plus an optional sibling
//             <name>.css), examples at registry/elements/examples/<item>/<Example>.html
//
// A docs entry can name other element files with `elements_files:`. An item has the elements flavor when every file and
// every example of it exists; one with some but not all fails the build (a half port). Items with no port yet are
// reported in the coverage, and --require-all-flavors makes them fail.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, posix } from 'node:path';
import ts from 'typescript';

export type Example = { name: string; label: string; center: boolean; half: boolean };
export type FlavorDoc = { name: string; title: string; type: string; description: string; files: string[]; examples: Example[]; elements_files?: string[] };
type Ctx = { root: string; reg: string; outDir: string; brand: { name: string; registryHost?: string; registryUrl: string; assetBase?: string; elementPrefix?: string }; fail: (msg: string) => void; pinned: (p: string) => string };

const IMPORT = /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

/** The element file that stands for a React component (hooks and lib files have none: they are bundled into it). */
export function elementPath(react: string) {
	const m = react.match(/^react\/components\/(.+)\/(\w+)\.tsx$/);
	return m ? `elements/components/${m[1]}/${kebab(m[2])}.ts` : undefined;
}

/** The class lists in a file: class and className attribute values (a string, or the expression in {...} or ${...}),
 * `class:` and `className:` properties, and the arguments of cn(), clsx() and classMap(). */
export function classContexts(text: string): string[] {
	// The expression that starts at `i` (a string, a template literal or a bracketed expression), to its end.
	const expressionAt = (i: number) => {
		const stack: string[] = []
		for (let j = i; j < text.length; j++) {
			const c = text[j]!
			const top = stack.at(-1)
			if (top === '`' || top === '"' || top === "'") {
				if (c === '\\') j++
				else if (c === top) {
					stack.pop()
					if (!stack.length) return text.slice(i, j + 1)
				}
				else if (top === '`' && c === '$' && text[j + 1] === '{') {
					stack.push('}')
					j++
				}
				continue
			}
			if (c === '`' || c === '"' || c === "'") stack.push(c)
			else if (c === '{') stack.push('}')
			else if (c === '(') stack.push(')')
			else if (c === '[') stack.push(']')
			else if (c === '}' || c === ')' || c === ']') {
				if (top !== c) return text.slice(i, j)
				stack.pop()
				if (!stack.length) return text.slice(i, j + 1)
			}
		}
		return text.slice(i)
	}
	const starts = [
		...text.matchAll(/\b(?:class|className)\s*=\s*\$?(?=["'{])/g),
		...text.matchAll(/\b(?:class|className)\s*:\s*(?=["'`([])/g),
		...text.matchAll(/\b(?:cn|clsx|classMap)\s*(?=\()/g),
	]
	return starts.map((m) => expressionAt((m.index ?? 0) + m[0].length)).filter(Boolean)
}

/** A class name with an interpolation glued to it (`bg-surface${x}`), which Tailwind's scanner cannot see: the text
 * around it, or undefined. Only class lists count (classContexts): an id or a prefix (`card-${id}`), a React key, an
 * SVG path or a comment is fine. */
export function gluedInterpolation(text: string) {
	for (const part of classContexts(text)) {
		const m = part.match(/[a-z0-9\]%]\$\{/)
		if (m) return part.slice(Math.max(0, (m.index ?? 0) - 24), (m.index ?? 0) + 3)
	}
	return undefined
}

/** Whether a React file needs 'use client': it calls a hook other than useId (fine on the server) or portals. */
export function needsUseClient(text: string) {
	const code = text.replace(/\/\/.*$/gm, '');
	return /\buse(?!Id\b)(State|Effect|LayoutEffect|Ref|Reducer|Callback|Memo|Context|Transition|SyncExternalStore|ImperativeHandle|Controllable|[A-Z]\w*)\s*[(<]/.test(code) || /\bcreatePortal\b/.test(code);
}

/** An example is the page's root: a function it writes for an event prop cannot cross from the server, so it is a client file. */
export function exampleNeedsUseClient(path: string, text: string) {
	return path.startsWith('react/examples/') && /\son[A-Z]\w*=\{/.test(text.replace(/\/\/.*$/gm, '')) && !/^\s*['"]use client['"]/.test(text);
}

export type ReactFlavor = { files: Array<{ path: string; content: string; target?: string }>; dependencies: string[]; registryDependencies: string[]; api?: ReactApi; examples: Array<Example & { path: string; content: string; registryDependencies: string[]; dependencies: string[] }> };
export type ElementsFlavor = { files: Array<{ path: string; content: string; target?: string }>; modules: string[]; tag: string; tags: string[]; dependencies: string[]; registryDependencies: string[]; api?: ElementsApi; examples: Array<Example & { path: string; content: string }> };
export type ReactApi = { components: Array<{ name: string; file: string; props: Array<{ name: string; type: string; required: boolean; default?: string; description?: string }>; extends?: string[] }> };
export type ElementsApi = { elements: Array<{ tag: string; name: string; module: string; description?: string; attributes: Array<{ name: string; field?: string; type?: string; default?: string; description?: string }>; properties: Array<{ name: string; type?: string; default?: string; description?: string; attribute?: string }>; events: Array<{ name: string; description?: string }>; slots: Array<{ name: string; description?: string }>; methods: Array<{ name: string; description?: string }> }> };

export async function buildFlavors(docs: FlavorDoc[], ctx: Ctx) {
	const { reg, fail } = ctx;
	const read = (p: string) => readFileSync(join(reg, p), 'utf8');
	const exists = (p: string) => existsSync(join(reg, p));

	// ----- React -----
	const reactOwner = new Map<string, string>();
	const reactFilesOf = new Map<string, string[]>();
	for (const d of docs) {
		const files = d.files;
		reactFilesOf.set(d.name, files);
		for (const f of files) reactOwner.set(f, d.name);
	}
	const resolveReact = (from: string, spec: string) => {
		const target = spec.slice(2);
		const hit = [target, `${target}.tsx`, `${target}.ts`, `${target}/index.tsx`, `${target}/index.ts`].find(exists);
		if (!hit) fail(`${from}: cannot resolve ${spec}`);
		return hit;
	};
	function reactClosure(entries: string[], self: string) {
		const files = new Set<string>();
		const requires = new Set<string>();
		const packages = new Set<string>();
		const queue = [...entries];
		while (queue.length) {
			const f = queue.shift()!;
			if (files.has(f)) continue;
			const own = reactOwner.get(f);
			if (own && own !== self) {
				requires.add(own);
				continue;
			}
			files.add(f);
			for (const m of read(f).matchAll(IMPORT)) {
				const spec = m[1];
				if (spec.startsWith('@/react/') || spec.startsWith('@/lib/')) {
					const hit = resolveReact(f, spec);
					if (hit) queue.push(hit);
				} else if (spec.startsWith('@/')) fail(`${f}: imports ${spec}; React files import only @/react/... and @/lib/... (framework-free)`);
				else if (spec.startsWith('.')) fail(`${f}: relative import ${spec}; use @/react/... so add can place it`);
				else if (!/^react(-dom)?(\/|$)/.test(spec)) packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
			}
		}
		return { files: [...files], requires: [...requires].sort(), packages: [...packages].sort() };
	}
	const glued = (f: string, text: string) => {
		const hit = gluedInterpolation(text)
		if (hit) fail(`${f}: \`${hit}\` glues an interpolation to a class name, which Tailwind's scanner cannot read; put a space before it or join an array of whole class names`);
	};
	function checkReactFile(f: string) {
		const text = read(f);
		if (/from\s+['"]next\//.test(text)) fail(`${f}: imports Next.js; components take data through props and work in any React app`);
		if (/from\s+['"]vue['"]/.test(text)) fail(`${f}: imports vue`);
		if (f.startsWith('lib/') && /from\s+['"](react|lit|lucide)/.test(text)) fail(`${f}: lib/ files are framework-free (both flavors import them)`);
		if (needsUseClient(text) && !/^\s*['"]use client['"]/.test(text)) fail(`${f}: uses hooks; start it with 'use client' so it works in Next's App Router`);
		if (exampleNeedsUseClient(f, text)) fail(`${f}: an example that writes an event handler (onClick={...}) is rendered on the server unless it starts with 'use client'`);
		glued(f, text);
		if (f.startsWith('react/components/') && !/(\sdata-ds=["{]|['"]data-ds['"]\s*:)/.test(text)) fail(`${f}: its root element needs data-ds="<name>" (the scoped base styles the library by it)`);
	}

	// ----- Elements -----
	const { buildElements, buildManifest, expandIcons, elementFiles, elementsOut, prefix } = await import('./build-elements.mjs');
	const elementOwner = new Map<string, string>();
	const elementFilesOf = new Map<string, string[]>();
	for (const d of docs) {
		const files = d.elements_files ?? d.files.map(elementPath).filter((p): p is string => !!p);
		elementFilesOf.set(d.name, files);
		for (const f of files) elementOwner.set(f, d.name);
	}
	const allElements = elementFiles() as Array<{ name: string; path: string }>;
	for (const f of allElements) if (!elementOwner.has(f.path)) fail(`${f.path} belongs to no item (name it after the React file it ports, or list it in a docs entry's elements_files)`);
	for (const f of reactFilesOfAll()) if (!reactOwner.has(f)) fail(`${f} belongs to no item (add it to a docs entry's files)`);
	function reactFilesOfAll() {
		const walk = (dir: string): string[] => (exists(dir) ? readdirSync(join(reg, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(posix.join(dir, e.name)) : [posix.join(dir, e.name)])) : []);
		return walk('react/components').filter((f) => f.endsWith('.tsx'));
	}

	const built = await buildElements();
	for (const e of built.errors) fail(e);
	let manifest: { modules: Array<{ path: string; declarations: Array<Record<string, any>> }> } = { modules: [] };
	if (!built.errors.length) {
		for (const e of buildManifest().errors) fail(e);
		const mf = join(elementsOut, 'custom-elements.json');
		if (existsSync(mf)) manifest = JSON.parse(readFileSync(mf, 'utf8'));
	}
	const moduleOf = (path: string) => `elements/${posix.basename(path, '.ts')}.js`;
	function elementClosure(entries: string[], self: string) {
		const files = new Set<string>();
		const requires = new Set<string>();
		const modules = new Set<string>(['elements/shared.js']);
		const queue = [...entries];
		while (queue.length) {
			const f = queue.shift()!;
			if (files.has(f)) continue;
			const own = elementOwner.get(f);
			if (own && own !== self) {
				requires.add(own);
				modules.add(moduleOf(f));
				// The other element's own imports load with it.
				for (const m of read(f).matchAll(IMPORT)) if (m[1].startsWith('@/elements/components/')) queue.push(`${m[1].slice(2).replace(/\.ts$/, '')}.ts`);
				continue;
			}
			files.add(f);
			if (f.startsWith('elements/components/')) modules.add(moduleOf(f));
			const css = f.replace(/\.ts$/, '.css');
			if (f.endsWith('.ts') && exists(css)) files.add(css);
			if (!f.endsWith('.ts')) continue;
			for (const m of read(f).matchAll(IMPORT)) {
				const spec = m[1];
				if (spec.startsWith('@/elements/lib/')) continue; // in shared.js
				if (spec.startsWith('@/lib/')) continue; // framework-free, bundled into the module
				if (spec.startsWith('@/elements/')) {
					const t = spec.slice(2).replace(/\.ts$/, '');
					const hit = [`${t}.ts`, `${t}/index.ts`].find(exists);
					if (!hit) fail(`${f}: cannot resolve ${spec}`);
					else queue.push(hit);
				} else if (spec.startsWith('@/')) fail(`${f}: imports ${spec}; element files import only @/elements/... and @/lib/...`);
				else if (spec.startsWith('.')) fail(`${f}: relative import ${spec}; use @/elements/...`);
				else if (!/^(lit|lit\/.*|lucide|virtual:.*)$/.test(spec)) fail(`${f}: imports ${spec}; elements bundle only Lit (in shared.js) and Lucide icons`);
			}
		}
		return { files: [...files], requires: [...requires].sort(), modules: [...modules] };
	}
	function elementsApi(files: string[]): ElementsApi {
		const elements: ElementsApi['elements'] = [];
		for (const f of files.filter((p) => p.endsWith('.ts'))) {
			const mod = manifest.modules.find((m) => m.path === moduleOf(f));
			const d = mod?.declarations[0];
			if (!d) continue;
			const fields = (d.members ?? []).filter((m: any) => m.kind === 'field');
			elements.push({
				tag: d.tagName,
				name: d.name,
				module: moduleOf(f),
				description: d.summary || d.description || undefined,
				attributes: (d.attributes ?? []).map((a: any) => ({ name: a.name, field: a.fieldName, type: a.type?.text, default: a.default, description: a.description })),
				properties: fields.map((m: any) => ({ name: m.name, type: m.type?.text, default: m.default, description: m.description, attribute: m.attribute })),
				events: (d.events ?? []).map((e: any) => ({ name: e.name, description: e.description })),
				slots: (d.slots ?? []).map((s: any) => ({ name: s.name, description: s.description })),
				methods: (d.members ?? []).filter((m: any) => m.kind === 'method').map((m: any) => ({ name: m.name, description: m.description })),
			});
		}
		return { elements };
	}

	// ----- Per item -----
	const react = new Map<string, ReactFlavor>();
	const elements = new Map<string, ElementsFlavor>();
	for (const d of docs) {
		// React
		const rFiles = reactFilesOf.get(d.name)!;
		const rHave = rFiles.filter(exists);
		const rExamples = d.examples.map((e) => `react/examples/${d.name}/${e.name}.tsx`);
		const rExHave = rExamples.filter(exists);
		if (rHave.length || rExHave.length) {
			const missing = [...rFiles, ...rExamples].filter((p) => !exists(p));
			if (missing.length) fail(`${d.name}: half ported to React; missing ${missing.join(', ')}`);
			else {
				const c = reactClosure(rFiles, d.name);
				c.files.forEach(checkReactFile);
				const examples = d.examples.map((e) => {
					const path = `react/examples/${d.name}/${e.name}.tsx`;
					checkReactFile(path);
					const ec = reactClosure([path], d.name);
					return { ...e, path, content: read(path), registryDependencies: ec.requires, dependencies: ec.packages.map(ctx.pinned) };
				});
				react.set(d.name, { files: c.files.map((path) => ({ path, content: read(path) })), dependencies: c.packages.map(ctx.pinned), registryDependencies: c.requires, api: reactApi(rFiles.filter((f) => f.endsWith('.tsx')), read), examples });
			}
		}
		const exDir = join(reg, 'react', 'examples', d.name);
		if (existsSync(exDir)) for (const f of readdirSync(exDir)) if (!d.examples.some((e) => `${e.name}.tsx` === f)) fail(`${d.name}: react/examples/${d.name}/${f} is not one of its docs' examples`);

		// Elements
		const eFiles = elementFilesOf.get(d.name)!;
		const eExamples = d.examples.map((e) => `elements/examples/${d.name}/${e.name}.html`);
		const eHave = eFiles.filter(exists);
		const eExHave = eExamples.filter(exists);
		if (eHave.length || eExHave.length) {
			const missing = [...eFiles, ...eExamples].filter((p) => !exists(p));
			if (missing.length) fail(`${d.name}: half ported to web components; missing ${missing.join(', ')}`);
			else {
				for (const f of eFiles) {
					const name = posix.basename(f, '.ts');
					const text = read(f);
					if (!new RegExp(`define\\(\\s*['"]${name}['"]`).test(text)) fail(`${f}: must define('${name}', ...) (the tag is <${prefix}-${name}>)`);
					glued(f, text);
					const css = f.replace(/\.ts$/, '.css');
					const hostIsRoot = exists(css) && /(^|\n)\s*:host\s*\{/.test(read(css));
					// A subclass of another element (<conare-select> extends <conare-combobox>) draws its parent's template.
					const subclass = /from\s+['"]@\/elements\/components\//.test(text) && /\bclass\s+\w+\s+extends\s+(?!Ds(Form)?Element\b)\w+/.test(text)
					// A root drawn by another element names itself through that element's rootName (.rootName=${'searches-page'}).
					if (!/\sdata-ds=["']|\.rootName=/.test(text) && !hostIsRoot && !subclass) fail(`${f}: its shadow root's root element needs data-ds="<name>" as the React file's has (or the host is the root: style :host in ${posix.basename(css)})`);
				}
				const c = elementClosure(eFiles, d.name);
				const tags = eFiles.map((f) => `${prefix}-${posix.basename(f, '.ts')}`);
				const examples = [];
				for (const e of d.examples) {
					const path = `elements/examples/${d.name}/${e.name}.html`;
					const raw = read(path);
					for (const m of raw.matchAll(new RegExp(`<(${prefix}-[a-z0-9-]+)`, 'g'))) {
						const used = m[1].slice(prefix.length + 1);
						if (!allElements.some((x) => x.name === used)) fail(`${path}: <${m[1]}> is not an element`);
					}
					let content = raw;
					try {
						content = await expandIcons(raw, path);
					} catch (error) {
						fail((error as Error).message);
					}
					examples.push({ ...e, path, content });
				}
				// The modules an example page needs: the item's, and those of the elements its examples use.
				const modules = new Set(c.modules);
				for (const ex of examples) for (const m of ex.content.matchAll(new RegExp(`<${prefix}-([a-z0-9-]+)`, 'g'))) {
					const f = allElements.find((x) => x.name === m[1]);
					if (f && !modules.has(moduleOf(f.path))) modules.add(moduleOf(f.path));
				}
				elements.set(d.name, {
					files: c.files.map((path) => ({ path, content: read(path) })),
					modules: [...modules],
					tag: tags.find((t) => t === `${prefix}-${d.name}`) ?? tags[0],
					tags,
					dependencies: [],
					registryDependencies: c.requires,
					api: elementsApi(eFiles),
					examples,
				});
			}
		}
		const eDir = join(reg, 'elements', 'examples', d.name);
		if (existsSync(eDir)) for (const f of readdirSync(eDir)) if (!d.examples.some((e) => `${e.name}.html` === f)) fail(`${d.name}: elements/examples/${d.name}/${f} is not one of its docs' examples`);
	}

	// ----- shadcn-style registries: /r/react/<item>.json and /r/elements/<item>.json -----
	const host = ctx.brand.registryHost ?? ctx.brand.registryUrl;
	const assetBase = ctx.brand.assetBase ?? '/ds';
	const toApp = (text: string) => text.replace(/(['"])@\/react\/(components|hooks|lib)\//g, '$1@/$2/');
	const reactType = (p: string) => (p.startsWith('react/hooks/') ? 'registry:hook' : p.startsWith('react/lib/') || p.startsWith('lib/') ? 'registry:lib' : 'registry:ui');
	mkdirSync(join(ctx.outDir, 'react'), { recursive: true });
	mkdirSync(join(ctx.outDir, 'elements'), { recursive: true });
	const reactIndex: unknown[] = [];
	const elementsIndex: unknown[] = [];
	for (const d of docs) {
		const r = react.get(d.name);
		if (r) {
			const files = r.files.map((f) => ({ path: f.path.replace(/^react\//, ''), type: reactType(f.path), content: toApp(f.content) }));
			const item = { $schema: 'https://ui.shadcn.com/schema/registry-item.json', name: d.name, type: d.type, title: d.title, description: d.description, dependencies: r.dependencies, registryDependencies: r.registryDependencies.map((x) => `${host}/r/react/${x}.json`), files };
			writeFileSync(join(ctx.outDir, 'react', `${d.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
			reactIndex.push({ ...item, files: files.map((f) => ({ path: f.path, type: f.type })) });
		}
		const e = elements.get(d.name);
		if (e) {
			const files = e.modules.flatMap((m) => {
				const base = posix.basename(m, '.js');
				const content = builtModule(elementsOut, base, d.name, fail);
				if (content === undefined) return [];
				const out = [{ path: m, type: 'registry:file', target: `public${assetBase}/${m}`, content }];
				const dts = join(elementsOut, `${base}.d.ts`);
				if (existsSync(dts)) out.push({ path: m.replace(/\.js$/, '.d.ts'), type: 'registry:file', target: `public${assetBase}/${m.replace(/\.js$/, '.d.ts')}`, content: readFileSync(dts, 'utf8') });
				return out;
			});
			const item = { $schema: 'https://ui.shadcn.com/schema/registry-item.json', name: d.name, type: 'registry:item', title: d.title, description: d.description, dependencies: [], registryDependencies: e.registryDependencies.map((x) => `${host}/r/elements/${x}.json`), files, meta: { tag: e.tag, tags: e.tags, modules: e.modules } };
			writeFileSync(join(ctx.outDir, 'elements', `${d.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
			elementsIndex.push({ ...item, files: files.map((f) => ({ path: f.path, type: f.type, target: f.target })) });
		}
	}
	const registryIndex = (items: unknown[], flavor: string) => ({ $schema: 'https://ui.shadcn.com/schema/registry.json', name: `${ctx.brand.name.toLowerCase()}-${flavor}`, homepage: ctx.brand.registryUrl, items });
	writeFileSync(join(ctx.outDir, 'react', 'index.json'), `${JSON.stringify(registryIndex(reactIndex, 'react'), null, 2)}\n`);
	writeFileSync(join(ctx.outDir, 'elements', 'index.json'), `${JSON.stringify(registryIndex(elementsIndex, 'elements'), null, 2)}\n`);

	return { react, elements, coverage: { total: docs.length, react: react.size, elements: elements.size, missing: { react: docs.filter((d) => !react.has(d.name)).map((d) => d.name), elements: docs.filter((d) => !elements.has(d.name)).map((d) => d.name) } }, elementPrefix: prefix };
}

/** A built element module's code, or undefined (with the reason) when its build failed: the build's own error says why,
 * and the item's JSON is not written from a missing file. */
export function builtModule(outDir: string, base: string, item: string, fail: (message: string) => void) {
	const file = join(outDir, `${base}.js`);
	if (!existsSync(file)) {
		fail(`${item}: elements/${base}.js was not built (see the elements error above for why)`);
		return undefined;
	}
	return readFileSync(file, 'utf8');
}

/** Each exported component's props, read with the TypeScript compiler: name, type, required, default, description. */
function reactApi(files: string[], read: (p: string) => string): ReactApi {
	const components: ReactApi['components'] = [];
	for (const file of files) {
		const text = read(file);
		const sf = ts.createSourceFile(file, text, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TSX);
		const types = new Map<string, ts.InterfaceDeclaration | ts.TypeAliasDeclaration>();
		sf.forEachChild((n) => {
			if (ts.isInterfaceDeclaration(n) || ts.isTypeAliasDeclaration(n)) types.set(n.name.text, n);
		});
		const doc = (n: ts.Node) => ts.getJSDocCommentsAndTags(n).map((j) => (typeof j.comment === 'string' ? j.comment : '')).join(' ').trim() || undefined;
		sf.forEachChild((n) => {
			if (!ts.isFunctionDeclaration(n) || !n.name || !n.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) || !/^[A-Z]/.test(n.name.text)) return;
			const param = n.parameters[0];
			const props: ReactApi['components'][number]['props'] = [];
			const defaults = new Map<string, string>();
			if (param && ts.isObjectBindingPattern(param.name)) for (const el of param.name.elements) if (el.initializer && ts.isIdentifier(el.name)) defaults.set(el.name.text, el.initializer.getText(sf));
			let ext: string[] | undefined;
			const t = param?.type;
			const addMembers = (members: ts.NodeArray<ts.TypeElement>) => {
				for (const m of members) if (ts.isPropertySignature(m) && m.name) {
					const name = m.name.getText(sf).replace(/^['"]|['"]$/g, '');
					if (name === 'ref') continue;
					props.push({ name, type: m.type?.getText(sf) ?? 'unknown', required: !m.questionToken, default: defaults.get(name), description: doc(m) });
				}
			};
			if (t && ts.isTypeReferenceNode(t)) {
				const decl = types.get(t.typeName.getText(sf));
				if (decl && ts.isInterfaceDeclaration(decl)) {
					addMembers(decl.members);
					ext = decl.heritageClauses?.flatMap((h) => h.types.map((x) => x.getText(sf)));
				} else if (decl && ts.isTypeAliasDeclaration(decl) && ts.isTypeLiteralNode(decl.type)) addMembers(decl.type.members);
			} else if (t && ts.isTypeLiteralNode(t)) addMembers(t.members);
			components.push({ name: n.name.text, file, props, ...(ext?.length ? { extends: ext } : {}) });
		});
	}
	return { components };
}
