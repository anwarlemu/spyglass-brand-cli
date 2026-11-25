import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { brand, packageRoot, tokens } from '../lib/brand.js';
import type { Face } from '../image/fonts.js';
import { capHeight, descent, measure } from '../image/text.js';
import { allFaces, checkGlyphs, clean, faceFor, fitText, FitError, longestPrefix, tooLong, wrapLines, type Faces4 } from './type.js';
import { keyOf, layoutStack, padOf, textOf, type Placed, type PlacedText, type StackContext } from './stack.js';
import { lit, litRuns, lightOf, range, touches, type LightModule, type LitMap, type PlacedLight } from './lit.js';
import type { Anchor, DrawnLayer, LayerEdit, Rect } from '../design/types.js';
import { cropStraight, encodePng } from './png.js';

// The asset engine: a scene is a frame size and a list of layers in the frame's pixels (the brand's layouts in
// brand/assets/*.json are scenes with slots). It draws one SVG with the vendored faces embedded, and rasterizes it
// with resvg, system fonts off. Nothing here knows the brand: colors resolve from the tokens, the light and the
// texture from the generators built from the registry, logos from brand/logo/svg.

export type Box = [number, number, number, number];
export type Pt = [number, number];
export type FaceRole = 'display' | 'body' | 'medium' | 'label' | 'code';

/** What every layer can carry: its name (layers with one name move together), and how an edit moves it. */
type Named = {
	id?: string;
	/** The canvas corner or edge this layer sits at; another anchor moves it there and swaps with what stood there. */
	corner?: Anchor;
	/** Runs off the canvas on purpose. */
	bleeds?: boolean;
	/** Layers it sits on by design. */
	over?: string[];
	/** Drawn only with pictures, or only without. */
	when?: 'pictures' | 'no-pictures';
	/** The template needs it: it cannot be hidden. */
	required?: boolean;
	/** Already at its edited size: not raised to the readable floor. */
	pinned?: boolean;
};

export type TextLayer = Named & {
	type: 'text';
	slot?: string;
	text?: string;
	face: FaceRole;
	size: number;
	/** Line pitch in pixels. */
	leading: number;
	x: number;
	/** The top of the first line's capitals. */
	top: number;
	w: number;
	align?: 'left' | 'center' | 'right';
	color?: string;
	maxLines?: number;
	/** The smallest size it steps down to (default: 75 percent). */
	min?: number;
	/** Letter spacing in em (labels: 0.06). */
	tracking?: number;
	caps?: boolean;
	opacity?: number;
};

type TextItem = Omit<TextLayer, 'type' | 'x' | 'top' | 'w' | 'corner'> & { type: 'text'; gap?: number; w?: number };
export type StackItem =
	| TextItem
	| (Omit<TextItem, 'type'> & { type: 'list'; itemGap: number })
	| (Named & { type: 'button'; slot?: string; text?: string; h: number; w: number; size: number; fill?: string; color?: string; radius?: number; gap?: number; align?: 'left' | 'center' | 'right' })
	| (Named & { type: 'card'; id: string; w: number; pad: number; padTop?: number; padBottom?: number; fill: string; radius?: number; gap?: number; align?: 'left' | 'center' | 'right'; items: StackItem[] });

/** Copy stacked in a box: what is not passed is left out and the rest closes up; copy that does not fit re-wraps and
 * steps down together to each item's floor, and past that is an error. A gap runs from the last baseline (or the
 * bottom of a button or card) to the next capitals (or top). */
export type StackLayer = Named & {
	type: 'stack';
	box: Box;
	valign?: 'top' | 'center' | 'bottom';
	align?: 'left' | 'center' | 'right';
	/** Where it starts (valign top), centers or ends by choice; it moves inside the box when the copy needs the room. */
	prefer?: number;
	/** A wider measure to try before any copy steps down. */
	grow?: number;
	items: StackItem[];
};

export type Layer =
	| (Named & { type: 'rect'; box: Box; fill: string; radius?: number; stroke?: string; opacity?: number })
	/** The brand's own pre-made art (brand/assets/art/<file>.jpg or .png with its ink map <file>.json), drawn over `box`:
	 * stretched to it (`fit: 'fill'`, the default) or cropped to cover it, mirrored with `flip`, and laid over what is under
	 * it in screen (the lights are lit on Black, so their Black drops out over the texture). */
	| (Named & { type: 'art'; file: string; box: Box; fit?: 'fill' | 'cover'; /** Where a cover crop centers, as fractions of the art (default the middle). */ at?: Pt; flip?: 'x' | 'y' | 'xy'; /** A quarter turn clockwise (cover only): a band laid upright. */ turn?: boolean; opacity?: number; clipQuad?: [Pt, Pt, Pt, Pt] })
	| TextLayer
	| StackLayer
	| (Named & { type: 'logo'; lockup: string; color: string; box: Box; align?: 'left' | 'center' | 'right'; /** `auto`: Black where the light under it is pale. */ tone?: 'auto'; /** For stings that bring the lockup in: 0 to 1. */ opacity?: number })
	| (Named & { type: 'light'; window?: Box; b?: Box; shift?: number; variant?: string; seed?: number; source?: 'brand' | 'generated'; clipQuad?: [Pt, Pt, Pt, Pt]; /** Stays where it is: it is not moved to keep copy clear. */ fixed?: boolean })
	/** The site's ASCII texture tile (brand/assets/art/ascii.png), repeated at `tile` pixels (default 1080 times the unit)
	 * and fading out radially from `from` as the site's drift does. `strength`: quiet (0.5), faint (0.32) or hero (1). */
	| (Named & { type: 'ascii'; box?: Box; seed?: number; density?: number; size?: number; tile?: number; from?: 'centre' | 'left' | 'right' | 'top' | 'bottom'; strength?: 'quiet' | 'faint' | 'hero'; core?: number })
	| InlineLayer
	| (Named & { type: 'photo'; box: Box; index: number; radius?: number; clip?: Box })
	| (Named & { type: 'panel'; quad: [Pt, Pt, Pt, Pt]; index: number })
	| (Named & { type: 'split'; box: Box; index: number; shift: number; bleed?: number })
	| (Named & { type: 'button'; box: Box; slot?: string; text?: string; size: number; fill?: string; color?: string; radius?: number; align?: 'left' | 'center' | 'right' })
	| (Named & { type: 'search'; box: Box; slot?: string; text?: string; button?: string; size: number })
	| (Named & { type: 'path'; d: string; fill?: string; stroke?: string; strokeWidth?: number; dash?: string; svgOnly?: boolean });

/** A heading set in runs with pictures between the words, as the deck cover does: each line lists word counts and
 * pictures (a picture is as tall as the capitals and sits on them). `words: 'rest'` takes what is left. Copy that does
 * not fit the width steps down with its pictures. */
export type InlineLayer = Named & {
	type: 'inline';
	slot: string;
	face: FaceRole;
	size: number;
	leading: number;
	x: number;
	top: number;
	w: number;
	/** The lowest the last baseline may sit. */
	bottom: number;
	gap: number;
	color?: string;
	lines: ({ words: number | 'rest' } | { photo: number; w: number })[][];
};

export type Photo = { mime: string; data: Buffer };

export type Scene = {
	width: number;
	height: number;
	/** Ground color (a token name or hex). Omit for a transparent ground. */
	ground?: string;
	layers: Layer[];
	/** Slot values (the copy). An empty slot is left out. */
	slots?: Record<string, string>;
	/** Slots filled with sample copy. */
	sampled?: string[];
	/** Slots that hold the brand's own words (its address). */
	own?: string[];
	photos?: Photo[];
	/** Draw a picture slot with no picture as the card fill (samples only). */
	placeholders?: boolean;
	/** The seed for the texture and a generated light. */
	seed?: number;
	/** 'brand' keeps the brand's own heat map; 'generated' draws every light from a heat map generated from the seed. */
	light?: 'brand' | 'generated';
	/** Leave the ASCII texture out. */
	texture?: boolean;
	/** Keep text inside the texture's clear areas (default on). */
	clearPadding?: number;
	/** The area inside the margins, for anchors (default: 64px in). */
	frame?: Box;
	/** Pixels of this canvas per pixel of the 1080 canvas: readable floors scale with it. */
	unit?: number;
	/** The smallest readable text, in pixels, at the width the picture is shown. */
	floor?: number;
	/** Pixels per CSS pixel, for the logo's minimum height (print: 300 / 96). */
	density?: number;
	/** Changes to single layers, by id. */
	edits?: Record<string, LayerEdit>;
	/** The corners the logo may go to (the template's, where some would crowd its copy). */
	logoAnchors?: Anchor[];
};

// ----- Colors -----

/** A color by token name (`white`, `card-fill`, `neutral-4`, `--ds-color-...`) or hex. */
export function color(value: string | undefined, fallback = '#FFFFFF'): string {
	if (!value) return fallback;
	if (/^#[0-9a-f]{3,8}$/i.test(value) || value === 'none') return value.toUpperCase() === 'NONE' ? 'none' : value.toUpperCase();
	const name = value.startsWith('--') ? value : `--ds-color-${value}`;
	const t = tokens()[name];
	const hex = t?.light?.trim();
	if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Unknown color \`${value}\` (no token ${name}).`);
	return hex.toUpperCase();
}

// ----- Generators -----

type AsciiModule = { asciiSvg: (o: Record<string, unknown>) => string };

