// registry/ -> apps/www/public/r (one JSON per item and index.json) and apps/www/lib/registry.generated.json (what
// the docs site lists). React is the source: each item's docs entry lists its React files (and the framework-free
// registry/lib files it owns), its examples are registry/react/examples/<item>/<Example>.tsx, and its web components
// are ported from them (scripts/registry-flavors.ts, scripts/build-elements.mjs). The build validates every item,
// derives its files, requires and packages from its imports, writes shadcn-style registries at /r/react/ and
// /r/elements/, the prebuilt element modules at apps/www/public/elements, runs the value check over the whole library
// and type-checks both flavors. Any problem fails the build.
//
//   bun scripts/build-registry.ts                        build, check and type-check
//   bun scripts/build-registry.ts --no-tsc               skip the type checks (faster while iterating)
//   bun scripts/build-registry.ts --require-all-flavors  fail unless every item has its web component port (release)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkText, formatFinding } from '../src/check/engine.ts';
import { buildFlavors } from './registry-flavors.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const reg = join(root, 'registry');
const outDir = join(root, 'apps', 'www', 'public', 'r');
const brand = JSON.parse(readFileSync(join(root, 'brand', 'brand.json'), 'utf8'));
const errors: string[] = [];
// Packages are pinned to the ranges this repository builds and type-checks against.
const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const ranges: Record<string, string> = { ...rootPkg.dependencies, ...rootPkg.devDependencies };
const pinned = (p: string) => (ranges[p] ? `${p}@${ranges[p]}` : p);
const fail = (msg: string) => errors.push(msg);

type Example = { name: string; label: string; center: boolean; half: boolean };
type Doc = { name: string; title: string; type: string; group: string; description: string; use_for: string; never: string[]; source: string; files: string[]; examples: Example[]; body: string; elements_files?: string[] };

/** The frontmatter this registry writes: `key: value` (plain or JSON-quoted) and `key:` followed by `  - item` lines. */
function frontmatter(text: string, file: string): Record<string, string | string[]> & { body: string } {
	const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) throw new Error(`${file}: no frontmatter`);
	const out: Record<string, string | string[]> = {};
	let list: string[] | undefined;
	const value = (v: string) => (v.startsWith('"') ? JSON.parse(v) : v);
	for (const line of m[1].split('\n')) {
		const item = line.match(/^\s+-\s+(.*)$/);
		if (item && list) list.push(value(item[1].trim()));
		else {
			const kv = line.match(/^([\w-]+):\s*(.*)$/);
			if (!kv) continue;
			if (kv[2] === '') out[kv[1]] = list = [];
			else {
				out[kv[1]] = value(kv[2].trim());
				list = undefined;
			}
		}
	}
	return Object.assign(out, { body: m[2].trim() });
}

const docs: Doc[] = readdirSync(join(reg, 'docs'))
	.filter((f) => f.endsWith('.md'))
	.sort()
	.map((f) => {
		const fm = frontmatter(readFileSync(join(reg, 'docs', f), 'utf8'), f);
		const name = f.slice(0, -3);
		for (const key of ['name', 'title', 'type', 'group', 'description', 'use_for', 'source']) if (typeof fm[key] !== 'string' || !fm[key]) fail(`docs/${f}: \`${key}\` is missing`);
		if (fm.name !== name) fail(`docs/${f}: name \`${fm.name}\` does not match the file`);
		if (!brand.groups[fm.group as string]) fail(`docs/${f}: group \`${fm.group}\` is not one of ${Object.keys(brand.groups).join(', ')}`);
		const examples = ((fm.examples as string[]) ?? []).map((e) => {
			const [ex, label, opts = ''] = e.split('|').map((s) => s.trim());
			return { name: ex, label: label || ex, center: /\bcenter\b/.test(opts), half: /\bhalf\b/.test(opts) };
		});
		return { name, title: fm.title as string, type: fm.type as string, group: fm.group as string, description: fm.description as string, use_for: fm.use_for as string, never: (fm.never as string[]) ?? [], source: fm.source as string, files: (fm.files as string[]) ?? [], examples, body: fm.body, elements_files: fm.elements_files as string[] | undefined };
	});

