import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { drawScene, rasterizeScene, type Box, type Layer, type Scene } from '../assets/scene.js';
import { unknown } from '../assets/templates.js';
import { muxMjpeg } from '../assets/mp4.js';
import { display, format, int, lightSource, str, write, type Flags } from '../assets/io.js';

// `video` writes short loops of the brand light (brand/assets/video.json). Frames are drawn like every other asset
// and encoded with ffmpeg when it is installed (H.264 MP4 and VP9 WebM); without it, the PNG frames and a Motion JPEG
// MP4 from the built-in muxer.

const require = createRequire(import.meta.url);
const jpeg = require('jpeg-js') as { encode: (img: { data: Buffer; width: number; height: number }, quality: number) => { data: Buffer } };

export const VIDEO_FLAGS = ['template', 'size', 'seed', 'light', 'seconds', 'fps', 'format', 'out', 'still', 'list'];

type LightSpec = { window?: Box; b: Box; shift: number };
type VideoTemplate = { id: string; name: string; from: string; description: string; light?: LightSpec; lights?: LightSpec[]; drift: [number, number]; logo: boolean; url: boolean; logoAt?: 'top-left' | 'bottom-left' | 'center' };
type VideoDoc = { fps: number; seconds: number; sizes: Record<string, [number, number]>; templates: VideoTemplate[] };

let doc: VideoDoc | undefined;
export function videoDoc(): VideoDoc {
	doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'video.json'), 'utf8')) as VideoDoc;
	return doc;
}

export function hasFfmpeg(): boolean {
	if (process.env.DS_NO_FFMPEG) return false;
	const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
	return r.status === 0;
}

export function videoCatalog() {
	const d = videoDoc();
	return {
		templates: d.templates.map((t) => ({ id: t.id, name: t.name, description: t.description, from: t.from })),
		sizes: Object.entries(d.sizes).map(([id, [width, height]]) => ({ id, width, height })),
		fps: d.fps,
		seconds: d.seconds,
		formats: ['mp4', 'webm', 'frames', 'all'],
		encoder: 'ffmpeg (H.264 MP4, VP9 WebM) when installed; otherwise PNG frames and a Motion JPEG MP4.',
	};
}

/** One frame of a loop as a scene: the template scaled from the center to the size, the light moved along its path. */
export function videoFrame(t: VideoTemplate, size: [number, number], phase: number, seed: number, light: 'brand' | 'generated'): Scene {
	const [W, H] = size;
	const s = Math.max(W, H) / 1080;
	const ox = (W - 1080 * s) / 2;
	const oy = (H - 1080 * s) / 2;
	const tx = (b: Box): Box => [b[0] * s + ox, b[1] * s + oy, b[2] * s, b[3] * s];
	const a = 2 * Math.PI * phase;
	const layers: Layer[] = [{ type: 'ascii' }];
	for (const l of t.lights ?? (t.light ? [t.light] : [])) {
		// The path: a figure eight, sideways drift[0] and up and down drift[1] of the heat map's size, at a constant rate.
		const dx = t.drift[0] * l.b[2] * Math.sin(a);
		const dy = t.drift[1] * l.b[3] * Math.sin(2 * a);
		const win = tx(l.window ?? [0, 0, 1080, 1080]);
		// Fixed: a loop's light follows its path and nothing else, so the last frame meets the first.
		layers.push({ type: 'light', window: win, b: [(l.b[0] + dx) * s, (l.b[1] + dy) * s, l.b[2] * s, l.b[3] * s], shift: l.shift * s, fixed: true });
	}
	const m = 72 * Math.min(W, H) / 1080;
	// The lockup and the address stand clear of a light strip at the left edge, and under a light that fills the top.
	const lx = Math.max(m, ...layers.flatMap((l) => (l.type === 'light' && l.window && l.window[0] <= 0 && l.window[2] < W / 2 ? [l.window[0] + l.window[2] + m] : [])));
	const k = Math.min(W, H) / 1080;
	const mid = t.logoAt === 'center';
	// A vertical loop is a story: its bars cover 250px at the top and 340px at the foot.
	const top = H > W * 1.5 ? 266 * k : m;
	const foot = H > W * 1.5 ? H - 356 * k : H - m;
	const ly = t.logoAt === 'bottom-left' ? foot - 28 * k - 40 * k : mid ? H / 2 - 14 * k : top;
	// In the corner light's empty middle, the lockup is centered and the address under it at the foot.
	if (t.logo) layers.push({ type: 'logo', lockup: 'horizontal', color: 'white', box: [mid ? W / 2 - 91.5 * k : lx, ly, 183 * k, 28 * k], align: mid ? 'center' : 'left' });
	if (t.url) layers.push({ type: 'text', slot: 'url', face: 'label', size: Math.max(14 * k, (8 * W) / 540), leading: 14, x: mid ? W / 2 - 300 : lx, top: foot - 10 * k, w: 600, align: mid ? 'center' : 'left', maxLines: 1 });
	const b = brand() as ReturnType<typeof brand> & { domain?: string };
	return { width: W, height: H, ground: 'black', layers, slots: { url: b.domain ?? new URL(b.site).host }, seed, light };
}

