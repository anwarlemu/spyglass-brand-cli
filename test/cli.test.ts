import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const bin = join(__dirname, '..', 'bin.js');
const run = (cwd: string, ...args: string[]) => execFileSync('node', [bin, ...args, '--cwd', cwd, '--json'], { encoding: 'utf8' });

function nuxtApp(withAlias = true) {
	const dir = mkdtempSync(join(tmpdir(), 'conare-ds-'));
	writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { nuxt: '4.6.0', vue: '3.5.43', 'lucide-vue-next': '^0.479.0' }, devDependencies: { tailwindcss: '^4.2.2', '@tailwindcss/vite': '^4.2.2' } }));
	writeFileSync(join(dir, withAlias ? 'nuxt.config.ts' : 'vite.config.ts'), withAlias ? "export default defineNuxtConfig({ css: ['~/assets/css/main.css'] })\n" : 'export default {}\n');
	mkdirSync(join(dir, withAlias ? 'app/assets/css' : 'src'), { recursive: true });
	if (withAlias) writeFileSync(join(dir, 'app/assets/css/main.css'), '@import "tailwindcss";\n\nbody { margin: 0; }\n');
	else writeFileSync(join(dir, 'src/style.css'), '@import "tailwindcss";\n');
	return dir;
}

describe('cli', () => {
	it('lists items', () => {
		const out = JSON.parse(run(mkdtempSync(join(tmpdir(), 'conare-ds-')), 'list'));
		expect(out.items.map((i: { name: string }) => i.name)).toContain('button');
	});
	it('init installs the stylesheet after tailwind, the fonts and the contract', () => {
		const dir = nuxtApp();
		run(dir, 'init');
		const css = readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8');
		expect(css.indexOf('@import "tailwindcss"')).toBeLessThan(css.indexOf('./conare-ds/brand.css'));
		expect(css).toContain('@import "./conare-ds/theme.css";');
		expect(existsSync(join(dir, 'app/assets/css/conare-ds/theme.css'))).toBe(true);
		expect(existsSync(join(dir, 'public/conare-ds/fonts/Geist-400.woff2'))).toBe(true);
		expect(readFileSync(join(dir, 'AGENTS.md'), 'utf8')).toContain('ds:contract:start');
		// Running it again changes nothing.
		run(dir, 'init');
		expect(readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8')).toBe(css);
	});
	it('add copies an item with what it requires into app/', () => {
		const dir = nuxtApp();
		const out = JSON.parse(run(dir, 'add', 'tag', '--no-install'));
		expect(out.items).toEqual(['loader', 'tag']);
		for (const f of ['app/components/ui/Tag.vue', 'app/components/ui/StatusTag.vue', 'app/components/ui/DotMatrix.vue']) expect(existsSync(join(dir, f)), f).toBe(true);
		expect(existsSync(join(dir, 'app/assets/css/conare-ds/brand.css'))).toBe(true);
	});
	it('rewrites @/ imports when the app has no alias', () => {
		const dir = nuxtApp(false);
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { vue: '3.5.43', 'lucide-vue-next': '^0.479.0' }, devDependencies: { tailwindcss: '^4.2.2' } }));
		run(dir, 'add', 'copy-button', '--no-install');
		const text = readFileSync(join(dir, 'src/components/ui/CopyButton.vue'), 'utf8');
		expect(text).toContain("from '../../composables/useCopy'");
	});
	it('check exits 1 on findings and 0 when clean', () => {
		const dir = nuxtApp();
		writeFileSync(join(dir, 'app/bad.vue'), '<template><div class="bg-red-500 transition-all" /></template>\n');
		let code = 0;
		try { run(dir, 'check', 'app/bad.vue'); } catch (e) { code = (e as { status: number }).status; }
		expect(code).toBe(1);
		writeFileSync(join(dir, 'app/good.vue'), '<template><div class="bg-surface text-fg" /></template>\n');
		expect(JSON.parse(run(dir, 'check', 'app/good.vue')).findings).toEqual([]);
	});
	it('installs a Tailwind 3 app with a preset wired into its config (it used to refuse)', () => {
		const dir = mkdtempSync(join(tmpdir(), 'conare-ds-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { vue: '3.5.43' }, devDependencies: { tailwindcss: '^3.4.17' } }));
		mkdirSync(join(dir, 'src'));
		writeFileSync(join(dir, 'src/main.ts'), "import './style.css'\n");
		writeFileSync(join(dir, 'src/style.css'), '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
		writeFileSync(join(dir, 'tailwind.config.js'), "/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{vue,ts}'],\n  theme: { extend: {} },\n  plugins: [],\n};\n");
		run(dir, 'init');
		const css = readFileSync(join(dir, 'src/style.css'), 'utf8');
		expect(css.startsWith('@import "./conare-ds/brand.css";\n@tailwind base;')).toBe(true);
		expect(readFileSync(join(dir, 'tailwind.config.js'), 'utf8')).toContain("presets: [require('./src/conare-ds/tailwind-preset.cjs')]");
		const preset = readFileSync(join(dir, 'src/conare-ds/tailwind-preset.cjs'), 'utf8');
		expect(preset).toContain('"surface"');
		expect(preset).toContain("addVariant('pointer-coarse'");
		// The preset's keys Tailwind also has (font-sans) keep the app's value outside the brand's scope.
		expect(preset).toContain('var(--ds-scope-fontFamily-sans)');
		const once = readFileSync(join(dir, 'tailwind.config.js'), 'utf8');
		run(dir, 'init');
		expect(readFileSync(join(dir, 'tailwind.config.js'), 'utf8')).toBe(once);
	});
	it("installs with the workspace's package manager when the app sits in a monorepo", () => {
		const root = mkdtempSync(join(tmpdir(), 'conare-ds-'));
		writeFileSync(join(root, 'package.json'), JSON.stringify({ private: true, workspaces: ['apps/*'] }));
		writeFileSync(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
		mkdirSync(join(root, 'apps/web/src'), { recursive: true });
		writeFileSync(join(root, 'apps/web/package.json'), JSON.stringify({ dependencies: { vue: '3.5.43' }, devDependencies: { tailwindcss: '^4.2.2' } }));
		const out = JSON.parse(run(join(root, 'apps/web'), 'info'));
		expect(out.packageManager).toBe('pnpm');
	});
});