const loaded = new Map<string, unknown>();
export async function generator<T>(name: 'light' | 'ascii'): Promise<T> {
	if (loaded.has(name)) return loaded.get(name) as T;
	const file = join(packageRoot, 'build', 'generators', `${name}.mjs`);
	if (!existsSync(file)) throw new Error(`build/generators/${name}.mjs is missing: run the build first.`);
	const mod = (await import(pathToFileURL(file).href)) as T;
	loaded.set(name, mod);
	return mod;
}

// ----- Logos -----

const logoCache = new Map<string, { viewBox: string; body: string; vw: number; vh: number }>();
export function logoNames(): string[] {
	const dir = join(packageRoot, 'brand', 'logo', 'svg');
	return ['horizontal', 'vertical', 'mark', 'wordmark', 'horizontal-3d', 'vertical-3d', 'mark-3d'].filter((n) => existsSync(join(dir, `${n}-white.svg`)));
}
function logo(lockup: string, tone: string) {
	const key = `${lockup}-${tone}`;
	const hit = logoCache.get(key);
	if (hit) return hit;
	const file = join(packageRoot, 'brand', 'logo', 'svg', `${key}.svg`);
	if (!existsSync(file)) throw new Error(`Unknown lockup \`${lockup}\` in ${tone}. Lockups: ${logoNames().join(', ')} (white or black).`);
	const raw = readFileSync(file, 'utf8');
	const viewBox = /viewBox="([^"]+)"/.exec(raw)?.[1] ?? '0 0 100 100';
	const [, , vw, vh] = viewBox.split(/[\s,]+/).map(Number);
	const fill = /<svg[^>]*\sfill="([^"]+)"/.exec(raw)?.[1] ?? (tone === 'white' ? '#FFFFFF' : '#000000');
	const body = `<g fill="${fill}">${raw.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/g, '')}</g>`;
	const entry = { viewBox, body, vw: vw!, vh: vh! };
	logoCache.set(key, entry);
	return entry;
}

/** A lockup fitted into a box (kept in proportion, aligned in the box). */
export function logoSvg(lockup: string, tone: string, box: Box, align: 'left' | 'center' | 'right' = 'center'): string {
	const l = logo(lockup, tone);
	const [x, y, w, h] = box;
	const scale = Math.min(w / l.vw, h / l.vh);
	const lw = l.vw * scale;
	const lh = l.vh * scale;
	const lx = align === 'left' ? x : align === 'right' ? x + w - lw : x + (w - lw) / 2;
	return `<svg x="${f(lx)}" y="${f(y + (h - lh) / 2)}" width="${f(lw)}" height="${f(lh)}" viewBox="${l.viewBox}">${l.body}</svg>`;
}

/** Ratio (width over height) of a lockup. */
export function logoRatio(lockup: string): number {
	const l = logo(lockup, 'white');
	return l.vw / l.vh;
}

// ----- Text -----

export { allFaces, faceFor, fitText, FitError, wrapLines } from './type.js';

function textMarkup(t: PlacedText, value?: string): string {
	const fill = color(value ?? t.color, '#FFFFFF');
	const ls = t.tracking ? ` letter-spacing="${f(t.tracking * t.size)}"` : '';
	const op = t.opacity !== undefined ? ` fill-opacity="${t.opacity}"` : '';
	// Each line is pinned to the width it was measured at, so every renderer sets it as wide as it was wrapped and
	// aligned (one rasterizer sets the text face about 2% wider without it).
	return t.lines.map((l) => `<text x="${f(l.x)}" y="${f(l.baseline)}" font-family="'${t.face.family}'" font-size="${f(t.size)}" font-weight="${t.face.weight}" fill="${fill}"${op}${ls} textLength="${f(l.w)}" lengthAdjust="spacing" xml:space="preserve">${esc(l.text)}</text>`).join('');
}

type PlacedInline = { runs: PlacedText['lines']; face: Face; size: number; pictures: { box: Box; index: number }[]; box: Box };

/** The inline heading at its size, or stepped down with its pictures until every line fits. */
function placeInline(all: Faces4, layer: InlineLayer, value: string, pin?: number): PlacedInline {
	const face = faceFor(all, layer.face);
	checkGlyphs(face, value, layer.slot);
	const words = clean(value).split(/\s+/).filter(Boolean);
	const tryAt = (k: number): PlacedInline | undefined => {
		const size = layer.size * k;
		const cap = capHeight(face, size);
		let at = 0;
		const runs: PlacedText['lines'] = [];
		const pictures: PlacedInline['pictures'] = [];
		let right = layer.x;
		let top = layer.top;
		let x = layer.x;
		let first = true;
		const space = measure(face, ' ', size, 0);
		const newline = () => {
			top += layer.leading * k;
			x = layer.x;
			first = true;
		};
		layer.lines.forEach((line, li) => {
			if (li) newline();
			for (const part of line) {
				if ('photo' in part) {
					const pw = part.w * k;
					if (x + (first ? 0 : layer.gap * k) + pw > layer.x + layer.w) newline();
					if (!first) x += layer.gap * k;
					pictures.push({ box: [x, top, pw, cap], index: part.photo });
					x += pw;
					first = false;
				} else {
					const n = part.words === 'rest' ? words.length - at : Math.min(part.words, words.length - at);
					let run = '';
					let rx = x + (first ? 0 : layer.gap * k);
					const flush = () => {
						if (!run) return;
						const w = measure(face, run, size, 0);
						runs.push({ text: run, x: rx, baseline: top + cap, w });
						x = rx + w;
						right = Math.max(right, x);
						first = false;
						run = '';
					};
					for (let i = 0; i < n; i++) {
						const word = words[at++]!;
						const next = run ? `${run} ${word}` : word;
						if (rx + measure(face, next, size, 0) <= layer.x + layer.w) run = next;
						else {
							flush();
							newline();
							rx = x;
							run = word;
						}
					}
					flush();
				}
				right = Math.max(right, x);
			}
		});
		void space;
		const bottom = top + cap;
		if (bottom > layer.bottom + 0.5 || runs.some((r) => r.x + r.w > layer.x + layer.w + 0.5)) return undefined;
		return { runs, face, size, pictures, box: [layer.x, layer.top, right - layer.x, bottom - layer.top + descent(face, size)] };
	};
	let base: PlacedInline | undefined;
	let bk = 1;
	for (let k = 1; k >= 0.4; k = Math.round((k - 0.02) * 100) / 100) {
		base = tryAt(k);
		bk = k;
		if (base) break;
	}
	if (!base) throw tooLong(layer.slot, value, longestPrefix(value, (t) => Boolean(placeInlineFits(all, layer, t))), `${Math.round(layer.size * 0.4)}px is the smallest readable size here`);
	if (pin === undefined || pin === 1) return base;
	const r = tryAt(bk * pin);
	if (r) return r;
	let best = 1;
	for (let k = 1; k <= pin; k = Math.round((k + 0.02) * 100) / 100) if (tryAt(bk * k)) best = k;
	throw new FitError(`The ${layer.slot} does not fit at ${pin}x: up to ${best}x fits here.`, layer.slot, { layer: layer.slot, max: best });
}
function placeInlineFits(all: Faces4, layer: InlineLayer, value: string): boolean {
	const face = faceFor(all, layer.face);
	const size = layer.size * 0.4;
	const lines = wrapLines(face, value, size, layer.w, 0);
	return lines.length * layer.leading * 0.4 <= layer.bottom - layer.top;
}

// ----- Photos -----

function href(p: Photo) {
	return `data:${p.mime};base64,${p.data.toString('base64')}`;
}

let uid = 0;
const nextId = (p: string) => `${p}${++uid}`;