export function videoHelp(): string {
	const b = brand().bin;
	const d = videoDoc();
	return [
		`Short loops of the brand light: ${d.seconds} s at ${d.fps} fps, seamless. MP4 and WebM through ffmpeg when it is installed;`,
		'otherwise PNG frames and a Motion JPEG MP4. Frames are deterministic per --seed.',
		'',
		`  ${b} video light-band --size square`,
		`  ${b} video --template light-corner --size vertical --seed 3 --light generated`,
		`  ${b} video --template light-field --still          (one frame, for reduced motion)`,
		`  ${b} video --list`,
		'',
		`Templates: ${d.templates.map((t) => t.id).join(', ')}. Sizes: ${Object.entries(d.sizes).map(([k, [w, h]]) => `${k} ${w}x${h}`).join(', ')}.`,
		'--format mp4, webm, frames or all (default: mp4 and webm with ffmpeg, frames and mp4 without). --seconds 2 to 20, --fps 12 to 60.',
		'--out is a directory (default video/).',
	].join('\n');
}

export async function runVideo(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	const d = videoDoc();
	if (flags.list === true || args[0] === 'list') {
		const cat = videoCatalog();
		return { json: cat, text: [...cat.templates.map((t) => `${t.id.padEnd(16)}${t.description}`), '', `Sizes: ${cat.sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}`, `${cat.seconds} s at ${cat.fps} fps. ${cat.encoder}`].join('\n') };
	}
	if (args.length > 1) throw new Error(`video takes one template: ${brand().bin} video light-band.`);
	if (args[0] && str(flags.template) && args[0] !== str(flags.template)) throw new Error(`--template ${str(flags.template)} and ${args[0]} disagree. Pass one.`);
	const id = str(flags.template) ?? args[0];
	if (!id) throw new Error(`Name a template: ${brand().bin} video --template light-band (--list shows them).`);
	const t = d.templates.find((x) => x.id === id.toLowerCase());
	if (!t) throw unknown('template', id, d.templates.map((x) => x.id));
	const sizeId = (str(flags.size) ?? 'square').toLowerCase();
	const size = d.sizes[sizeId];
	if (!size) throw unknown('size', sizeId, Object.keys(d.sizes));
	const seed = int(flags, 'seed', 0, 0, 1_000_000);
	const light = lightSource(flags);
	const fps = int(flags, 'fps', d.fps, 12, 60);
	const seconds = int(flags, 'seconds', d.seconds, 2, 20);
	const ff = hasFfmpeg();
	const fmt = format(flags, ['mp4', 'webm', 'frames', 'all'], ff ? 'all' : 'frames');
	if ((fmt === 'webm') && !ff) throw new Error('WebM needs ffmpeg on the PATH. Without it: --format frames or mp4 (Motion JPEG).');
	const dir = resolve(cwd, str(flags.out) ?? 'video');
	const name = `${t.id}-${sizeId}${seed ? `-${seed}` : ''}`;
	const files: { path: string; format: string; width: number; height: number; frames?: number; fps?: number; encoder?: string }[] = [];

	if (flags.still === true) {
		const r = await rasterizeScene(await drawScene(videoFrame(t, size, 0, seed, light)));
		const path = join(dir, `${name}-still.png`);
		write(path, r.png);
		files.push({ path: display(cwd, path), format: 'png', width: size[0], height: size[1] });
		return { json: { files, template: t.id, size: sizeId, seed }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
	}

	const count = fps * seconds;
	const work = mkdtempSync(join(tmpdir(), 'ds-video-'));
	const jpegs: Buffer[] = [];
	const keepFrames = fmt === 'frames' || (fmt === 'all' && !ff);
	try {
		for (let f = 0; f < count; f++) {
			const r = await rasterizeScene(await drawScene(videoFrame(t, size, f / count, seed, light)));
			const file = `frame-${String(f + 1).padStart(4, '0')}.png`;
			write(join(work, file), r.png);
			if (keepFrames) write(join(dir, name, file), r.png);
			if (!ff && fmt !== 'frames') jpegs.push(jpeg.encode({ data: r.pixels, width: r.width, height: r.height }, 92).data);
		}
		if (keepFrames) files.push({ path: display(cwd, join(dir, name)), format: 'frames', width: size[0], height: size[1], frames: count, fps });
		if (ff) {
			const input = join(work, 'frame-%04d.png');
			if (fmt === 'mp4' || fmt === 'all') {
				const out = join(dir, `${name}.mp4`);
				write(out, '');
				encodeMp4(input, fps, out);
				files.push({ path: display(cwd, out), format: 'mp4', width: size[0], height: size[1], frames: count, fps, encoder: 'ffmpeg libx264' });
			}
			if (fmt === 'webm' || fmt === 'all') {
				const out = join(dir, `${name}.webm`);
				write(out, '');
				ffmpeg(input, fps, out, ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuv420p', '-b:v', '0', '-crf', '32', '-row-mt', '0']);
				files.push({ path: display(cwd, out), format: 'webm', width: size[0], height: size[1], frames: count, fps, encoder: 'ffmpeg libvpx-vp9' });
			}
		} else if (fmt === 'mp4' || fmt === 'all') {
			const out = join(dir, `${name}.mp4`);
			write(out, muxMjpeg(jpegs, size[0], size[1], fps));
			files.push({ path: display(cwd, out), format: 'mp4', width: size[0], height: size[1], frames: count, fps, encoder: 'built-in Motion JPEG' });
		}
	} finally {
		rmSync(work, { recursive: true, force: true });
	}
	return { json: { files, template: t.id, size: sizeId, seed, light, ffmpeg: ff }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}${f.frames ? `, ${f.frames} frames at ${f.fps} fps` : ''}${f.encoder ? ` (${f.encoder})` : ''}`).join('\n') };
}

export type LoopRequest = { template: string; size: string; seed: number; light: 'brand' | 'generated'; seconds?: number; fps?: number };

/** A loop's first frame, and the loop itself as MP4 (ffmpeg). */
export async function renderVideo(q: LoopRequest): Promise<{ still: Buffer }> {
	const { t, size } = loopOf(q);
	const r = await rasterizeScene(await drawScene(videoFrame(t, size, 0, q.seed, q.light)));
	return { still: r.png };
}
renderVideo.mp4 = async (q: LoopRequest, work: string): Promise<Buffer> => {
	const { t, size, fps, seconds } = loopOf(q);
	const count = Math.round(fps * seconds);
	for (let i = 0; i < count; i++) write(join(work, `frame-${String(i + 1).padStart(4, '0')}.png`), (await rasterizeScene(await drawScene(videoFrame(t, size, i / count, q.seed, q.light)))).png);
	const out = join(work, 'loop.mp4');
	encodeMp4(join(work, 'frame-%04d.png'), fps, out);
	return readFileSync(out);
};
function loopOf(q: LoopRequest) {
	const d = videoDoc();
	const t = d.templates.find((x) => x.id === q.template);
	if (!t) throw unknown('template', q.template, d.templates.map((x) => x.id));
	const size = d.sizes[q.size];
	if (!size) throw unknown('size', q.size, Object.keys(d.sizes));
	return { t, size, fps: q.fps ?? d.fps, seconds: q.seconds ?? d.seconds };
}
function ffmpeg(input: string, fps: number, out: string, codec: string[]) {
	const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', input, ...codec, '-threads', '1', out], { encoding: 'utf8' });
	if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr || r.error?.message}`);
}
export function encodeMp4(input: string, fps: number, out: string) {
	ffmpeg(input, fps, out, ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', '-bitexact']);
}
