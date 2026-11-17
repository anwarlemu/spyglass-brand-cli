import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { brand, packageRoot, tokens } from '../lib/brand.js';
import type { Face, Faces } from '../image/fonts.js';
import { faces } from '../image/fonts.js';
import { rasterize } from '../image/render.js';
import { theme, type GroundId, type Theme } from '../image/spec.js';
import { blockHeight, capHeight, descent, fit, measure, withStop } from '../image/text.js';
import { muxMjpeg } from './mp4.js';
import { refuseVideo, videoSize, VIDEO_FPS, VIDEO_FRAMES, VIDEO_JPEG_QUALITY, type VideoSize, type VideoSizeId, type VideoTemplateId } from './spec.js';

// Frames are static SVGs. resvg paints each one with the vendored faces and no system fonts, jpeg-js encodes the
// pixels, and the MP4 muxer writes a container with no timestamps. Same inputs, same bytes.

const require = createRequire(import.meta.url);
const jpeg = require('jpeg-js') as { encode: (img: { data: Buffer; width: number; height: number }, quality: number) => { data: Buffer } };

export type VideoRequest = {
	template: VideoTemplateId;
	sizes: VideoSizeId[];
	ground: GroundId;
	title?: string;
	text?: string;
	eyebrow?: string;
	/** Library and tests only. The command always uses VIDEO_FRAMES. */
	frames?: number;
};

export type RenderedClip = {
	template: VideoTemplateId;
	size: VideoSizeId;
	ground: GroundId;
	width: number;
	height: number;
	fps: number;
	frames: number;
	codec: 'mjpeg';
	mp4: Buffer;
	poster: Buffer;
};

export type WrittenVideo = {
	path: string;
	format: 'mp4';
	template: VideoTemplateId;
	size: VideoSizeId;
	ground: GroundId;
	width: number;
	height: number;
	fps: number;
	frames: number;
};

type Rhythm = {
	padX: number;
	padTop: number;
	padBottom: number;
	mark: number;
	url: number;
	footerGap: number;
	headline: number;
	headlineMin: number;
	headlineLines: number;
	body: number;
	bodyMin: number;
	bodyLines: number;
	bodyLeading: number;
	eyebrow: number;
	gapTag: number;
	gapBody: number;
};

type Graphic = { viewBox: string; body: string; vw: number; vh: number };

const graphics = new Map<string, Graphic>();

export async function renderVideo(req: VideoRequest): Promise<RenderedClip[]> {
	refuseVideo(req.template, { title: req.title, text: req.text, eyebrow: req.eyebrow });
	const frameCount = req.frames ?? VIDEO_FRAMES;
	if (!Number.isInteger(frameCount) || frameCount < 1 || frameCount > VIDEO_FRAMES) throw new Error(`Frame count must be an integer from 1 to ${VIDEO_FRAMES}.`);
	const out: RenderedClip[] = [];
	for (const id of req.sizes) {
		const size = videoSize(id);
		if (!size) throw new Error(`Unknown size \`${id}\`.`);
		const jpegs: Buffer[] = [];
		let poster: Buffer | undefined;
		for (let frame = 0; frame < frameCount; frame++) {
			const svg = await frameSvg(req, size, frame, frameCount);
			const image = await rasterize(svg, theme(req.ground).bg);
			if (image.width !== size.width || image.height !== size.height) throw new Error(`Frame raster is ${image.width}x${image.height}, expected ${size.width}x${size.height}.`);
			jpegs.push(encodeJpeg(image.pixels, image.width, image.height));
			poster = image.png;
		}
		out.push({
			template: req.template,
			size: id,
			ground: req.ground,
			width: size.width,
			height: size.height,
			fps: VIDEO_FPS,
			frames: frameCount,
			codec: 'mjpeg',
			mp4: muxMjpeg(jpegs, size.width, size.height, VIDEO_FPS),
			poster: poster!,
		});
	}
	return out;
}

