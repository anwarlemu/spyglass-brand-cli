import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { drawScene, rasterizeScene } from '../assets/scene.js';
import { unknown } from '../assets/templates.js';
import { muxMjpeg } from '../assets/mp4.js';
import { display, format, int, lightSource, str, write } from '../assets/io.js';
// `video` writes short loops of the brand light (brand/assets/video.json). Frames are drawn like every other asset
// and encoded with ffmpeg when it is installed (H.264 MP4 and VP9 WebM); without it, the PNG frames and a Motion JPEG
// MP4 from the built-in muxer.
const require = createRequire(import.meta.url);
const jpeg = require('jpeg-js');
export const VIDEO_FLAGS = ['template', 'size', 'seed', 'light', 'seconds', 'fps', 'format', 'out', 'still', 'list'];
let doc;
export function videoDoc() {
    doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'video.json'), 'utf8'));
    return doc;
}
export function hasFfmpeg() {
    if (process.env.DS_NO_FFMPEG)
        return false;
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
export function videoFrame(t, size, phase, seed, light) {
    const [W, H] = size;
    // A piece keeps to the edges it was drawn at: one that spans the 1080 frame spans this one, one nearer an edge keeps its
    // distance from that edge, at the frame's short side over 1080.
    const s = Math.min(W, H) / 1080;
    const axis = (p0, len, full) => {
        const c = p0 + len / 2;
        if (len >= 1000)
            return [(p0 * full) / 1080, (len * full) / 1080];
        if (Math.abs(c - 540) < 120)
            return [full / 2 + (p0 - 540) * s, len * s];
        return c < 540 ? [p0 * s, len * s] : [full - (1080 - p0) * s, len * s];
    };
    const tx = (b) => {
        const [x, w] = axis(b[0], b[2], W);
        const [y, h] = axis(b[1], b[3], H);
        return [x, y, w, h];
    };
    const a = 2 * Math.PI * phase;
    const layers = [{ type: 'ascii' }];
    t.art.forEach((l, i) => {
        // The path: a figure eight, sideways drift[0] and up and down drift[1] of the art's box, at a constant rate.
        // A sting sweeps once, eased on the site's out curve; a loop follows its figure eight. The two pieces of a pair move
        // against each other.
        const sweep = t.sting ? 1 - (1 - phase) ** 3 : 0;
        const dir = i % 2 ? -1 : 1;
        const dx = dir * (t.sting ? t.drift[0] * l.box[2] * (2 * sweep - 1) : t.drift[0] * l.box[2] * Math.sin(a));
        const dy = dir * (t.sting ? 0 : t.drift[1] * l.box[3] * Math.sin(2 * a));
        const raw = [l.box[0] + dx, l.box[1] + dy, l.box[2], l.box[3]];
        // An upright ribbon keeps its own size, centered on a taller frame (it fades out where it ends), never widened.
        const box = l.turn ? [tx(raw)[0], H / 2 + (raw[1] - 540) * s, raw[2] * s, raw[3] * s] : tx(raw);
        layers.push({ type: 'art', id: i ? 'light-2' : 'light', file: l.file, box, fit: 'cover', at: l.at, flip: l.flip, turn: l.turn });
    });
    const m = 72 * Math.min(W, H) / 1080;
    // The lockup and the address stand clear of a light strip at the left edge, and under a light that fills the top.
    const lx = Math.max(m, ...layers.flatMap((l) => (l.type === 'art' && l.box[0] <= 0 && l.box[2] < W / 2 ? [l.box[0] + l.box[2] + m] : [])));
    const k = Math.min(W, H) / 1080;
    const mid = t.logoAt === 'center';
    // A vertical loop is a story: its bars cover 250px at the top and 340px at the foot.
    const top = H > W * 1.5 ? 266 * k : m;
    const foot = H > W * 1.5 ? H - 356 * k : H - m;
    const ly = t.logoAt === 'bottom-left' ? foot - 28 * k - 40 * k : mid ? H / 2 - 14 * k : top;
    // In the corner light's empty middle, the lockup is centered and the address under it at the foot.
    // A reveal brings the lockup in over the first 40% (ease out) and holds; an outro holds and lets it go over the last 30%.
    const ease = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 3;
    const opacity = t.sting === 'reveal' ? ease(phase / 0.4) : t.sting === 'outro' ? 1 - ease((phase - 0.7) / 0.3) : undefined;
    if (t.logo)
        layers.push({ type: 'logo', lockup: 'horizontal', color: 'white', box: [mid ? W / 2 - 91.5 * k : lx, ly, 183 * k, 28 * k], align: mid ? 'center' : 'left', ...(opacity !== undefined ? { opacity } : {}) });
    if (t.url)
        layers.push({ type: 'text', slot: 'url', face: 'label', size: Math.max(14 * k, (8 * W) / 540), leading: 20 * k, color: 'neutral-11', x: mid ? W / 2 - 300 : lx, top: foot - 10 * k, w: 600, align: mid ? 'center' : 'left', maxLines: 1 });
    const b = brand();
    return { width: W, height: H, ground: 'black', layers, slots: { url: b.domain ?? new URL(b.site).host }, seed, light };
}
export function videoHelp() {
    const b = brand().bin;
    const d = videoDoc();
    return [
        `Short loops of the site's light images: ${d.seconds} s at ${d.fps} fps, seamless. MP4 and WebM through ffmpeg when it is installed;`,
        'otherwise PNG frames and a Motion JPEG MP4. Frames are deterministic per --seed.',
        '',
        `  ${b} video light-band --size square`,
        `  ${b} video --template light-corner --size vertical`,
        `  ${b} video --template light-field --still          (one frame, for reduced motion)`,
        `  ${b} video --list`,
        '',
        `Templates: ${d.templates.map((t) => t.id).join(', ')}. Sizes: ${Object.entries(d.sizes).map(([k, [w, h]]) => `${k} ${w}x${h}`).join(', ')}.`,
        '--format mp4, webm, frames or all (default: mp4 and webm with ffmpeg, frames and mp4 without). --seconds 2 to 20, --fps 12 to 60.',
        '--out is a directory (default video/).',
    ].join('\n');
}
export async function runVideo(cwd, args, flags) {
    const d = videoDoc();
    if (flags.list === true || args[0] === 'list') {
        const cat = videoCatalog();
        return { json: cat, text: [...cat.templates.map((t) => `${t.id.padEnd(16)}${t.description}`), '', `Sizes: ${cat.sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}`, `${cat.seconds} s at ${cat.fps} fps. ${cat.encoder}`].join('\n') };
    }
    if (args.length > 1)
        throw new Error(`video takes one template: ${brand().bin} video light-band.`);
    if (args[0] && str(flags.template) && args[0] !== str(flags.template))
        throw new Error(`--template ${str(flags.template)} and ${args[0]} disagree. Pass one.`);
    const id = str(flags.template) ?? args[0];
    if (!id)
        throw new Error(`Name a template: ${brand().bin} video --template light-band (--list shows them).`);
    const t = d.templates.find((x) => x.id === id.toLowerCase());
    if (!t)
        throw unknown('template', id, d.templates.map((x) => x.id));
    const sizeId = (str(flags.size) ?? 'square').toLowerCase();
    const size = d.sizes[sizeId];
    if (!size)
        throw unknown('size', sizeId, Object.keys(d.sizes));
    const seed = int(flags, 'seed', 0, 0, 1_000_000);
    const light = lightSource(flags);
    const fps = int(flags, 'fps', d.fps, 12, 60);
    const seconds = int(flags, 'seconds', d.seconds, 2, 20);
    const ff = hasFfmpeg();
    const fmt = format(flags, ['mp4', 'webm', 'frames', 'all'], ff ? 'all' : 'frames');
    if ((fmt === 'webm') && !ff)
        throw new Error('WebM needs ffmpeg on the PATH. Without it: --format frames or mp4 (Motion JPEG).');
    const dir = resolve(cwd, str(flags.out) ?? 'video');
    const name = `${t.id}-${sizeId}${seed ? `-${seed}` : ''}`;
    const files = [];
    if (flags.still === true) {
        const r = await rasterizeScene(await drawScene(videoFrame(t, size, 0, seed, light)));
        const path = join(dir, `${name}-still.png`);
        write(path, r.png);
        files.push({ path: display(cwd, path), format: 'png', width: size[0], height: size[1] });
        return { json: { files, template: t.id, size: sizeId, seed }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
    }
    const count = fps * seconds;
    const work = mkdtempSync(join(tmpdir(), 'ds-video-'));
    const jpegs = [];
    const keepFrames = fmt === 'frames' || (fmt === 'all' && !ff);
    try {
        for (let f = 0; f < count; f++) {
            const r = await rasterizeScene(await drawScene(videoFrame(t, size, f / count, seed, light)));
            const file = `frame-${String(f + 1).padStart(4, '0')}.png`;
            write(join(work, file), r.png);
            if (keepFrames)
                write(join(dir, name, file), r.png);
            if (!ff && fmt !== 'frames')
                jpegs.push(jpeg.encode({ data: r.pixels, width: r.width, height: r.height }, 92).data);
        }
        if (keepFrames)
            files.push({ path: display(cwd, join(dir, name)), format: 'frames', width: size[0], height: size[1], frames: count, fps });
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
        }
        else if (fmt === 'mp4' || fmt === 'all') {
            const out = join(dir, `${name}.mp4`);
            write(out, muxMjpeg(jpegs, size[0], size[1], fps));
            files.push({ path: display(cwd, out), format: 'mp4', width: size[0], height: size[1], frames: count, fps, encoder: 'built-in Motion JPEG' });
        }
    }
    finally {
        rmSync(work, { recursive: true, force: true });
    }
    return { json: { files, template: t.id, size: sizeId, seed, light, ffmpeg: ff }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}${f.frames ? `, ${f.frames} frames at ${f.fps} fps` : ''}${f.encoder ? ` (${f.encoder})` : ''}`).join('\n') };
}
/** A loop's first frame, and the loop itself as MP4 (ffmpeg). */
export async function renderVideo(q) {
    const { t, size } = loopOf(q);
    const r = await rasterizeScene(await drawScene(videoFrame(t, size, 0, q.seed, q.light)));
    return { still: r.png };
}
renderVideo.mp4 = async (q, work) => {
    const { t, size, fps, seconds } = loopOf(q);
    const count = Math.round(fps * seconds);
    for (let i = 0; i < count; i++)
        write(join(work, `frame-${String(i + 1).padStart(4, '0')}.png`), (await rasterizeScene(await drawScene(videoFrame(t, size, i / count, q.seed, q.light)))).png);
    const out = join(work, 'loop.mp4');
    encodeMp4(join(work, 'frame-%04d.png'), fps, out);
    return readFileSync(out);
};
function loopOf(q) {
    const d = videoDoc();
    const t = d.templates.find((x) => x.id === q.template);
    if (!t)
        throw unknown('template', q.template, d.templates.map((x) => x.id));
    const size = d.sizes[q.size];
    if (!size)
        throw unknown('size', q.size, Object.keys(d.sizes));
    return { t, size, fps: q.fps ?? d.fps, seconds: q.seconds ?? d.seconds };
}
function ffmpeg(input, fps, out, codec) {
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', input, ...codec, '-threads', '1', out], { encoding: 'utf8' });
    if (r.status !== 0)
        throw new Error(`ffmpeg failed: ${r.stderr || r.error?.message}`);
}
export function encodeMp4(input, fps, out) {
    ffmpeg(input, fps, out, ['-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', '-bitexact']);
}
