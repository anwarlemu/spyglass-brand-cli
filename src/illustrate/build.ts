import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { color, drawScene, rasterizeScene, type Layer, type Photo, type Scene } from '../assets/scene.js';
import { unknown } from '../assets/templates.js';

// `illustrate` draws the brand's own imagery (brand/assets/illustrate.json, rules in brand/illustration.md): the
// pattern (the light with the texture behind it), the light in any variant, the texture and the photo light split,
// each a scene drawn by the asset engine (vector SVG, rasterized by resvg).

export type StyleId = 'pattern' | 'light' | 'texture' | 'split';
type StyleDef = { name: string; from: string; description: string; size: [number, number] | null; image: false | 'required' | 'optional' };
export type IllustrateData = {
	styles: Record<StyleId, StyleDef>;
	split: { shift: number; bleed: number; from: string };
	pattern: { variant: string; texture: number; from: string };
};

let cached: IllustrateData | undefined;
export function illustrateData(): IllustrateData {
	cached ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'illustrate.json'), 'utf8')) as IllustrateData;
	return cached;
}

export const STYLES = (): StyleId[] => Object.keys(illustrateData().styles) as StyleId[];
/** Light variant frames as the brand assets cut them (the light command's defaults). */
export const LIGHT_FRAMES: Record<string, [number, number]> = { band: [1080, 240], field: [1080, 612], corner: [1080, 1080], 'strip-left': [160, 1080], 'strip-right': [160, 1080], tile: [200, 200], 'close-up': [280, 208], 'curved-strip': [1920, 619] };

// ----- Subjects -----

/** The natural size of a PNG or JPEG, from its header. */
export function pictureSize(data: Buffer): { w: number; h: number } {
	if (data[0] === 0x89 && data[1] === 0x50) return { w: data.readUInt32BE(16), h: data.readUInt32BE(20) };
	let i = 2;
	while (i + 9 < data.length) {
		if (data[i] !== 0xff) { i++; continue; }
		const marker = data[i + 1]!;
		const len = data.readUInt16BE(i + 2);
		if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { w: data.readUInt16BE(i + 7), h: data.readUInt16BE(i + 5) };
		i += 2 + len;
	}
	throw new Error('Could not read the picture size (a JPEG without a frame header).');
}

// ----- Drawing -----

export type IllustrateRequest = {
	style: StyleId;
	photo?: Photo;
	variant?: string;
	source?: 'brand' | 'generated';
	seed?: number;
	width?: number;
	height?: number;
	density?: number;
	texture?: boolean;
};

export type Illustration = { svg: string; png: Buffer; width: number; height: number; vector: boolean; meta: Record<string, unknown> };

function size(req: IllustrateRequest, fallback: [number, number]): [number, number] {
	const w = req.width ?? fallback[0];
	const h = req.height ?? fallback[1];
	if (!(w >= 16 && h >= 16 && w <= 6000 && h <= 6000)) throw new Error('--width and --height take 16 to 6000.');
	return [Math.round(w), Math.round(h)];
}

async function sceneOut(scene: Scene, meta: Record<string, unknown>): Promise<Illustration> {
	const drawn = await drawScene(scene);
	const r = await rasterizeScene(drawn);
	return { svg: drawn.svg, png: r.png, width: drawn.width, height: drawn.height, vector: true, meta };
}

export async function illustrate(req: IllustrateRequest): Promise<Illustration> {
	const data = illustrateData();
	const def = data.styles[req.style];
	if (!def) throw unknown('style', req.style, STYLES());
	const seed = Math.trunc(req.seed ?? 0);
	if (req.photo && !def.image) throw new Error(`The ${req.style} style takes no --image. Pictures go to: ${STYLES().filter((s) => data.styles[s].image).join(', ')}.`);
	if (req.style === 'light' || req.style === 'pattern') {
		const variant = req.variant ?? (req.style === 'pattern' ? data.pattern.variant : 'band');
		if (!LIGHT_FRAMES[variant]) throw unknown('variant', variant, Object.keys(LIGHT_FRAMES));
		const [w, h] = size(req, req.style === 'light' ? LIGHT_FRAMES[variant]! : def.size!);
		const layers: Layer[] = [];
		if (req.style === 'pattern' && req.texture !== false) layers.push({ type: 'ascii', density: req.density ?? data.pattern.texture });
		layers.push({ type: 'light', variant, seed, source: req.source ?? 'brand' });
		return sceneOut({ width: w, height: h, ground: 'black', layers, seed, light: req.source ?? 'brand' }, { style: req.style, variant, seed, source: req.source ?? 'brand' });
	}
	if (req.variant) throw new Error(`--variant belongs to the light and pattern styles.`);
	if (req.style === 'texture') {
		const [w, h] = size(req, def.size!);
		return sceneOut({ width: w, height: h, ground: 'black', layers: [{ type: 'ascii', density: req.density ?? 0.5 }], seed }, { style: 'texture', seed, density: req.density ?? 0.5 });
	}
	if (req.style === 'split') {
		if (!req.photo) throw new Error('The split style needs a picture: --image photo.jpg.');
		const ps = pictureSize(req.photo.data);
		const [w, h] = size(req, req.width || req.height ? def.size! : fitLong(ps.w, ps.h, def.size![0]));
		const shift = Math.round(w * data.split.shift * 100) / 100;
		const bleed = Math.round(w * data.split.bleed * 100) / 100;
		return sceneOut({ width: w, height: h, ground: 'black', layers: [{ type: 'split', box: [0, 0, w, h], index: 0, shift, bleed }], photos: [req.photo], seed }, { style: 'split', shift, seed });
	}
	throw unknown('style', req.style, STYLES());
}

/** A picture's proportions with its long side at `long`. */
function fitLong(w: number, h: number, long: number): [number, number] {
	return w >= h ? [long, Math.round((long * h) / w)] : [Math.round((long * w) / h), long];
}
