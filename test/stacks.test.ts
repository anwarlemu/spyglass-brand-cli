import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { convertFile } from '../src/convert/dispatch.js';
import { StructureChanged } from '../src/convert/shared.js';

// Every stack the CLI supports, on small app trees laid out the way each official scaffold lays them out: detection,
// init (where the brand stylesheet goes and how it is wired), apply (whole app, a page, a kind), idempotence, check.

const bin = join(__dirname, '..', 'bin.js');
const cli = (cwd: string, ...args: string[]) => execFileSync('node', [bin, ...args, '--cwd', cwd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, ...(globalThis as any).dsEnv } });
const json = (cwd: string, ...args: string[]) => JSON.parse(cli(cwd, ...args, '--json'));
const fails = (cwd: string, ...args: string[]) => {
	try {
		cli(cwd, ...args);
	} catch (e) {
		return (e as { stderr: string }).stderr;
	}
	throw new Error(`expected \`${args.join(' ')}\` to fail`);
};
function app(files: Record<string, string>) {
	const dir = mkdtempSync(join(tmpdir(), 'conare-stack-'));
	for (const [rel, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), text);
	}
	return dir;
}
function snapshot(dir: string, base = dir): Record<string, string> {
	const out: Record<string, string> = {};
	for (const name of readdirSync(dir)) {
		const abs = join(dir, name);
		if (statSync(abs).isDirectory()) Object.assign(out, snapshot(abs, base));
		else out[relative(base, abs)] = readFileSync(abs, 'utf8');
	}
	return out;
}
const read = (dir: string, rel: string) => readFileSync(join(dir, rel), 'utf8');
const pkg = (deps: Record<string, string>, dev: Record<string, string> = {}) => JSON.stringify({ dependencies: deps, devDependencies: dev });

const TW_PAGE = (title: string) => `<main className="max-w-5xl mx-auto p-8"><h1 className="text-3xl font-bold text-gray-900">${title}</h1><button className="px-4 py-2 rounded-md bg-indigo-600 text-white">Save</button></main>`;
const tsx = (name: string, body: string, imports = '') => `${imports}export default function ${name}() {\n  return (\n    ${body}\n  );\n}\n`;
const PLAIN_CSS = '.btn { padding: 9px 17px; background: #7c3aed; color: #fff; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,.1); }\n.btn-danger { background: #dc2626; }\nh1 { font-size: 30px; color: #111827; }\n';
const htmlPage = (title: string, body: string, link = '<link rel="stylesheet" href="/css/site.css" />') => `<!doctype html>\n<html>\n  <head>\n    <title>${title}</title>\n    ${link}\n  </head>\n  <body>\n${body}\n  </body>\n</html>\n`;
const plainBody = (title: string) => `<main class="main"><h1 class="title">${title}</h1><button class="btn">Save</button><button class="btn btn-danger">Delete</button><table class="table"><tr><th>Name</th></tr><tr><td>Acme</td></tr></table></main>`;

describe('Next.js (App Router, src/, Tailwind 4)', () => {
	const make = () =>
		app({
			'package.json': pkg({ next: '16.0.0', react: '19.2.0', 'react-dom': '19.2.0' }, { tailwindcss: '^4.1.0', '@tailwindcss/postcss': '^4.1.0' }),
			'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
			'src/app/globals.css': '@import "tailwindcss";\n\nbody { font-family: Arial; }\n',
			'src/app/layout.tsx': 'import "./globals.css";\nimport { Nav } from "@/components/Nav";\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (<html lang="en"><body><Nav />{children}</body></html>);\n}\n',
			'src/app/page.tsx': tsx('Home', TW_PAGE('Home'), 'import { PrimaryButton } from "@/components/PrimaryButton";\n'),
			'src/app/settings/page.tsx': tsx('Settings', TW_PAGE('Settings')),
			'src/app/(marketing)/pricing/page.tsx': tsx('Pricing', TW_PAGE('Pricing')),
			'src/components/Nav.tsx': tsx('Nav', '<nav className="flex gap-4 bg-slate-900 text-white p-4"><a href="/">Home</a></nav>').replace('export default function', 'export function'),
			'src/components/PrimaryButton.tsx': 'export function PrimaryButton({ children }: { children: React.ReactNode }) {\n  return <button className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">{children}</button>;\n}\n',
		});
	it('detects the stack, routes and flavor', () => {
		const dir = make();
		const info = json(dir, 'info');
		expect([info.framework, info.flavor, info.tailwind, info.stylesheet]).toEqual(['next', 'react', 4, 'src/app/globals.css']);
		const r = json(dir, 'apply', '/pricing', '--dry-run');
		expect(r.files.map((f: { file: string }) => f.file)).toEqual(['src/app/(marketing)/pricing/page.tsx']);
	});
	it('init imports brand.css and the theme after tailwind; apply restyles className; a page selection leaves the rest byte for byte', () => {
		const dir = make();
		const before = snapshot(dir);
		json(dir, 'apply', '/settings');
		const after = snapshot(dir);
		const changed = Object.keys(after).filter((f) => after[f] !== before[f]);
		expect(changed.filter((f) => !/conare-ds\/|^\.ds\/|^AGENTS\.md$/.test(f)).sort()).toEqual(['src/app/globals.css', 'src/app/settings/page.tsx']);
		expect(read(dir, 'src/app/globals.css')).toContain('@import "tailwindcss";\n@import "./conare-ds/brand.css";\n@import "./conare-ds/theme.css";');
		const page = read(dir, 'src/app/settings/page.tsx');
		expect(page).toContain('className="text-fg type-heading-1 ds-scope"');
		expect(page).toMatch(/<button className="[^"]*bg-action-primary[^"]*">Save<\/button>/);
		// Twice: nothing more changes.
		json(dir, 'apply', '/settings');
		expect(snapshot(dir)).toEqual(after);
	});
	it('a kind selection restyles that kind across the app, components included', () => {
		const dir = make();
		const r = json(dir, 'apply', 'button');
		expect(r.files.map((f: { file: string }) => f.file).sort()).toEqual(['src/app/(marketing)/pricing/page.tsx', 'src/app/page.tsx', 'src/app/settings/page.tsx', 'src/components/PrimaryButton.tsx']);
		expect(read(dir, 'src/components/Nav.tsx')).toContain('bg-slate-900');
		expect(read(dir, 'src/app/page.tsx')).toContain('text-3xl font-bold text-gray-900');
	});
});

