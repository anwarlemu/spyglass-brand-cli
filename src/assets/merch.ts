import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import type { Layer, Scene } from './scene.js';
import type { LayerEdit } from '../design/types.js';
import { drawScene, FitError, type DrawResult } from './scene.js';
import { checkDrawn, fill, unknown } from './templates.js';

// Merch print files: brand/assets/merch.json holds each item's trim size, bleed and safe area (inches, with their
// source) and layouts in inches from the trim. This turns an item and a variant into a scene in pixels at 300 per inch
// with the bleed around it; the command writes the SVG at physical size and the PNG at the asked dpi.

export const PX_PER_IN = 300;

export type MerchItem = {
	id: string;
	name: string;
	size: [number, number];
	bleed: number;
	safe: number;
	method: string;
	source: string;
	cut?: { radius: number };
	variants: Record<string, { ink: string; ground: string }>;
	layers: Layer[] | Record<string, Layer[]>;
	slots?: Record<string, string>;
	required?: string[];
};

let doc: { dpi: number; items: MerchItem[] } | undefined;
export function merchItems(): MerchItem[] {
	doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'merch.json'), 'utf8')) as { dpi: number; items: MerchItem[] };
	return doc.items;
}

export function findItem(id: string): MerchItem {
	const all = merchItems();
	const hit = all.find((i) => i.id === id.trim().toLowerCase());
	if (!hit) throw unknown('item', id, all.map((i) => i.id));
	return hit;
}

export function merchCatalog() {
	return merchItems().map((i) => ({
		id: i.id,
		name: i.name,
		trim: { width: i.size[0], height: i.size[1], unit: 'in' },
		bleed: i.bleed,
		safe: i.safe,
		method: i.method,
		variants: Object.keys(i.variants),
		pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
		dieCut: Boolean(i.cut),
		slots: Object.fromEntries(Object.entries(i.slots ?? {}).map(([k, v]) => [k, fill(v)])),
		required: i.required ?? [],
		source: i.source,
	}));
}

const LEN = new Set(['x', 'top', 'w', 'h', 'size', 'tile', 'leading', 'gap', 'itemGap', 'shift', 'min', 'pad', 'padTop', 'padBottom', 'grow', 'bottom', 'radius', 'prefer']);
/** Lengths that are places, so they move by the bleed. */
const PLACE = new Set(['x', 'top', 'bottom', 'prefer']);

/** Inches to pixels, moving positions by the bleed. */
function convert<T>(layer: T, bleed: number, vars: Record<string, string>): T {
	const o = bleed * PX_PER_IN;
	const px = (n: number) => n * PX_PER_IN;
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(layer as Record<string, unknown>)) {
		if (typeof v === 'string' && v.startsWith('$')) out[k] = vars[v.slice(1)] ?? v;
		else if (k === 'box' || k === 'window') out[k] = (v as number[]).map((n, i) => px(n) + (i < 2 ? o : 0));
		else if (k === 'b') out[k] = (v as number[]).map((n, i) => px(n) + (i < 2 && !('window' in (layer as object)) ? o : 0));
		else if (k === 'quad' || k === 'clipQuad') out[k] = (v as number[][]).map(([x, y]) => [px(x!) + o, px(y!) + o]);
		else if (k === 'items' && Array.isArray(v)) out[k] = v.map((i) => (i && typeof i === 'object' ? convert(i, 0, vars) : i));
		else if (LEN.has(k) && typeof v === 'number') out[k] = PLACE.has(k) ? px(v) + o : px(v);
		else out[k] = v;
	}
	return out as T;
}

export type MerchRequest = { variant?: string; seed?: number; light?: 'brand' | 'generated'; texture?: boolean; guides?: boolean; slots?: Record<string, string>; sample?: boolean; edits?: Record<string, LayerEdit> };

