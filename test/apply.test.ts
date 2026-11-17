import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const bin = join(__dirname, '..', 'bin.js');
const cli = (cwd: string, ...args: string[]) => execFileSync('node', [bin, ...args, '--cwd', cwd], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const json = (cwd: string, ...args: string[]) => JSON.parse(cli(cwd, ...args, '--json'));
const fails = (cwd: string, ...args: string[]) => {
	try {
		cli(cwd, ...args);
	} catch (e) {
		return (e as { stderr: string }).stderr;
	}
	throw new Error(`expected \`${args.join(' ')}\` to fail`);
};

function write(dir: string, files: Record<string, string>) {
	for (const [rel, text] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, rel)), { recursive: true });
		writeFileSync(join(dir, rel), text);
	}
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

const page = (body: string, script = '') => `<script setup lang="ts">\n${script}\n</script>\n\n<template>\n${body}\n</template>\n`;

/** A Nuxt 4 app: pages for /, /settings and /billing, a layout, components used by one page or several. */
function nuxtApp() {
	const dir = mkdtempSync(join(tmpdir(), 'conare-apply-'));
	write(dir, {
		'package.json': JSON.stringify({ dependencies: { nuxt: '^4.6.0', vue: '^3.5.0' }, devDependencies: { tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0' } }),
		'nuxt.config.ts': "export default defineNuxtConfig({ css: ['~/assets/css/main.css'] })\n",
		'app/assets/css/main.css': '@import "tailwindcss";\n\nbody { color: #111827; }\n',
		'app/app.vue': '<template>\n  <NuxtLayout><NuxtPage /></NuxtLayout>\n</template>\n',
		'app/layouts/default.vue': '<template>\n  <div class="bg-gray-50"><AppNav /><slot /></div>\n</template>\n',
		'app/components/AppNav.vue': page('  <nav class="bg-slate-900 text-white">Acme</nav>'),
		'app/components/BaseButton.vue': page('  <button :class="[base, variants[variant]]"><slot /></button>', "const variant = 'primary'\nconst base = 'rounded-lg px-4 py-2 text-sm'\nconst variants: Record<string, string> = { primary: 'bg-indigo-600 text-white', secondary: 'bg-white border border-gray-300' }"),
		'app/components/settings/ProfileForm.vue': page('  <form class="rounded-lg border border-gray-200 bg-white p-6"><input class="rounded-md border-gray-300 text-sm"><BaseButton>Save</BaseButton></form>'),
		'app/components/StatusBadge.vue': page('  <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">paid</span>'),
		'app/pages/index.vue': page('  <main class="p-8"><h1 class="text-4xl font-bold text-gray-900">Acme</h1><button class="rounded bg-blue-600 px-4 py-2 text-white">Start</button></main>'),
		'app/pages/settings.vue': page('  <main class="p-8"><h1 class="text-3xl font-bold">Settings</h1><SettingsProfileForm /></main>'),
		'app/pages/billing.vue': page('  <main class="p-8"><h1 class="text-3xl font-bold">Billing</h1><StatusBadge /><BaseButton variant="secondary">Cancel plan</BaseButton></main>'),
	});
	return dir;
}

const SETUP = /^(\.ds\/|AGENTS\.md|public\/|app\/assets\/css\/conare-ds\/|app\/assets\/css\/main\.css$)/;
const changed = (before: Record<string, string>, after: Record<string, string>) => Object.keys(after).filter((f) => before[f] !== after[f] && !SETUP.test(f)).sort();

describe('apply', () => {
	it('restyles the whole app, installs the theme and changes nothing on a second run', () => {
		const dir = nuxtApp();
		const before = snapshot(dir);
		const r = json(dir, 'apply');
		expect(r.scope.whole).toBe(true);
		expect(readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8')).toContain('@import "./conare-ds/theme.css";');
		expect(readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8')).toContain('color: var(--ds-color-fg);');
		expect(changed(before, snapshot(dir)).length).toBeGreaterThan(5);
		const once = snapshot(dir);
		cli(dir, 'apply');
		expect(snapshot(dir)).toEqual(once);
		expect(json(dir, 'check').findings).toEqual([]);
	});
	it('applies to a page and only the components it alone uses; shared files are listed, not touched', () => {
		const dir = nuxtApp();
		const before = snapshot(dir);
		const r = json(dir, 'apply', '/settings');
		expect(changed(before, snapshot(dir))).toEqual(['app/components/settings/ProfileForm.vue', 'app/pages/settings.vue']);
		expect(r.sharedLeftOut).toEqual(expect.arrayContaining(['app/components/BaseButton.vue', 'app/layouts/default.vue']));
		// The main stylesheet gets the imports only: its own values are outside the scope.
		expect(readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8')).toContain('body { color: #111827; }');
		// The check enforces the brand on the scope only, so the rest of the app does not fail it.
		expect(json(dir, 'check').findings).toEqual([]);
		expect(() => cli(dir, 'check', '--all')).toThrow();
	});
	it('applies named kinds across the app and leaves everything else as it was', () => {
		const dir = nuxtApp();
		const before = snapshot(dir);
		cli(dir, 'apply', 'Button');
		expect(changed(before, snapshot(dir))).toEqual(['app/components/BaseButton.vue', 'app/pages/index.vue']);
		const index = readFileSync(join(dir, 'app/pages/index.vue'), 'utf8');
		expect(index).toContain('<h1 class="text-4xl font-bold text-gray-900">');
		expect(index).toContain('bg-action-primary');
		// The check covers the button components only, not the badge component left as it was.
		expect(JSON.parse(readFileSync(join(dir, '.ds/state.json'), 'utf8')).checked).toEqual(['app/components/BaseButton.vue']);
		expect(json(dir, 'check').findings).toEqual([]);
	});
	it('combines kinds and pages, records the scope, widens it, and --redo repeats it', () => {
		const dir = nuxtApp();
		cli(dir, 'apply', '--components', 'button,badge', '--pages', '/billing');
		const state = JSON.parse(readFileSync(join(dir, '.ds/state.json'), 'utf8'));
		expect(state.parts).toHaveLength(1);
		expect(state.parts[0].kinds).toEqual(['button', 'badge']);
		const once = snapshot(dir);
		cli(dir, 'apply', '--components', 'button,badge', '--pages', '/billing');
		expect(snapshot(dir), 'the same apply again changes nothing, the state included').toEqual(once);
		cli(dir, 'apply', '/settings');
		expect(JSON.parse(readFileSync(join(dir, '.ds/state.json'), 'utf8')).parts).toHaveLength(2);
		const r = json(dir, 'apply', '--redo', '--dry-run');
		expect(r.files).toEqual([]);
		cli(dir, 'apply');
		expect(JSON.parse(readFileSync(join(dir, '.ds/state.json'), 'utf8')).whole).toBe(true);
	});
	it('lists every file with its reason and changes in a JSON dry run, writing nothing', () => {
		const dir = nuxtApp();
		const before = snapshot(dir);
		const r = json(dir, 'apply', 'app/pages/billing.vue', '--dry-run');
		expect(snapshot(dir)).toEqual(before);
		expect(r.files.map((f: { file: string }) => f.file).sort()).toEqual(['app/components/StatusBadge.vue', 'app/pages/billing.vue']);
		for (const f of r.files) {
			expect(f.reason).toBeTruthy();
			expect(f.changes.length).toBeGreaterThan(0);
		}
	});
	it('fails on a target it cannot resolve, with suggestions, writing nothing', () => {
		const dir = nuxtApp();
		const before = snapshot(dir);
		const err = fails(dir, 'apply', '/setings', 'Buton');
		expect(err).toContain('/settings');
		expect(err).toContain('`button`');
		expect(snapshot(dir)).toEqual(before);
	});
	it('rejects an unknown option instead of widening the apply', () => {
		const dir = nuxtApp();
		const before = snapshot(dir);
		expect(fails(dir, 'apply', '--component', 'button')).toContain('Unknown option');
		expect(snapshot(dir)).toEqual(before);
	});
	it("restyles the app's own components/ui/Button.vue but never a library file add wrote", () => {
		const dir = nuxtApp();
		write(dir, { 'app/components/ui/Button.vue': page('  <button class="rounded-md bg-violet-600 px-3 py-2 text-white"><slot /></button>') });
		cli(dir, 'add', 'tag', '--no-install');
		const tag = readFileSync(join(dir, 'app/components/ui/Tag.vue'), 'utf8');
		cli(dir, 'apply');
		expect(readFileSync(join(dir, 'app/components/ui/Button.vue'), 'utf8')).toContain('bg-action-primary');
		expect(readFileSync(join(dir, 'app/components/ui/Tag.vue'), 'utf8')).toBe(tag);
	});
	it('reads Vue Router routes in a Vite app', () => {
		const dir = mkdtempSync(join(tmpdir(), 'conare-vite-'));
		write(dir, {
			'package.json': JSON.stringify({ dependencies: { vue: '^3.5.0', 'vue-router': '^4.5.0' }, devDependencies: { tailwindcss: '^4.1.0' } }),
			'src/main.ts': "import './style.css'\n",
			'src/style.css': '@import "tailwindcss";\n',
			'src/router/index.ts': "import { createRouter, createWebHistory } from 'vue-router'\nimport Home from '../views/Home.vue'\nexport default createRouter({ history: createWebHistory(), routes: [{ path: '/', component: Home }, { path: '/team', component: () => import('../views/Team.vue'), children: [{ path: 'invite', component: () => import('../views/Invite.vue') }] }] })\n",
			'src/views/Home.vue': page('  <p class="text-gray-500">Home</p>'),
			'src/views/Team.vue': page('  <p class="text-gray-500">Team</p>'),
			'src/views/Invite.vue': page('  <p class="text-gray-500">Invite</p>'),
		});
		const r = json(dir, 'apply', '/team/invite', '--dry-run');
		expect(r.files.map((f: { file: string }) => f.file)).toEqual(['src/views/Invite.vue']);
	});
});

describe('apps it cannot restyle fail clearly and write nothing', () => {
	it('in a folder with no app', () => {
		const empty = mkdtempSync(join(tmpdir(), 'conare-empty-'));
		expect(fails(empty, 'init')).toContain('no app this can restyle');
		expect(fails(empty, 'apply')).toContain('Nothing was written');
		expect(readdirSync(empty)).toEqual([]);
	});
	it('on Tailwind 2', () => {
		const dir = mkdtempSync(join(tmpdir(), 'conare-tw2-'));
		write(dir, { 'package.json': JSON.stringify({ dependencies: { vue: '^3.5.0' }, devDependencies: { tailwindcss: '^2.2.0' } }), 'src/style.css': '@tailwind base;\n' });
		const before = snapshot(dir);
		for (const cmd of [['apply'], ['init'], ['add', 'button', '--no-install']]) expect(fails(dir, ...cmd)).toContain('Tailwind CSS 2');
		expect(snapshot(dir)).toEqual(before);
	});
});

describe('library by name', () => {
	it('adds items however they are typed: Button, AlertDialog, alert-dialog, badge', () => {
		const dir = nuxtApp();
		const r = json(dir, 'add', 'Button', 'AlertDialog', 'badge', '--no-install');
		expect(r.items).toEqual(expect.arrayContaining(['button', 'alert-dialog', 'tag']));
		expect(r.notes.join(' ')).toContain('badge is tag');
		expect(existsSync(join(dir, 'app/components/ui/AlertDialog.vue'))).toBe(true);
		expect(fails(dir, 'add', 'buton', '--no-install')).toContain('`button`');
	});
	it('shows how to use an item: props, model, events, slots, examples', () => {
		const v = json(dir0(), 'view', 'alert-dialog').items[0];
		const api = v.api.find((a: { component: string }) => a.component === 'AlertDialog');
		expect(api.props.map((p: { name: string }) => p.name)).toEqual(expect.arrayContaining(['title', 'action']));
		expect(api.models[0].name).toBe('open');
		expect(api.emits).toEqual(expect.arrayContaining(['confirm', 'cancel']));
		expect(v.examples.length).toBeGreaterThan(0);
		expect(v.files[0].content).toContain('<script setup');
		const button = json(dir0(), 'view', 'button').items[0].api[0];
		expect(button.props.find((p: { name: string }) => p.name === 'variant').type).toContain("'dark'");
	});
	it('searches, describes the app and diffs a local copy', () => {
		expect(json(dir0(), 'search', 'modal').results[0].name).toBe('dialog');
		const dir = nuxtApp();
		cli(dir, 'add', 'tag', '--no-install');
		const info = json(dir, 'info');
		expect(info.framework).toBe('nuxt');
		expect(info.theme).toBe(true);
		expect(info.installed.map((i: { name: string }) => i.name)).toEqual(expect.arrayContaining(['tag', 'loader']));
		writeFileSync(join(dir, 'app/components/ui/Tag.vue'), `${readFileSync(join(dir, 'app/components/ui/Tag.vue'), 'utf8')}<!-- local -->\n`);
		let out = '';
		try {
			cli(dir, 'diff', 'tag', '--json');
		} catch (e) {
			// Like git diff --exit-code: 1 when a local copy differs.
			expect((e as { status: number }).status).toBe(1);
			out = (e as { stdout: string }).stdout;
		}
		const d = JSON.parse(out).items[0].files.find((f: { path: string }) => f.path === 'app/components/ui/Tag.vue');
		expect(d.status).toBe('changed');
		expect(d.diff).toContain('-<!-- local -->');
	});
	it('installs with the workspace manager in a monorepo', () => {
		const root = mkdtempSync(join(tmpdir(), 'conare-mono-'));
		write(root, { 'package.json': JSON.stringify({ private: true, workspaces: ['apps/*'] }), 'bun.lock': '{}\n', 'apps/web/package.json': JSON.stringify({ dependencies: { vue: '^3.5.0' }, devDependencies: { tailwindcss: '^4.1.0' } }), 'apps/web/src/style.css': '@import "tailwindcss";\n' });
		const info = json(join(root, 'apps/web'), 'info');
		expect(info.packageManager).toBe('bun');
		expect(info.installRoot).toBe(root);
	});
});

let empty: string | undefined;
function dir0() {
	empty ??= mkdtempSync(join(tmpdir(), 'conare-view-'));
	return empty;
}
