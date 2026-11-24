import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { drawScene, fitText, allFaces, rasterizeScene, logoRatio } from '../src/assets/scene.js';
import { brand } from '../src/lib/brand.js';
import { findTemplate, resolveSize, sceneFor, templates } from '../src/assets/templates.js';
import type { StackItem } from '../src/assets/scene.js';
import { merchItems, merchScene, PX_PER_IN } from '../src/assets/merch.js';
import { videoDoc, videoFrame } from '../src/commands/video.js';
import { runImage } from '../src/commands/image.js';
import { runDeck } from '../src/commands/deck.js';
import { runMerch } from '../src/commands/merch.js';
import { runVideo } from '../src/commands/video.js';

const bin = join(__dirname, '..', 'bin.js');
const sha = (data: string | Buffer) => createHash('sha256').update(data).digest('hex').slice(0, 16);
const pngSize = (png: Buffer) => ({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) });
const tmp = () => mkdtempSync(join(tmpdir(), 'ds-assets-'));
const fails = (args: string[]) => {
	const r = spawnSync('node', [bin, ...args], { encoding: 'utf8' });
	return { status: r.status, err: r.stderr };
};
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

describe('image templates', () => {
	it('cover every layout on the brand assets page plus Open Graph and story', () => {
		const ids = templates('image').map((t) => t.id);
		for (const id of ['post-creative-ring', 'post-agents', 'post-any-brand', 'post-every-market', 'post-know-what-changed', 'post-offer']) expect(ids).toContain(id);
		for (const id of ['ad-search-bar', 'ad-corridor', 'ad-photo', 'ad-testimonial', 'ad-creator-plan', 'ad-creative-row']) expect(ids).toContain(id);
		for (const id of ['banner-tagline', 'banner-creative-row', 'banner-light-close-up', 'banner-tagline-creatives', 'avatar', 'logo-background', 'logo-background-3d', 'logo-primary', 'og', 'og-offer', 'story', 'story-offer']) expect(ids).toContain(id);
		// A template's first size is its own frame; layouts are functions of the canvas and flow to the others.
		const first = (id: string) => {
			const t = findTemplate('image', id);
			const r = resolveSize(t, t.sizes[0]);
			return [r.width, r.height];
		};
		expect(first('post-offer')).toEqual([1080, 1080]);
		expect(first('ad-creator-plan')).toEqual([1080, 1350]);
		expect(first('banner-tagline')).toEqual([1500, 500]);
		expect(findTemplate('image', 'banner-tagline').sizes).toEqual(expect.arrayContaining(['x-banner', 'linkedin-banner', 'linkedin-page']));
		expect(findTemplate('image', 'avatar').sizes).toEqual(['avatar']);
		expect(first('og')).toEqual([1200, 630]);
		expect(findTemplate('image', 'og').sizes).toContain('landscape');
		expect(first('og-offer')).toEqual([1200, 630]);
		expect(first('story')).toEqual([1080, 1920]);
		expect(Object.keys(findTemplate('image', 'logo-background').variants!)).toEqual(['black', 'white', 'blue', 'red', 'magenta', 'yellow', 'green']);
	});

	it('never ship third-party names in the default copy', () => {
		const raw = readFileSync(join(__dirname, '..', 'brand', 'assets', 'image.json'), 'utf8') + readFileSync(join(__dirname, '..', 'brand', 'assets', 'deck.json'), 'utf8');
		const copy = JSON.stringify(templates('image').map((t) => t.slots)) + JSON.stringify(templates('deck').map((t) => t.slots));
		for (const name of ['Lauren', 'Accetturo', 'Launch Titans', 'Huel', 'rhode', 'Olipop', 'Represent', 'AG1', 'KHY']) expect(copy).not.toContain(name);
		expect(raw).not.toMatch(/\.(png|jpe?g)"/);
	});

	it('wrap the plan ad headline where the reference does (regression: "Stop screenshotting / at midnight.")', async () => {
		const faces = await allFaces();
		// The headline as each layout sets it: a text layer, or an item of a stack (its measure is the stack's).
		const headline = (id: string, size: string) => {
			const { scene } = sceneFor(findTemplate('image', id), { size, sample: true });
			for (const l of scene.layers) {
				if (l.type === 'text' && l.slot === 'headline') return l;
				if (l.type === 'stack') {
					const i = l.items.find((x: StackItem) => x.type === 'text' && x.slot === 'headline') as (StackItem & { size: number; leading: number; w?: number; maxLines?: number }) | undefined;
					if (i) return { ...i, w: i.w ?? l.box[2] };
				}
			}
			throw new Error(`${id} has no headline`);
		};
		expect(fitText(faces.display, 'Stop screenshotting at midnight.', headline('ad-creator-plan', 'portrait') as never).lines).toEqual(['Stop screenshotting', 'at midnight.']);
		expect(fitText(faces.display, 'Stop screenshotting at midnight.', headline('post-offer', 'square') as never).lines).toEqual(['Stop screenshotting', 'at midnight.']);
	});

	it('draw every template at every size and variant at the right pixel size', async () => {
		for (const t of templates('image')) {
			for (const size of t.sizes) {
				const layout = resolveSize(t, size);
				for (const variant of t.variants ? Object.keys(t.variants) : [undefined]) {
					const d = await drawScene(sceneFor(t, { size, variant, sample: true }).scene);
					expect(d.svg, `${t.id} ${size}`).toContain(`width="${layout.width}" height="${layout.height}"`);
					const r = await rasterizeScene(d, { scale: Math.min(1, 400 / Math.max(layout.width, layout.height)) });
					expect(pngSize(r.png), `${t.id} ${size}`).toEqual({ width: Math.round(layout.width * Math.min(1, 400 / Math.max(layout.width, layout.height))), height: Math.round(layout.height * Math.min(1, 400 / Math.max(layout.width, layout.height))) });
				}
			}
		}
	}, 900_000);

	it('are deterministic per seed (output hashes)', async () => {
		const t = findTemplate('image', 'post-offer');
		const one = await drawScene(sceneFor(t, { seed: 4, sample: true }).scene);
		const two = await drawScene(sceneFor(t, { seed: 4, sample: true }).scene);
		const other = await drawScene(sceneFor(t, { seed: 5, sample: true }).scene);
		expect(sha(one.svg)).toBe(sha(two.svg));
		expect(sha(one.svg)).not.toBe(sha(other.svg));
		expect(sha((await rasterizeScene(one)).png)).toBe(sha((await rasterizeScene(two)).png));
		const generated = await drawScene(sceneFor(t, { seed: 4, light: 'generated', sample: true }).scene);
		expect(sha(generated.svg)).not.toBe(sha(one.svg));
	});

	it('take copy and pictures by slot and refuse what a template does not draw', async () => {
		const dir = tmp();
		writeFileSync(join(dir, 'a.png'), tinyPng);
		const r = await runImage(dir, [], { template: 'ad-testimonial', quote: '“Acme found it in a minute.”', name: 'Acme team', image: ['a.png'], format: 'svg', out: 'o' });
		const svg = readFileSync(join(dir, 'o', 'ad-testimonial.svg'), 'utf8');
		expect(svg).toContain('Acme found it in a minute.');
		expect(svg).toContain('data:image/png;base64');
		expect((r.json as { files: unknown[] }).files).toHaveLength(1);
		await expect(runImage(dir, [], { template: 'post-offer', quote: 'x' })).rejects.toThrow(/does not draw --quote/);
		await expect(runImage(dir, [], { template: 'post-agents', image: ['a.png', 'a.png'] })).rejects.toThrow(/holds 1 picture/);
		await expect(runImage(dir, [], { template: 'post-offer', headline: 'word '.repeat(200) })).rejects.toThrow(/too long/);
		rmSync(dir, { recursive: true, force: true });
	});

	it('exit 1 with suggestions for unknown names', () => {
		const a = fails(['image', '--template', 'post-ofer']);
		expect(a.status).toBe(1);
		expect(a.err).toMatch(/Did you mean `post-offer`/);
		const b = fails(['image', '--template', 'banner-tagline', '--size', 'linkedn']);
		expect(b.status).toBe(1);
		expect(b.err).toMatch(/Choose from: x-banner, linkedin-banner/);
		const c = fails(['image', '--template', 'logo-background', '--variant', 'purple']);
		expect(c.status).toBe(1);
		expect(c.err).toMatch(/Choose from: black, white, blue/);
	});
});

describe('deck', () => {
	it('writes a slide per entry and a PDF with one page each', async () => {
		const dir = tmp();
		writeFileSync(join(dir, 'deck.json'), JSON.stringify({ seed: 2, slides: [{ type: 'section', headline: 'Every creative in one place.' }, { type: 'bullets', headline: 'Why it works', items: ['One point.', 'Another point.'] }, { type: 'stat', stat: '3x', body: 'more ideas per week' }] }));
		const r = await runDeck(dir, [], { input: 'deck.json', out: 'd' });
		const files = (r.json as { files: { path: string; format: string }[] }).files;
		expect(files.map((f) => f.format)).toEqual(['png', 'png', 'png', 'pdf']);
		expect(pngSize(readFileSync(join(dir, 'd', 'slide-01-section.png')))).toEqual({ width: 1920, height: 1080 });
		const pdf = readFileSync(join(dir, 'd', 'deck.pdf'));
		expect(pdf.subarray(0, 8).toString('latin1')).toBe('%PDF-1.4');
		expect(pdf.toString('latin1').match(/\/Type \/Page /g)).toHaveLength(3);
		expect(pdf.toString('latin1')).toContain('/MediaBox [0 0 960 540]');
		// Deterministic: the same input writes the same PDF.
		await runDeck(dir, [], { input: 'deck.json', out: 'e', format: 'pdf' });
		expect(sha(readFileSync(join(dir, 'e', 'deck.pdf')))).toBe(sha(pdf));
		await expect(runDeck(dir, [], { slide: 'covr-row' })).rejects.toThrow(/Did you mean `cover-row`/);
		rmSync(dir, { recursive: true, force: true });
	}, 60_000);

	it('has every slide type and draws each', async () => {
		expect(templates('deck').map((t) => t.id)).toEqual(['cover-row', 'cover-inline', 'cover-curved', 'section', 'statement', 'bullets', 'stat', 'quote', 'image', 'closing', 'agenda', 'timeline', 'team', 'comparison', 'image-grid', 'qa']);
		for (const t of templates('deck')) {
			const d = await drawScene(sceneFor(t, { seed: 1, sample: true }).scene);
			expect(d.width).toBe(1920);
		}
	});
});

describe('video', () => {
	it('loops: the frame after the last is the first, and frames are deterministic per seed', async () => {
		const t = videoDoc().templates.find((x) => x.id === 'light-band')!;
		const first = await drawScene(videoFrame(t, [1080, 1080], 0, 3, 'brand'));
		const wrap = await drawScene(videoFrame(t, [1080, 1080], 1, 3, 'brand'));
		const mid = await drawScene(videoFrame(t, [1080, 1080], 0.25, 3, 'brand'));
		expect(sha(first.svg)).toBe(sha(wrap.svg));
		expect(sha(mid.svg)).not.toBe(sha(first.svg));
		const again = await drawScene(videoFrame(t, [1080, 1080], 0.25, 3, 'brand'));
		expect(sha((await rasterizeScene(mid)).png)).toBe(sha((await rasterizeScene(again)).png));
		const vertical = await drawScene(videoFrame(t, [1080, 1920], 0, 3, 'brand'));
		expect(vertical.svg).toContain('width="1080" height="1920"');
	});

	it('writes frames and a Motion JPEG MP4 without ffmpeg, and a still', async () => {
		const dir = tmp();
		process.env.DS_NO_FFMPEG = '1';
		try {
			const r = await runVideo(dir, [], { template: 'light-corner', size: 'square', seconds: '2', fps: '12', format: 'all', out: 'v' });
			const files = (r.json as { files: { format: string; frames?: number }[] }).files;
			expect(files.map((f) => f.format)).toEqual(['frames', 'mp4']);
			expect(existsSync(join(dir, 'v', 'light-corner-square', 'frame-0024.png'))).toBe(true);
			expect(readFileSync(join(dir, 'v', 'light-corner-square.mp4')).subarray(4, 8).toString()).toBe('ftyp');
			await expect(runVideo(dir, [], { template: 'light-corner', format: 'webm' })).rejects.toThrow(/needs ffmpeg/);
		} finally {
			delete process.env.DS_NO_FFMPEG;
		}
		await runVideo(dir, [], { template: 'light-field', size: 'vertical', still: true, out: 'v' });
		expect(pngSize(readFileSync(join(dir, 'v', 'light-field-vertical-still.png')))).toEqual({ width: 1080, height: 1920 });
		await expect(runVideo(dir, [], { template: 'light-bnad' })).rejects.toThrow(/Did you mean `light-band`/);
		rmSync(dir, { recursive: true, force: true });
	}, 60_000);
});

describe('merch', () => {
	it('lists every item with its trim, bleed, safe area and source', () => {
		const items = merchItems();
		expect(items.map((i) => i.id)).toEqual(['cap-front', 'tee-front', 'tee-back', 'hoodie-front', 'tote', 'mug-wrap', 'sticker', 'poster', 'socks', 'poster-11x17', 'poster-24x36', 'sticker-sheet', 'notebook-cover', 'lanyard']);
		for (const i of items) {
			expect(i.source.length, i.id).toBeGreaterThan(20);
			expect(i.safe).toBeGreaterThan(0);
		}
		expect(items.find((i) => i.id === 'tee-front')!.size).toEqual([12, 16]);
		expect(items.find((i) => i.id === 'poster')!.bleed).toBe(0.125);
		expect(Object.keys(items.find((i) => i.id === 'cap-front')!.variants)).toEqual(['white', 'black']);
	});

	it('draws print files at physical size with the bleed, a die line on the sticker, deterministic per seed', async () => {
		const dir = tmp();
		await runMerch(dir, [], { item: 'poster', variant: 'full-color', dpi: '72', seed: '3', out: 'm', sample: true });
		const svg = readFileSync(join(dir, 'm', 'poster-full-color.svg'), 'utf8');
		expect(svg).toContain('width="18.25in" height="24.25in"');
		expect(svg).toContain(`viewBox="0 0 ${18.25 * PX_PER_IN} ${24.25 * PX_PER_IN}"`);
		const png = readFileSync(join(dir, 'm', 'poster-full-color.png'));
		expect(pngSize(png)).toEqual({ width: Math.round(18.25 * 72), height: Math.round(24.25 * 72) });
		// pHYs: 72 dpi in pixels per meter.
		expect(png.indexOf('pHYs')).toBeGreaterThan(0);
		await runMerch(dir, [], { item: 'poster', variant: 'full-color', dpi: '72', seed: '3', out: 'n', sample: true });
		expect(sha(readFileSync(join(dir, 'n', 'poster-full-color.svg')))).toBe(sha(svg));
		expect(sha(readFileSync(join(dir, 'n', 'poster-full-color.png')))).toBe(sha(png));
		await runMerch(dir, [], { item: 'sticker', variant: 'white', dpi: '72', out: 'm', sample: true });
		expect(readFileSync(join(dir, 'm', 'sticker-white.svg'), 'utf8')).toContain('id="CutContour"');
		const one = merchScene(merchItems().find((i) => i.id === 'tee-front')!, { variant: 'white', sample: true });
		expect(one.scene.ground).toBeUndefined();
		await expect(runMerch(dir, [], { item: 'cap-front', variant: 'full-color' })).rejects.toThrow(/Choose from: white, black/);
		await expect(runMerch(dir, [], { item: 'teeshirt' })).rejects.toThrow(/Unknown item/);
		rmSync(dir, { recursive: true, force: true });
	}, 60_000);
});

describe('png', () => {
	it('writes straight alpha (merch on a transparent ground keeps its edges)', async () => {
		const d = await drawScene(merchScene(merchItems().find((i) => i.id === 'cap-front')!, { variant: 'white' }).scene);
		const r = await rasterizeScene(d, { scale: 0.25 });
		const idat = r.png.subarray(r.png.indexOf('IDAT') + 4);
		expect(inflateSync(idat.subarray(0, idat.indexOf('IEND') - 8)).length).toBeGreaterThan(0);
		let partial = 0;
		for (let i = 3; i < r.pixels.length; i += 4) if (r.pixels[i]! > 0 && r.pixels[i]! < 255 && r.pixels[i - 1]! > 250) partial++;
		expect(partial).toBeGreaterThan(0);
	});
});

void execFileSync;

describe('help examples', () => {
	it('never run a long example into its description', () => {
		for (const args of [['--help'], ['image', '--help'], ['deck', '--help'], ['illustrate', '--help'], ['figma', '--help']]) {
			const out = spawnSync('node', [bin, ...args], { encoding: 'utf8' }).stdout;
			expect(out).toMatch(/\S/);
			expect(out).not.toMatch(/^ +$/m);
			for (const line of out.split('\n').filter((l) => /^ {2}spyglass-ds /.test(l))) expect(line, line).not.toMatch(/\.(png|svg)[A-Z]|[a-z0-9][A-Z][a-z]+ (the|in|of|only|a|come|fill)\b/);
		}
		expect(spawnSync('node', [bin, 'image', '--help'], { encoding: 'utf8' }).stdout).toMatch(/--image b\.png\n {2,}Pictures fill/);
	});
});

describe('logo rules', () => {
	it('every template keeps each logo above its minimum height and its clear space free', () => {
		const spec = brand().logo!;
		type B = [number, number, number, number];
		const hit = (a: B, b: B) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
		let checked = 0;
		for (const kind of ['image', 'deck'] as const)
			for (const t of templates(kind))
				for (const size of t.sizes.slice(0, 6))
					for (const variant of t.variants ? Object.keys(t.variants) : [undefined]) {
						const { scene } = sceneFor(t, { size, variant, sample: true });
						for (const l of scene.layers) {
							if (l.type !== 'logo') continue;
							const id = `${kind} ${t.id} ${size}${variant ? ` ${variant}` : ''} ${l.lockup}`;
							const [x, y, w, h] = l.box;
							const r = logoRatio(l.lockup);
							const lh = Math.min(h, w / r);
							const lw = lh * r;
							const lx = l.align === 'left' ? x : l.align === 'right' ? x + w - lw : x + (w - lw) / 2;
							const ly = y + (h - lh) / 2;
							if (spec.minHeight[l.lockup]) expect(lh, id).toBeGreaterThanOrEqual(spec.minHeight[l.lockup]);
							const share = spec.markHeight[l.lockup];
							if (share === undefined) continue;
							checked++;
							const c = spec.clearSpace * share * lh;
							const zone: B = [lx - c, ly - c, lw + 2 * c, lh + 2 * c];
							for (const o of scene.layers) {
								const b: B | undefined = o.type === 'text' || o.type === 'list' ? [o.x, o.top, o.w, o.size] : o.type === 'photo' || o.type === 'button' || o.type === 'search' || o.type === 'split' ? o.box : undefined;
								if (b) expect(hit(zone, b), `${id} clear space holds a ${o.type}`).toBe(false);
							}
						}
					}
		expect(checked).toBeGreaterThan(30);
	});
});