export function merchScene(item: MerchItem, req: MerchRequest): { scene: Scene; variant: string; widthIn: number; heightIn: number; given: string[] } {
	const names = Object.keys(item.variants);
	const variant = (req.variant ?? names[0]!).toLowerCase();
	const vars = item.variants[variant];
	if (!vars) throw unknown(`theme for ${item.id}`, variant, names);
	const raw = Array.isArray(item.layers) ? item.layers : item.layers[variant] ?? item.layers.default ?? [];
	const layers = raw.map((l) => convert(l, item.bleed, vars));
	const widthIn = item.size[0] + 2 * item.bleed;
	const heightIn = item.size[1] + 2 * item.bleed;
	const W = Math.round(widthIn * PX_PER_IN);
	const H = Math.round(heightIn * PX_PER_IN);
	const o = item.bleed * PX_PER_IN;
	const tw = item.size[0] * PX_PER_IN;
	const th = item.size[1] * PX_PER_IN;
	const rect = (x: number, y: number, w: number, h: number, r = 0) =>
		r ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z` : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
	if (item.cut) layers.push({ type: 'path', id: 'CutContour', d: rect(o, o, tw, th, item.cut.radius * PX_PER_IN), stroke: 'magenta', strokeWidth: 3, svgOnly: true });
	if (req.guides) {
		const s = item.safe * PX_PER_IN;
		if (item.bleed) layers.push({ type: 'path', id: 'Trim', d: rect(o, o, tw, th), stroke: 'cyan', strokeWidth: 3 });
		layers.push({ type: 'path', id: 'Safe', d: rect(o + s, o + s, tw - 2 * s, th - 2 * s), stroke: 'cyan', strokeWidth: 3, dash: '18 12' });
	}
	const takes = item.slots ?? {};
	for (const k of Object.keys(req.slots ?? {})) if (!(k in takes)) throw new Error(`${item.id} does not draw --${k}.${Object.keys(takes).length ? ` It takes ${Object.keys(takes).map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
	const slots: Record<string, string> = {};
	const sampled: string[] = [];
	const own: string[] = [];
	for (const [k, v] of Object.entries(takes)) {
		const given = req.slots?.[k];
		if (given !== undefined) slots[k] = given;
		else if (k === 'url') {
			slots[k] = fill(v);
			own.push(k);
		}
		else if (req.sample) {
			slots[k] = fill(v);
			sampled.push(k);
		} else slots[k] = '';
	}
	const missing = (item.required ?? []).filter((k) => !slots[k]?.trim());
	if (missing.length) throw new Error(`${item.id} needs ${missing.map((k) => `--${k}`).join(' and ')} (--sample fills sample copy to look at it).`);
	const ground = vars.ground === 'none' ? undefined : vars.ground;
	const s = item.safe * PX_PER_IN;
	return { scene: { width: W, height: H, ground, layers, slots, sampled, own, seed: req.seed, light: req.light, texture: req.texture, clearPadding: 0.05 * PX_PER_IN, frame: [o + s, o + s, tw - 2 * s, th - 2 * s], unit: 1.8, density: PX_PER_IN / 96, edits: req.edits }, variant, widthIn, heightIn, given: Object.keys(req.slots ?? {}) };
}

/** Draws an item, and refuses to leave out a word that was passed. */
export async function drawMerch(item: MerchItem, req: MerchRequest): Promise<{ drawn: DrawResult; variant: string; widthIn: number; heightIn: number; scene: Scene }> {
	const r = merchScene(item, req);
	let drawn: DrawResult;
	try {
		drawn = await drawScene(r.scene);
	} catch (err) {
		if (err instanceof FitError) throw new FitError(`${item.id}: ${err.message}`, err.slot, err.detail);
		throw err;
	}
	checkDrawn(`${item.id} in ${r.variant}`, r.scene, r.given, drawn);
	return { drawn, variant: r.variant, widthIn: r.widthIn, heightIn: r.heightIn, scene: r.scene };
}

/** The SVG at physical size: inches on the root, pixels at 300 per inch inside. */
export function physicalSvg(svg: string, widthIn: number, heightIn: number): string {
	return svg.replace(/(<svg [^>]*?)width="\d+(?:\.\d+)?" height="\d+(?:\.\d+)?"/, `$1width="${widthIn}in" height="${heightIn}in"`);
}
