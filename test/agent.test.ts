import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { about, logos, principleSurfaces, tokenByName, voice } from '../src/brand/system.js';
import { runBrand, runPrinciples } from '../src/commands/brand.js';
import { manifest } from '../src/commands/manifest.js';
import { statesOf, unionLiterals } from '../src/component/emit.js';
import { runComponent } from '../src/commands/component.js';
import type { Api } from '../src/commands/library.js';

const bin = join(__dirname, '..', 'bin.js');
const root = join(__dirname, '..');
const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

describe('brand system', () => {
	it('returns tokens, fonts, logos and voice from the files on disk', () => {
		const color = runBrand(['color'], {});
		const tokens = (color.json as { tokens: { name: string; light: string }[] }).tokens;
		expect(tokens.find((token) => token.name === '--ds-color-red')?.light.toUpperCase()).toBe('#DF0000');
		expect(tokens.find((token) => token.name === '--ds-color-blue-8')?.light.toUpperCase()).toBe('#1B1DFF');
		expect(tokens.find((token) => token.name === '--ds-color-card-fill')?.light.toUpperCase()).toBe('#171717');
		expect(tokens.some((token) => token.name.startsWith('--ds-duration-'))).toBe(false);
		const motion = runBrand([], { section: 'motion' });
		expect((motion.json as { tokens: { name: string }[] }).tokens.some((token) => token.name === '--ds-easing-out')).toBe(true);
		expect(tokenByName('--ds-radius-control').light).toBe('8px');
		expect(tokenByName('--ds-asset-radius').light).toBe('10px');
		expect(() => tokenByName('--ds-color-nope')).toThrow(/Unknown token/);
		expect(() => runBrand(['nope'], {})).toThrow(/Unknown section/);
		expect(() => runBrand([], { section: '' })).toThrow(/--section needs a value/);
		expect(() => runPrinciples([], { surface: '' })).toThrow(/--surface needs a value/);
		expect(() => runBrand(['color'], { token: '--ds-color-fg' })).toThrow(/not both/);
		const fonts = runBrand(['fonts'], {});
		expect((fonts.json as { files: { present: boolean }[] }).files.every((file) => file.present)).toBe(true);
		const logo = logos();
		for (const lockup of ['mark', 'wordmark', 'horizontal', 'vertical', 'mark-3d', 'horizontal-3d', 'vertical-3d']) for (const tone of ['black', 'white']) expect(logo.assets.some((asset) => asset.path === `brand/logo/svg/${lockup}-${tone}.svg`), `${lockup}-${tone}`).toBe(true);
		expect(logo.rules.some((rule) => rule.includes('brand/logo/svg/mark-white.svg') && rule.includes('#FFFFFF'))).toBe(true);
		expect(logo.rules.some((rule) => rule.includes('brand/logo/svg/mark-black.svg') && rule.includes('#000000'))).toBe(true);
		expect(logo.rules.some((rule) => /half the height of the logomark/.test(rule))).toBe(true);
		expect(logo.rules.some((rule) => /mark 16px, horizontal 16px, vertical 32px/.test(rule))).toBe(true);
		expect(logo.missing.join(' ')).not.toMatch(/clear space/);
		const said = voice();
		expect(said.never).toContain('delve');
		expect(said.never).toContain('seamless');
		expect(about().length).toBeGreaterThan(40);
	});

	it('keeps every principle inside the file it cites', () => {
		const surfaces = principleSurfaces();
		for (const surface of [surfaces.product, surfaces.website]) {
			for (const rule of [...surface.do, ...surface.dont, ...surface.rules]) {
				const source = readFileSync(join(root, rule.source ?? surface.source), 'utf8');
				expect(squash(source), `${surface.id}:${rule.id}`).toContain(squash(rule.text));
			}
		}
		const md = readFileSync(join(root, 'brand/principles.md'), 'utf8');
		expect(squash(md)).toContain(voice().prose);
		expect(() => runPrinciples(['poster'], {})).toThrow(/Unknown surface/);
		const product = runPrinciples(['product'], {});
		expect((product.json as { surfaces: { product: { id: string }; website?: unknown } }).surfaces.website).toBeUndefined();
		expect((product.json as { voice: { never: string[] } }).voice.never).toContain('leverage');
	});
});