function photoSvg(box: Box, photo: Photo | undefined, radius = 0, clip?: Box): string {
	const [x, y, w, h] = box;
	const c = clip ?? box;
	const id = nextId('ph');
	const clipEl = `<clipPath id="${id}"><rect x="${f(c[0])}" y="${f(c[1])}" width="${f(c[2])}" height="${f(c[3])}" rx="${f(radius)}"/></clipPath>`;
	if (!photo) return `<rect x="${f(c[0])}" y="${f(c[1])}" width="${f(c[2])}" height="${f(c[3])}" rx="${f(radius)}" fill="${color('card-fill')}"/>`;
	return `${clipEl}<image href="${href(photo)}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
}

/** A photo on a quad whose left and right edges are vertical (a panel seen in perspective): drawn in thin vertical
 * strips, each scaled to the quad's height there, so the picture narrows with the panel. */
function panelSvg(quad: [Pt, Pt, Pt, Pt], photo: Photo | undefined, defs: string[]): string {
	// Corners: top-left, top-right, bottom-right, bottom-left.
	const [tl, tr, br, bl] = quad;
	const poly = quad.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
	if (!photo) return `<polygon points="${poly}" fill="${color('card-fill')}"/>`;
	const id = nextId('pn');
	const x0 = tl[0];
	const x1 = tr[0];
	const width = x1 - x0;
	const aspectH = Math.max(bl[1] - tl[1], br[1] - tr[1]);
	defs.push(`<image id="${id}" href="${href(photo)}" width="${f(width)}" height="${f(aspectH)}" preserveAspectRatio="xMidYMid slice"/>`);
	const clip = nextId('pc');
	const strips = Math.max(4, Math.min(48, Math.round(Math.abs(width) / 6)));
	const parts: string[] = [`<clipPath id="${clip}"><polygon points="${poly}"/></clipPath><g clip-path="url(#${clip})">`];
	for (let i = 0; i < strips; i++) {
		const t0 = i / strips;
		const t1 = (i + 1) / strips;
		const tm = (t0 + t1) / 2;
		const top = tl[1] + (tr[1] - tl[1]) * tm;
		const bottom = bl[1] + (br[1] - bl[1]) * tm;
		const sx = x0 + width * t0;
		// Each strip runs under the next, so no seam shows where two soft edges meet.
		const sw = width / strips + 1.5;
		const sc = (bottom - top) / aspectH;
		const sid = nextId('ps');
		parts.push(`<clipPath id="${sid}"><rect x="${f(sx)}" y="${f(top - 2)}" width="${f(sw)}" height="${f(bottom - top + 4)}"/></clipPath><g clip-path="url(#${sid})"><use href="#${id}" transform="translate(${f(x0)} ${f(top)}) scale(1 ${f(sc)})"/></g>`);
	}
	parts.push('</g>');
	return parts.join('');
}

/** The brand's "photo light split": the photo three times, as its blue, green and red channels, shifted sideways
 * and added, so its edges separate like the light's. */
function splitSvg(box: Box, photo: Photo | undefined, shift: number, bleed = 0): string {
	const [x, y, w, h] = box;
	if (!photo) return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${color('card-fill')}"/>`;
	const id = nextId('sp');
	const pad = shift * 2 + bleed;
	const channel = (k: number) => {
		const m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
		m[k * 5 + k] = 1;
		return m.join(' ');
	};
	const filter = `<filter id="${id}" x="${f(x - pad)}" y="${f(y - pad)}" width="${f(w + pad * 2)}" height="${f(h + pad * 2)}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feOffset in="SourceGraphic" dx="${f(-shift)}" result="b0"/><feColorMatrix in="b0" type="matrix" values="${channel(2)}" result="b"/><feColorMatrix in="SourceGraphic" type="matrix" values="${channel(1)}" result="g"/><feOffset in="SourceGraphic" dx="${f(shift)}" result="r0"/><feColorMatrix in="r0" type="matrix" values="${channel(0)}" result="r"/><feComposite in="b" in2="g" operator="arithmetic" k2="1" k3="1" result="bg"/><feComposite in="bg" in2="r" operator="arithmetic" k2="1" k3="1"/></filter>`;
	const clip = nextId('spc');
	return `<defs>${filter}<clipPath id="${clip}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/></clipPath></defs><g clip-path="url(#${clip})"><image href="${href(photo)}" x="${f(x - bleed)}" y="${f(y - bleed)}" width="${f(w + bleed * 2)}" height="${f(h + bleed * 2)}" preserveAspectRatio="xMidYMid slice" filter="url(#${id})"/></g>`;
}

// ----- Edits -----

const ANCHOR = (a: Anchor): [number, number] => [a.endsWith('left') ? 0 : a.endsWith('right') ? 1 : 0.5, a.startsWith('top') ? 0 : a.startsWith('bottom') ? 1 : 0.5];
export const CORNERS: Anchor[] = ['top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'];

/** A layer's name: its own, its slot, or its kind (`logo`, `light`, `pictures`). */
export function layerId(l: Layer): string {
	if (l.id) return l.id;
	if (l.type === 'text' || l.type === 'button' || l.type === 'search' || l.type === 'inline') return l.slot ?? l.type;
	if (l.type === 'photo' || l.type === 'panel' || l.type === 'split') return 'pictures';
	if (l.type === 'ascii') return 'texture';
	return l.type;
}

/** The layers with every light named (`light`, `light-2`): each one moves on its own. */
export function named(layers: Layer[]): Layer[] {
	let n = 0;
	return layers.map((l) => {
		if (l.type !== 'light' || l.id) return l;
		n++;
		return { ...l, id: n === 1 ? 'light' : `light-${n}` };
	});
}

const arts = new Map<string, { data: string; width: number; height: number; ink: [number, number, number, number][] }>();
let asciiTile: string | undefined;
/** The site's ASCII tile: White characters on transparent, as the site ships it (ascii-texture-alpha@2x). */
function asciiArt(): string {
	asciiTile ??= `data:image/png;base64,${readFileSync(join(packageRoot, 'brand', 'assets', 'art', 'ascii.png')).toString('base64')}`;
	return asciiTile;
}
/** The site's four drift crops (ui/AsciiDrift: mass, column, cluster, scatter), as fractions of the 1080 tile. */
const ASCII_CROPS: Pt[] = [[-120, -592], [0, -16], [-336, -248], [-808, -560]].map(([x, y]) => [x / 1080, y / 1080] as Pt);
const ASCII_AT: Record<string, [number, number]> = { centre: [0.5, 0.5], left: [0, 0.5], right: [1, 0.5], top: [0.5, 0], bottom: [0.5, 1] };
/** The brand's pre-made art: the PNG as base64 and where it is lit, in its own pixels. */
function artOf(file: string) {
	let a = arts.get(file);
	if (!a) {
		const dir = join(packageRoot, 'brand', 'assets', 'art');
		const map = JSON.parse(readFileSync(join(dir, `${file}.json`), 'utf8')) as { width: number; height: number; ink: [number, number, number, number][] };
		const jpg = existsSync(join(dir, `${file}.jpg`));
		a = { data: `data:image/${jpg ? 'jpeg' : 'png'};base64,${readFileSync(join(dir, `${file}.${jpg ? 'jpg' : 'png'}`)).toString('base64')}`, ...map };
		arts.set(file, a);
	}
	return a;
}

function boxOf(l: Layer): Box | undefined {
	if (l.type === 'panel') {
		const xs = l.quad.map((p) => p[0]);
		const ys = l.quad.map((p) => p[1]);
		return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)];
	}
	if (l.type === 'light') return l.window;
	if (l.type === 'photo') return l.clip ?? l.box;
	if ('box' in l) return l.box as Box | undefined;
	return undefined;
}

const union = (boxes: Box[]): Box => {
	const x = Math.min(...boxes.map((b) => b[0]));
	const y = Math.min(...boxes.map((b) => b[1]));
	return [x, y, Math.max(...boxes.map((b) => b[0] + b[2])) - x, Math.max(...boxes.map((b) => b[1] + b[3])) - y];
};
const hit = (a: Box, b: Box) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
const grow = (b: Box, p: number): Box => [b[0] - p, b[1] - p, b[2] + 2 * p, b[3] + 2 * p];
const rect = (b: Box): Rect => ({ x: round(b[0]), y: round(b[1]), w: round(b[2]), h: round(b[3]) });
const round = (n: number) => Math.round(n * 10) / 10;
/** The part of a rectangle inside a box, or nothing. */
function clipRect(r: Rect, [x, y, w, h]: Box): Rect | undefined {
	const x0 = Math.max(r.x, x);
	const y0 = Math.max(r.y, y);
	const x1 = Math.min(r.x + r.w, x + w);
	const y1 = Math.min(r.y + r.h, y + h);
	return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : undefined;
}
/** Relative luminance of a hex color, 0 to 1. */
function luma(hex: string): number {
	const n = parseInt(hex.slice(1, 7), 16);
	return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}

/** Moves and scales a box about a point. */
function moved(b: Box, about: Pt, k: number, dx: number, dy: number): Box {
	return [about[0] + (b[0] - about[0]) * k + dx, about[1] + (b[1] - about[1]) * k + dy, b[2] * k, b[3] * k];
}

/** The box a lockup really takes inside the box it is fitted into. */
export function logoBox(l: { lockup: string; box: Box; align?: 'left' | 'center' | 'right' }): Box {
	const r = logoRatio(l.lockup);
	const [x, y, w, h] = l.box;
	const lh = Math.min(h, w / r);
	const lw = lh * r;
	return [l.align === 'left' ? x : l.align === 'right' ? x + w - lw : x + (w - lw) / 2, y + (h - lh) / 2, lw, lh];
}

/** Clear space around a lockup: a share of the logomark's height, on every side. */
export function clearOf(lockup: string, h: number): number {
	const spec = brand().logo;
	if (!spec) return 0;
	return spec.clearSpace * (spec.markHeight[lockup] ?? 1) * h;
}

/** The layers with the edits applied: hidden layers gone, corner layers moved (swapping with what stood there), groups
 * moved and scaled, and stacks given the room that is left. */