describe('Next.js (Pages Router, no src, no Tailwind)', () => {
	it('plain CSS: brand.css and kinds.css imported by the global stylesheet; elements get kinds.css classes; CSS values become tokens', async () => {
		const dir = app({
			'package.json': pkg({ next: '16.0.0', react: '19.2.0' }),
			'styles/globals.css': PLAIN_CSS,
			'pages/_app.tsx': "import '@/styles/globals.css';\nexport default function App({ Component, pageProps }: any) {\n  return <Component {...pageProps} />;\n}\n",
			'pages/index.tsx': tsx('Home', '<main><h1>Home</h1><button className="btn">Go</button><button className="btn btn-danger">Delete</button></main>'),
			'pages/team.tsx': tsx('Team', '<main><h1>Team</h1></main>'),
		});
		const info = json(dir, 'info');
		expect([info.framework, info.tailwind, info.stylesheet]).toEqual(['next', null, 'styles/globals.css']);
		json(dir, 'apply');
		const css = read(dir, 'styles/globals.css');
		expect(css.startsWith('@import "./conare-ds/brand.css";\n@import "./conare-ds/kinds.css";\n')).toBe(true);
		expect(css).toContain('background: var(--ds-color-');
		expect(read(dir, 'styles/conare-ds/kinds.css')).toContain('.ds-button.ds-button-danger');
		// The look wins over a component's scoped rule loaded after it (Angular's .save[_ngcontent-x] and the like).
		const chrome = '/Users/anwarlemu/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
		if (existsSync(process.env.PARITY_CHROMIUM ?? chrome)) {
			const { chromium } = await import('playwright-core');
			const browser = await chromium.launch({ executablePath: process.env.PARITY_CHROMIUM ?? chrome });
			try {
				const p = await browser.newPage();
				const kinds = read(dir, 'styles/conare-ds/kinds.css');
				await p.setContent(`<style>${kinds}</style><style>.save[_ngcontent-x] { padding: 8px 16px; }</style><button class="save ds-button ds-button-dark" _ngcontent-x>Save</button>`);
				expect(await p.evaluate(() => getComputedStyle(document.querySelector('button')!).paddingTop)).toBe('0px');
			} finally {
				await browser.close();
			}
		}
		const home = read(dir, 'pages/index.tsx');
		expect(home).toContain('className="btn ds-button ds-button-dark"');
		expect(home).toContain('className="btn btn-danger ds-button ds-button-danger"');
		expect(home).toContain('<h1 className="ds-type-heading-1">');
		const once = snapshot(dir);
		json(dir, 'apply');
		expect(snapshot(dir)).toEqual(once);
		expect(json(dir, 'check').findings).toEqual([]);
	});
});