/** One frame of SVG, for tests and for the raster loop. `frame` is 0-based. */
export async function frameSvg(req: VideoRequest, size: VideoSize, frame: number, frameCount: number): Promise<string> {
	const loaded = await faces();
	const palette = theme(req.ground);
	const t = frameCount <= 1 ? 1 : frame / (frameCount - 1);
	const ease = easeOut();
	const body = req.template === 'logo' ? logoBody(size, palette, t, ease) : textBody(req, size, palette, loaded, t, ease);
	return document(size, palette, loaded, `${body}${footer(size, rhythm(size.id), loaded, palette, phase(t, 0.55, 0.92, ease), phase(t, 0.62, 1, ease))}`);
}

export function writeVideos(cwd: string, out: string | undefined, clips: RenderedClip[]): WrittenVideo[] {
	if (!clips.length) return [];
	const named = out && /\.mp4$/i.test(out) ? resolve(cwd, out) : undefined;
	if (named && clips.length > 1) throw new Error('--out is a file, so pass one --size. For several videos, pass a directory.');
	const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
	mkdirSync(dir, { recursive: true });
	return clips.map((clip) => {
		const path = named ?? join(dir, `${clip.template}-${clip.size}${clip.ground === 'ink' ? '-ink' : ''}.mp4`);
		writeFileSync(path, clip.mp4);
		return { path: display(cwd, path), format: 'mp4' as const, template: clip.template, size: clip.size, ground: clip.ground, width: clip.width, height: clip.height, fps: clip.fps, frames: clip.frames };
	});
}

function encodeJpeg(pixels: Buffer, width: number, height: number): Buffer {
	const expected = width * height * 4;
	if (pixels.length !== expected) throw new Error(`Frame is ${pixels.length} bytes, expected ${expected}.`);
	const encoded = jpeg.encode({ data: pixels, width, height }, VIDEO_JPEG_QUALITY).data;
	if (encoded.length < 4 || encoded[0] !== 0xff || encoded[1] !== 0xd8) throw new Error('JPEG encode did not start.');
	let end = encoded.length;
	if (encoded[end - 2] !== 0xff || encoded[end - 1] !== 0xd9) {
		end = -1;
		for (let i = encoded.length - 1; i >= 1; i--) if (encoded[i - 1] === 0xff && encoded[i] === 0xd9) { end = i + 1; break; }
		if (end < 0) throw new Error('JPEG encode did not end.');
	}
	return encoded.subarray(0, end);
}

function easeOut(): (t: number) => number {
	const raw = tokens()['--ds-easing-out']?.light ?? '';
	const match = raw.match(/cubic-bezier\(\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\)/);
	if (!match) throw new Error('Token --ds-easing-out is not a cubic-bezier(...).');
	return bezier(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
}

function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const cx = 3 * x1;
	const bx = 3 * (x2 - x1) - cx;
	const ax = 1 - cx - bx;
	const cy = 3 * y1;
	const by = 3 * (y2 - y1) - cy;
	const ay = 1 - cy - by;
	const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
	const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
	const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
	return (x: number) => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const dx = sampleX(t) - x;
			const slope = slopeX(t);
			if (Math.abs(dx) < 1e-6 || Math.abs(slope) < 1e-6) break;
			t = Math.min(1, Math.max(0, t - dx / slope));
		}
		return sampleY(t);
	};
}

function phase(t: number, start: number, end: number, ease: (n: number) => number): number {
	if (t <= start) return 0;
	if (t >= end) return 1;
	return ease((t - start) / (end - start));
}

function rhythm(id: VideoSizeId): Rhythm {
	if (id === 'vertical') return { padX: 88, padTop: 128, padBottom: 72, mark: 44, url: 22, footerGap: 28, headline: 108, headlineMin: 36, headlineLines: 6, body: 32, bodyMin: 20, bodyLines: 4, bodyLeading: 1.4, eyebrow: 18, gapTag: 36, gapBody: 28 };
	if (id === 'landscape') return { padX: 96, padTop: 72, padBottom: 48, mark: 36, url: 20, footerGap: 22, headline: 80, headlineMin: 32, headlineLines: 3, body: 26, bodyMin: 18, bodyLines: 2, bodyLeading: 1.35, eyebrow: 16, gapTag: 22, gapBody: 18 };
	return { padX: 84, padTop: 92, padBottom: 56, mark: 40, url: 20, footerGap: 24, headline: 100, headlineMin: 34, headlineLines: 5, body: 28, bodyMin: 18, bodyLines: 4, bodyLeading: 1.4, eyebrow: 17, gapTag: 32, gapBody: 24 };
}