describe('manifest', () => {
	it('lists commands, templates, sizes, components and rules', async () => {
		const doc = await manifest();
		const commands = (doc.commands as { name: string }[]).map((command) => command.name);
		for (const name of ['manifest', 'describe', 'brand', 'principles', 'component', 'image', 'deck', 'video', 'merch', 'light', 'ascii', 'list', 'view', 'add', 'check', 'tokens']) expect(commands).toContain(name);
		expect((doc.image as { templates: { id: string }[] }).templates.map((template) => template.id)).toEqual(expect.arrayContaining(['post-offer', 'ad-creator-plan', 'ad-search-bar', 'banner-tagline', 'avatar', 'logo-background', 'og', 'story']));
		expect((doc.deck as { slides: { id: string }[] }).slides.map((slide) => slide.id)).toEqual(['cover-row', 'cover-inline', 'cover-curved', 'section', 'statement', 'bullets', 'stat', 'quote', 'image', 'closing', 'agenda', 'timeline', 'team', 'comparison', 'image-grid', 'qa']);
		expect((doc.merch as { items: { id: string }[] }).items.map((item) => item.id)).toEqual(['cap-front', 'tee-front', 'tee-back', 'hoodie-front', 'tote', 'mug-wrap', 'sticker', 'poster', 'socks', 'poster-11x17', 'poster-24x36', 'sticker-sheet', 'notebook-cover', 'lanyard']);
		expect((doc.video as { templates: { id: string }[] }).templates.map((template) => template.id)).toEqual(['light-band', 'light-corner', 'light-field', 'light-strips', 'light-close-up', 'logo-reveal', 'outro']);
		expect((doc.video as { sizes: { id: string; width: number; height: number }[] }).sizes.map((size) => [size.id, size.width, size.height])).toEqual([
			['square', 1080, 1080],
			['vertical', 1080, 1920],
			['landscape', 1920, 1080],
		]);
		const names = (doc.components as { name: string; states: string[] }[]).map((item) => item.name);
		expect(names).toContain('button');
		for (const name of ['input', 'card', 'search-bar', 'brand-light', 'ascii-texture', 'logo']) expect(names).toContain(name);
		const button = (doc.components as { name: string; part?: string; states: string[]; parts: { component: string; states: string[] }[] }[]).find((item) => item.name === 'button');
		expect(button?.part).toBe('Button');
		expect(button?.states).toEqual(expect.arrayContaining(['variant:primary', 'variant:secondary', 'variant:ghost', 'size:lg', 'example:Variants']));
		const light = (doc.components as { name: string; part?: string; states: string[] }[]).find((item) => item.name === 'brand-light');
		expect(light?.part).toBe('BrandLight');
		expect(light?.states).toEqual(expect.arrayContaining(['variant:band', 'variant:corner', 'variant:curved-strip', 'source:generated']));
		const rules = (doc.principles as { rules: { id: string; surface: string; text: string }[] }).rules;
		expect(rules.some((rule) => rule.surface === 'product' && /Black is the ground/.test(rule.text))).toBe(true);
		expect(rules.some((rule) => rule.surface === 'website' && /plus-lighter/.test(rule.text))).toBe(true);
		expect((doc.gaps as string[]).some((gap) => /clear space/.test(gap))).toBe(false);
		const again = JSON.stringify(await manifest());
		expect(again).toBe(JSON.stringify(doc));
	});
});

