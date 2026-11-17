import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const bin = join(__dirname, '..', 'bin.js');
const run = (cwd: string, ...args: string[]) => execFileSync('node', [bin, ...args, '--cwd', cwd, '--json'], { encoding: 'utf8' });

function nuxtApp(withAlias = true) {
	const dir = mkdtempSync(join(tmpdir(), 'spyglass-ds-'));
	writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { nuxt: '4.6.0', vue: '3.5.43', 'lucide-vue-next': '^0.479.0' }, devDependencies: { tailwindcss: '^4.2.2', '@tailwindcss/vite': '^4.2.2' } }));
	writeFileSync(join(dir, withAlias ? 'nuxt.config.ts' : 'vite.config.ts'), withAlias ? "export default defineNuxtConfig({ css: ['~/assets/css/main.css'] })\n" : 'export default {}\n');
	mkdirSync(join(dir, withAlias ? 'app/assets/css' : 'src'), { recursive: true });
	if (withAlias) writeFileSync(join(dir, 'app/assets/css/main.css'), '@import "tailwindcss";\n\nbody { margin: 0; }\n');
	else writeFileSync(join(dir, 'src/style.css'), '@import "tailwindcss";\n');
	return dir;
}

/** A Next.js app (App Router, Tailwind 4, the @/ alias at the root), or a Vite + React app with no alias. */
function reactApp(withAlias = true) {
	const dir = mkdtempSync(join(tmpdir(), 'spyglass-ds-'));
	if (withAlias) {
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { next: '16.0.0', react: '19.2.0', 'react-dom': '19.2.0', 'lucide-react': '0.479.0' }, devDependencies: { tailwindcss: '^4.2.2', '@tailwindcss/postcss': '^4.2.2' } }));
		mkdirSync(join(dir, 'app'));
		writeFileSync(join(dir, 'app/globals.css'), '@import "tailwindcss";\n');
		writeFileSync(join(dir, 'app/layout.tsx'), "import './globals.css'\nexport default function Layout({ children }: { children: React.ReactNode }) { return <html><body>{children}</body></html> }\n");
		writeFileSync(join(dir, 'tsconfig.json'), JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }));
	} else {
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { react: '19.2.0', 'react-dom': '19.2.0', 'lucide-react': '0.479.0' }, devDependencies: { vite: '^7.1.12', tailwindcss: '^4.2.2', '@tailwindcss/vite': '^4.2.2' } }));
		writeFileSync(join(dir, 'vite.config.ts'), 'export default {}\n');
		mkdirSync(join(dir, 'src'));
		writeFileSync(join(dir, 'src/main.tsx'), "import './index.css'\n");
		writeFileSync(join(dir, 'src/index.css'), '@import "tailwindcss";\n');
	}
	return dir;
}

