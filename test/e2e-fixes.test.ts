import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { elementTypes } from '../src/library/element-types.js';
import { insertLinks } from '../src/install/stylesheets.js';

// Regressions found installing the packed CLI into fresh scaffolds (Next, Vite + React, SvelteKit, Astro, Angular, a
// plain site, Django, Nuxt): each test is one bug.

const bin = join(__dirname, '..', 'bin.js');
const registry = join(__dirname, '..', 'apps', 'www', 'public', 'r');
const env = { ...process.env, DS_REGISTRY_DIR: registry };
const json = (cwd: string, ...args: string[]) => JSON.parse(execFileSync('node', [bin, ...args, '--cwd', cwd, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env }));
function app(files: Record<string, string>) {
	const dir = mkdtempSync(join(tmpdir(), 'spyglass-e2e-'));
	for (const [rel, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), text);
	}
	return dir;
}
const read = (dir: string, rel: string) => readFileSync(join(dir, rel), 'utf8');
const pkg = (deps: Record<string, string>, dev: Record<string, string> = {}) => JSON.stringify({ name: 'acme', private: true, dependencies: deps, devDependencies: dev });
const has = existsSync(join(registry, 'search-bar.json')) && JSON.parse(readFileSync(join(registry, 'search-bar.json'), 'utf8')).flavors?.elements;

describe.skipIf(!has)('web components in apps', () => {
	it('loads every element an item needs (a search bar renders a button), once each', () => {
		const dir = app({ 'index.html': '<!doctype html><html><head><title>Acme</title></head><body></body></html>\n' });
		const r = json(dir, 'add', 'search-bar', 'card', 'button');
		const srcs = r.scripts.map((l: string) => l.match(/src="([^"]+)"/)![1]);
		expect(srcs).toEqual(expect.arrayContaining(['/spyglass-ds/elements/search-bar.js', '/spyglass-ds/elements/button.js', '/spyglass-ds/elements/card.js']));
		expect(new Set(srcs).size).toBe(srcs.length);
		expect(existsSync(join(dir, 'spyglass-ds/elements/shared.js'))).toBe(true);
		expect(json(dir, 'view', 'search-bar').items[0].imports.join('\n')).toContain('search-bar.js');
	});

	it('writes types for the tags (React JSX, Svelte, the tag map) and the manifest, and rewrites them on the next add', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0', 'react-dom': '19.2.0' }, { vite: '7.0.0', typescript: '5.9.0' }), 'tsconfig.json': '{ "files": [] }', 'index.html': '<!doctype html><html><head></head><body></body></html>\n', 'src/index.css': 'body {}\n', 'src/main.tsx': "import './index.css';\n" });
		json(dir, 'add', 'button', '--no-install');
		const first = read(dir, 'src/spyglass-ds/elements.d.ts');
		expect(first).toContain("'spyglass-button': ButtonElement.Button");
		expect(first).toContain("declare module 'react'");
		expect(first).not.toContain('svelte/elements');
		expect(first).toContain('export class Button extends HTMLElement');
		const manifest = JSON.parse(read(dir, 'public/spyglass-ds/elements/custom-elements.json'));
		expect(manifest.modules.map((m: { path: string }) => m.path)).toContain('elements/button.js');
		expect(manifest.modules.some((m: { path: string }) => m.path === 'elements/card.js')).toBe(false);
		json(dir, 'add', 'card', '--no-install');
		const second = read(dir, 'src/spyglass-ds/elements.d.ts');
		expect(second).toContain("'spyglass-button'");
		expect(second).toContain("'spyglass-card'");
		const svelte = app({ 'package.json': pkg({}, { '@sveltejs/kit': '2.0.0', svelte: '5.0.0', typescript: '5.9.0' }), 'tsconfig.json': '{}', 'src/app.html': '<html><head></head><body>%sveltekit.body%</body></html>\n' });
		json(svelte, 'add', 'button');
		expect(read(svelte, 'src/spyglass-ds/elements.d.ts')).toContain("declare module 'svelte/elements'");
	});

	it('the app\'s flavor follows what add installed: a React app without Tailwind views and diffs the web components', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0' }, { vite: '7.0.0' }), 'src/index.css': 'body {}\n', 'src/main.tsx': "import './index.css';\n", 'index.html': '<html><head></head><body></body></html>\n' });
		json(dir, 'add', 'button');
		expect(json(dir, 'view', 'button').items[0].flavor).toBe('elements');
		expect(json(dir, 'diff', 'button').items[0].files.every((f: { status: string }) => f.status === 'same')).toBe(true);
		expect(json(dir, 'info').flavor).toBe('elements');
	});

	it('Vue and Nuxt apps that take the elements are told, and set, isCustomElement for the prefix; Angular is told about CUSTOM_ELEMENTS_SCHEMA', () => {
		const nuxt = app({ 'package.json': pkg({ nuxt: '4.0.0', vue: '3.5.0' }), 'nuxt.config.ts': "export default defineNuxtConfig({\n  devtools: { enabled: false },\n})\n", 'app/app.vue': '<template><main /></template>\n' });
		const r = json(nuxt, 'add', 'button', '--framework', 'elements');
		expect(read(nuxt, 'nuxt.config.ts')).toContain("vue: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('spyglass-') } },");
		expect(r.notes.join(' ')).toContain('app.head.script');
		json(nuxt, 'add', 'card', '--framework', 'elements');
		expect(read(nuxt, 'nuxt.config.ts').match(/isCustomElement/g)).toHaveLength(1);
		const vite = app({ 'package.json': pkg({ vue: '3.5.0' }, { vite: '7.0.0', '@vitejs/plugin-vue': '6.0.0' }), 'vite.config.ts': "import vue from '@vitejs/plugin-vue'\nexport default { plugins: [vue()] }\n", 'index.html': '<html><head></head><body></body></html>\n', 'src/main.ts': '' });
		json(vite, 'add', 'button', '--framework', 'elements');
		expect(read(vite, 'vite.config.ts')).toContain("vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('spyglass-') } } })");
		const ng = app({ 'package.json': pkg({ '@angular/core': '20.0.0' }), 'angular.json': '{}', 'src/index.html': '<html><head></head><body></body></html>\n', 'src/styles.css': '' });
		expect(json(ng, 'add', 'button').notes.join(' ')).toContain('schemas: [CUSTOM_ELEMENTS_SCHEMA]');
	});

	it('view shows a React example with the app\'s imports, not the library\'s @/react paths', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }', 'app/globals.css': '@import "tailwindcss";\n', 'app/layout.tsx': 'import "./globals.css";\n' });
		const v = json(dir, 'view', 'card').items[0];
		expect(v.examples[0].content).toContain("from '@/components/ui/Card'");
		expect(v.examples[0].content).not.toContain('@/react/');
	});
});