// Which item owns which file: its React components and hooks, and the framework-free lib files it lists.
const owner = new Map<string, string>();
for (const d of docs) {
	if (!d.files.length) fail(`${d.name}: lists no files`);
	for (const f of d.files) {
		if (!/^(react\/(components|hooks)\/|lib\/)/.test(f)) fail(`${d.name}: ${f} is not a React file (react/components/, react/hooks/) or a lib file (lib/)`);
		if (!existsSync(join(reg, f))) fail(`${d.name}: ${f} does not exist`);
		if (owner.has(f)) fail(`${f} is listed by both ${owner.get(f)} and ${d.name}`);
		owner.set(f, d.name);
	}
}
const walk = (dir: string): string[] => (existsSync(join(reg, dir)) ? readdirSync(join(reg, dir), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(posix.join(dir, e.name)) : [posix.join(dir, e.name)])) : []);
for (const f of walk('lib')) if (!owner.has(f)) fail(`${f} belongs to no item (list it in the files of the item that owns it)`);

const IMPORT = /(?:^|\n)\s*(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g;
// The docs site renders the library's source on the server, where `typeof window` is folded away; feature checks go
// through globalThis instead.
const TYPEOF_GLOBAL = /\btypeof\s+(window|document)\b/;
function guardGlobals(path: string, text: string) {
	const m = text.match(TYPEOF_GLOBAL);
	if (m) fail(`${path}: uses \`${m[0]}\`; check through globalThis instead (\`globalThis.matchMedia\`, \`'IntersectionObserver' in globalThis\`) or inside an effect`);
}
const APP_ONLY = /from\s+['"](next\/|@clerk\/|@vercel\/analytics)|\b(useRouter|usePathname|useSearchParams|getServerSession)\b/;

/** Files, required items and packages of a set of entry files, following @/react/ and @/lib/ imports. */
function closure(entries: string[], self?: string) {
	const files = new Set<string>();
	const requires = new Set<string>();
	const packages = new Set<string>();
	const queue = [...entries];
	while (queue.length) {
		const f = queue.shift()!;
		if (files.has(f)) continue;
		const own = owner.get(f);
		if (own && own !== self) {
			requires.add(own);
			continue;
		}
		files.add(f);
		const text = readFileSync(join(reg, f), 'utf8');
		for (const m of text.matchAll(IMPORT)) {
			const spec = m[1];
			if (spec.startsWith('@/')) {
				const target = spec.slice(2);
				const resolved = [target, `${target}.tsx`, `${target}.ts`, `${target}/index.ts`].find((p) => existsSync(join(reg, p)));
				if (!resolved) fail(`${f}: cannot resolve ${spec}`);
				else queue.push(resolved);
			} else if (spec.startsWith('.')) fail(`${f}: relative import ${spec}; use @/react/... or @/lib/... so add can place it`);
			else if (!/^react(-dom)?(\/|$)/.test(spec)) packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
		}
	}
	return { files: [...files], requires: [...requires].sort(), packages: [...packages].sort() };
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const flavors = await buildFlavors(docs, { root, reg, outDir, brand, fail, pinned });
const index: unknown[] = [];
const site: unknown[] = [];
let checked = 0;
for (const d of docs) {
	const { files, requires, packages } = closure(d.files, d.name);
	for (const f of files) {
		const text = readFileSync(join(reg, f), 'utf8');
		if (APP_ONLY.test(text)) fail(`${f}: uses app-only code (${text.match(APP_ONLY)?.[0]}); components take data through props`);
		guardGlobals(f, text);
	}
	const exDir = join(reg, 'react', 'examples', d.name);
	const exFiles = existsSync(exDir) ? readdirSync(exDir).filter((f) => f.endsWith('.tsx')).map((f) => f.slice(0, -4)) : [];
	if (!exFiles.length) fail(`${d.name}: has no example in react/examples/${d.name}/`);
	if (!d.examples.length) fail(`${d.name}: its docs list no examples`);
	for (const e of d.examples) if (!exFiles.includes(e.name)) fail(`${d.name}: example ${e.name} is listed but react/examples/${d.name}/${e.name}.tsx does not exist`);
	for (const e of exFiles) if (!d.examples.some((x) => x.name === e)) fail(`${d.name}: react/examples/${d.name}/${e}.tsx is not listed in its docs`);
	const examples = d.examples.filter((e) => exFiles.includes(e.name)).map((e) => {
		const path = `react/examples/${d.name}/${e.name}.tsx`;
		const c = closure([path], d.name);
		const content = readFileSync(join(reg, path), 'utf8');
		guardGlobals(path, content);
		if (/\b(Huel|rhode|Olipop|AG1|Represent|KHY|Lauren)\b/.test(content)) fail(`${path}: names a real brand or person; examples use Acme`);
		return { ...e, path, content, requires: c.requires, packages: c.packages };
	});
	const react = flavors.react.get(d.name);
	const elements = flavors.elements.get(d.name);
	const item = {
		name: d.name, title: d.title, type: d.type, group: d.group, description: d.description, use_for: d.use_for, never: d.never, source: d.source, body: d.body,
		requires, dependencies: packages.map(pinned),
		files: files.map((path) => ({ path, content: readFileSync(join(reg, path), 'utf8') })),
		examples,
		flavors: { ...(react ? { react } : {}), ...(elements ? { elements } : {}) },
	};
	writeFileSync(join(outDir, `${d.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
	const flavorList = [...(react ? ['react'] : []), ...(elements ? ['elements'] : [])];
	const { flavors: _full, ...listed } = item;
	index.push({ ...listed, files, examples: d.examples.map((e) => e.name), flavors: flavorList });
	site.push({
		name: d.name, title: d.title, group: d.group, description: d.description, use_for: d.use_for, never: d.never, source: d.source, body: d.body, requires, dependencies: packages, files, examples: d.examples,
		api: react?.api,
		flavors: {
			...(react ? { react: { files: react.files.map((f) => f.path) } } : {}),
			...(elements ? { elements: { files: elements.files.map((f) => f.path), tag: elements.tag, tags: elements.tags, modules: elements.modules, requires: elements.registryDependencies } } : {}),
		},
	});
}
const coverage = { total: docs.length, react: flavors.coverage.react, elements: flavors.coverage.elements };
writeFileSync(join(outDir, 'index.json'), `${JSON.stringify({ name: brand.name, registryUrl: brand.registryUrl, registryHost: brand.registryHost ?? brand.registryUrl, elementPrefix: flavors.elementPrefix, coverage, items: index }, null, 2)}\n`);
if (existsSync(join(root, 'apps', 'www', 'lib'))) writeFileSync(join(root, 'apps', 'www', 'lib', 'registry.generated.json'), `${JSON.stringify({ name: brand.name, groups: brand.groups, elementPrefix: flavors.elementPrefix, assetBase: brand.assetBase, coverage, items: site }, null, 2)}\n`);
for (const n of flavors.coverage.missing.react) fail(`${n}: its React files or examples are missing`);
if (process.argv.includes('--require-all-flavors')) for (const n of flavors.coverage.missing.elements) fail(`${n}: has no web component port (registry/elements/)`);

// The value check over the whole library: components, hooks, lib files, examples and element styles.
for (const f of walk('.').filter((p) => /\.(ts|tsx|css|html)$/.test(p) && !p.endsWith('.d.ts'))) {
	const { findings } = checkText(`registry/${f}`, readFileSync(join(reg, f), 'utf8'));
	checked++;
	// Each flavor's Lucide: lucide-react in the React files, lucide's icon nodes in the elements.
	const lucide = f.startsWith('react/') ? /^lucide-react\b/ : f.startsWith('elements/') ? /^lucide\b(?!-)/ : null;
	for (const x of findings) if (!(lucide && x.rule === 'icon-pack' && lucide.test(x.snippet))) fail(formatFinding(x));
}

if (!process.argv.includes('--no-tsc') && !errors.length) {
	for (const config of ['tsconfig.registry-react.json', 'tsconfig.registry-elements.json']) {
		try {
			execFileSync(join(root, 'node_modules', '.bin', 'tsc'), ['--noEmit', '-p', join(root, config)], { cwd: root, stdio: 'pipe' });
		} catch (error) {
			const e = error as { stdout?: Buffer; stderr?: Buffer };
			fail(`tsc (${config}):\n${e.stdout?.toString() ?? ''}${e.stderr?.toString() ?? ''}`);
		}
	}
}

if (errors.length) {
	console.error(`registry: ${errors.length} problem(s)\n${errors.map((e) => `  ${e}`).join('\n')}`);
	process.exit(1);
}
console.log(`registry: ${docs.length} items, ${checked} files checked, written to apps/www/public/r`);
console.log(`flavors: react ${coverage.react} of ${docs.length}, elements ${coverage.elements} of ${docs.length}${coverage.elements < docs.length ? ' (--require-all-flavors makes the rest fail)' : ''}`);