describe('cli', () => {
	it('lists items', () => {
		const out = JSON.parse(run(mkdtempSync(join(tmpdir(), 'spyglass-ds-')), 'list'));
		expect(out.items.map((i: { name: string }) => i.name)).toContain('button');
	});
	it('init installs the stylesheet after tailwind, the fonts and the contract', () => {
		const dir = nuxtApp();
		run(dir, 'init');
		const css = readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8');
		expect(css.indexOf('@import "tailwindcss"')).toBeLessThan(css.indexOf('./spyglass-ds/brand.css'));
		expect(css).toContain('@import "./spyglass-ds/theme.css";');
		expect(existsSync(join(dir, 'app/assets/css/spyglass-ds/theme.css'))).toBe(true);
		for (const f of ['FunnelDisplay-400.woff2', 'DMSans-400.woff2', 'DMSans-500.woff2', 'GeistMono-400.woff2', 'licenses/DMSans-OFL.txt']) expect(existsSync(join(dir, 'public/spyglass-ds/fonts', f)), f).toBe(true);
		expect(existsSync(join(dir, 'public/spyglass-ds/logo/horizontal-white.svg'))).toBe(true);
		expect(readFileSync(join(dir, 'AGENTS.md'), 'utf8')).toContain('ds:contract:start');
		// Running it again changes nothing.
		run(dir, 'init');
		expect(readFileSync(join(dir, 'app/assets/css/main.css'), 'utf8')).toBe(css);
	});
	it('add copies a React item with what it requires, imports through the app alias', () => {
		const dir = reactApp();
		const out = JSON.parse(run(dir, 'add', 'search-bar', '--no-install'));
		expect(out.flavor).toBe('react');
		expect(out.items).toEqual(['button', 'search-bar']);
		for (const f of ['components/product/SearchBar.tsx', 'components/ui/Button.tsx', 'hooks/useControllable.ts', 'lib/cn.ts']) expect(existsSync(join(dir, f)), f).toBe(true);
		const bar = readFileSync(join(dir, 'components/product/SearchBar.tsx'), 'utf8');
		expect(bar).toContain("from '@/components/ui/Button'");
		expect(bar).not.toContain('@/react/');
		expect(existsSync(join(dir, 'app/spyglass-ds/brand.css'))).toBe(true);
	});
	it('add brings the framework-free generator a visual imports, and rewrites @/ imports when the app has no alias', () => {
		const dir = reactApp(false);
		run(dir, 'add', 'ascii-texture', '--no-install');
		for (const f of ['src/components/visuals/AsciiTexture.tsx', 'src/components/visuals/BrandLight.tsx', 'src/lib/ascii.ts', 'src/lib/light.ts', 'src/lib/light-master.ts']) expect(existsSync(join(dir, f)), f).toBe(true);
		expect(readFileSync(join(dir, 'src/components/visuals/AsciiTexture.tsx'), 'utf8')).toContain("from '../../lib/ascii'");
		expect(readFileSync(join(dir, 'src/lib/ascii.ts'), 'utf8')).toContain("from './light'");
	});
	it('add gives a Vue app the web components, with Vue told the tags are custom elements', () => {
		const dir = nuxtApp();
		const out = JSON.parse(run(dir, 'add', 'button', '--no-install'));
		expect(out.flavor).toBe('elements');
		expect(existsSync(join(dir, 'public/spyglass-ds/elements/button.js'))).toBe(true);
		expect(existsSync(join(dir, 'public/spyglass-ds/elements/shared.js'))).toBe(true);
		expect(readFileSync(join(dir, 'nuxt.config.ts'), 'utf8')).toContain("isCustomElement: (tag) => tag.startsWith('spyglass-')");
	});
	it('add copies a page template with its copy file and every item it is built from', () => {
		const dir = reactApp();
		const out = JSON.parse(run(dir, 'add', 'home-page', '--no-install'));
		expect(out.flavor).toBe('react');
		for (const item of ['home-page', 'hero-block', 'offer-block', 'stat-block', 'site-header', 'footer-row', 'creative-card', 'creative-corridor', 'creative-ring', 'testimonial', 'search-bar', 'card']) expect(out.items, item).toContain(item);
		for (const f of ['components/pages/HomePage.tsx', 'lib/pages/home.ts', 'lib/creative-layouts.ts', 'components/blocks/HeroBlock.tsx', 'components/site/CreativeCorridor.tsx']) expect(existsSync(join(dir, f)), f).toBe(true);
		const page = readFileSync(join(dir, 'components/pages/HomePage.tsx'), 'utf8');
		expect(page).toContain("from '@/lib/pages/home'");
		expect(page).not.toContain('@/react/');
	});
	it('add gives a Vue app a page template as one web component and the elements it renders', () => {
		const dir = nuxtApp();
		const out = JSON.parse(run(dir, 'add', 'pricing-page', '--no-install'));
		expect(out.flavor).toBe('elements');
		for (const f of ['pricing-page', 'plan-card', 'offer-block', 'site-header', 'footer-row']) expect(existsSync(join(dir, `public/spyglass-ds/elements/${f}.js`)), f).toBe(true);
	});
	it('manifest lists the page templates and blocks with the command that adds each', () => {
		const doc = JSON.parse(run(mkdtempSync(join(tmpdir(), 'spyglass-ds-')), 'manifest'));
		expect(doc.pages.map((p: { name: string }) => p.name).sort()).toEqual(['about-page', 'blog-page', 'blog-post-page', 'changelog-page', 'home-page', 'legal-page', 'not-found-page', 'pricing-page', 'product-page']);
		expect(doc.blocks.map((b: { name: string }) => b.name).sort()).toEqual(['hero-block', 'offer-block', 'stat-block']);
		expect(doc.pages.find((p: { name: string }) => p.name === 'home-page').add).toBe('spyglass-ds add home-page');
		expect(doc.groups.map((g: { id: string }) => g.id)).toEqual(expect.arrayContaining(['pages', 'blocks']));
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
		const dir = mkdtempSync(join(tmpdir(), 'spyglass-ds-'));
		writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { vue: '3.5.43' }, devDependencies: { tailwindcss: '^3.4.17' } }));
		mkdirSync(join(dir, 'src'));
		writeFileSync(join(dir, 'src/main.ts'), "import './style.css'\n");
		writeFileSync(join(dir, 'src/style.css'), '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
		writeFileSync(join(dir, 'tailwind.config.js'), "/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{vue,ts}'],\n  theme: { extend: {} },\n  plugins: [],\n};\n");
		run(dir, 'init');
		const css = readFileSync(join(dir, 'src/style.css'), 'utf8');
		expect(css.startsWith('@import "./spyglass-ds/brand.css";\n@tailwind base;')).toBe(true);
		expect(readFileSync(join(dir, 'tailwind.config.js'), 'utf8')).toContain("presets: [require('./src/spyglass-ds/tailwind-preset.cjs')]");
		const preset = readFileSync(join(dir, 'src/spyglass-ds/tailwind-preset.cjs'), 'utf8');
		expect(preset).toContain('"surface"');
		expect(preset).toContain("addVariant('pointer-coarse'");
		// The preset's keys Tailwind also has (font-sans) keep the app's value outside the brand's scope.
		expect(preset).toContain('var(--ds-scope-fontFamily-sans)');
		const once = readFileSync(join(dir, 'tailwind.config.js'), 'utf8');
		run(dir, 'init');
		expect(readFileSync(join(dir, 'tailwind.config.js'), 'utf8')).toBe(once);
	});
	it("installs with the workspace's package manager when the app sits in a monorepo", () => {
		const root = mkdtempSync(join(tmpdir(), 'spyglass-ds-'));
		writeFileSync(join(root, 'package.json'), JSON.stringify({ private: true, workspaces: ['apps/*'] }));
		writeFileSync(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
		mkdirSync(join(root, 'apps/web/src'), { recursive: true });
		writeFileSync(join(root, 'apps/web/package.json'), JSON.stringify({ dependencies: { vue: '3.5.43' }, devDependencies: { tailwindcss: '^4.2.2' } }));
		const out = JSON.parse(run(join(root, 'apps/web'), 'info'));
		expect(out.packageManager).toBe('pnpm');
	});
});