describe.skipIf(!has)('updating what an app has', () => {
	it('add always replaces the prebuilt modules and the shared chunk, says which, and keeps changed source files', () => {
		const site = app({ 'index.html': '<!doctype html><html><head></head><body></body></html>\n' });
		json(site, 'add', 'button');
		const dir = join(site, 'spyglass-ds/elements');
		writeFileSync(join(dir, 'button.js'), '// an old build\n');
		writeFileSync(join(dir, 'shared.js'), '// an old build\n');
		const again = json(site, 'add', 'button');
		expect(again.updated.map((p: string) => p.split('/').pop()).sort()).toEqual(['button.js', 'shared.js']);
		expect(again.kept).toEqual([]);
		expect(read(site, 'spyglass-ds/elements/shared.js')).not.toBe('// an old build\n');
		expect(json(site, 'add', 'button').updated).toEqual([]);
		const next = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }', 'app/globals.css': '@import "tailwindcss";\n', 'app/layout.tsx': 'import "./globals.css";\n' });
		json(next, 'add', 'button', '--no-install');
		writeFileSync(join(next, 'components/ui/Button.tsx'), `${read(next, 'components/ui/Button.tsx')}// ours\n`);
		const r = json(next, 'add', 'button', '--no-install');
		expect(r.kept).toEqual(['components/ui/Button.tsx']);
		expect(read(next, 'components/ui/Button.tsx')).toContain('// ours');
	});

	it('add --update re-adds every installed item in its flavor: modules replaced, changed sources kept unless --overwrite; info says so', () => {
		const next = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./*"] } } }', 'app/globals.css': '@import "tailwindcss";\n', 'app/layout.tsx': 'import "./globals.css";\n', 'public/.keep': '' });
		json(next, 'add', 'button', 'card', '--no-install');
		json(next, 'add', 'logo', '--framework', 'elements');
		writeFileSync(join(next, 'components/ui/Button.tsx'), `${read(next, 'components/ui/Button.tsx')}// ours\n`);
		writeFileSync(join(next, 'components/ui/Card.tsx'), '// lost\n');
		writeFileSync(join(next, 'public/spyglass-ds/elements/logo.js'), '// an old build\n');
		expect(json(next, 'info').next.join('\n')).toContain('add --update');
		const r = json(next, 'add', '--update', '--no-install').results;
		expect(r.map((x: { flavor: string }) => x.flavor)).toEqual(['react', 'elements']);
		expect(r[0].items).toEqual(expect.arrayContaining(['button', 'card']));
		expect(r[0].kept).toEqual(expect.arrayContaining(['components/ui/Button.tsx', 'components/ui/Card.tsx']));
		expect(r[1].updated.map((p: string) => p.split('/').pop())).toContain('logo.js');
		expect(read(next, 'components/ui/Button.tsx')).toContain('// ours');
		json(next, 'add', '--update', '--overwrite', '--no-install');
		expect(read(next, 'components/ui/Button.tsx')).not.toContain('// ours');
		expect(read(next, 'components/ui/Card.tsx')).not.toBe('// lost\n');
	});
});

describe('element types from the registry\'s declaration files', () => {
	it('the types file for every element compiles, strict, with the React hooks and the tag map, and checks props', async () => {
		const ts = (await import('typescript')).default;
		const dir = join(__dirname, '..', 'apps', 'www', 'public', 'elements');
		const modules = readdirSync(dir).filter((f) => f.endsWith('.d.ts')).map((f) => ({ name: f.replace(/\.d\.ts$/, ''), dts: readFileSync(join(dir, f), 'utf8') }));
		const out = mkdtempSync(join(tmpdir(), 'spyglass-types-'));
		writeFileSync(join(out, 'elements.d.ts'), elementTypes({ pkg: { dependencies: { react: '19.2.0' } }, framework: 'vite-react' }, modules));
		writeFileSync(join(out, 'use.tsx'), "export const a = <spyglass-button variant=\"secondary\" size=\"lg\" icon>Go</spyglass-button>\nexport const b = <spyglass-brand-light variant=\"corner\" seed={3} cover />\nexport const c: string | undefined = document.querySelector('spyglass-search-bar')?.value\nexport const d: boolean | undefined = document.querySelector('spyglass-input')?.checkValidity()\n// @ts-expect-error a variant the button does not have\nexport const e = <spyglass-button variant=\"nope\">Go</spyglass-button>\n// @ts-expect-error a light variant that does not exist\nexport const f = <spyglass-brand-light variant=\"spiral\" />\n");
		const program = ts.createProgram([join(out, 'elements.d.ts'), join(out, 'use.tsx')], { strict: true, noEmit: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'], typeRoots: [join(__dirname, '..', 'node_modules', '@types')], types: ['react'] });
		expect(ts.getPreEmitDiagnostics(program).map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '))).toEqual([]);
	});
});

describe('stylesheet links', () => {
	it('before </head>, the links take the indent of the head\'s lines', () => {
		const layout = '<html>\n\t<head>\n\t\t<meta charset="utf-8" />\n\t</head>\n</html>\n';
		expect(insertLinks(layout, ['<link rel="stylesheet" href="/x.css">'])).toBe('<html>\n\t<head>\n\t\t<meta charset="utf-8" />\n\t\t<link rel="stylesheet" href="/x.css">\n\t</head>\n</html>\n');
	});
});

describe('what people and agents read, per flavor', () => {
	it('the contract says what this app takes: React in Next, the elements with their schema in Angular, {% static %} and npx from the source in Django', () => {
		const next = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'app/globals.css': '@import "tailwindcss";\n', 'app/layout.tsx': 'import "./globals.css";\n' });
		json(next, 'init');
		expect(read(next, 'AGENTS.md')).toContain("- In this app (Next.js): the React flavor, in components/ (`import { Button } from '@/components/ui/Button'`).");
		expect(read(next, '.ds/agent-guide.md')).toContain('## Library flavors');
		expect(read(next, '.ds/agent-guide.md')).toContain('`value` + `onValueChange`');
		const ng = app({ 'package.json': pkg({ '@angular/core': '20.0.0' }), 'angular.json': '{}', 'src/index.html': '<html><head></head><body></body></html>\n', 'src/styles.css': '' });
		json(ng, 'init');
		expect(read(ng, 'AGENTS.md')).toContain('In this app (Angular): the web components');
		expect(read(ng, 'AGENTS.md')).toContain('CUSTOM_ELEMENTS_SCHEMA');
		const django = app({ 'manage.py': '', 'acme/settings.py': "STATIC_URL = 'static/'\n", 'templates/base.html': '<html><head></head><body></body></html>\n' });
		json(django, 'init');
		const agents = read(django, 'AGENTS.md');
		expect(agents).toContain("{% static 'spyglass-ds/elements/<name>.js' %}");
		expect(agents).toContain('npx -y ');
		expect(agents).not.toContain('{{');
	});

	it.skipIf(!has)('view gives an element example the CSS its layout classes need on a page without Tailwind, and not with Tailwind', () => {
		const plain = app({ 'index.html': '<!doctype html><html><head></head><body></body></html>\n' });
		const ex = json(plain, 'view', 'card').items[0].examples[1].content as string;
		expect(ex).toContain('<style>');
		expect(ex).toContain('@layer ds-example');
		expect(ex).toMatch(/\.sm\\:grid-cols-3/);
		const tw = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'app/globals.css': '@import "tailwindcss";\n', 'app/layout.tsx': 'import "./globals.css";\n' });
		expect(json(tw, 'view', 'card', '--framework', 'elements').items[0].examples[1].content).not.toContain('<style>');
	});
});