describe('components', () => {
	it('derives states from prop unions and refuses values that are not in the source', () => {
		expect(unionLiterals("ButtonVariant ('secondary' | 'dark')")).toEqual(['secondary', 'dark']);
		expect(unionLiterals('string')).toBeUndefined();
		const api: Api = { file: 'components/ui/Button.vue', component: 'Button', props: [{ name: 'variant', type: "'secondary' | 'dark'", required: false, default: "'secondary'" }, { name: 'disabled', type: 'boolean', required: false }], models: [], emits: [], slots: ['default'] };
		expect(statesOf(api, ['Dark']).map((state) => state.id)).toEqual(['rest', 'variant:secondary', 'variant:dark', 'disabled:true', 'disabled:false', 'example:Dark']);
	});

	it('inspects and emits real markup, and errors on an unknown state or prop', async () => {
		const dir = mkdtempSync(join(tmpdir(), 'ds-emit-'));
		const inspected = await runComponent(dir, ['inspect', 'button'], {});
		const parts = (inspected.json as { parts: { component: string; states: { id: string }[] }[] }).parts;
		expect(parts.map((part) => part.component)).toContain('Button');
		expect(parts.find((part) => part.component === 'Button')?.states.map((state) => state.id)).toContain('variant:ghost');
		const emitted = await runComponent(dir, ['emit', 'button'], { state: 'variant:ghost' });
		expect(emitted.text).toContain('variant="ghost"');
		expect(emitted.text).toContain("import { Button } from '@/components/ui/Button'");
		expect(emitted.text).toContain('export default function Example()');
		expect(emitted.text).not.toContain('Acme');
		const example = await runComponent(dir, ['emit', 'button'], { state: 'example:Variants' });
		expect((example.json as { markup: string }).markup).toBe(readFileSync(join(root, 'registry/react/examples/button/Variants.tsx'), 'utf8'));
		const bar = await runComponent(dir, ['emit', 'search-bar'], { prop: ['placeholder=Acme ads'] });
		expect(bar.text).toContain('placeholder="Acme ads"');
		const light = await runComponent(dir, ['emit', 'brand-light'], { prop: ['variant=corner', 'seed=3'] });
		expect(light.text).toContain('variant="corner"');
		expect(light.text).toContain('seed={3}');
		await expect(runComponent(dir, ['emit', 'brand-light'], { prop: 'variant=spiral' })).rejects.toThrow(/Unknown value/);
		await expect(runComponent(dir, ['emit', 'button'], { state: 'variant:dark' })).rejects.toThrow(/Unknown state/);
		await expect(runComponent(dir, ['emit', 'button'], { prop: 'variant=round' })).rejects.toThrow(/Unknown value/);
		await expect(runComponent(dir, ['list'], { group: 'widgets' })).rejects.toThrow(/Unknown group/);
		await expect(runComponent(dir, ['frob'], {})).rejects.toThrow(/Unknown component action/);
		await expect(runComponent(dir, ['emit', 'button'], { state: '' })).rejects.toThrow(/--state needs a value/);
		await expect(runComponent(dir, ['inspect', 'button'], { part: 'Button' })).rejects.toThrow(/does not take --state, --prop or --part/);
		rmSync(dir, { recursive: true, force: true });
	});
});

describe('cli agent surface', () => {
	it('prints manifest, rejects an unknown video template, and emits from the command', () => {
		const doc = JSON.parse(execFileSync('node', [bin, 'manifest', '--json'], { encoding: 'utf8' })) as { components: { name: string }[]; video: { fps: number; seconds: number } };
		expect(doc.components.some((item) => item.name === 'button')).toBe(true);
		expect(doc.video).toMatchObject({ fps: 30, seconds: 6 });
		let err = '';
		try {
			execFileSync('node', [bin, 'video', '--template', 'reel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
		} catch (error) {
			err = (error as { stderr: string }).stderr;
		}
		expect(err).toMatch(/Unknown template/);
		const dir = mkdtempSync(join(tmpdir(), 'ds-agent-'));
		const raw = execFileSync('node', [bin, 'component', 'emit', 'button', '--state', 'variant:secondary', '--cwd', dir, '--json'], { encoding: 'utf8' });
		expect(JSON.parse(raw).markup).toContain('variant="secondary"');
		rmSync(dir, { recursive: true, force: true });
	});
});