function textBody(req: VideoRequest, size: VideoSize, palette: Theme, loaded: Faces, t: number, ease: (n: number) => number): string {
	const r = rhythm(size.id);
	const title = withStop(req.title ?? '');
	const sub = (req.text ?? '').trim();
	const eyebrow = (req.eyebrow ?? '').trim();
	const showSub = req.template !== 'headline' && sub.length > 0;
	const column = size.width - r.padX * 2;
	const contentBottom = size.height - r.padBottom - r.mark - r.footerGap - 12;
	const budget = contentBottom - r.padTop;
	const tag = eyebrow ? fitTag(eyebrow, loaded.medium, r.eyebrow, column, palette) : undefined;
	if (eyebrow && !tag) throw new Error('The eyebrow does not fit this size.');
	const tagBlock = tag ? tag.height + r.gapTag : 0;
	const ruleGap = req.template === 'announcement' && showSub ? r.gapBody : 0;
	const subGap = showSub ? (req.template === 'announcement' ? ruleGap + 1 + r.gapBody : r.gapBody) : 0;
	const leading = 1.08;
	let head = fit(loaded.heading, title, column, { maxSize: r.headline, minSize: r.headlineMin, maxLines: r.headlineLines, leading, tracking: palette.trackingDisplay, maxHeight: Math.max(r.headlineMin, budget - tagBlock - subGap - (showSub ? r.bodyMin : 0)) });
	let subLines: string[] = [];
	let subSize = r.body;
	if (showSub) {
		const subWidth = Math.min(column, Math.round(size.width * 0.72));
		for (let guard = 0; guard < 40; guard++) {
			const headH = blockHeight(loaded.heading, head.lines, head.size, leading);
			const room = budget - tagBlock - subGap - headH;
			const fitted = fit(loaded.text, sub, subWidth, { maxSize: r.body, minSize: r.bodyMin, maxLines: r.bodyLines, leading: r.bodyLeading, tracking: 0, maxHeight: Math.max(r.bodyMin, room) });
			subLines = fitted.lines;
			subSize = fitted.size;
			const used = headH + blockHeight(loaded.text, subLines, subSize, r.bodyLeading);
			if (tagBlock + subGap + used <= budget + 0.5 || head.size <= r.headlineMin) break;
			head = fit(loaded.heading, title, column, { maxSize: Math.max(r.headlineMin, head.size - 2), minSize: r.headlineMin, maxLines: r.headlineLines, leading, tracking: palette.trackingDisplay, maxHeight: budget });
		}
	}
	const headH = blockHeight(loaded.heading, head.lines, head.size, leading);
	const subH = showSub ? blockHeight(loaded.text, subLines, subSize, r.bodyLeading) : 0;
	const stackH = tagBlock + headH + subGap + subH;
	const top = r.padTop + Math.max(0, Math.round((budget - stackH) * (size.id === 'vertical' ? 0.28 : 0.36)));
	const headP = phase(t, 0.08, 0.52, ease);
	const dy = (1 - headP) * 16;
	const parts: string[] = [];
	let y = top;
	if (tag) {
		parts.push(tag.draw(r.padX, y, phase(t, 0, 0.32, ease)));
		y += tag.height + r.gapTag;
	}
	parts.push(lines(loaded.heading, head.lines, head.size, leading, palette.trackingDisplay, palette.fg, palette.accentText, r.padX, y, headP, phase(t, 0.28, 0.74, ease)));
	y += headH;
	if (showSub && req.template === 'announcement') {
		y += ruleGap;
		const ruleW = Math.max(48, ...head.lines.map((line) => measure(loaded.heading, line.endsWith('.') ? line.slice(0, -1) : line, head.size, palette.trackingDisplay)));
		parts.push(rect(r.padX, y, ruleW * phase(t, 0.36, 0.7, ease), 1, palette.edge));
		y += 1 + r.gapBody;
	} else if (showSub) y += r.gapBody;
	if (showSub) parts.push(lines(loaded.text, subLines, subSize, r.bodyLeading, 0, palette.fgMuted, palette.fgMuted, r.padX, y, phase(t, 0.42, 0.84, ease), 1));
	return `<g transform="translate(0 ${fmt(dy)})">${parts.join('')}</g>`;
}

