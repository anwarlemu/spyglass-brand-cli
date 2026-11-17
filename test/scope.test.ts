import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { scopeTheme } from '../src/install/theme.js';

// A selection or a plain add installs tokens, theme and fonts with the base scoped to the library's components and to
// what the selection restyled; only a whole-app apply installs the base for every page.

const root = join(__dirname, '..');
const bin = join(root, 'bin.js');
const cli = (cwd: string, ...args: string[]) => execFileSync('node', [bin, ...args, '--cwd', cwd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const read = (dir: string, rel: string) => readFileSync(join(dir, rel), 'utf8');
const page = (body: string) => `<script setup lang="ts">\n</script>\n\n<template>\n${body}\n</template>\n`;

function app() {
	const dir = mkdtempSync(join(tmpdir(), 'conare-scope-'));
	const files: Record<string, string> = {
		'package.json': JSON.stringify({ dependencies: { nuxt: '^4.6.0', vue: '^3.5.0' }, devDependencies: { tailwindcss: '^4.1.0' } }),
		'nuxt.config.ts': "export default defineNuxtConfig({ css: ['~/assets/css/main.css'] })\n",
		'app/assets/css/main.css': '@import "tailwindcss";\n\n@theme {\n  --font-sans: "Inter", sans-serif;\n}\n',
		'app/pages/index.vue': page('  <main class="p-8"><h1 class="text-4xl font-bold">Home</h1><p class="text-gray-600">Out of scope.</p></main>'),
		'app/pages/settings.vue': page('  <main class="p-8"><h1 class="text-3xl font-bold">Settings</h1><button class="rounded bg-blue-600 px-4 py-2 text-white">Save</button></main>'),
	};
	for (const [rel, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), text);
	}
	return dir;
}
const brandCss = (dir: string) => read(dir, 'app/assets/css/conare-ds/brand.css');
const themeCss = (dir: string) => read(dir, 'app/assets/css/conare-ds/theme.css');
/** Selectors of rules that apply to the whole page: anything not inside the library's or the selection's scope. */
const globalRules = (css: string) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(^|[{}])\s*([^{}@;]+)\{/g)].map((m) => m[2].trim()).filter((s) => !/^(:root|\[data-theme=|@)/.test(s) && !/:(where|is)\(\[data-ds\], \.ds-scope\)/.test(s));

describe('the base layer reaches only what was named', () => {
	it('ships a scoped base: no html, body, heading or focus rule outside the library and the selection', () => {
		const scoped = read(root, 'build/brand-scoped.css');
		expect(globalRules(scoped)).toEqual([]);
		expect(globalRules(read(root, 'build/brand.css'))).toContain('body');
		// The type on a scoped root outranks Tailwind's preflight (button { font: inherit }) in the base layer.
		expect(scoped).toContain(':is([data-ds], .ds-scope):not(:is([data-ds], .ds-scope) *) {');
		// The brand's faces under their own names, so an app that names Inter or Geist keeps its own rendering.
		expect(scoped).toMatch(/font-family: "Geist \(Conare\)";/);
		expect(scoped).not.toMatch(/font-family: "Inter";/);
	});
	it('marks every library component root with data-ds', () => {
		const index = JSON.parse(read(root, 'apps/www/public/r/index.json'));
		for (const entry of index.items) {
			const item = JSON.parse(read(root, `apps/www/public/r/${entry.name}.json`));
			for (const f of item.files.filter((x: { path: string }) => x.path.endsWith('.vue'))) expect(f.content, f.path).toMatch(/<template>[\s\S]*data-ds="/);
		}
	});
	it('a plain add installs the scoped base and a theme that keeps the app font-sans', () => {
		const dir = app();
		cli(dir, 'add', 'button', '--no-install');
		expect(globalRules(brandCss(dir))).toEqual([]);
		expect(themeCss(dir)).toContain('--font-sans: var(--ds-scope-font-sans);');
		expect(themeCss(dir)).toMatch(/:root \{\n {2}--ds-scope-font-sans: "Inter", sans-serif;/);
		expect(read(dir, 'app/components/ui/Button.vue')).toContain('data-ds="button"');
	});
	it('a page selection marks the page it restyled and nothing else', () => {
		const dir = app();
		const home = read(dir, 'app/pages/index.vue');
		cli(dir, 'apply', '/settings');
		expect(globalRules(brandCss(dir))).toEqual([]);
		expect(read(dir, 'app/pages/settings.vue')).toMatch(/<main class="[^"]*ds-scope">/);
		expect(read(dir, 'app/pages/index.vue')).toBe(home);
		const once = read(dir, 'app/pages/settings.vue');
		cli(dir, 'apply', '/settings');
		expect(read(dir, 'app/pages/settings.vue')).toBe(once);
	});
	it('a kind selection marks the elements it restyled', () => {
		const dir = app();
		cli(dir, 'apply', 'button');
		expect(read(dir, 'app/pages/settings.vue')).toMatch(/<button class="[^"]*bg-action-primary[^"]*ds-scope">/);
		expect(read(dir, 'app/pages/settings.vue')).toContain('<h1 class="text-3xl font-bold">');
		expect(globalRules(brandCss(dir))).toEqual([]);
	});
	it('the whole app gets the base, keeps it through a later selection and add, and needs no marks', () => {
		const dir = app();
		cli(dir, 'apply');
		expect(globalRules(brandCss(dir))).toContain('body');
		expect(themeCss(dir)).toContain('--font-sans: var(--ds-font-text);');
		expect(read(dir, 'app/pages/settings.vue')).not.toContain('ds-scope');
		cli(dir, 'apply', '/settings');
		cli(dir, 'add', 'tag', '--no-install');
		expect(globalRules(brandCss(dir))).toContain('body');
		expect(JSON.parse(read(dir, '.ds/state.json')).whole).toBe(true);
	});
	it("points a key Tailwind has at the app's value outside the scope and the brand's inside", () => {
		const theme = '@theme inline {\n  --font-sans: var(--ds-font-text);\n  --color-surface: var(--ds-color-surface);\n  --tracking-tight: var(--ds-tracking-tight);\n}\n';
		const r = scopeTheme(theme, new Map(), new Map([['--font-sans', 'ui-sans-serif, system-ui'], ['--tracking-tight', '-0.025em']]));
		expect(r.scoped).toEqual(['--font-sans', '--tracking-tight']);
		expect(r.theme).toContain('--color-surface: var(--ds-color-surface);');
		expect(r.theme).toContain(':where([data-ds], .ds-scope) {\n  --ds-scope-font-sans: var(--ds-font-text);');
	});
});