async function applyEdits(scene: Scene, all: Faces4): Promise<Layer[]> {
	const edits = scene.edits ?? {};
	const ids = Object.keys(edits).filter((k) => edits[k] && Object.keys(edits[k]!).length);
	let layers = named(scene.layers).filter((l) => !(l.type === 'ascii' && scene.texture === false));
	if (!ids.length) return layers;
	const W = scene.width;
	const H = scene.height;
	const frame = scene.frame ?? [64, 64, W - 128, H - 128];
	layers = layers.filter((l) => l.type === 'stack' || !edits[layerId(l)]?.hidden);
	const slots = scene.slots ?? {};
	const value = (l: { slot?: string; text?: string }) => clean((l.slot ? slots[l.slot] : undefined) ?? l.text ?? '');
	const changed = new Set<Layer>();

	// Corners: the size of what stands in one, then its place.
	const sizeOf = (l: Layer): [number, number] => {
		if (l.type === 'logo') {
			const b = logoBox(l);
			return [b[2], b[3]];
		}
		if (l.type === 'button') {
			const face = all.medium;
			return [Math.max(l.box[2], measure(face, value(l), l.size, 0) + 2 * padOf(l.box[3])), l.box[3]];
		}
		if (l.type === 'text') {
			const face = faceFor(all, l.face);
			const caps = l.caps ?? l.face === 'label';
			const v = caps ? value(l).toUpperCase() : value(l);
			return [measure(face, v, l.size, l.tracking ?? (l.face === 'label' ? 0.06 : 0)), capHeight(face, l.size)];
		}
		return [0, 0];
	};
	const centerY = (l: Layer): number => (l.type === 'text' ? l.top + sizeOf(l)[1] / 2 : boxOf(l)![1] + boxOf(l)![3] / 2);
	const inCorner = layers.filter((l) => l.corner && (l.type === 'logo' || l.type === 'text' || l.type === 'button') && (l.type === 'logo' || value(l)));
	const topRow = inCorner.filter((l) => l.corner!.startsWith('top')).map(centerY)[0];
	const bottomRow = inCorner.filter((l) => l.corner!.startsWith('bottom')).map(centerY)[0];
	const put = (l: Layer, a: Anchor): Layer => {
		const [w, h] = sizeOf(l);
		const [ax, ay] = ANCHOR(a);
		const x = frame[0] + (frame[2] - w) * ax;
		const cy = ay === 0 ? topRow ?? frame[1] + h / 2 : ay === 1 ? bottomRow ?? frame[1] + frame[3] - h / 2 : frame[1] + frame[3] / 2;
		const align = ax === 0 ? 'left' : ax === 1 ? 'right' : 'center';
		if (l.type === 'logo') return { ...l, corner: a, align, box: [x, cy - h / 2, w, h] };
		if (l.type === 'button') return { ...l, corner: a, align, box: [x, cy - h / 2, w, h] };
		if (l.type === 'text') return { ...l, corner: a, align, x, w: w + 1, top: cy - h / 2 };
		return l;
	};
	const replace = (from: Layer, to: Layer) => {
		layers = layers.map((l) => (l === from ? to : l));
		changed.add(to);
	};
	for (const id of ids) {
		const a = edits[id]!.anchor;
		if (!a) continue;
		const l = layers.find((x) => x.corner && layerId(x) === id);
		if (!l) continue;
		const other = layers.find((x) => x !== l && x.corner === a && (x.type === 'logo' || value(x as { slot?: string; text?: string })) && !edits[layerId(x)]?.anchor);
		const was = l.corner!;
		replace(l, put(l, a));
		if (other && was !== a) replace(other, put(other, was));
	}

	// Groups: every fixed layer of one name, moved and scaled about its own middle (a corner layer about its corner).
	for (const id of ids) {
		const e = edits[id]!;
		const k = e.scale ?? 1;
		const dx = (e.dx ?? 0) * W;
		const dy = (e.dy ?? 0) * H;
		const group = layers.filter((l) => l.type !== 'stack' && layerId(l) === id);
		if (!group.length) continue;
		if (e.align) for (const l of group) if (l.type === 'text' && l.align !== e.align) replace(l, { ...l, align: e.align });
		if (k === 1 && !dx && !dy) continue;
		const group2 = layers.filter((l) => l.type !== 'stack' && layerId(l) === id);
		const boxes = group2.map(boxOf).filter((b): b is Box => Boolean(b));
		const u = boxes.length ? union(boxes) : ([0, 0, W, H] as Box);
		const about: Pt = [u[0] + u[2] / 2, u[1] + u[3] / 2];
		for (const l of group2) {
			const [ax, ay] = l.corner ? ANCHOR(l.corner) : [0.5, 0.5];
			if (l.type === 'logo') {
				const b = logoBox(l);
				replace(l, { ...l, box: moved(b, l.corner ? [b[0] + b[2] * ax, b[1] + b[3] * ay] : [b[0] + b[2] / 2, b[1] + b[3] / 2], k, dx, dy) });
			} else if (l.type === 'text') {
				const [w, h] = sizeOf(l);
				const base = Math.max(l.size, scene.floor ?? 0);
				const size = base * k;
				replace(l, { ...l, pinned: true, size, min: size, leading: (l.leading * size) / l.size, x: l.x - (l.w * (k - 1)) * (l.align === 'right' ? 1 : l.align === 'center' ? 0.5 : 0) + dx, w: l.w * k, top: l.top - h * (k - 1) * ay + dy });
				void w;
			} else if (l.type === 'inline') replace(l, { ...l, x: l.x + dx, top: l.top + dy, bottom: l.bottom + dy });
			else if (l.type === 'panel') replace(l, { ...l, quad: l.quad.map(([x, y]) => [about[0] + (x - about[0]) * k + dx, about[1] + (y - about[1]) * k + dy]) as typeof l.quad });
			else if (l.type === 'light') {
				// A light tile among the pictures moves with them; every other light moves after it has cleared the words.
				if (id !== 'pictures' || !l.window) continue;
				const win = moved(l.window, about, k, dx, dy);
				replace(l, { ...l, window: win, ...(l.b ? { b: [l.b[0] * k, l.b[1] * k, l.b[2] * k, l.b[3] * k] as Box, shift: (l.shift ?? 34) * k } : {}), ...(l.clipQuad ? { clipQuad: l.clipQuad.map(([x, y]) => [about[0] + (x - about[0]) * k + dx, about[1] + (y - about[1]) * k + dy]) as typeof l.clipQuad } : {}) });
			} else if (l.type === 'photo') replace(l, { ...l, box: moved(l.box, about, k, dx, dy), ...(l.clip ? { clip: moved(l.clip, about, k, dx, dy) } : {}) });
			else if (l.type === 'button') {
				const b = l.box;
				replace(l, { ...l, size: l.size * k, box: moved(b, l.corner ? [b[0] + b[2] * ax, b[1] + b[3] * ay] : about, k, dx, dy) });
			} else if ('box' in l && l.box) replace(l, { ...l, box: moved(l.box as Box, about, k, dx, dy), ...('size' in l && l.size ? { size: (l.size as number) * k } : {}) } as Layer);
		}
	}

	// Stacks: an anchor moves the whole stack to that part of the frame; a moved corner or panel takes its room.
	layers = layers.map((l) => {
		if (l.type !== 'stack') return l;
		const names = l.items.map((i) => i.id ?? ('slot' in i ? i.slot : undefined) ?? i.type);
		const a = names.map((n) => edits[n]?.anchor).find(Boolean);
		let s: StackLayer = l;
		if (a) {
			const [ax, ay] = ANCHOR(a);
			const w = Math.min(l.box[2], frame[2]);
			const rows = inCornerBoxes(layers.filter((x) => x.corner), sizeOf, centerY);
			// Between the rows of corner layers on the side it moves to.
			const top = Math.max(frame[1], ...rows.filter((r) => r.row === 'top').map((r) => r.y + r.h + 40 * (scene.unit ?? 1)));
			const bottom = Math.min(frame[1] + frame[3], ...rows.filter((r) => r.row === 'bottom').map((r) => r.y - 40 * (scene.unit ?? 1)));
			s = { ...l, box: [frame[0] + (frame[2] - w) * ax, top, w, bottom - top], prefer: undefined, valign: ay === 0 ? 'top' : ay === 1 ? 'bottom' : 'center', align: ax === 0 ? 'left' : ax === 1 ? 'right' : 'center', items: l.items.map((i) => ({ ...i, align: undefined })) };
		}
		for (const c of changed) {
			if (!layers.includes(c) || (c.type !== 'logo' && c.type !== 'text' && c.type !== 'button')) continue;
			const [w, h] = sizeOf(c);
			const cy = centerY(c);
			const x = c.type === 'logo' ? logoBox(c)[0] : c.type === 'text' ? (c.align === 'right' ? c.x + c.w - w : c.align === 'center' ? c.x + (c.w - w) / 2 : c.x) : c.box[0];
			const pad = c.type === 'logo' ? clearOf(c.lockup, h) + 8 : 24 * (scene.unit ?? 1);
			const r = grow([x, cy - h / 2, w, h], pad);
			if (!hit(r, s.box)) continue;
			const [bx, by, bw, bh] = s.box;
			const below = by + bh - (r[1] + r[3]);
			const above = r[1] - by;
			s = { ...s, box: below >= above ? [bx, r[1] + r[3], bw, below] : [bx, by, bw, above] };
		}
		return s;
	});
	return layers;
}

function inCornerBoxes(list: Layer[], sizeOf: (l: Layer) => [number, number], centerY: (l: Layer) => number) {
	return list.map((l) => {
		const [, h] = sizeOf(l);
		const cy = centerY(l);
		return { row: l.corner!.startsWith('top') ? 'top' : l.corner!.startsWith('bottom') ? 'bottom' : 'mid', y: cy - h / 2, h };
	});
}

// ----- The scene -----

/** `svg` is the file; `raster` is the same drawing inside a margin wide enough for every light's filter, which is
 * what the rasterizer draws (resvg clips a filter region that starts left of or above its canvas), then crops.
 * `under` is the raster without the words and logos: what they sit on. */
export type DrawResult = { svg: string; raster: string; under: string; margin: number; width: number; height: number; ground: string; lights: { svg: string; win: Box; pad: number }[]; layers: DrawnLayer[] };

type Out = { svg: string; raster?: string; under?: string };