function logoBody(size: VideoSize, palette: Theme, t: number, ease: (n: number) => number): string {
	const r = rhythm(size.id);
	const column = size.width - r.padX * 2;
	const budget = size.height - r.padBottom - r.mark - r.footerGap - 12 - r.padTop;
	const graphic = readGraphic('horizontal-white.svg');
	let width = column * (size.id === 'vertical' ? 0.92 : 0.78);
	let height = width * (graphic.vh / graphic.vw);
	if (height > budget) {
		height = budget;
		width = height * (graphic.vw / graphic.vh);
	}
	const p = phase(t, 0.06, 0.64, ease);
	const x = r.padX + (column - width) / 2;
	const y = r.padTop + Math.max(0, (budget - height) / 2);
	return `<g opacity="${op(p)}" transform="translate(0 ${fmt((1 - p) * 18)})">${placed('horizontal-white.svg', palette.fg, x, y, width)}</g>`;
}

type Tag = { height: number; draw: (x: number, y: number, opacity: number) => string };

function fitTag(label: string, face: Face, size: number, maxWidth: number, palette: Theme): Tag | undefined {
	let s = size;
	let text = label.trim().toUpperCase();
	if (!text || maxWidth < 8) return undefined;
	const padXFor = (n: number) => Math.round(n * 0.48);
	const boxWidth = (n: number, value: string) => measure(face, value, n, palette.trackingTag) + padXFor(n) * 2;
	while (boxWidth(s, text) > maxWidth && s > 11) s -= 1;
	if (boxWidth(s, text) > maxWidth) {
		while (text.length > 0 && boxWidth(s, `${text}...`) > maxWidth) text = text.slice(0, -1).trimEnd();
		text = text ? `${text}...` : '';
	}
	if (!text || boxWidth(s, text) > maxWidth) return undefined;
	const cap = capHeight(face, s);
	const padX = padXFor(s);
	const padY = Math.round(s * 0.36);
	const height = Math.ceil(cap + padY * 2);
	const boxW = Math.min(maxWidth, Math.ceil(boxWidth(s, text)));
	return {
		height,
		draw: (x, y, opacity) => `<g opacity="${op(opacity)}">${rect(x, y, boxW, height, palette.accent)}${textAt(face, text, x + padX, y + padY + cap, s, palette.trackingTag, palette.onAccent)}</g>`,
	};
}

function lines(face: Face, rows: string[], size: number, leading: number, tracking: number, fill: string, stop: string, x: number, y: number, opacity: number, stopOpacity: number): string {
	let baseline = y + capHeight(face, size);
	const painted = rows.map((line, i) => {
		const svg = paintLine(face, line, x, baseline, size, tracking, fill, i === rows.length - 1 ? stop : fill, stopOpacity);
		baseline += size * leading;
		return svg;
	});
	return `<g opacity="${op(opacity)}">${painted.join('')}</g>`;
}

function paintLine(face: Face, line: string, x: number, baseline: number, size: number, tracking: number, fill: string, stop: string, stopOpacity: number): string {
	const parts = stop === fill ? undefined : splitStop(line);
	if (!parts) return textAt(face, line, x, baseline, size, tracking, fill);
	const ls = tracking ? ` letter-spacing="${fmt(tracking * size)}"` : '';
	return `<text x="${fmt(x)}" y="${fmt(baseline)}" fill="${fill}" ${familyAttr(face)} font-size="${fmt(size)}" font-weight="${face.weight}"${ls}>${esc(parts.body)}<tspan fill="${stop}" opacity="${op(stopOpacity)}">.</tspan>${esc(parts.tail)}</text>`;
}

