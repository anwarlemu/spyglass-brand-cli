import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkText } from '../src/check/engine.js';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('build', () => {
	it('writes the brand files', () => {
		for (const f of ['build/brand.css', 'build/theme.css', 'build/tokens.css', 'build/fonts.css', 'build/tokens.json']) expect(existsSync(join(root, f)), f).toBe(true);
	});
	it('maps tokens to Tailwind utilities', () => {
		const theme = read('build/theme.css');
		for (const line of ['--color-surface: var(--ds-color-surface);', '--color-fg-muted: var(--ds-color-fg-muted);', '--color-edge: var(--ds-color-edge);', '--text-ui: var(--ds-text-ui);', '--radius-control: var(--ds-radius-control);', '--ease-out: var(--ds-easing-out);', '@utility type-ui {']) expect(theme).toContain(line);
	});
	it("leaves Tailwind's own neutral and radius scales alone, so an app looks the same where the brand is not applied", () => {
		const theme = read('build/theme.css');
		expect(theme).not.toMatch(/--color-neutral-\d/);
		expect(theme).toContain('--color-ds-neutral-500: var(--ds-color-neutral-500);');
		expect(theme).not.toMatch(/--radius-(sm|md|lg|xl):/);
		expect(theme).toContain('--radius-ds-lg: var(--ds-radius-lg);');
	});
	it('serves every font file it declares', () => {
		const fonts = read('build/fonts.css');
		for (const m of fonts.matchAll(/url\("\/conare-ds\/fonts\/([^"]+)"\)/g)) expect(existsSync(join(root, 'build', 'fonts', m[1])), m[1]).toBe(true);
	});
	it('resolves the dark theme', () => {
		const t = JSON.parse(read('build/tokens.json')).tokens;
		expect(t['--ds-color-surface'].light).toBe('#FEFEFE');
		expect(t['--ds-color-surface'].dark).toBe('#020202');
	});
	it('keeps its own element styles on the tokens', () => {
		expect(checkText('build/base.css', read('build/base.css')).findings).toEqual([]);
	});
});

describe('registry', () => {
	const index = JSON.parse(read('apps/www/public/r/index.json'));
	it('lists every item with files, examples and docs', () => {
		expect(index.items.length).toBeGreaterThanOrEqual(16);
		for (const i of index.items) {
			expect(i.files.length, i.name).toBeGreaterThan(0);
			expect(i.examples.length, i.name).toBeGreaterThan(0);
			expect(i.use_for, i.name).toBeTruthy();
		}
	});
	it('requires only items that exist and packages it imports', () => {
		const names = new Set(index.items.map((i: { name: string }) => i.name));
		for (const i of index.items) {
			for (const r of i.requires) expect(names.has(r), `${i.name} requires ${r}`).toBe(true);
			for (const d of i.dependencies) expect(d).not.toBe('vue');
		}
		const status = index.items.find((i: { name: string }) => i.name === 'tag');
		expect(status.requires).toContain('loader');
	});
	it('ships component content in each item file', () => {
		const button = JSON.parse(read('apps/www/public/r/button.json'));
		expect(button.files.find((f: { path: string }) => f.path === 'components/ui/Button.vue').content).toContain('<script setup lang="ts">');
		expect(button.files.map((f: { path: string }) => f.path)).toContain('composables/usePixelGrid.ts');
	});
});