describe('Vite + React (react-router routes in code)', () => {
	it('reads createBrowserRouter routes; the router file does not make every page shared', () => {
		const dir = app({
			'package.json': pkg({ react: '19.2.0', 'react-router': '7.9.0' }, { vite: '7.0.0', tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0' }),
			'index.html': '<!doctype html><html><head><title>x</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
			'src/index.css': '@import "tailwindcss";\n',
			'src/main.tsx': "import './index.css';\nimport { createBrowserRouter } from 'react-router';\nimport App from './App';\nimport Home from './pages/Home';\nimport Settings from './pages/Settings';\nexport const router = createBrowserRouter([{ path: '/', element: <App />, children: [{ index: true, element: <Home /> }, { path: 'settings', element: <Settings /> }] }]);\n",
			'src/App.tsx': tsx('App', '<div className="p-4 bg-white"><Outlet /></div>', "import { Outlet } from 'react-router';\n"),
			'src/pages/Home.tsx': tsx('Home', TW_PAGE('Home')),
			'src/pages/Settings.tsx': tsx('Settings', TW_PAGE('Settings')),
		});
		const r = json(dir, 'apply', '/settings', '--dry-run');
		expect(r.files.map((f: { file: string }) => f.file)).toEqual(['src/pages/Settings.tsx']);
		expect(r.sharedLeftOut).not.toContain('src/pages/Settings.tsx');
	});
});

describe('React Router 7 (framework mode)', () => {
	it('reads app/routes.ts (index, route, prefix) and the ~/ alias', () => {
		const dir = app({
			'package.json': pkg({ 'react-router': '7.9.0', react: '19.2.0' }, { '@react-router/dev': '7.9.0', tailwindcss: '^4.1.0' }),
			'tsconfig.json': '{ "compilerOptions": { "paths": { "~/*": ["./app/*"] } } }',
			'app/app.css': '@import "tailwindcss";\n',
			'app/root.tsx': 'import "./app.css";\nexport default function Root() { return null; }\n',
			'app/routes.ts': 'import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";\nexport default [index("routes/home.tsx"), route("settings", "routes/settings.tsx"), ...prefix("docs", [route("intro", "routes/intro.tsx")])] satisfies RouteConfig;\n',
			'app/routes/home.tsx': tsx('Home', TW_PAGE('Home')),
			'app/routes/settings.tsx': tsx('Settings', TW_PAGE('Settings')),
			'app/routes/intro.tsx': tsx('Intro', TW_PAGE('Intro')),
		});
		const info = json(dir, 'info');
		expect([info.framework, info.stylesheet, info.alias]).toEqual(['react-router', 'app/app.css', '~/']);
		expect(json(dir, 'apply', '/docs/intro', '--dry-run').files.map((f: { file: string }) => f.file)).toEqual(['app/routes/intro.tsx']);
	});
});

describe('Tailwind 3 (Vite + React)', () => {
	it('a preset wired into an ESM config; utilities written for the preset', () => {
		const dir = app({
			'package.json': JSON.stringify({ type: 'module', dependencies: { react: '19.2.0' }, devDependencies: { vite: '7.0.0', tailwindcss: '^3.4.17' } }),
			'index.html': '<!doctype html><html><head></head><body></body></html>\n',
			'tailwind.config.js': "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./src/**/*.tsx'],\n  theme: { extend: {} },\n  plugins: [],\n};\n",
			'src/main.tsx': "import './index.css';\n",
			'src/index.css': '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n',
			'src/App.tsx': tsx('App', TW_PAGE('App')),
		});
		json(dir, 'apply');
		const config = read(dir, 'tailwind.config.js');
		expect(config.startsWith("import __dsPreset from './src/conare-ds/tailwind-preset.cjs';")).toBe(true);
		expect(config).toContain('presets: [__dsPreset],');
		expect(read(dir, 'src/index.css').startsWith('@import "./conare-ds/brand.css";\n@tailwind base;')).toBe(true);
		expect(read(dir, 'src/App.tsx')).toContain('bg-action-primary');
	});
});

describe('SvelteKit (Tailwind 4) and Vite + Svelte (plain CSS)', () => {
	it('SvelteKit: routes from src/routes, the stylesheet the root layout imports, class and class: directives', () => {
		const dir = app({
			'package.json': pkg({}, { '@sveltejs/kit': '2.40.0', svelte: '5.40.0', tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0' }),
			'src/app.html': '<!doctype html><html><head>%sveltekit.head%</head><body>%sveltekit.body%</body></html>\n',
			'src/routes/layout.css': '@import "tailwindcss";\n',
			'src/routes/+layout.svelte': "<script lang=\"ts\">\n  import './layout.css';\n  let { children } = $props();\n</script>\n\n<nav class=\"bg-slate-900 text-white p-4\">Acme</nav>\n{@render children()}\n",
			'src/routes/+page.svelte': '<h1 class="text-3xl font-bold">Home</h1>\n',
			'src/routes/settings/+page.svelte': '<script lang="ts">\n  let on = $state(false);\n</script>\n\n<h1 class="text-3xl font-bold text-gray-900">Settings</h1>\n<button class="px-4 py-2 bg-indigo-600 text-white rounded" class:opacity-50={on} onclick={() => (on = !on)}>Save</button>\n<style>\n  h1 { color: #111827; }\n</style>\n',
		});
		const info = json(dir, 'info');
		expect([info.framework, info.stylesheet, info.publicDir]).toEqual(['sveltekit', 'src/routes/layout.css', 'static']);
		const before = snapshot(dir);
		json(dir, 'apply', '/settings');
		const page = read(dir, 'src/routes/settings/+page.svelte');
		expect(page).toContain('class:opacity-50={on} onclick={() => (on = !on)}');
		expect(page).toContain('color: var(--ds-color-fg);');
		// The top-level script and style are roots of the file, but draw nothing: no scope class on them.
		expect(page).toContain('<script lang="ts">\n  let on');
		expect(page).toContain('<style>\n  h1 {');
		expect(page).toMatch(/<button class="[^"]*bg-action-primary[^"]*"/);
		expect(read(dir, 'src/routes/+page.svelte')).toBe(before['src/routes/+page.svelte']);
		expect(read(dir, 'src/routes/+layout.svelte')).toBe(before['src/routes/+layout.svelte']);
		expect(existsSync(join(dir, 'static/conare-ds/fonts/Geist-400.woff2'))).toBe(true);
	});
	it('a Svelte component restyled as its kind gives the look to its element root, never to its top-level script or style', () => {
		const card = '<script lang="ts">\n\tlet { title, children } = $props();\n</script>\n\n<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">\n\t<h2>{title}</h2>\n\t{@render children()}\n</div>\n\n<style>\n\th2 { color: #111827; }\n</style>\n';
		const out = convertFile('src/lib/Card.svelte', card, { general: true, kinds: 'all', componentKind: 'card' }).text;
		expect(out).toContain('<script lang="ts">');
		expect(out).toContain('<style>');
		expect(out).toMatch(/<div class="[^"]*border-edge[^"]*">/);
	});
	it('Vite + Svelte without Tailwind: semantic classes, kinds.css imported by app.css', () => {
		const dir = app({
			'package.json': pkg({}, { svelte: '5.40.0', vite: '7.0.0' }),
			'index.html': '<!doctype html><html><head></head><body></body></html>\n',
			'src/main.ts': "import './app.css';\n",
			'src/app.css': PLAIN_CSS,
			'src/App.svelte': '<button class="btn">Go</button>\n<button>Bare</button>\n',
		});
		json(dir, 'apply');
		expect(read(dir, 'src/App.svelte')).toBe('<button class="btn ds-button ds-button-dark">Go</button>\n<button class="ds-button ds-button-secondary">Bare</button>\n');
		expect(read(dir, 'src/app.css')).toContain('@import "./conare-ds/kinds.css";');
	});
});

describe('Astro 5 (plain CSS)', () => {
	it('pages from src/pages, frontmatter and class:list untouched in structure', () => {
		const dir = app({
			'package.json': pkg({ astro: '5.14.0' }),
			'src/layouts/Layout.astro': "---\nimport '../styles/global.css';\n---\n<html><head><title>x</title></head><body><slot /></body></html>\n",
			'src/styles/global.css': PLAIN_CSS,
			'src/pages/index.astro': "---\nimport Layout from '../layouts/Layout.astro';\nconst items = ['a'];\n---\n<Layout><h1 class=\"title\">Home</h1><button class=\"btn\">Go</button><div class:list={['card', { on: true }]}>x</div></Layout>\n<style>\n  .title { color: #111827; }\n</style>\n",
			'src/pages/about.astro': "---\nimport Layout from '../layouts/Layout.astro';\n---\n<Layout><h1>About</h1></Layout>\n",
		});
		const info = json(dir, 'info');
		expect([info.framework, info.stylesheet]).toEqual(['astro', 'src/styles/global.css']);
		const before = snapshot(dir);
		json(dir, 'apply', '/');
		const page = read(dir, 'src/pages/index.astro');
		expect(page).toContain("const items = ['a'];");
		expect(page).toContain('<Layout><h1 class="title ds-type-heading-1 ds-scope">Home</h1><button class="btn ds-button ds-button-dark ds-scope">Go</button>');
		// A tag that draws nothing never takes the scope class (the file's top-level style counts as a root).
		expect(page).toContain('<style>\n  .title { color: var(--ds-color-fg); }');
		expect(read(dir, 'src/pages/about.astro')).toBe(before['src/pages/about.astro']);
	});
});

describe('Angular 20 (plain CSS)', () => {
	it('routes from app.routes.ts (component and loadComponent), templateUrl files, [ngClass] and [class.x]', () => {
		const dir = app({
			'package.json': pkg({ '@angular/core': '20.3.0', '@angular/router': '20.3.0' }),
			'angular.json': JSON.stringify({ projects: { ng: { architect: { build: { options: { styles: ['src/styles.css'] } } } } } }),
			'src/index.html': '<!doctype html><html><head><title>x</title></head><body><app-root></app-root></body></html>\n',
			'src/styles.css': PLAIN_CSS,
			'src/app/app.routes.ts': "import { Routes } from '@angular/router';\nimport { Home } from './home/home';\nexport const routes: Routes = [{ path: '', component: Home }, { path: 'team', loadComponent: () => import('./team/team').then((m) => m.Team) }];\n",
			'src/app/home/home.ts': "import { Component } from '@angular/core';\n@Component({ selector: 'app-home', templateUrl: './home.html' })\nexport class Home {}\n",
			'src/app/home/home.html': '<h1 class="title">Home</h1>\n',
			'src/app/team/team.ts': "import { Component } from '@angular/core';\n@Component({ selector: 'app-team', templateUrl: './team.html', styleUrl: './team.css' })\nexport class Team { danger = true; }\n",
			'src/app/team/team.html': '@if (danger) {\n  <button class="btn" [class.active]="danger" (click)="danger = !danger">{{ danger ? "On" : "Off" }}</button>\n}\n<table class="table"><tr><th>Name</th></tr></table>\n',
			'src/app/team/team.css': '.x { color: #ff0000; }\n',
		});
		const info = json(dir, 'info');
		expect([info.framework, info.flavor, info.stylesheet]).toEqual(['angular', 'elements', 'src/styles.css']);
		const r = json(dir, 'apply', '/team');
		expect(r.files.map((f: { file: string }) => f.file).sort()).toEqual(['src/app/team/team.css', 'src/app/team/team.html']);
		const html = read(dir, 'src/app/team/team.html');
		expect(html).toContain('<button class="btn ds-button ds-button-dark ds-scope" [class.active]="danger" (click)="danger = !danger">{{ danger ? "On" : "Off" }}</button>');
		expect(html).toContain('<th class="ds-table-th ds-scope">');
		expect(read(dir, 'src/app/home/home.html')).toBe('<h1 class="title">Home</h1>\n');
	});
	it('an inline template and styles in a component', () => {
		const ts = "import { Component } from '@angular/core';\n@Component({\n  selector: 'app-x',\n  template: `<button class=\"px-4 py-2 bg-blue-600 text-white\">Go</button>`,\n  styles: [`.a { color: #ff0000; }`],\n})\nexport class X {}\n";
		const out = convertFile('src/app/x.component.ts', ts, { general: true, kinds: 'all' }, true).text;
		expect(out).toContain('bg-action-primary');
		expect(out).toContain('.a { color: var(--ds-color-');
		expect(out).toContain('export class X {}');
	});
});

describe('Solid (plain CSS, class in JSX)', () => {
	it('adds class (not className) to a bare element', () => {
		const out = convertFile('src/App.tsx', "import { render } from 'solid-js/web';\nexport default function App() {\n  return <button>Go</button>;\n}\n", { general: true, kinds: 'all', css: 'plain', look: () => [] }).text;
		expect(out).toContain('<button class="ds-button ds-button-secondary">Go</button>');
	});
});

describe('A plain HTML site (no package.json)', () => {
	const make = () => app({ 'index.html': htmlPage('Home', plainBody('Home')), 'about.html': htmlPage('About', plainBody('About')), 'css/site.css': PLAIN_CSS });
	it('links brand.css and kinds.css from every page, in the static folder with relative fonts', () => {
		const dir = make();
		const info = json(dir, 'info');
		expect([info.framework, info.flavor, info.stylesheet, info.publicDir, info.packageManager]).toEqual(['html', 'elements', 'css/site.css', '.', null]);
		json(dir, 'init');
		for (const page of ['index.html', 'about.html']) expect(read(dir, page)).toContain('    <link rel="stylesheet" href="/conare-ds/brand.css">\n    <link rel="stylesheet" href="/conare-ds/kinds.css">\n    <link rel="stylesheet" href="/css/site.css" />');
		expect(read(dir, 'conare-ds/brand.css')).toContain('url("./fonts/Geist-400.woff2")');
		expect(existsSync(join(dir, 'conare-ds/fonts/Geist-400.woff2'))).toBe(true);
	});
	it('a page selection links and restyles that page only: the other pages stay byte for byte', () => {
		const dir = make();
		const before = snapshot(dir);
		json(dir, 'apply', '/about');
		expect(read(dir, 'index.html')).toBe(before['index.html']);
		expect(read(dir, 'css/site.css')).toBe(before['css/site.css']);
		expect(read(dir, 'about.html')).toContain('<button class="btn btn-danger ds-button ds-button-danger ds-scope">Delete</button>');
	});
});

describe('Server templates', () => {
	it('Rails: application.html.erb links the stylesheets; views by controller; partials; ERB untouched', () => {
		const dir = app({
			Gemfile: 'source "https://rubygems.org"\ngem "rails", "~> 8.0"\n',
			'config/routes.rb': 'Rails.application.routes.draw do\n  root "pages#home"\n  get "settings", to: "pages#settings"\nend\n',
			'app/views/layouts/application.html.erb': '<!DOCTYPE html>\n<html>\n  <head>\n    <title>Acme</title>\n    <%= stylesheet_link_tag :app %>\n  </head>\n  <body><%= yield %></body>\n</html>\n',
			'app/views/pages/home.html.erb': '<h1 class="title"><%= @title %></h1>\n<%= render "shared/button", label: "Go" %>\n',
			'app/views/pages/settings.html.erb': '<h1 class="title">Settings</h1>\n<div class="p-4 <% if @x %>active<% end %>">x</div>\n<button class="btn <%= @on ? \'on\' : \'\' %>">Save</button>\n',
			'app/views/shared/_button.html.erb': '<button class="btn"><%= label %></button>\n',
			'app/assets/stylesheets/application.css': PLAIN_CSS,
		});
		const info = json(dir, 'info');
		expect([info.framework, info.stylesheet, info.layouts]).toEqual(['rails', 'app/assets/stylesheets/application.css', ['app/views/layouts/application.html.erb']]);
		const before = snapshot(dir);
		json(dir, 'apply', '/settings');
		expect(read(dir, 'app/views/layouts/application.html.erb')).toContain('    <link rel="stylesheet" href="/conare-ds/brand.css">\n    <link rel="stylesheet" href="/conare-ds/kinds.css">\n    <%= stylesheet_link_tag :app %>');
		const settings = read(dir, 'app/views/pages/settings.html.erb');
		expect(settings).toContain('<div class="p-4 <% if @x %>active<% end %>">x</div>');
		expect(settings).toContain('<button class="btn <%= @on ? \'on\' : \'\' %> ds-button ds-button-dark ds-scope">Save</button>');
		expect(read(dir, 'app/views/pages/home.html.erb')).toBe(before['app/views/pages/home.html.erb']);
		expect(existsSync(join(dir, 'public/conare-ds/kinds.css'))).toBe(true);
		const kinds = json(dir, 'apply', 'button', '--dry-run');
		expect(kinds.files.map((f: { file: string }) => f.file)).toContain('app/views/shared/_button.html.erb');
	});
	it('Laravel: Blade views from routes/web.php, @vite stylesheet, <x-component> and $attributes->merge class strings', () => {
		const dir = app({
			artisan: '#!/usr/bin/env php\n',
			'package.json': pkg({}, { vite: '7.0.0', tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0', 'laravel-vite-plugin': '^2.0.0' }),
			'vite.config.js': 'export default {}\n',
			'routes/web.php': "<?php\nRoute::get('/', function () { return view('welcome'); });\nRoute::view('/settings', 'settings');\n",
			'resources/css/app.css': "@import 'tailwindcss';\n",
			'resources/views/layouts/app.blade.php': "<html><head>@vite(['resources/css/app.css'])</head><body>@yield('content')</body></html>\n",
			'resources/views/welcome.blade.php': "@extends('layouts.app')\n@section('content')<h1 class=\"text-3xl font-bold\">Hi</h1>@endsection\n",
			'resources/views/settings.blade.php': "@extends('layouts.app')\n@section('content')\n<h1 class=\"text-3xl font-bold text-gray-900\">{{ __('Settings') }}</h1>\n<x-primary-button>Save</x-primary-button>\n@endsection\n",
			'resources/views/components/primary-button.blade.php': "<button {{ $attributes->merge(['type' => 'submit', 'class' => 'px-4 py-2 bg-indigo-600 text-white rounded-md']) }}>{{ $slot }}</button>\n",
		});
		const info = json(dir, 'info');
		expect([info.framework, info.tailwind, info.stylesheet]).toEqual(['laravel', 4, 'resources/css/app.css']);
		const r = json(dir, 'apply', '/settings', '--with-shared');
		expect(r.files.map((f: { file: string }) => f.file)).toEqual(expect.arrayContaining(['resources/views/settings.blade.php', 'resources/views/components/primary-button.blade.php']));
		expect(read(dir, 'resources/views/components/primary-button.blade.php')).toMatch(/'class' => '[^']*h-control-sm[^']*bg-action-primary/);
		expect(read(dir, 'resources/css/app.css')).toContain("@import 'tailwindcss';\n@import \"./conare-ds/brand.css\";\n@import \"./conare-ds/theme.css\";");
	});
	it('Django: urls.py routes to views and TemplateView templates; base.html links /static/', () => {
		const dir = app({
			'manage.py': '#!/usr/bin/env python\n',
			'acme/settings.py': "STATIC_URL = 'static/'\nSTATICFILES_DIRS = [BASE_DIR / 'static']\n",
			'acme/urls.py': "from django.urls import path\nfrom django.views.generic import TemplateView\nfrom pages import views\nurlpatterns = [path('', views.home), path('team/', TemplateView.as_view(template_name='team.html'))]\n",
			'pages/views.py': "from django.shortcuts import render\n\ndef home(request):\n    return render(request, 'home.html')\n",
			'templates/base.html': '{% load static %}<!doctype html>\n<html>\n  <head>\n    <link rel="stylesheet" href="{% static \'css/site.css\' %}" />\n  </head>\n  <body>{% block content %}{% endblock %}</body>\n</html>\n',
			'templates/home.html': '{% extends "base.html" %}{% block content %}<h1 class="title">Home</h1>{% endblock %}\n',
			'templates/team.html': '{% extends "base.html" %}{% block content %}<button class="btn {% if x %}on{% endif %}">Go</button><table><tr><th>{{ name }}</th></tr></table>{% endblock %}\n',
			'static/css/site.css': PLAIN_CSS,
		});
		const info = json(dir, 'info');
		expect([info.framework, info.publicDir, info.layouts]).toEqual(['django', 'static', ['templates/base.html']]);
		json(dir, 'apply', '/team/');
		// {% static %}, so STATIC_URL and hashed file names follow; the template loads the tag library already.
		expect(read(dir, 'templates/base.html')).toContain(`    <link rel="stylesheet" href="{% static 'conare-ds/brand.css' %}">`);
		expect(read(dir, 'templates/base.html').match(/\{% load static %\}/g)).toHaveLength(1);
		expect(read(dir, 'templates/team.html')).toContain('<button class="btn {% if x %}on{% endif %}">Go</button>');
		expect(read(dir, 'templates/team.html')).toContain('<th class="ds-table-th ds-scope">{{ name }}</th>');
		expect(read(dir, 'templates/home.html')).toBe('{% extends "base.html" %}{% block content %}<h1 class="title">Home</h1>{% endblock %}\n');
	});
	it('PHP: pages and includes; the header partial with <head> takes the links', () => {
		const dir = app({ 'index.php': "<?php include __DIR__ . '/partials/header.php'; ?>\n<main><button class=\"btn\">Go</button></main>\n", 'partials/header.php': '<html><head><link rel="stylesheet" href="/css/style.css"></head><body>\n', 'css/style.css': PLAIN_CSS });
		const info = json(dir, 'info');
		expect([info.framework, info.layouts]).toEqual(['php', ['partials/header.php']]);
		json(dir, 'apply');
		expect(read(dir, 'partials/header.php')).toContain('<link rel="stylesheet" href="/conare-ds/brand.css"><link rel="stylesheet" href="/conare-ds/kinds.css"><link rel="stylesheet" href="/css/style.css">');
		expect(read(dir, 'index.php')).toContain('<button class="btn ds-button ds-button-dark">Go</button>');
		expect(read(dir, 'css/style.css')).toContain('var(--ds-color-');
	});
	it('Express + EJS: views, partials and the stylesheet in public/', () => {
		const dir = app({
			'package.json': pkg({ express: '5.1.0', ejs: '3.1.10' }),
			'views/partials/head.ejs': '<html><head><link rel="stylesheet" href="/css/style.css"></head><body>\n',
			'views/home.ejs': "<%- include('partials/head') %>\n<button class=\"btn\"><%= label %></button>\n",
			'public/css/style.css': PLAIN_CSS,
		});
		const info = json(dir, 'info');
		expect([info.framework, info.stylesheet, info.layouts]).toEqual(['templates', 'public/css/style.css', ['views/partials/head.ejs']]);
		json(dir, 'apply');
		expect(read(dir, 'public/css/style.css')).toContain('var(--ds-color-');
		expect(read(dir, 'views/home.ejs')).toContain('<button class="btn ds-button ds-button-dark"><%= label %></button>');
		expect(json(dir, 'check').findings).toEqual([]);
	});
});

describe('the structure check holds in every file type', () => {
	const opts = { general: true, kinds: 'all' as const };
	it('refuses a change outside class and style values', async () => {
		const { markupSignature } = await import('../src/convert/markup.js');
		const { jsxSignature } = await import('../src/convert/jsx.js');
		const svelte = '<script>let a = 1;</script>\n<button class="px-4 bg-red-500" onclick={() => a++}>Go {a}</button>\n';
		expect(markupSignature(svelte, 'svelte')).toBe(markupSignature(svelte.replace('px-4 bg-red-500', 'h-control-sm bg-action-danger'), 'svelte'));
		expect(markupSignature(svelte, 'svelte')).not.toBe(markupSignature(svelte.replace('Go', 'Run'), 'svelte'));
		expect(markupSignature(svelte, 'svelte')).not.toBe(markupSignature(svelte.replace('a++', 'a--'), 'svelte'));
		const erb = '<p class="x <%= y %>">Hi <%= name %></p>\n';
		expect(markupSignature(erb, 'template')).not.toBe(markupSignature(erb.replace('<%= y %>', '<%= z %>'), 'template'));
		const x = '<div className="p-4">Hello</div>';
		expect(jsxSignature(`const a = ${x};`, 'a.tsx')).toBe(jsxSignature('const a = <div className="h-2">Hello</div>;', 'a.tsx'));
		expect(jsxSignature(`const a = ${x};`, 'a.tsx')).not.toBe(jsxSignature('const a = <span className="p-4">Hello</span>;', 'a.tsx'));
	});
	it('runs twice to the same result in each file type', () => {
		const files: Record<string, string> = {
			'a.tsx': 'export const A = () => <div className="p-6 bg-white shadow-md rounded-lg"><button className={`px-4 ${on ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Go</button><input className="border border-gray-300 rounded px-3" /></div>;\n',
			'b.svelte': '<div class="p-4 bg-white shadow rounded-xl"><button class="px-2 bg-red-500 text-white">x</button></div>\n<style>.a { color: #333; transition: all .3s ease-in; }</style>\n',
			'c.astro': '---\nconst a = 1;\n---\n<a href="/" class="text-blue-600 underline">x</a>\n',
			'd.html.erb': '<h1 class="text-2xl font-bold"><%= t %></h1><%= link_to "x", y, class: "px-4 py-2 bg-blue-600 text-white rounded" %>\n',
			'e.blade.php': '<button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md">{{ __("Save") }}</button>\n',
			'f.html': '<table><tr><th class="px-4 py-2 font-semibold">A</th></tr></table>\n',
		};
		for (const [name, text] of Object.entries(files)) {
			const once = convertFile(name, text, opts).text;
			expect(once, name).not.toBe(text);
			expect(convertFile(name, once, opts).text, name).toBe(once);
		}
	});
	it("keeps a native dialog's backdrop (it used to be dropped with the dialog's own fill)", () => {
		const out = convertFile('a.svelte', '<dialog class="p-6 rounded-xl bg-white shadow-xl backdrop:bg-black/50">x</dialog>\n', opts).text;
		expect(out).toContain('backdrop:bg-surface-inverse/50');
		expect(out).toContain('bg-surface');
	});
		it('a file that does not parse is left as it is', () => {
		expect(() => convertFile('x.tsx', 'export const = <div className="p-4">', opts)).toThrow('does not parse');
		expect(new StructureChanged('x')).toBeInstanceOf(Error);
	});
});

describe('library flavors', () => {
	// A registry with the React and web component flavors of button, as the registry build emits them.
	const fixture = () => {
		const dir = mkdtempSync(join(tmpdir(), 'conare-registry-'));
		cpSync(join(__dirname, '..', 'apps', 'www', 'public', 'r'), join(dir, 'r'), { recursive: true });
		const item = JSON.parse(readFileSync(join(dir, 'r', 'button.json'), 'utf8'));
		item.flavors = {
			react: { files: [{ path: 'react/components/ui/Button.tsx', content: "import { cn } from '@/react/lib/cn';\n\nexport type ButtonProps = { variant?: 'secondary' | 'dark'; children?: React.ReactNode };\n\nexport function Button({ variant = 'secondary', children }: ButtonProps) {\n  return <button data-ds=\"Button\" className={cn('h-control-sm', variant === 'dark' ? 'bg-action-primary' : 'bg-surface')}>{children}</button>;\n}\n" }, { path: 'react/lib/cn.ts', content: 'export const cn = (...a: unknown[]) => a.filter(Boolean).join(" ");\n' }], dependencies: ['lucide-react'], registryDependencies: [] },
			elements: { files: [{ path: 'elements/components/ui/button.ts', content: "@customElement('conare-button')\nexport class ConareButton extends LitElement {\n  @property({ type: String }) variant = 'secondary';\n  render() { this.dispatchEvent(new CustomEvent('press')); return html`<button><slot></slot></button>`; }\n}\n" }], modules: ['elements/button.js'], tag: 'conare-button', dependencies: ['lit'] },
		};
		writeFileSync(join(dir, 'r', 'button.json'), JSON.stringify(item));
		const index = JSON.parse(readFileSync(join(dir, 'r', 'index.json'), 'utf8'));
		for (const i of index.items) if (i.name === 'button') i.flavors = ['vue', 'react', 'elements'];
		writeFileSync(join(dir, 'r', 'index.json'), JSON.stringify(index));
		mkdirSync(join(dir, 'elements'));
		writeFileSync(join(dir, 'elements', 'button.js'), "import { DsElement } from './shared-x1.js';\ncustomElements.define('conare-button', class extends DsElement {});\n");
		writeFileSync(join(dir, 'elements', 'shared-x1.js'), 'export class DsElement extends HTMLElement {}\n');
		(globalThis as any).dsEnv = { DS_REGISTRY_DIR: join(dir, 'r') };
		return dir;
	};
	it('a React app with Tailwind gets the React flavor, its @/react imports through the app alias, packages listed', () => {
		fixture();
		const dir = app({ 'package.json': pkg({ react: '19.2.0', next: '16.0.0' }, { tailwindcss: '^4.1.0' }), 'tsconfig.json': '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }', 'src/app/globals.css': '@import "tailwindcss";\n', 'src/app/layout.tsx': 'import "./globals.css";\n' });
		const r = json(dir, 'add', 'button', '--no-install');
		expect(r.flavor).toBe('react');
		expect(r.packages).toEqual(['lucide-react']);
		expect(read(dir, 'src/components/ui/Button.tsx')).toContain("from '@/lib/cn'");
		const v = json(dir, 'view', 'button').items[0];
		expect(v.flavor).toBe('react');
		expect(v.imports).toEqual(["import { Button } from '@/components/ui/Button'"]);
		expect(v.api[0].props.map((p: { name: string }) => p.name)).toEqual(['variant']);
		expect(json(dir, 'diff', 'button').items[0].files.every((f: { status: string }) => f.status === 'same')).toBe(true);
		expect(json(dir, 'info').installed).toEqual([{ name: 'button', flavor: 'react', modified: [] }]);
	});
	it('a React app with no alias gets relative imports; without Tailwind it takes the web components, and stops when React is asked for by name', () => {
		fixture();
		const dir = app({ 'package.json': pkg({ react: '19.2.0' }, { vite: '7.0.0', tailwindcss: '^4.1.0' }), 'src/index.css': '@import "tailwindcss";\n', 'src/main.tsx': "import './index.css';\n" });
		json(dir, 'add', 'button', '--no-install');
		expect(read(dir, 'src/components/ui/Button.tsx')).toContain("from '../../lib/cn'");
		const plain = app({ 'package.json': pkg({ react: '19.2.0' }, { vite: '7.0.0' }), 'src/index.css': 'body {}\n', 'src/main.tsx': "import './index.css';\n" });
		const auto = json(plain, 'add', 'button', '--dry-run');
		expect(auto.flavor).toBe('elements');
		expect(auto.notes.join(' ')).toContain('no Tailwind');
		expect(fails(plain, 'add', 'button', '--framework', 'react')).toContain('--framework elements');
		expect(json(plain, 'add', 'button', '--framework', 'elements').flavor).toBe('elements');
	});
	it('view and diff take --framework, and read the API the registry build writes for each flavor', () => {
		(globalThis as any).dsEnv = { DS_REGISTRY_DIR: join(__dirname, '..', 'apps', 'www', 'public', 'r') };
		const dir = app({ 'index.html': htmlPage('Home', '<main></main>') });
		const wc = json(dir, 'view', 'dialog').items[0];
		expect(wc.flavor).toBe('elements');
		expect(wc.api[0].component).toBe(`${wc.tag}`);
		expect(wc.api[0].props.map((p: { name: string }) => p.name)).toContain('open');
		expect(wc.api[0].emits).toContain('close');
		expect(wc.api[0].slots).toContain('foot');
		const react = json(dir, 'view', 'dialog', '--framework', 'react').items[0];
		expect(react.flavor).toBe('react');
		expect(react.api[0].props.map((p: { name: string }) => p.name)).toContain('onOpenChange');
		expect(json(dir, 'diff', 'dialog', '--framework', 'react').items[0].files[0].status).toBe('missing');
	});
	it('a site with no build gets the prebuilt web component and its shared chunk in the static folder, with the script line', () => {
		fixture();
		const dir = app({ 'index.html': htmlPage('Home', '<main></main>') });
		const r = json(dir, 'add', 'button');
		expect(r.flavor).toBe('elements');
		expect(existsSync(join(dir, 'conare-ds/elements/button.js'))).toBe(true);
		expect(existsSync(join(dir, 'conare-ds/elements/shared-x1.js'))).toBe(true);
		expect(r.scripts).toEqual(['<script type="module" src="/conare-ds/elements/button.js"></script>']);
		const v = json(dir, 'view', 'button').items[0];
		expect([v.flavor, v.tag]).toEqual(['elements', 'conare-button']);
		expect(v.api[0].props[0].name).toBe('variant');
		expect(v.api[0].emits).toEqual(['press']);
		const django = app({ 'manage.py': '', 'acme/settings.py': "STATIC_URL = '/static/'\n", 'templates/base.html': '<html><head></head><body></body></html>\n', 'static/css/a.css': '' });
		expect(json(django, 'add', 'button').scripts).toEqual([`<script type="module" src="{% static 'conare-ds/elements/button.js' %}"></script>`]);
		// A template without the tag library gets {% load static %} with the links.
		expect(read(django, 'templates/base.html')).toMatch(/^\{% load static %\}\n<html>/);
		expect(read(django, 'templates/base.html')).toContain(`<link rel="stylesheet" href="{% static 'conare-ds/brand.css' %}">`);
		expect(existsSync(join(django, 'static/conare-ds/elements/button.js'))).toBe(true);
	});
	it('list and search show the flavors', () => {
		fixture();
		const button = json(mkdtempSync(join(tmpdir(), 'x-')), 'list').items.find((i: { name: string }) => i.name === 'button');
		expect(button.flavors).toEqual(['vue', 'react', 'elements']);
		(globalThis as any).dsEnv = {};
	});
});

describe('the agent hook', () => {
	it('checks the files an edit payload names, exit 2 with the findings on stderr', () => {
		const dir = app({ 'package.json': pkg({ react: '19.2.0' }), 'src/a.css': '.a { color: #ff0000; }\n', 'src/b.css': '.b { color: var(--ds-color-fg); }\n' });
		const run = (payload: string) => {
			try {
				execFileSync('node', [bin, 'hook', '--cwd', dir], { input: payload, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
				return { code: 0, err: '' };
			} catch (e) {
				return { code: (e as { status: number }).status, err: (e as { stderr: string }).stderr };
			}
		};
		const bad = run(JSON.stringify({ tool_input: { file_path: join(dir, 'src/a.css') } }));
		expect(bad.code).toBe(2);
		expect(bad.err).toContain('src/a.css:1:13  raw-color');
		expect(run(JSON.stringify({ file_path: 'src/b.css' })).code).toBe(0);
	});
});