export async function drawScene(scene: Scene, opts: { embedFonts?: boolean } = {}): Promise<DrawResult> {
	uid = 0;
	const all = await allFaces();
	const light = await generator<LightModule>('light');
	const slots = scene.slots ?? {};
	const photos = scene.photos ?? [];
	const seed = Math.trunc(scene.seed ?? 0);
	const edits = scene.edits ?? {};
	const W = scene.width;
	const H = scene.height;
	const unit = scene.unit ?? 1;
	const defs: string[] = [];
	const parts: Out[] = [];
	const lights: DrawResult['lights'] = [];
	const ground = scene.ground ? color(scene.ground) : 'none';
	if (ground !== 'none') parts.push({ svg: `<rect width="${W}" height="${H}" fill="${ground}"/>` });
	const floor = scene.floor ?? 0;
	const ctx: StackContext = { all, slots, edits, unit, floor, canvas: [W, H] };
	const layers = await applyEdits(scene, all);
	const value = (l: { slot?: string; text?: string }) => clean((l.slot ? slots[l.slot] : undefined) ?? l.text ?? '');
	const pictured = (index: number) => Boolean(photos[index]) || scene.placeholders === true;

	// 1. Copy: every text, stack, button and heading placed with the real faces.
	const placed = new Map<Layer, Placed[]>();
	const inlines = new Map<Layer, PlacedInline>();
	for (const l of layers) {
		if (l.type === 'text') {
			const v = value(l);
			if (!v) continue;
			const face = faceFor(all, l.face);
			const caps = l.caps ?? l.face === 'label';
			const tracking = l.tracking ?? (l.face === 'label' ? 0.06 : 0);
			const size = l.pinned ? l.size : Math.max(l.size, floor);
			const set = fitText(face, caps ? v.toUpperCase() : v, { ...l, size, leading: l.leading * (size / l.size), min: l.pinned ? size : Math.max(floor, l.min ?? size * 0.75), tracking });
			placed.set(l, [textOf({ id: layerId(l), slot: l.slot, asked: v, face, size: set.size, leading: set.leading, min: l.min ?? l.size * 0.75, tracking, caps, lines: set.lines, x: l.x, top: l.top, w: l.w, align: l.align ?? 'left', color: l.color, opacity: l.opacity, over: l.over ?? [], required: l.required })]);
		} else if (l.type === 'stack') placed.set(l, layoutStack(ctx, l, l.box));
		else if (l.type === 'inline') {
			const v = value(l);
			if (v) inlines.set(l, placeInline(all, l, v, edits[layerId(l)]?.scale));
		} else if (l.type === 'button') {
			const v = value(l);
			if (!v) continue;
			checkGlyphs(all.medium, v, l.slot);
			// The button is as wide as its label needs, away from the side it stands on.
			const bw = Math.max(l.box[2], measure(all.medium, v, l.size, 0) + 2 * padOf(l.box[3]));
			const room = (scene.frame ?? [0, 0, W, H])[2];
			if (bw > room) throw tooLong(l.slot, v, longestPrefix(v, (t) => measure(all.medium, t, l.size, 0) + 2 * padOf(l.box[3]) <= room), 'one line inside the button');
			const bx = l.align === 'right' ? l.box[0] + l.box[2] - bw : l.align === 'center' ? l.box[0] + (l.box[2] - bw) / 2 : l.box[0];
			placed.set(l, [keyOf(ctx, { id: layerId(l), slot: l.slot, value: v, size: l.size, box: [bx, l.box[1], bw, l.box[3]], fill: l.fill, color: l.color, radius: l.radius, over: l.over ?? [], required: l.required })]);
		} else if (l.type === 'search') {
			const v = value(l);
			if (!v) continue;
			const [x, y, w, h] = l.box;
			const u = h / 88;
			// The site's prompt: the words from 32 in, the send key a square at the right.
			const bw = h - 32 * u;
			const set = fitText(all.body, v, { size: l.size, leading: l.size * 1.25, w: w - 32 * u - bw - 16 * u - 24 * u, maxLines: 2, min: Math.max(l.size * 0.75, 16 * unit), slot: l.slot });
			const bh = capHeight(all.body, set.size) + (set.lines.length - 1) * set.leading;
			placed.set(l, [textOf({ id: layerId(l), slot: l.slot, asked: v, face: all.body, size: set.size, leading: set.leading, min: l.size * 0.75, tracking: 0, caps: false, lines: set.lines, x: x + 32 * u, w: w - 32 * u - bw - 40 * u, top: y + (h - bh) / 2, align: 'left', color: 'neutral-11', over: [layerId(l)] })]);
		}
	}

	// 2. What the light and the texture keep clear of: the words, the logo with its clear space, buttons and pictures.
	const pad = scene.clearPadding ?? 12;
	const clear: { x: number; y: number; w: number; h: number }[] = [];
	const keep = (b: Box) => clear.push({ x: b[0] - pad, y: b[1] - pad, w: b[2] + pad * 2, h: b[3] + pad * 2 });
	const words: Box[] = [];
	const solid: Box[] = [];
	for (const l of layers) {
		for (const p of placed.get(l) ?? []) {
			keep(p.box);
			if (p.kind !== 'text') solid.push(p.box);
			else if (!p.over.length) words.push(...p.lines.map((r): Box => [r.x, r.baseline - capHeight(p.face, p.size), r.w, capHeight(p.face, p.size) + descent(p.face, p.size)]));
			if (p.kind === 'key' && !p.over.length) words.push(p.box);
		}
		const t = inlines.get(l);
		if (t) {
			keep(t.box);
			words.push(...t.runs.map((r): Box => [r.x, r.baseline - capHeight(t.face, t.size), r.w, capHeight(t.face, t.size) + descent(t.face, t.size)]));
		}
		if (l.type === 'logo') keep(logoBox(l));
		else if (l.type === 'photo' || l.type === 'split') {
			if (pictured(l.index)) {
				keep(l.type === 'photo' && l.clip ? l.clip : l.box);
				solid.push(l.type === 'photo' && l.clip ? l.clip : l.box);
			}
		} else if (l.type === 'search' && placed.has(l)) {
			keep(l.box);
			solid.push(l.box);
		} else if (l.type === 'rect' && l.fill !== 'none' && (l.radius ?? 0) > 0) keep(l.box);
		else if (l.type === 'panel' && pictured(l.index)) keep(boxOf(l)!);
	}

	// 3. The light, moved as little as it takes to leave the words and the logo's clear space alone.
	const gap = Math.max(12, 10 * unit);
	const keeps: Box[] = words.map((b) => grow(b, gap));
	for (const l of layers) if (l.type === 'logo' && l.tone !== 'auto') keeps.push(grow(logoBox(l), clearOf(l.lockup, logoBox(l)[3]) + gap));
	let lightIndex = 0;
	let margin = 0;
	const finalLights = new Map<Layer, { p: PlacedLight; map: LitMap; moved: Pt; blocked: boolean; box: Box }>();
	for (const l of layers) {
		if (l.type !== 'light') continue;
		const win: Box = l.window ?? [0, 0, W, H];
		const source = l.source ?? scene.light ?? 'brand';
		const base: PlacedLight = { win, b: l.b, shift: l.shift, variant: l.variant, seed: l.b ? seed + (l.seed ?? 0) + lightIndex * 101 : l.seed ?? seed, source };
		lightIndex++;
		const inWin = keeps.filter((k) => hit(k, win));
		let p = base;
		let shiftBy: Pt = [0, 0];
		let blocked = false;
		if (inWin.length && l.b && !l.clipQuad) {
			const found = await clearLight(light, base, inWin, W, H, l.fixed === true);
			p = found.p;
			shiftBy = found.moved;
			blocked = found.blocked;
		}
		// An edit moves the light from where it settled. A window as wide or tall as the canvas stays so: the light moves in it.
		const e = edits[layerId(l)] ?? {};
		let box: Box = l.window ? win : p.b ? [p.b[0], p.b[1], p.b[2] + 2 * (p.shift ?? 34), p.b[3]] : win;
		if (layerId(l) !== 'pictures' && p.b && (e.dx || e.dy || (e.scale !== undefined && e.scale !== 1))) {
			const k = e.scale ?? 1;
			const dx = (e.dx ?? 0) * W;
			const dy = (e.dy ?? 0) * H;
			const about: Pt = l.window ? [win[0] + win[2] / 2, win[1] + win[3] / 2] : [W / 2, H / 2];
			box = moved(box, about, k, dx, dy);
			const abs = moved([win[0] + p.b[0], win[1] + p.b[1], p.b[2], p.b[3]], about, k, dx, dy);
			const w: Box = l.window ? moved(win, about, k, dx, dy) : win;
			if (win[0] <= 0 && win[0] + win[2] >= W) [w[0], w[2]] = [0, W];
			if (win[1] <= 0 && win[1] + win[3] >= H) [w[1], w[3]] = [0, H];
			p = { ...p, win: w, b: [abs[0] - w[0], abs[1] - w[1], abs[2], abs[3]], shift: (p.shift ?? 34) * k };
		}
		finalLights.set(l, { p, map: await lit(light, p), moved: shiftBy, blocked, box });
	}

	// 4. Draw, in order, and report what was drawn.
	const groups = new Map<string, { kind: DrawnLayer['kind']; boxes: Box[]; ink: Rect[]; over: Set<string>; bleeds: boolean; text?: DrawnLayer['text']; logo?: DrawnLayer['logo']; can: DrawnLayer['can'] }>();
	const note = (id: string, kind: DrawnLayer['kind'], box: Box, o: { ink?: Rect[]; over?: string[]; bleeds?: boolean; text?: DrawnLayer['text']; logo?: DrawnLayer['logo']; can?: DrawnLayer['can'] } = {}) => {
		const g = groups.get(id) ?? { kind, boxes: [], ink: [], over: new Set<string>(), bleeds: false, can: o.can ?? {} };
		g.boxes.push(box);
		g.ink.push(...(o.ink ?? [rect(box)]));
		for (const x of o.over ?? []) g.over.add(x);
		g.bleeds ||= o.bleeds ?? false;
		if (o.text) g.text = g.text ? { ...g.text, asked: `${g.text.asked} | ${o.text.asked}`, drawn: `${g.text.drawn} | ${o.text.drawn}`, size: Math.min(g.text.size, o.text.size), ground: [...new Set([...g.text.ground, ...o.text.ground])] } : o.text;
		if (o.logo) g.logo = o.logo;
		groups.set(id, g);
	};
	const marks = (slot?: string) => (!slot ? {} : scene.sampled?.includes(slot) ? { sample: true } : scene.own?.includes(slot) ? { own: true } : {});
	const textNote = (t: PlacedText, anchors?: Anchor[], extra: Partial<DrawnLayer['can']> = {}) => {
		const lo = Math.max(0.5, Math.ceil((t.min / t.size) * 100) / 100);
		note(t.id, 'text', t.box, {
			ink: t.lines.map((l) => rect([l.x, l.baseline - capHeight(t.face, t.size), l.w, capHeight(t.face, t.size) + (t.caps ? 0 : descent(t.face, t.size))])),
			over: [...t.over, ...underneath(t.box)],
			text: { asked: t.asked, drawn: t.lines.map((l) => l.text).join(' '), size: round(t.size), color: color(t.color, '#FFFFFF'), ground: [], ...marks(t.slot) },
			can: { move: true, scale: [Math.min(1, lo), t.size / t.min > 1.02 || t.face === all.display ? 1.6 : 1.4], align: true, hide: !t.required, ...(anchors ? { anchors } : {}), ...extra },
		});
	};
	/** The texture sits under everything by design; the light only where a layer says so (its lit part is its ink). */
	const underneath = (_b: Box): string[] => (layers.some((l) => l.type === 'ascii') ? ['texture'] : []);
	const drawPlaced = (list: Placed[], anchors?: Anchor[]) => {
		for (const p of list) {
			if (p.kind === 'text') {
				textNote(p, anchors);
				parts.push({ svg: textMarkup(p), under: '' });
			} else if (p.kind === 'panel') {
				const [x, y, w, h] = p.box;
				parts.push({ svg: `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(p.radius ?? 0)}" fill="${color(p.fill)}"/>` });
				note(p.id, 'panel', p.box, { over: ['texture', 'light', 'light-2', ...p.over], can: { move: true, hide: false } });
			} else {
				const [x, y, w, h] = p.box;
				// The site's buttons: White primary; any darker fill is its quiet button, a 1px hairline ring inside.
				const fill = color(p.fill ?? 'white');
				const quiet = luma(fill) < 0.5;
				parts.push({ svg: `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(p.radius ?? 8 * unit)}" fill="${fill}"/>${quiet ? `<rect x="${f(x + 0.5)}" y="${f(y + 0.5)}" width="${f(w - 1)}" height="${f(h - 1)}" rx="${f(Math.max(0, (p.radius ?? 8 * unit) - 0.5))}" fill="none" stroke="${color('neutral-5')}" stroke-width="1"/>` : ''}` });
				const t = p.label;
				if (t) parts.push({ svg: textMarkup(t, t.color), under: '' });
				note(p.id, 'key', p.box, { over: [...p.over, ...underneath(p.box)], ...(t ? { text: { asked: t.asked, drawn: t.lines.map((l) => l.text).join(' '), size: round(t.size), color: color(t.color, '#000000'), ground: [color(p.fill ?? 'white')], ...marks(t.slot) } } : {}), can: { move: true, scale: [0.8, 1.5], align: true, hide: !p.required, ...(anchors ? { anchors } : {}) } });
			}
		}
	};
	const STACK_ANCHORS: Anchor[] = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
	for (const l of layers) {
		const id = layerId(l);
		switch (l.type) {
			case 'art': {
				const a0 = artOf(l.file);
				// A turned piece is the art a quarter turn clockwise: its own width becomes its height, and its ink turns with it.
				const turn = l.turn === true;
				const a = turn ? { ...a0, width: a0.height, height: a0.width, ink: a0.ink.map(([px, py, pw, ph]) => [a0.height - py - ph, px, ph, pw] as [number, number, number, number]) } : a0;
				const [x, y, w, h] = l.box;
				// Cover: the art keeps its proportions and is cropped to the box.
				const k = l.fit === 'cover' || turn ? Math.max(w / a.width, h / a.height) : 0;
				const iw = k ? a.width * k : w;
				const ih = k ? a.height * k : h;
				const [fx0, fy0] = l.at ?? [0.5, 0.5];
				// The crop centers on `at` (flipped with the art), kept inside the art.
				const ax = l.flip?.includes('x') ? 1 - fx0 : fx0;
				const ay = l.flip?.includes('y') ? 1 - fy0 : fy0;
				const ix = k ? Math.min(x, Math.max(x + w - iw, x + w / 2 - ax * iw)) : x;
				const iy = k ? Math.min(y, Math.max(y + h - ih, y + h / 2 - ay * ih)) : y;
				const fx = l.flip?.includes('x') ?? false;
				const fy = l.flip?.includes('y') ?? false;
				const tf = fx || fy ? ` transform="translate(${f(fx ? 2 * ix + iw : 0)} ${f(fy ? 2 * iy + ih : 0)}) scale(${fx ? -1 : 1} ${fy ? -1 : 1})"` : '';
				const image = turn
					? `<image href="${a.data}" width="${a0.width}" height="${a0.height}" preserveAspectRatio="none" transform="translate(${f(ix + a0.height * k)} ${f(iy)}) rotate(90) scale(${f(k)})"/>`
					: `<image href="${a.data}" x="${f(ix)}" y="${f(iy)}" width="${f(iw)}" height="${f(ih)}" preserveAspectRatio="none"/>`;
				const cid = nextId('art');
				const clipped = k || l.clipQuad;
				const clip = clipped ? ` clip-path="url(#${cid})"` : '';
				if (l.clipQuad) defs.push(`<clipPath id="${cid}"><polygon points="${l.clipQuad.map((q) => `${f(q[0])},${f(q[1])}`).join(' ')}"/></clipPath>`);
				else if (k) defs.push(`<clipPath id="${cid}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/></clipPath>`);
				const op = l.opacity !== undefined ? ` opacity="${l.opacity}"` : '';
				parts.push({ svg: `<g${clip}${op} style="mix-blend-mode:screen"><g${tf}>${image}</g></g>` });
				const sx = iw / a.width;
				const sy = ih / a.height;
				const ink = a.ink
					.map(([px, py, pw, ph]) => ({ x: fx ? ix + iw - (px + pw) * sx : ix + px * sx, y: fy ? iy + ih - (py + ph) * sy : iy + py * sy, w: pw * sx, h: ph * sy }))
					.map((r) => (clipped ? clipRect(r, [x, y, w, h]) : r))
					.filter((r): r is Rect => Boolean(r) && r!.x < W && r!.y < H && r!.x + r!.w > 0 && r!.y + r!.h > 0);
				note(id, 'art', l.box, { ink, bleeds: true, over: ['texture', ...(l.over ?? [])], can: { hide: true } });
				break;
			}
			case 'rect': {
				const [x, y, w, h] = l.box;
				const stroke = l.stroke ? ` stroke="${color(l.stroke)}" stroke-width="1"` : '';
				const op = l.opacity !== undefined ? ` opacity="${l.opacity}"` : '';
				const inset = l.stroke ? 0.5 : 0;
				parts.push({ svg: `<rect x="${f(x + inset)}" y="${f(y + inset)}" width="${f(w - inset * 2)}" height="${f(h - inset * 2)}" rx="${f(l.radius ?? 0)}" fill="${color(l.fill)}"${stroke}${op}/>` });
				note(id, 'panel', l.box, { over: ['texture', 'light', 'light-2', ...(l.over ?? [])], bleeds: l.bleeds, can: { move: true, hide: !l.required } });
				break;
			}
			case 'text':
			case 'button':
				drawPlaced(placed.get(l) ?? [], l.corner ? CORNERS : undefined);
				break;
			case 'stack':
				drawPlaced(placed.get(l) ?? [], STACK_ANCHORS);
				break;
			case 'inline': {
				const t = inlines.get(l);
				if (!t) break;
				for (const p of t.pictures) if (pictured(p.index)) parts.push({ svg: photoSvg(p.box, photos[p.index], 0) });
				if (t.pictures.some((p) => pictured(p.index))) note('pictures', 'picture', union(t.pictures.map((p) => p.box)), { ink: t.pictures.map((p) => rect(p.box)), over: ['texture', 'light', 'light-2'], can: {} });
				const pt: PlacedText = { kind: 'text', id, slot: l.slot, asked: value(l), face: t.face, size: t.size, leading: l.leading * (t.size / l.size), min: l.size * 0.4, tracking: 0, caps: false, lines: t.runs, box: t.box, color: l.color, over: ['pictures'], pinned: false, required: l.required };
				textNote(pt, undefined, { align: false });
				parts.push({ svg: textMarkup(pt), under: '' });
				break;
			}
			case 'logo': {
				const b = logoBox(l);
				let tone: 'black' | 'white' = l.color === 'black' ? 'black' : 'white';
				if (l.tone === 'auto') {
					// Black on the pale light, White on Black: whichever the brand's own pair reads better there.
					let lo = 1;
					let hi = 0;
					for (const fl of finalLights.values()) {
						if (!hit(b, fl.p.win)) continue;
						const [a, z] = range(fl.map, rect(b));
						lo = Math.min(lo, a);
						hi = Math.max(hi, z);
					}
					if (finalLights.size && (lo + 0.05) / 0.05 > 1.05 / (hi + 0.05)) tone = 'black';
				}
				const mark = logoSvg(l.lockup, tone, l.box, l.align);
				parts.push({ svg: l.opacity !== undefined && l.opacity < 1 ? `<g opacity="${f(l.opacity)}">${mark}</g>` : mark, under: '' });
				const spec = brand().logo;
				const min = (spec?.minHeight[l.lockup] ?? 0) * (scene.density ?? 1);
				const lo = Math.max(0.5, Math.ceil((min / b[3]) * 100) / 100);
				note(id, 'logo', b, { over: [...underneath(b), ...(l.tone === 'auto' ? ['light', 'light-2'] : []), ...(l.over ?? [])], logo: { clear: round(clearOf(l.lockup, b[3])), min }, can: { move: true, scale: [Math.min(1, lo), l.corner ? 1.8 : 1.4], hide: !l.required, ...(l.corner ? { anchors: scene.logoAnchors ? CORNERS.filter((a) => scene.logoAnchors!.includes(a)).sort((x, y) => (x === l.corner ? -1 : y === l.corner ? 1 : 0)) : [l.corner, ...CORNERS.filter((a) => a !== l.corner)] } : {}) } });
				break;
			}
			case 'light': {
				const fl = finalLights.get(l)!;
				const g = lightOf(light, fl.p);
				const lpad = Math.ceil(g.offset * 2 + g.blur * 4) + 24;
				margin = Math.max(margin, lpad);
				const i = lights.length;
				const lid = `l${i}`;
				const win = fl.p.win;
				// The file blends with CSS plus-lighter, as the brand does; the raster adds the layers in a filter.
				const svg = light.lightGeometrySvg(g, { ground: false, blend: 'css', id: lid }).replace(/<svg /, '<svg overflow="hidden" ');
				lights.push({ svg: light.lightGeometrySvg(g, { ground: false, blend: 'filter', id: lid }), win, pad: lpad });
				const wrap = (inner: string) => {
					if (!l.clipQuad) return inner;
					const cid = `lq${i}`;
					return `<clipPath id="${cid}"><polygon points="${l.clipQuad.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/></clipPath><g clip-path="url(#${cid})">${inner}</g>`;
				};
				parts.push({ svg: wrap(`<g transform="translate(${f(win[0])} ${f(win[1])})" style="isolation:isolate">${svg}</g>`), raster: wrap(`\u0000L${i}\u0000`) });
				// Its ink is where it is lit, less what opaque layers cover on purpose.
				if (id === 'pictures') {
					note(id, 'picture', l.clipQuad ? boxOf({ type: 'panel', quad: l.clipQuad, index: 0 })! : win, { over: ['texture', 'light', 'light-2'], bleeds: l.bleeds });
					break;
				}
				const runs = litRuns(fl.map, [Math.max(0, win[0]), Math.max(0, win[1]), Math.min(W, win[0] + win[2]) - Math.max(0, win[0]), Math.min(H, win[1] + win[3]) - Math.max(0, win[1])], 8 * unit);
				if (runs.length) note(id, 'art', fl.box, { ink: runs, bleeds: l.bleeds ?? true, over: ['texture', ...(l.over ?? [])], can: fl.p.b ? { move: true, scale: [0.6, 1.8], hide: true } : { hide: true } });
				break;
			}
			case 'ascii': {
				const [x, y, w, h] = l.box ?? [0, 0, W, H];
				const tile = l.tile ?? 1080 * unit;
				const [cx, cy] = ASCII_CROPS[Math.abs(seed + (l.seed ?? 0)) % ASCII_CROPS.length]!;
				const [ax, ay] = ASCII_AT[l.from ?? 'centre']!;
				const strength = l.strength === 'hero' ? 1 : l.strength === 'faint' ? Number(tokens()['--ds-ascii-faint']?.light ?? 0.32) : Number(tokens()['--ds-ascii-quiet']?.light ?? 0.5);
				const core = l.core ?? (l.strength === 'hero' ? 0.56 : 0.24);
				const pid = nextId('ascii');
				// The fade is the site's: radial, farthest side, opaque to `core`, gone at the edge.
				const rx = Math.max(ax, 1 - ax) * w;
				const ry = Math.max(ay, 1 - ay) * h;
				const dark = ground !== 'none' && luma(ground) > 0.5;
				defs.push(`<pattern id="${pid}p" patternUnits="userSpaceOnUse" x="${f(x + cx * tile)}" y="${f(y + cy * tile)}" width="${f(tile)}" height="${f(tile)}"><image href="${asciiArt()}" width="${f(tile)}" height="${f(tile)}"/></pattern>`);
				defs.push(`<radialGradient id="${pid}g" gradientUnits="userSpaceOnUse" cx="${f(x + ax * w)}" cy="${f(y + ay * h)}" r="${f(Math.max(rx, ry))}" gradientTransform="translate(${f(x + ax * w)} ${f(y + ay * h)}) scale(${f(rx / Math.max(rx, ry))} ${f(ry / Math.max(rx, ry))}) translate(${f(-(x + ax * w))} ${f(-(y + ay * h))})"><stop offset="${core}" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>`);
				defs.push(`<mask id="${pid}m" maskUnits="userSpaceOnUse" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#${pid}g)"/></mask>`);
				// On a White ground the characters are Black.
				if (dark) defs.push(`<filter id="${pid}f" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>`);
				parts.push({ svg: `<g mask="url(#${pid}m)" opacity="${strength}"${dark ? ` filter="url(#${pid}f)"` : ''}><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#${pid}p)"/></g>` });
				note(id, 'art', [x, y, w, h], { ink: [], bleeds: true, can: { hide: true } });
				break;
			}
			case 'photo':
			case 'panel':
			case 'split': {
				if (!pictured(l.index)) break;
				const b = boxOf(l)!;
				parts.push({ svg: l.type === 'photo' ? photoSvg(l.box, photos[l.index], l.radius ?? 0, l.clip) : l.type === 'panel' ? panelSvg(l.quad, photos[l.index], defs) : splitSvg(l.box, photos[l.index], l.shift, l.bleed ?? 0) });
				note(id, 'picture', b, { over: ['texture', 'light', 'light-2', ...(l.over ?? [])], bleeds: l.bleeds, can: { move: true, scale: [0.6, 1.4], hide: !l.required } });
				break;
			}
			case 'search': {
				const t = placed.get(l);
				if (!t) break;
				const [x, y, w, h] = l.box;
				const u = h / 88;
				const inset = 16 * u;
				const bw = h - inset * 2;
				const bx = x + w - inset - bw;
				const by = y + inset;
				// The site's hero prompt (Hero.module.css): the raised fill, a strong hairline ring inside, a 20px corner, and
				// the White send key with its arrow (Lucide arrow-up at the brand's stroke).
				const k = (bw * 0.5) / 24;
				const arrow = `<path d="M5 12l7-7 7 7M12 19V5" transform="translate(${f(bx + bw * 0.25)} ${f(by + bw * 0.25)}) scale(${f(k)})" fill="none" stroke="${color('black')}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
				parts.push({ svg: `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(20 * u)}" fill="${color('neutral-3')}"/><rect x="${f(x + 0.5)}" y="${f(y + 0.5)}" width="${f(w - 1)}" height="${f(h - 1)}" rx="${f(20 * u - 0.5)}" fill="none" stroke="${color('neutral-7')}" stroke-width="1"/><rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bw)}" rx="${f(8 * u)}" fill="${color('white')}"/>${arrow}` });
				const prompt = t[0] as PlacedText;
				parts.push({ svg: textMarkup(prompt), under: '' });
				note(id, 'panel', l.box, { over: ['texture', 'light', 'light-2'], text: { asked: prompt.asked, drawn: prompt.lines.map((r) => r.text).join(' '), size: round(prompt.size), color: color('neutral-11'), ground: [color('neutral-3')], ...marks(l.slot) }, can: { move: true, scale: [0.8, 1.2], hide: true } });
				break;
			}
			case 'path': {
				const dash = l.dash ? ` stroke-dasharray="${l.dash}"` : '';
				const pid = l.id ? ` id="${esc(l.id)}"` : '';
				// A cut line is for the cutter, not the printer: it stays in the file and out of the picture.
				parts.push({ svg: `<path${pid} d="${l.d}" fill="${l.fill ? color(l.fill) : 'none'}"${l.stroke ? ` stroke="${color(l.stroke)}" stroke-width="${l.strokeWidth ?? 1}"` : ''}${dash}/>`, ...(l.svgOnly ? { raster: '' } : {}) });
				break;
			}
		}
	}

	const fontCss = opts.embedFonts === false ? '' : [all.display, all.body, all.medium, all.code]
		.map((face) => `@font-face{font-family:"${face.family}";font-weight:${face.weight};font-style:normal;src:url("data:font/woff2;base64,${face.woff2.toString('base64')}") format("woff2");}`)
		.join('');
	const head = `<defs>${fontCss ? `<style type="text/css"><![CDATA[${fontCss}]]></style>` : ''}${defs.join('')}</defs>`;
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${head}
${parts.map((p) => p.svg).join('\n')}
</svg>
`;
	const m = margin;
	const wrapRaster = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W + 2 * m}" height="${H + 2 * m}" viewBox="${-m} ${-m} ${W + 2 * m} ${H + 2 * m}">${head}${body}</svg>`;
	const drawn: DrawnLayer[] = [...groups].map(([id, g]) => ({
		id,
		kind: g.kind,
		box: rect(union(g.boxes)),
		...(g.ink.length || id === 'texture' ? { ink: g.ink } : {}),
		...(g.bleeds ? { bleeds: true } : {}),
		...(g.over.size ? { over: [...g.over] } : {}),
		...(g.text ? { text: g.text } : {}),
		...(g.logo ? { logo: g.logo } : {}),
		can: g.can,
	}));
	return { svg, raster: wrapRaster(parts.map((p) => p.raster ?? p.svg).join('\n')), under: wrapRaster(parts.map((p) => p.under ?? p.raster ?? p.svg).join('\n')), margin: m, width: W, height: H, ground, lights, layers: drawn };
}

/** The light moved as little as possible so nothing lit is under the words or inside the logo's clear space. A light
 * generated from a seed is redrawn when no move is enough; the brand's own stays its own. */
async function clearLight(light: LightModule, base: PlacedLight, keeps: Box[], W: number, H: number, fixed: boolean): Promise<{ p: PlacedLight; moved: Pt; blocked: boolean }> {
	const rects = keeps.map((k) => ({ x: k[0], y: k[1], w: k[2], h: k[3] }));
	const tries = base.source === 'generated' ? 6 : 1;
	// The brand's light also settles a little larger or smaller, about its window's middle, before it gives up.
	const sizes = fixed ? [1] : [1, 1.12, 0.92, 1.3, 1.6, 2];
	const zoomed = (p: PlacedLight, k: number): PlacedLight => (k === 1 ? p : { ...p, b: moved(p.b!, [p.win[2] / 2, p.win[3] / 2], k, 0, 0), shift: (p.shift ?? 34) * k });
	for (const k of sizes) for (let t = 0; t < tries; t++) {
		const p = zoomed(t ? { ...base, seed: base.seed + t * 1009 } : base, k);
		const map = await lit(light, p, 0.3);
		if (k === 1 && !rects.some((r) => touches(map, r, 0, 0, p.win))) return { p, moved: [0, 0], blocked: false };
		if (fixed) continue;
		const [, , w, h] = p.win;
		const steps: { dx: number; dy: number; d: number }[] = [];
		for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) steps.push({ dx: i * 0.02 * w, dy: j * 0.02 * h, d: Math.hypot(i * 0.02 * w, j * 0.02 * h) });
		steps.sort((a, b) => a.d - b.d || a.dx - b.dx || a.dy - b.dy);
		const total = shown(map, p.win, 0, 0);
		// Where the heat map covered the window it still does: its own edge never shows.
		const gaps = (b: Box, dx: number, dy: number) => [b[0] + dx, w - (b[0] + b[2] + dx), b[1] + dy, h - (b[1] + b[3] + dy)];
		const was = gaps(base.b!, 0, 0).map((g) => Math.max(0.5, g));
		for (const s of steps) {
			if (gaps(p.b!, s.dx, s.dy).some((g, i) => g > was[i]!)) continue;
			if (rects.some((r) => touches(map, r, s.dx, s.dy, p.win))) continue;
			// It still has to be a light: at least a third of what it showed.
			if (shown(map, p.win, s.dx, s.dy) < total * (k === 1 ? 0.35 : 0.12)) continue;
			return { p: { ...p, b: [p.b![0] + s.dx, p.b![1] + s.dy, p.b![2], p.b![3]] }, moved: [s.dx, s.dy], blocked: false };
		}
	}
	void W;
	void H;
	return { p: base, moved: [0, 0], blocked: true };
}