function splitStop(line: string): { body: string; tail: string } | undefined {
	const match = /^(.*)\.((?:['"”’])*)$/.exec(line);
	if (!match || match[1].endsWith('.')) return undefined;
	return { body: match[1], tail: match[2] };
}

function footer(size: VideoSize, r: Rhythm, loaded: Faces, palette: Theme, ruleP: number, markP: number): string {
	const y = size.height - r.padBottom - r.mark;
	const ruleY = y - r.footerGap;
	const host = siteHost(brand().site);
	let urlSize = r.url;
	const room = size.width - r.padX * 2 - r.mark * (149 / 134) - 24;
	while (urlSize > 11 && measure(loaded.text, host, urlSize, 0) > room) urlSize -= 1;
	const cap = capHeight(loaded.text, urlSize);
	const drop = descent(loaded.text, urlSize);
	const baseline = y + (r.mark - (cap + drop)) / 2 + cap;
	const urlW = measure(loaded.text, host, urlSize, 0);
	return [
		rect(r.padX, ruleY, (size.width - r.padX * 2) * ruleP, 1, palette.edge),
		`<g opacity="${op(markP)}">${placed('mark-white.svg', palette.fg, r.padX, y, r.mark)}${textAt(loaded.text, host, size.width - r.padX - urlW, baseline, urlSize, 0, palette.fgMuted)}</g>`,
	].join('');
}

function readGraphic(file: string): Graphic {
	const cached = graphics.get(file);
	if (cached) return cached;
	const raw = readFileSync(join(packageRoot, 'brand', 'logo', 'svg', file), 'utf8');
	if (!/fill="#[0-9A-Fa-f]{3,8}"/.test(raw)) throw new Error(`brand/logo/svg/${file} has no filled paths.`);
	const viewBox = /viewBox="([^"]+)"/.exec(raw)?.[1] ?? '0 0 1 1';
	const parts = viewBox.split(/[\s,]+/).map(Number);
	const body = raw.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/fill="#[0-9A-Fa-f]{3,8}"/g, 'fill="__FILL__"');
	const graphic = { viewBox, body, vw: parts[2] || 1, vh: parts[3] || 1 };
	graphics.set(file, graphic);
	return graphic;
}

function placed(file: string, fill: string, x: number, y: number, width: number): string {
	const graphic = readGraphic(file);
	const height = width * (graphic.vh / graphic.vw);
	return `<svg x="${fmt(x)}" y="${fmt(y)}" width="${fmt(width)}" height="${fmt(height)}" viewBox="${graphic.viewBox}">${graphic.body.replaceAll('__FILL__', fill)}</svg>`;
}

function document(size: VideoSize, palette: Theme, loaded: Faces, body: string): string {
	const css = [loaded.heading, loaded.text, loaded.medium]
		.filter((face, i, all) => all.findIndex((item) => item.family === face.family && item.weight === face.weight) === i)
		.map((face) => `@font-face{font-family:"${face.family}";font-weight:${face.weight};font-style:normal;src:url("data:font/woff2;base64,${face.woff2.toString('base64')}") format("woff2");}`)
		.join('');
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}">
<defs><style type="text/css"><![CDATA[${css}]]></style></defs>
${rect(0, 0, size.width, size.height, palette.bg)}
${body}
</svg>
`;
}

function familyAttr(face: Face): string {
	return `font-family="'${esc(face.family)}'"`;
}

function textAt(face: Face, text: string, x: number, y: number, size: number, tracking: number, fill: string): string {
	const ls = tracking ? ` letter-spacing="${fmt(tracking * size)}"` : '';
	return `<text x="${fmt(x)}" y="${fmt(y)}" fill="${fill}" ${familyAttr(face)} font-size="${fmt(size)}" font-weight="${face.weight}"${ls}>${esc(text)}</text>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string): string {
	return `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(Math.max(0, w))}" height="${fmt(h)}" fill="${fill}" shape-rendering="crispEdges"/>`;
}

function siteHost(site: string): string {
	try {
		return new URL(site).host.replace(/^www\./, '');
	} catch {
		return site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
	}
}

function op(n: number): string {
	return (Math.round(Math.min(1, Math.max(0, n)) * 1000) / 1000).toFixed(3);
}

function fmt(n: number): string {
	const rounded = Math.round(n * 100) / 100;
	return Object.is(rounded, -0) ? '0' : String(rounded);
}

function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function display(cwd: string, path: string): string {
	const rel = relative(cwd, path);
	return !rel || rel.startsWith('..') || isAbsolute(rel) ? path : rel;
}
