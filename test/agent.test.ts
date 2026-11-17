import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { about, logos, principleSurfaces, tokenByName, voice } from '../src/brand/system.js';
import { runBrand, runPrinciples } from '../src/commands/brand.js';
import { manifest } from '../src/commands/manifest.js';
import { statesOf, unionLiterals } from '../src/component/emit.js';
import { runComponent } from '../src/commands/component.js';
import type { Api } from '../src/commands/library.js';
import { frameSvg, renderVideo } from '../src/video/render.js';
import { runVideo } from '../src/commands/video.js';
import { resolveVideo, VIDEO_FRAMES, VIDEO_FPS } from '../src/video/spec.js';
import { theme } from '../src/image/spec.js';

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
		expect(logo.missing[0]).toMatch(/clear space/);
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
		for (const name of ['manifest', 'describe', 'brand', 'principles', 'component', 'image', 'video', 'light', 'ascii', 'list', 'view', 'add', 'check', 'tokens']) expect(commands).toContain(name);
		expect((doc.image as { templates: { id: string }[] }).templates.map((template) => template.id)).toEqual(['headline', 'statement', 'quote', 'announcement', 'frame']);
		expect((doc.video as { templates: { id: string }[] }).templates.map((template) => template.id)).toEqual(['headline', 'statement', 'announcement', 'logo']);
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
		expect((doc.gaps as string[]).some((gap) => /clear space/.test(gap))).toBe(true);
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

describe('video', () => {
	it('rejects unknown templates and sizes and fields a template does not draw', async () => {
		expect(() => resolveVideo({ template: 'poster', size: 'square' })).toThrow(/Unknown template/);
		expect(() => resolveVideo({ template: 'headline', size: 'story' })).toThrow(/Unknown size/);
		expect(() => resolveVideo({ template: 'logo', size: 'og' })).toThrow(/Unknown size/);
		expect(resolveVideo({ template: 'Headline', size: '1080x1920' }).sizes).toEqual(['vertical']);
		expect(resolveVideo({ template: 'logo' }).sizes).toEqual(['square']);
		expect(() => resolveVideo({})).toThrow(/--template is required/);
		await expect(runVideo(root, [], { template: '' })).rejects.toThrow(/--template needs a value/);
		await expect(runVideo(root, [], { template: 'headline' })).rejects.toThrow(/title is required/);
		await expect(runVideo(root, [], { template: 'headline', title: 'Hello', text: 'under' })).rejects.toThrow(/does not draw --text/);
		await expect(runVideo(root, [], { template: 'logo', title: 'Hello' })).rejects.toThrow(/does not draw a title/);
	});

	it('renders byte-identical frames from the tokens, the face and the logo', async () => {
		const request = { template: 'headline' as const, sizes: ['square' as const], ground: 'paper' as const, title: 'Context that stays current', frames: 2 };
		const once = await renderVideo(request);
		const twice = await renderVideo(request);
		expect(Buffer.compare(once[0].mp4, twice[0].mp4)).toBe(0);
		expect(Buffer.compare(once[0].poster, twice[0].poster)).toBe(0);
		expect(once[0].width).toBe(1080);
		expect(once[0].height).toBe(1080);
		expect(once[0].frames).toBe(2);
		const first = await frameSvg(request, { id: 'square', width: 1080, height: 1080, description: '' }, 0, 2);
		const last = await frameSvg(request, { id: 'square', width: 1080, height: 1080, description: '' }, 1, 2);
		expect(first).not.toBe(last);
		expect(last).toContain(theme('paper').fg);
		expect(last).toContain('Context that stays');
		// The logomark from brand/logo/svg/mark-white.svg, split from the given lockup.
		expect(last).toContain('M31.2854');
		expect(last).toContain('font/woff2');
		const logo = await frameSvg({ template: 'logo', sizes: ['square'], ground: 'ink' }, { id: 'square', width: 1080, height: 1080, description: '' }, 1, 2);
		expect(logo).toContain(theme('ink').bg);
		expect(logo).toContain('M31.2854');
		expect(logo).toContain('M659.19');
		const probed = probe(once[0].mp4);
		expect(probed.codec).toBe('mjpeg');
		expect(probed.width).toBe(1080);
		expect(probed.height).toBe(1080);
		expect(probed.frames).toBe(2);
	});
});

describe('cli agent surface', () => {
	it('prints manifest, rejects an unknown video template, and emits from the command', () => {
		const doc = JSON.parse(execFileSync('node', [bin, 'manifest', '--json'], { encoding: 'utf8' })) as { components: { name: string }[]; video: { fps: number; frames: number } };
		expect(doc.components.some((item) => item.name === 'button')).toBe(true);
		expect(doc.video).toMatchObject({ fps: VIDEO_FPS, frames: VIDEO_FRAMES });
		let err = '';
		try {
			execFileSync('node', [bin, 'video', '--template', 'reel', '--title', 'Hello'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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

function probe(mp4: Buffer): { codec: string; width: number; height: number; frames: number } {
	const dir = mkdtempSync(join(tmpdir(), 'ds-mp4-'));
	const path = join(dir, 'clip.mp4');
	writeFileSync(path, mp4);
	const raw = execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,nb_read_frames', '-of', 'json', path], { encoding: 'utf8' });
	rmSync(dir, { recursive: true, force: true });
	const stream = JSON.parse(raw).streams[0] as { codec_name: string; width: number; height: number; nb_read_frames: string };
	return { codec: stream.codec_name, width: stream.width, height: stream.height, frames: Number(stream.nb_read_frames) };
}