/** How much of a light shows in its window. */
function shown(map: LitMap, win: Box, dx: number, dy: number): number {
	let n = 0;
	for (let y = win[1] + map.cell; y < win[1] + win[3]; y += map.cell * 3) {
		for (let x = win[0] + map.cell; x < win[0] + win[2]; x += map.cell * 3) {
			const i = Math.floor((x - dx - map.x0) / map.cell);
			const j = Math.floor((y - dy - map.y0) / map.cell);
			if (i >= 0 && j >= 0 && i < map.cols && j < map.rows && map.lit[j * map.cols + i]) n++;
		}
	}
	return n;
}

let palette: string[] | undefined;
/** Every color the brand names, as hex: what words may be drawn in and on. */
export function brandColors(): string[] {
	palette ??= [...new Set(Object.entries(tokens()).filter(([k, t]) => k.startsWith('--ds-color-') && /^#[0-9a-f]{6}$/i.test(t.light?.trim() ?? '')).map(([, t]) => t.light!.trim().toUpperCase()))];
	return palette;
}
function nearestColor(hex: string): string {
	const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
	const a = rgb(hex);
	let best = '#000000';
	let d = Infinity;
	for (const c of brandColors()) {
		const b = rgb(c);
		const e = (a[0]! - b[0]!) ** 2 + (a[1]! - b[1]!) ** 2 + (a[2]! - b[2]!) ** 2;
		if (e < d) [best, d] = [c, e];
	}
	return best;
}

/** The colors under every text, measured from the drawing without its words: the darkest and the lightest. */
export async function groundsOf(d: DrawResult): Promise<DrawnLayer[]> {
	const scale = Math.min(1, 900 / Math.max(d.width, d.height));
	const need = d.layers.some((l) => l.text && !l.text.ground.length);
	if (!need) return d.layers;
	const { pixels, width, height } = await rasterizeScene(d, { scale, under: true });
	const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
	return d.layers.map((l) => {
		if (!l.text || l.text.ground.length) return l;
		const px: { lum: number; hex: string }[] = [];
		for (const r of l.ink ?? [l.box]) {
			const x0 = Math.max(0, Math.floor(r.x * scale));
			const x1 = Math.min(width - 1, Math.ceil((r.x + r.w) * scale));
			const y0 = Math.max(0, Math.floor(r.y * scale));
			const y1 = Math.min(height - 1, Math.ceil((r.y + r.h) * scale));
			for (let y = y0; y <= y1; y++)
				for (let x = x0; x <= x1; x++) {
					const k = (y * width + x) * 4;
					if (pixels[k + 3]! < 128) continue;
					const [R, G, B] = [pixels[k]!, pixels[k + 1]!, pixels[k + 2]!];
					px.push({ lum: 0.2126 * lin(R / 255) + 0.7152 * lin(G / 255) + 0.0722 * lin(B / 255), hex: `#${[R, G, B].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}` });
				}
		}
		if (!px.length) return l;
		px.sort((a, b) => a.lum - b.lum);
		// The nearest brand color to the darkest and the lightest: a blurred edge between two tokens is still theirs.
		const at = (q: number) => nearestColor(px[Math.min(px.length - 1, Math.floor(q * px.length))]!.hex);
		return { ...l, text: { ...l.text, ground: [...new Set([at(0.01), at(0.99)])] } };
	});
}

/** A drawn scene as PNG: rasterized in its margin at `scale`, cropped to the frame, straight alpha. */
export async function rasterizeScene(d: DrawResult, opts: { scale?: number; dpi?: number; under?: boolean } = {}): Promise<{ png: Buffer; pixels: Buffer; width: number; height: number }> {
	const scale = opts.scale ?? 1;
	let raster = opts.under ? d.under : d.raster;
	for (const [i, l] of d.lights.entries()) {
		// The light alone, inside a margin wider than its filter, cropped to its window.
		const [, , w, h] = l.win;
		const doc = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w + 2 * l.pad}" height="${h + 2 * l.pad}" viewBox="${-l.pad} ${-l.pad} ${w + 2 * l.pad} ${h + 2 * l.pad}">${l.svg}</svg>`;
		const lr = await rasterizeSvg(doc, { scale });
		const p = Math.round(l.pad * scale);
		const lw = Math.max(1, Math.round(w * scale));
		const lh = Math.max(1, Math.round(h * scale));
		const png = encodePng(cropStraight(lr.pixels, lr.width, p, p, Math.min(lw, lr.width - p), Math.min(lh, lr.height - p)), Math.min(lw, lr.width - p), Math.min(lh, lr.height - p), 4);
		raster = raster.replace(`\u0000L${i}\u0000`, `<image href="data:image/png;base64,${png.toString('base64')}" x="${f(l.win[0])}" y="${f(l.win[1])}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="none"/>`);
	}
	const r = await rasterizeSvg(raster, { scale, background: d.ground });
	const m = Math.round(d.margin * scale);
	const w = Math.round(d.width * scale);
	const h = Math.round(d.height * scale);
	const pixels = cropStraight(r.pixels, r.width, m, m, Math.min(w, r.width - m), Math.min(h, r.height - m));
	return { png: encodePng(pixels, w, h, 4, opts.dpi), pixels, width: w, height: h };
}

/** Rasterizes an SVG with the vendored faces only. `scale` multiplies the pixel size (print files at 300 dpi). */
export async function rasterizeSvg(svg: string, opts: { scale?: number; background?: string } = {}): Promise<{ png: Buffer; pixels: Buffer; width: number; height: number }> {
	const all = await allFaces();
	const resvg = new Resvg(svg, {
		background: opts.background && opts.background !== 'none' ? opts.background : undefined,
		fitTo: opts.scale && opts.scale !== 1 ? { mode: 'zoom', value: opts.scale } : { mode: 'original' },
		textRendering: 2,
		font: { loadSystemFonts: false, fontFiles: [all.display.ttfPath, all.body.ttfPath, all.medium.ttfPath, all.code.ttfPath], defaultFontFamily: all.body.family },
	});
	const r = resvg.render();
	return { png: Buffer.from(r.asPng()), pixels: Buffer.from(r.pixels), width: r.width, height: r.height };
}

export function f(n: number): string {
	const r = Math.round(n * 100) / 100;
	return Object.is(r, -0) ? '0' : String(r);
}

export function esc(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
