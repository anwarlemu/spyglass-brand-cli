import { createRequire } from 'node:module';
import type { BlockInfo, DesignDoc, DesignState, DrawnLayer, Rect } from '../design/types.js';
import { blockRects, gridOf } from '../design/index.js';
import { drawScene, groundsOf, logoBox, type Box, type DrawResult, type Layer, type Photo, type Pt, type StackItem } from './scene.js';
import { findTemplate, sceneFor } from './templates.js';
import { zonesOf } from './sizes.js';
import { faces } from '../image/fonts.js';
import { blockHeight, wrap } from '../image/text.js';

// Open composition: the brand's blocks on a grid of the canvas, drawn by the same scene engine as the templates (the
// same faces, light, texture, buttons and checks). Every block is built from what the templates already draw, at the
// 1080 canvas's sizes times the canvas unit; nothing here is a new value. A light or a picture may carry the exact
// window a template gives it (`geometry`), which is how every template is recreated as blocks (recipeFor).

const require = createRequire(import.meta.url);

/** The approved grounds and the type that stands on each (the logo pages: White on Black, Blue, Red and Magenta;
 * Black on White, Yellow and Green). */
export const COMPOSE_THEMES: Record<string, { ground: string; fg: string; card: string; soft: string }> = {
	black: { ground: 'black', fg: 'white', card: 'neutral-4', soft: 'neutral-11' },
	white: { ground: 'white', fg: 'black', card: 'neutral-14', soft: 'neutral-5' },
	blue: { ground: 'blue', fg: 'white', card: 'blue-6', soft: 'white' },
	red: { ground: 'red', fg: 'white', card: 'red-6', soft: 'white' },
	magenta: { ground: 'magenta', fg: 'white', card: 'magenta-6', soft: 'white' },
	yellow: { ground: 'yellow', fg: 'black', card: 'yellow-9', soft: 'black' },
	green: { ground: 'green', fg: 'black', card: 'green-9', soft: 'black' },
};

const LOCKUPS = ['horizontal', 'vertical', 'mark', 'wordmark', 'horizontal-3d', 'vertical-3d', 'mark-3d'];
const ALIGN = ['left', 'center', 'right'];
const VALIGN = ['top', 'center', 'bottom'];

export const BLOCKS: BlockInfo[] = [
	{ type: 'headline', names: ['title', 'heading', 'head'], kind: 'text', description: 'Funnel Display at the page head\'s weight, stepping down to fit its cells.', copy: [{ id: 'text', required: true }], options: [{ id: 'size', range: [16, 400] }, { id: 'align', values: ALIGN }, { id: 'valign', values: VALIGN }], span: { cols: 10, rows: 3 }, place: 'left', sample: { text: 'Every creative in one place.' } },
	{ type: 'body', names: ['text', 'paragraph', 'copy', 'line'], kind: 'text', description: 'DM Sans body copy.', copy: [{ id: 'text', required: true }], options: [{ id: 'size', range: [10, 120] }, { id: 'align', values: ALIGN }, { id: 'valign', values: VALIGN }], span: { cols: 8, rows: 2 }, place: 'left', sample: { text: 'Search the ads and posts every brand puts out.' } },
	{ type: 'eyebrow', names: ['label', 'kicker', 'overline'], kind: 'text', description: 'A label in DM Sans Medium capitals with 6% tracking.', copy: [{ id: 'text', required: true }], options: [{ id: 'align', values: ALIGN }], span: { cols: 6, rows: 1 }, place: 'top-left', sample: { text: 'New' } },
	{ type: 'badge', names: ['tag', 'chip', 'pill'], kind: 'text', description: 'A short word on the inset fill with the small corner (the site\'s badge).', copy: [{ id: 'text', required: true }], options: [{ id: 'align', values: ALIGN }], span: { cols: 4, rows: 1 }, place: 'top-left', sample: { text: 'Coming soon' } },
	{ type: 'logo', names: ['lockup', 'mark', 'logomark', 'wordmark'], kind: 'logo', description: 'An approved lockup, Black or White by the ground.', copy: [], options: [{ id: 'lockup', values: LOCKUPS }, { id: 'align', values: ALIGN }, { id: 'tone', values: ['auto', 'white', 'black'] }], span: { cols: 4, rows: 1 }, place: 'top-left' },
	{ type: 'picture', names: ['image', 'photo', 'creative', 'screenshot'], kind: 'picture', description: 'A picture on Black: plain, with the corner, split by the light, or in the browser frame. Without one it is the card fill (to look at a layout).', copy: [], image: {}, options: [{ id: 'treatment', values: ['plain', 'rounded', 'split', 'frame'] }, { id: 'geometry' }], span: { cols: 6, rows: 6 }, place: 'right', under: true },
	{ type: 'light', names: ['glow', 'pattern', 'band'], kind: 'art', description: 'The brand light from its heat map, in from an edge or a corner; it moves to keep words clear.', copy: [], options: [{ id: 'variant', values: ['band', 'field', 'corner', 'strip-left', 'strip-right', 'tile', 'close-up', 'curved-strip'] }, { id: 'seed', range: [0, 9999] }, { id: 'geometry' }], span: { cols: 12, rows: 4 }, place: 'bottom', under: true },
	{ type: 'ascii', names: ['texture', 'field'], kind: 'art', description: 'The ASCII texture, kept clear of words, the logo and pictures.', copy: [], options: [{ id: 'density', range: [0.1, 1] }], span: { cols: 12, rows: 12 }, place: 'center', under: true },
	{ type: 'card', names: ['panel', 'plan', 'box'], kind: 'panel', description: 'A card on the ground: a title, a line, a list and a button, each optional.', copy: [{ id: 'title' }, { id: 'text' }, { id: 'items' }, { id: 'cta' }], options: [{ id: 'align', values: ALIGN }], span: { cols: 6, rows: 6 }, place: 'center', sample: { title: 'Creator', text: '$20 a month.', items: 'Every network|Unlimited boards', cta: 'Start free' } },
	{ type: 'stat', names: ['number', 'figure', 'metric'], kind: 'text', description: 'A figure in Funnel Display over a line of DM Sans.', copy: [{ id: 'value', required: true }, { id: 'label' }], options: [{ id: 'align', values: ALIGN }], span: { cols: 4, rows: 3 }, place: 'center', sample: { value: '42%', label: 'more ads tracked' } },
	{ type: 'quote', names: ['testimonial', 'review'], kind: 'text', description: 'A quote in Funnel Display, the name and role under it (Acme, never a real person).', copy: [{ id: 'text', required: true }, { id: 'name' }, { id: 'role' }], options: [{ id: 'align', values: ALIGN }], span: { cols: 10, rows: 5 }, place: 'center', sample: { text: 'We see every launch the day it ships.', name: 'Alex Kim', role: 'Head of growth, Acme' } },
	{ type: 'list', names: ['bullets', 'points', 'features'], kind: 'text', description: 'Lines of DM Sans, one per item (separate them with |).', copy: [{ id: 'items', required: true }], options: [{ id: 'align', values: ALIGN }], span: { cols: 6, rows: 4 }, place: 'left', sample: { items: 'Every network|Daily updates|Shared boards' } },
	{ type: 'button', names: ['cta', 'action'], kind: 'key', description: 'The one White button with a DM Sans Medium label.', copy: [{ id: 'text', required: true }], options: [{ id: 'align', values: ALIGN }, { id: 'valign', values: VALIGN }], span: { cols: 4, rows: 1 }, place: 'bottom-left', sample: { text: 'Start free' } },
	{ type: 'search', names: ['search-bar', 'prompt', 'field'], kind: 'panel', description: 'The search bar: a Black field with the prompt and a White Search button.', copy: [{ id: 'text', required: true }], span: { cols: 12, rows: 1 }, place: 'center', sample: { text: 'Longest-running ads in running shoes' } },
	{ type: 'code', names: ['snippet', 'terminal'], kind: 'panel', description: 'Code in the system mono on the code fill.', copy: [{ id: 'text', required: true }], span: { cols: 8, rows: 3 }, place: 'center', sample: { text: 'npx acme search "running shoes"' } },
	{ type: 'chart', names: ['graph', 'bars', 'donut'], kind: 'art', description: 'Bars, a line or a donut from your numbers ("Mon 12, Tue 18"), in White and the neutral steps.', copy: [{ id: 'data', required: true }], options: [{ id: 'type', values: ['bar', 'line', 'donut'] }], span: { cols: 6, rows: 4 }, place: 'right', sample: { data: 'Mon 12, Tue 18, Wed 30, Thu 26' } },
	{ type: 'table', names: ['grid-table', 'comparison'], kind: 'text', description: 'Rows of cells (cells split by |, rows by a new line), the first row as the head.', copy: [{ id: 'rows', required: true }], span: { cols: 10, rows: 4 }, place: 'center', sample: { rows: 'Plan|Price\nFree|$0\nCreator|$20' } },
	{ type: 'divider', names: ['rule', 'hairline', 'line-break'], kind: 'art', description: 'A hairline across its cells.', copy: [], span: { cols: 12, rows: 1 }, place: 'center' },
	{ type: 'icon', names: ['glyph', 'symbol'], kind: 'art', description: 'A Lucide icon (the library\'s set) at a 1.5 stroke.', copy: [], options: [{ id: 'name' }], span: { cols: 1, rows: 1 }, place: 'top-left' },
];

type Theme = (typeof COMPOSE_THEMES)[string];
const themeOf = (doc: Pick<DesignDoc, 'theme'>): Theme => COMPOSE_THEMES[doc.theme ?? 'black'] ?? COMPOSE_THEMES.black!;
const box = (r: Rect): Box => [r.x, r.y, r.w, r.h];
const opt = (doc: DesignDoc, id: string, key: string) => doc.options[`${id}.${key}`];
const str = (v: unknown, fallback: string) => (typeof v === 'string' && v ? v : fallback);
const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() && !Number.isNaN(Number(v)) ? Number(v) : fallback);

/** A light or picture's exact window, as a template places it. */
type Geometry = { W0?: number; H0?: number; window?: Box; b?: Box; shift?: number; variant?: string; source?: 'brand' | 'generated'; fixed?: boolean; box?: Box; quad?: [Pt, Pt, Pt, Pt]; radius?: number; split?: number };
const geometryOf = (doc: DesignDoc, id: string): Geometry | undefined => {
	const v = opt(doc, id, 'geometry');
	if (typeof v !== 'string' || !v.trim()) return undefined;
	let g: Geometry;
	try {
		g = JSON.parse(v) as Geometry;
	} catch {
		throw new Error(`${id}.geometry is not a window (it is JSON a template writes).`);
	}
	// Written for one canvas, drawn on this one: boxes follow the canvas, the light keeps its shape.
	const sx = g.W0 ? doc.size.width / g.W0 : 1;
	const sy = g.H0 ? doc.size.height / g.H0 : 1;
	const k = Math.max(sx, sy);
	const at = (b?: Box): Box | undefined => (b ? [b[0] * sx, b[1] * sy, b[2] * sx, b[3] * sy] : undefined);
	return { ...g, window: at(g.window), box: at(g.box), b: g.b ? [g.b[0] * sx - (g.b[2] * (k - sx)) / 2, g.b[1] * sy - (g.b[3] * (k - sy)) / 2, g.b[2] * k, g.b[3] * k] : undefined, shift: g.shift !== undefined ? g.shift * k : undefined, quad: g.quad?.map((p) => [p[0] * sx, p[1] * sy]) as Geometry['quad'], split: g.split !== undefined ? g.split * k : undefined };
};

/** "Mon 12, Tue 18" as labels and numbers. */
function dataOf(text: string): { label: string; value: number; raw: string }[] {
	return text.split(/[,\n]/).map((p) => p.trim()).filter(Boolean).map((p) => {
		const m = /^(.*?)\s*(-?\d+(?:\.\d+)?)\s*%?$/.exec(p);
		if (!m) throw new Error(`The chart takes a label and a number for each point ("Mon 12, Tue 18"), not "${p}".`);
		return { label: m[1]!.trim(), value: Number(m[2]), raw: p };
	});
}

/** A Lucide icon's elements as one path, scaled from its 24 box into a square. */
function iconPath(name: string, x: number, y: number, s: number): string {
	const lucide = require('lucide') as { icons: Record<string, [string, Record<string, string>][]> };
	const key = name.replace(/(^|-)(\w)/g, (_, _d, c: string) => c.toUpperCase());
	const node = lucide.icons[key];
	if (!node) throw new Error(`There is no Lucide icon "${name}" (names as on lucide.dev, like search, arrow-right).`);
	const k = s / 24;
	const P = (px: number, py: number) => `${(x + px * k).toFixed(2)} ${(y + py * k).toFixed(2)}`;
	const n = (v?: string) => Number(v ?? 0);
	const out: string[] = [];
	for (const [tag, a] of node) {
		if (tag === 'path') out.push(scalePath(a.d!, x, y, k));
		else if (tag === 'circle' || tag === 'ellipse') {
			const rx = n(a.r ?? a.rx) * k;
			const ry = n(a.r ?? a.ry) * k;
			const cx = x + n(a.cx) * k;
			const cy = y + n(a.cy) * k;
			out.push(`M${(cx - rx).toFixed(2)} ${cy.toFixed(2)}a${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(2 * rx).toFixed(2)} 0a${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(-2 * rx).toFixed(2)} 0`);
		} else if (tag === 'line') out.push(`M${P(n(a.x1), n(a.y1))}L${P(n(a.x2), n(a.y2))}`);
		else if (tag === 'polyline' || tag === 'polygon') {
			const pts = (a.points ?? '').trim().split(/[\s,]+/).map(Number);
			const seg = [];
			for (let i = 0; i < pts.length; i += 2) seg.push(P(pts[i]!, pts[i + 1]!));
			out.push(`M${seg.join('L')}${tag === 'polygon' ? 'Z' : ''}`);
		} else if (tag === 'rect') {
			const rx0 = n(a.x);
			const ry0 = n(a.y);
			const w = n(a.width);
			const h = n(a.height);
			out.push(`M${P(rx0, ry0)}L${P(rx0 + w, ry0)}L${P(rx0 + w, ry0 + h)}L${P(rx0, ry0 + h)}Z`);
		}
	}
	return out.join('');
}

/** An SVG path's numbers scaled by k about the origin and moved to (x, y): absolute commands move, relative ones scale. */
function scalePath(d: string, x: number, y: number, k: number): string {
	const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
	let cmd = '';
	let i = 0;
	const out: string[] = [];
	const counts: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };
	while (i < tokens.length) {
		const t = tokens[i]!;
		if (/[a-zA-Z]/.test(t)) {
			cmd = t;
			i++;
			// A path's first moveto is absolute even when written small; the pairs after it are relative lines.
			if (i === 1 && t === 'm') {
				const [mx, my] = [Number(tokens[i]), Number(tokens[i + 1])];
				i += 2;
				out.push(`M${(x + mx * k).toFixed(2)} ${(y + my * k).toFixed(2)}`);
				cmd = 'l';
				if (i >= tokens.length || /[a-zA-Z]/.test(tokens[i]!)) continue;
				out.push('l');
			} else out.push(cmd);
			if (cmd.toLowerCase() === 'z') continue;
		}
		const lower = cmd.toLowerCase();
		const abs = cmd !== lower;
		const n = counts[lower] ?? 2;
		const vals = tokens.slice(i, i + n).map(Number);
		i += n;
		const mapped = vals.map((v, j) => {
			if (lower === 'a') {
				if (j === 2 || j === 3 || j === 4) return v;
				if (j < 2) return v * k;
				return abs ? (j === 5 ? x + v * k : y + v * k) : v * k;
			}
			if (lower === 'h') return abs ? x + v * k : v * k;
			if (lower === 'v') return abs ? y + v * k : v * k;
			return abs ? (j % 2 === 0 ? x + v * k : y + v * k) : v * k;
		});
		out.push(mapped.map((v) => (Number.isInteger(v) ? String(v) : v.toFixed(2))).join(' '));
	}
	return out.join(' ');
}

/** The scene a compose design stands for, and the extra layers (charts, icons) the engine draws as paths. */
/** Pixels per pixel of the 1080 canvas, as the templates measure it: posts by width, wide cards against 1200 by 630,
 * strips by their height. */
export function unitOf(W: number, H: number): number {
	const r = W / H;
	if (r > 2.4) return Math.min(H / 500, W / 1200) ** 0.5;
	if (r > 1.2) return Math.min(W / 1200, H / 630);
	return W / 1080;
}

function composeScene(doc: DesignDoc, photosIn: Photo[], floor: number, fitted: Record<string, number> = {}): { layers: Layer[]; extra: DrawnLayer[]; photos: Photo[]; placeholders: boolean } {
	const W = doc.size.width;
	const H = doc.size.height;
	const u0 = unitOf(W, H);
	// Small type keeps to the readable floor where the picture is shown.
	const u = u0;
	const fl = (px: number) => Math.max(floor, px);
	const th = themeOf(doc);
	const layers: Layer[] = [];
	const extra: DrawnLayer[] = [];
	const photos: Photo[] = [];
	let pictureCount = 0;
	let placeholders = false;
	const text = (id: string, slot: string, face: 'display' | 'body' | 'medium' | 'label' | 'code', size: number, leading: number, o: Partial<Extract<StackItem, { type: 'text' }>> = {}): StackItem => ({ type: 'text', id, slot, face, size, leading, color: th.fg, ...o });
	// A stack set from the foot or the middle hangs its descenders below the box it is given: keep them in the cells.
	const stackAt = (r: Rect, items: StackItem[], align: string, valign: string): Layer => {
		const last = [...items].reverse().find((i) => 'size' in i) as { size: number } | undefined;
		const drop = valign === 'top' || !last ? 0 : last.size * 0.3;
		return { type: 'stack', box: [r.x, r.y, r.w, r.h - drop], align: align as 'left', valign: valign as 'top', items };
	};
	for (const { block: b, rect: r } of blockRects(doc)) {
		const id = b.id;
		const align = str(opt(doc, id, 'align'), 'left');
		const valign = str(opt(doc, id, 'valign'), 'top');
		const lines = (size: number, leading: number) => Math.max(1, Math.floor((r.h - size * 0.3) / leading) + 1);
		switch (b.type) {
			case 'headline': {
				const s = fitted[id] ?? num(opt(doc, id, 'size'), Math.min(72 * u, r.h * 0.9));
				layers.push(stackAt(r, [text(id, `${id}.text`, 'display', s, s * 1.07, { maxLines: lines(s, s * 1.07), min: fitted[id] ?? Math.max(16 * u, s * 0.5), pinned: fitted[id] !== undefined })], align, valign));
				break;
			}
			case 'body': {
				const s = fitted[id] ?? fl(num(opt(doc, id, 'size'), 24 * u));
				layers.push(stackAt(r, [text(id, `${id}.text`, 'body', s, s * 1.33, { maxLines: lines(s, s * 1.33), color: th.soft, ...(fitted[id] !== undefined ? { min: s, pinned: true } : {}) })], align, valign));
				break;
			}
			case 'eyebrow': {
				const s = fl(14 * u);
				layers.push(stackAt(r, [text(id, `${id}.text`, 'label', s, s * 1.4, { maxLines: lines(s, s * 1.4), tracking: 0.06, caps: true })], align, 'center'));
				break;
			}
			case 'badge': {
				const h = Math.min(r.h, 40 * u);
				layers.push({ type: 'button', id, slot: `${id}.text`, box: [r.x, r.y + (r.h - h) / 2, Math.min(r.w, 120 * u), h], size: fl(20 * u), fill: th.card, color: th.fg, radius: 6 * u, align: align as 'left' });
				break;
			}
			case 'logo': {
				const lockup = str(opt(doc, id, 'lockup'), 'horizontal');
				const tone = str(opt(doc, id, 'tone'), '');
				// auto: Black where the light under it is pale, as the templates set it; white or black as asked, else by the ground.
				layers.push({ type: 'logo', id, lockup, color: tone === 'white' || tone === 'black' ? tone : th.fg, box: box(r), align: align as 'left', ...(tone === 'auto' ? { tone: 'auto' as const } : {}) });
				break;
			}
			case 'picture': {
				const g = geometryOf(doc, id);
				const treatment = str(opt(doc, id, 'treatment'), 'plain');
				const index = pictureCount++;
				const photo = (photosIn as (Photo & { slot?: string })[]).find((p) => p.slot === id);
				if (photo) photos[index] = photo;
				else placeholders = true;
				const at: Box = g?.box ?? box(r);
				if (g?.quad) layers.push({ type: 'panel', id, quad: g.quad, index, bleeds: true });
				else if (treatment === 'split' || g?.split !== undefined) layers.push({ type: 'split', id, box: at, index, shift: g?.split ?? 26 * u });
				else if (treatment === 'frame') {
					const bar = 28 * u;
					layers.push({ type: 'rect', id: `${id}-frame`, box: at, fill: th.card, radius: 8 * u, stroke: 'neutral-6' });
					layers.push({ type: 'photo', id, box: [at[0] + u, at[1] + bar, at[2] - 2 * u, at[3] - bar - u], index, over: [`${id}-frame`] });
				} else layers.push({ type: 'photo', id, box: at, index, radius: treatment === 'rounded' ? 10 * u : g?.radius ?? 0 });
				break;
			}
			case 'light': {
				const g = geometryOf(doc, id);
				const seed = opt(doc, id, 'seed');
				if (g?.window || g?.b) layers.push({ type: 'light', id, window: g.window, b: g.b, shift: g.shift, variant: g.variant, source: g.source, fixed: g.fixed, ...(seed !== undefined ? { seed: num(seed, 0) } : {}) });
				else {
					// The light is never boxed in: a side whose cells reach the grid's edge runs on to the canvas edge.
					const grid = doc.grid ?? { cols: 12, rows: 12 };
					const x0 = b.at.col === 0 ? 0 : r.x;
					const y0 = b.at.row === 0 ? 0 : r.y;
					const x1 = b.at.col + b.at.cols >= grid.cols ? W : r.x + r.w;
					const y1 = b.at.row + b.at.rows >= grid.rows ? H : r.y + r.h;
					layers.push({ type: 'light', id, window: [x0, y0, x1 - x0, y1 - y0], variant: str(opt(doc, id, 'variant'), 'band'), bleeds: true, ...(seed !== undefined ? { seed: num(seed, 0) } : {}) });
				}
				break;
			}
			case 'ascii':
				layers.push({ type: 'ascii', id, box: box(r), density: num(opt(doc, id, 'density'), 0.7) });
				break;
			case 'card': {
				const pad = Math.min(48 * u, r.w * 0.08);
				const items: StackItem[] = [
					{ type: 'text', id: `${id}-title`, slot: `${id}.title`, face: 'display', size: 40 * u, leading: 40 * u, maxLines: 2, color: th.fg },
					{ type: 'text', id: `${id}-text`, slot: `${id}.text`, face: 'body', size: fl(24 * u), leading: fl(24 * u) * 1.33, maxLines: 3, gap: 24 * u, color: th.soft },
					{ type: 'list', id: `${id}-items`, slot: `${id}.items`, face: 'body', size: fl(20 * u), leading: fl(20 * u) * 1.3, maxLines: 2, gap: 32 * u, itemGap: 16 * u, color: th.soft },
					{ type: 'button', id: `${id}-cta`, slot: `${id}.cta`, h: Math.max(56 * u, fl(20 * u) * 2.4), w: r.w - 2 * pad, size: fl(20 * u), gap: 32 * u, align: 'center', ...(th.fg === 'black' ? { fill: 'black', color: 'white' } : {}) },
				];
				layers.push({ type: 'stack', box: box(r), valign: 'top', align: align as 'left', items: [{ type: 'card', id, w: r.w, pad, fill: th.card, radius: 10 * u, items }] });
				break;
			}
			case 'stat':
				layers.push(stackAt(r, [text(id, `${id}.value`, 'display', Math.min(96 * u, r.h * 0.6), Math.min(96 * u, r.h * 0.6), { maxLines: 1, min: 24 * u }), text(`${id}-label`, `${id}.label`, 'body', fl(22 * u), fl(22 * u) * 1.36, { gap: 32 * u, maxLines: 2, color: th.soft })], align, valign));
				break;
			case 'quote':
				layers.push(stackAt(r, [text(id, `${id}.text`, 'display', 44 * u, 50 * u, { maxLines: lines(44 * u, 50 * u), min: 24 * u }), text(`${id}-name`, `${id}.name`, 'medium', fl(22 * u), fl(22 * u) * 1.36, { gap: 28 * u, maxLines: 1 }), text(`${id}-role`, `${id}.role`, 'body', fl(20 * u), fl(20 * u) * 1.4, { gap: 8 * u, maxLines: 1, color: th.soft })], align, valign));
				break;
			case 'list':
				layers.push(stackAt(r, [{ type: 'list', id, slot: `${id}.items`, face: 'body', size: fl(24 * u), leading: fl(24 * u) * 1.33, maxLines: 2, itemGap: 16 * u, color: th.fg }], align, valign));
				break;
			case 'button':
			{
				// The button keeps its size and sits in its cells as `align` and `valign` say (a strip ad's button lines up
				// with the right margin and the middle of the row).
				const bw = Math.min(r.w, 258 * u);
				const bh = Math.max(Math.min(r.h, 56 * u), fl(20 * u) * 2.4);
				const bx = align === 'right' ? r.x + r.w - bw : align === 'center' ? r.x + (r.w - bw) / 2 : r.x;
				const by = valign === 'center' ? r.y + (r.h - bh) / 2 : valign === 'bottom' ? r.y + r.h - bh : r.y;
				layers.push({ type: 'button', id, slot: `${id}.text`, box: [bx, by, bw, bh], size: fl(20 * u), radius: 10 * u, align: align as 'left', ...(th.fg === 'black' ? { fill: 'black', color: 'white' } : {}) });
			}
				break;
			case 'search':
				layers.push({ type: 'search', id, slot: `${id}.text`, box: [r.x, r.y + Math.max(0, (r.h - 88 * u) / 2), r.w, Math.min(r.h, 88 * u)], size: fl(24 * u) });
				break;
			case 'code': {
				const pad = Math.min(24 * u, r.w * 0.06);
				layers.push({ type: 'stack', box: box(r), valign: 'top', align: 'left', items: [{ type: 'card', id, w: r.w, pad, fill: 'neutral-2', radius: 10 * u, items: [{ type: 'text', id: `${id}-text`, slot: `${id}.text`, face: 'code', size: fl(22 * u), leading: fl(22 * u) * 1.36, maxLines: Math.max(1, Math.floor((r.h - 2 * pad) / (fl(22 * u) * 1.36))), color: 'white' }] }] });
				break;
			}
			case 'divider':
				layers.push({ type: 'rect', id, box: [r.x, r.y + r.h / 2, r.w, Math.max(1, Math.round(u))], fill: th.fg === 'white' ? 'neutral-5' : 'neutral-11' });
				break;
			case 'chart': {
				const data = dataOf(doc.copy[`${id}.data`] ?? '');
				if (!data.length) break;
				const kind = str(opt(doc, id, 'type'), 'bar');
				const labelH = fl(18 * u) * 1.4 + 12 * u;
				const plot = { x: r.x, y: r.y, w: r.w, h: r.h - labelH };
				const max = Math.max(...data.map((d) => d.value), 1);
				const ds: string[] = [];
				const n = data.length;
				const step = plot.w / n;
				// Every point's words as written ("Mon 12"), under the plot, so nothing passed goes unshown.
				const labelRow = () => data.forEach((d, i) => layers.push({ type: 'text', id: `${id}-label-${i + 1}`, text: d.raw, face: 'body', size: fl(18 * u), leading: fl(18 * u) * 1.33, x: plot.x + step * i, top: plot.y + plot.h + 10 * u, w: step, align: 'center', maxLines: 1, color: th.soft }));
				if (kind === 'donut') {
					const cx = r.x + r.w / 2;
					const cy = r.y + (r.h - labelH) / 2;
					const R = Math.min(r.w, r.h - labelH) / 2;
					const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
					const steps = [th.fg, 'neutral-9', 'neutral-7', 'neutral-5', 'neutral-11', 'neutral-6'];
					let a0 = -Math.PI / 2;
					data.forEach((d, i) => {
						const a1 = a0 + (Math.max(0, d.value) / total) * Math.PI * 2;
						const p = (a: number, rr: number) => `${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
						const large = a1 - a0 > Math.PI ? 1 : 0;
						const ri = R * 0.62;
						layers.push({ type: 'path', id: `${id}-slice-${i + 1}`, d: `M${p(a0, R)}A${R.toFixed(2)} ${R.toFixed(2)} 0 ${large} 1 ${p(a1, R)}L${p(a1, ri)}A${ri.toFixed(2)} ${ri.toFixed(2)} 0 ${large} 0 ${p(a0, ri)}Z`, fill: steps[i % steps.length] });
						a0 = a1;
					});
					labelRow();
					extra.push({ id, kind: 'art', box: r, ink: [{ x: cx - R, y: cy - R, w: 2 * R, h: 2 * R }], can: { move: true, hide: true } });
					break;
				}
				if (kind === 'line') {
					const pts = data.map((d, i) => [plot.x + step * (i + 0.5), plot.y + plot.h - (d.value / max) * plot.h] as const);
					ds.push(`M${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L')}`);
					layers.push({ type: 'path', id: `${id}-line`, d: ds[0]!, stroke: th.fg, strokeWidth: Math.max(2, 3 * u) });
				} else {
					data.forEach((d, i) => {
						const bh = (d.value / max) * plot.h;
						const bx = plot.x + step * i + step * 0.15;
						layers.push({ type: 'rect', id: `${id}-bar-${i + 1}`, box: [bx, plot.y + plot.h - bh, step * 0.7, bh], fill: i === n - 1 ? th.fg : th.fg === 'white' ? 'neutral-6' : 'neutral-10', radius: 4 * u });
					});
				}
				labelRow();
				extra.push({ id, kind: 'art', box: r, ink: [plot], can: { move: true, hide: true } });
				break;
			}
			case 'table': {
				const rows = (doc.copy[`${id}.rows`] ?? '').split('\n').map((row) => row.split('|').map((c) => c.trim())).filter((row) => row.some(Boolean));
				if (!rows.length) break;
				const cols = Math.max(...rows.map((row) => row.length));
				const rh = Math.min(r.h / rows.length, 64 * u);
				const cw = r.w / cols;
				rows.forEach((row, i) => {
					const y = r.y + i * rh;
					row.forEach((c, j) => {
						if (!c) return;
						layers.push({ type: 'text', id: i === 0 && j === 0 ? id : `${id}-r${i + 1}c${j + 1}`, text: c, face: i === 0 ? 'medium' : 'body', size: fl(22 * u), leading: fl(22 * u) * 1.3, x: r.x + j * cw, top: y + (rh - 16 * u) / 2, w: cw - 12 * u, maxLines: 1, color: i === 0 ? th.fg : th.soft });
					});
					if (i > 0) layers.push({ type: 'rect', id: `${id}-rule-${i}`, box: [r.x, y, r.w, Math.max(1, Math.round(u))], fill: th.fg === 'white' ? 'neutral-5' : 'neutral-11' });
				});
				break;
			}
			case 'icon': {
				const s = Math.min(r.w, r.h);
				const d = iconPath(str(opt(doc, id, 'name'), 'search'), r.x + (r.w - s) / 2, r.y + (r.h - s) / 2, s);
				layers.push({ type: 'path', id: `${id}-glyph`, d, stroke: th.fg, strokeWidth: Math.max(1, (1.5 * s) / 24) });
				extra.push({ id, kind: 'art', box: r, ink: [{ x: r.x + (r.w - s) / 2, y: r.y + (r.h - s) / 2, w: s, h: s }], can: { move: true, scale: [0.5, 2], hide: true } });
				break;
			}
		}
	}
	return { layers, extra, photos, placeholders };
}

/** Draws a compose design with the scene engine. Pictures come keyed by their block id. */
export async function drawCompose(doc: DesignDoc, pictures: Record<string, Photo>): Promise<{ drawn: DrawResult; layers: DrawnLayer[] }> {
	const W = doc.size.width;
	const H = doc.size.height;
	const th = themeOf(doc);
	const z = zonesOf(doc.size.id, W, H);
	const tagged = Object.entries(pictures).map(([slot, p]) => ({ ...p, slot }));
	// Headlines and body copy take the largest size that fits their cells (from the asked size down to the floor), or
	// the design is refused with what to shorten.
	const f = await faces();
	const fitted: Record<string, number> = {};
	const u = unitOf(W, H);
	for (const { block: b, rect: r } of blockRects(doc)) {
		if (b.type !== 'headline' && b.type !== 'body') continue;
		const words = (doc.copy[`${b.id}.text`] ?? '').trim();
		if (!words || doc.layers[b.id]?.hidden) continue;
		const display = b.type === 'headline';
		const face = display ? f.heading : f.text;
		const ratio = display ? 1.07 : 1.33;
		const start = num(doc.options[`${b.id}.size`], display ? Math.min(72 * u, r.h * 0.9) : 24 * u) * (doc.layers[b.id]?.scale ?? 1);
		const low = Math.max(z.floor, display ? 16 * u : 12 * u);
		let size = Math.max(low, Math.floor(start));
		for (; size >= low; size--) {
			const lines = wrap(face, words, size, r.w, 0);
			const room = (doc.options[`${b.id}.valign`] ?? 'top') === 'top' ? r.h : r.h - size * 0.3;
			if (lines.every((l) => l.length) && blockHeight(face, lines, size, ratio) <= room + 0.5 && !lines.some((l) => !words.includes(l.split(' ')[0]!))) break;
		}
		if (size < low) throw new Error(`The ${b.id}'s words are too long for its cells: shorten them, or give it more cells (make it wider or taller).`);
		fitted[b.id] = size;
	}
	const { layers, extra, photos, placeholders } = composeScene(doc, tagged, z.floor, fitted);
	const g = gridOf(doc);
	const frame: Box = [g.m, g.m, W - 2 * g.m, H - 2 * g.m];
	const drawn = await drawScene({ width: W, height: H, ground: th.ground, layers, slots: doc.copy, photos, placeholders, seed: doc.seed, light: 'brand', texture: true, frame, unit: unitOf(W, H), floor: z.floor, edits: doc.layers });
	const reported = await groundsOf(drawn);
	const ids = new Set(reported.map((l) => l.id));
	return { drawn, layers: [...reported, ...extra.filter((l) => !ids.has(l.id))] };
}

// ----- Every template as blocks -----

const snap = (doc: Pick<DesignDoc, 'size' | 'grid'>, b: Box, grid: { cols: number; rows: number }, mode: 'words' | 'words-up' | 'inside' | 'near' = 'near'): { col: number; row: number; cols: number; rows: number } => {
	const g = gridOf({ ...doc, grid });
	const c0 = g.cell({ col: 0, row: 0, cols: 1, rows: 1 });
	const c1 = g.cell({ col: 1, row: 1, cols: 1, rows: 1 });
	const sx = c1.x - c0.x;
	const sy = c1.y - c0.y;
	// The nearest cells: a span of n cells is n steps less one gutter wide.
	// Words keep their height (every row they touch; set from the foot, they grow upward) and take the nearest columns,
	// re-wrapping to fit; a logo takes the cells inside where it stood, so its clear space stays clear; the rest the nearest.
	const R = Math.round;
	const [lo, hi, loR, hiR] = mode === 'words' ? [R, R, R, Math.ceil] : mode === 'words-up' ? [R, R, Math.floor, R] : mode === 'inside' ? [Math.ceil, Math.floor, Math.ceil, Math.floor] : [R, R, R, R];
	const col = Math.max(0, Math.min(grid.cols - 1, lo((b[0] - c0.x) / sx)));
	const row = Math.max(0, Math.min(grid.rows - 1, loR((b[1] - c0.y) / sy)));
	const end = Math.min(grid.cols, Math.max(col + 1, hi((b[0] + b[2] - c0.x + g.g) / sx)));
	const endR = Math.min(grid.rows, Math.max(row + 1, hiR((b[1] + b[3] - c0.y + g.g) / sy)));
	return { col, row, cols: end - col, rows: endR - row };
};

/** A template's design as blocks: the same lights and pictures in their windows, the words and logo in the cells over
 * where the template sets them, at the template's sizes. */
export function recipeFor(template: string, size: string, copy: Record<string, string>): (Pick<DesignState, 'blocks' | 'copy'> & Partial<Pick<DesignState, 'grid' | 'theme' | 'options'>>) | undefined {
	let t;
	try {
		t = findTemplate('image', template);
	} catch {
		return undefined;
	}
	const { scene, width, height, variant } = sceneFor(t, { size, slots: copy, placeholders: true });
	// Fine enough to follow the template, coarse enough that a cell still holds a line: fewer rows on a strip.
	const grid = { cols: width >= height ? 24 : Math.max(8, Math.round((24 * width) / height)), rows: height >= width ? 24 : Math.max(8, Math.round((24 * height) / width)) };
	const doc = { size: { id: size, width, height }, grid };
	const blocks: DesignState['blocks'] = [];
	const out: Record<string, string> = {};
	const options: DesignState['options'] = {};
	const used = new Set<string>();
	const idFor = (base: string) => {
		let id = base.replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '') || 'block';
		if (!/^[a-z]/.test(id)) id = `b-${id}`;
		let n = id;
		for (let i = 2; used.has(n); i++) n = `${id}-${i}`;
		used.add(n);
		return n;
	};
	const full = { col: 0, row: 0, cols: grid.cols, rows: grid.rows };
	const slotsOf = scene.slots ?? {};
	const value = (slot?: string) => (slot ? (slotsOf[slot] ?? '').trim() : '');
	const textBlock = (face: string) => (face === 'display' ? 'headline' : face === 'label' ? 'eyebrow' : 'body');
	const estimate = (it: { size: number; leading: number; slot?: string; face?: string; w?: number }, w: number) => {
		const v = value(it.slot);
		const chars = v.length * it.size * (it.face === 'display' ? 0.52 : 0.5);
		const lines = Math.max(1, Math.ceil(chars / Math.max(1, it.w ?? w)));
		return it.size * 0.8 + (lines - 1) * it.leading + it.size * 0.35;
	};
	// What the template sets (words, logo, buttons) mapped into the grid's area when the template uses more of the canvas
	// than the grid covers (a story's foot, a platform's safe area), so its parts keep their order and spacing.
	const parts: Box[] = [];
	for (const l of scene.layers) {
		if (l.type === 'text' && value(l.slot)) parts.push([l.x, l.top - l.size * 0.3, l.w, estimate(l, l.w)]);
		else if (l.type === 'logo') parts.push(logoBox(l));
		else if ((l.type === 'button' || l.type === 'search' || l.type === 'stack') && ('slot' in l ? value(l.slot) : true)) parts.push(l.box);
	}
	const area = gridOf(doc).cell({ col: 0, row: 0, cols: grid.cols, rows: grid.rows });
	const F = parts.length ? [Math.min(...parts.map((b) => b[0])), Math.min(...parts.map((b) => b[1])), Math.max(...parts.map((b) => b[0] + b[2])), Math.max(...parts.map((b) => b[1] + b[3]))] : [area.x, area.y, area.x + area.w, area.y + area.h];
	const kx = Math.min(1, area.w / Math.max(1, F[2]! - F[0]!));
	const ky = Math.min(1, area.h / Math.max(1, F[3]! - F[1]!));
	const ox = Math.max(area.x, Math.min(F[0]!, area.x + area.w - (F[2]! - F[0]!) * kx));
	const oy = Math.max(area.y, Math.min(F[1]!, area.y + area.h - (F[3]! - F[1]!) * ky));
	const map = (b: Box): Box => [ox + (b[0] - F[0]!) * kx, oy + (b[1] - F[1]!) * ky, b[2] * kx, b[3] * ky];
	const place = (b: Box, mode?: 'words' | 'words-up' | 'inside' | 'near') => snap(doc, map(b), grid, mode);
	for (const l of scene.layers) {
		if (l.type === 'ascii') {
			blocks.push({ id: idFor('texture'), type: 'ascii', at: full });
		} else if (l.type === 'light') {
			const id = idFor(l.id ?? 'light');
			blocks.push({ id, type: 'light', at: full });
			options[`${id}.geometry`] = JSON.stringify({ W0: width, H0: height, window: l.window, b: l.b, shift: l.shift, variant: l.variant, source: l.source, fixed: l.fixed });
		} else if (l.type === 'photo' || l.type === 'split' || l.type === 'panel') {
			const id = idFor(l.id ?? `picture-${l.index + 1}`);
			const b: Box = l.type === 'panel' ? [Math.min(...l.quad.map((p) => p[0])), Math.min(...l.quad.map((p) => p[1])), Math.max(...l.quad.map((p) => p[0])) - Math.min(...l.quad.map((p) => p[0])), Math.max(...l.quad.map((p) => p[1])) - Math.min(...l.quad.map((p) => p[1]))] : l.box;
			blocks.push({ id, type: 'picture', at: place(b) });
			options[`${id}.geometry`] = JSON.stringify({ W0: width, H0: height, ...(l.type === 'panel' ? { quad: l.quad } : l.type === 'split' ? { box: l.box, split: l.shift } : { box: l.box, radius: l.radius }) });
		} else if (l.type === 'logo') {
			const id = idFor('logo');
			blocks.push({ id, type: 'logo', at: place(logoBox(l)) });
			options[`${id}.lockup`] = l.lockup;
			if (l.tone === 'auto') options[`${id}.tone`] = 'auto';
			if (l.align) options[`${id}.align`] = l.align;
		} else if (l.type === 'text' && value(l.slot)) {
			const id = idFor(l.slot!);
			const h = estimate(l, l.w);
			blocks.push({ id, type: textBlock(l.face), at: place([l.x, l.top - l.size * 0.3, l.w, h], 'words') });
			out[`${id}.text`] = value(l.slot);
			if (l.face !== 'label') options[`${id}.size`] = Math.round(l.size * 10) / 10;
			if (l.align) options[`${id}.align`] = l.align;
		} else if (l.type === 'button' && value(l.slot)) {
			const id = idFor(l.slot!);
			blocks.push({ id, type: 'button', at: place(l.box, 'words') });
			out[`${id}.text`] = value(l.slot);
			if (l.align) options[`${id}.align`] = l.align;
		} else if (l.type === 'search' && value(l.slot)) {
			const id = idFor(l.slot!);
			blocks.push({ id, type: 'search', at: place(l.box, 'words') });
			out[`${id}.text`] = value(l.slot);
		} else if (l.type === 'stack') {
			// The stack's items one under another, as the template sets them, from the top or the foot of its box.
			const items = l.items.filter((i) => (i.type === 'card' ? i.items.some((c) => 'slot' in c && value(c.slot as string)) : value((i as { slot?: string }).slot)));
			const heights = items.map((i) => (i.type === 'card' ? i.items.reduce((s, c) => s + ((c as { gap?: number }).gap ?? 0) + (c.type === 'button' ? c.h : 'slot' in c && value(c.slot as string) ? estimate(c as never, i.w - 2 * i.pad) : 0), 2 * i.pad) : i.type === 'button' ? i.h : estimate(i as never, (i as { w?: number }).w ?? l.box[2])));
			const gaps = items.map((i, k) => (k === 0 ? 0 : ((i as { gap?: number }).gap ?? 0)));
			const total = heights.reduce((s, h, k) => s + h + gaps[k]!, 0);
			const k = total > l.box[3] ? l.box[3] / total : 1;
			let y = l.valign === 'bottom' ? l.box[1] + l.box[3] - total * k : l.valign === 'center' ? l.box[1] + (l.box[3] - total * k) / 2 : l.box[1];
			items.forEach((i, n) => {
				y += gaps[n]! * k;
				const h = heights[n]! * k;
				const w = i.type === 'card' ? i.w : (i as { w?: number }).w ?? l.box[2];
				const x = l.align === 'center' ? l.box[0] + (l.box[2] - w) / 2 : l.align === 'right' ? l.box[0] + l.box[2] - w : l.box[0];
				const b: Box = [x, y, w, h];
				if (i.type === 'card') {
					const id = idFor(i.id ?? 'card');
					blocks.push({ id, type: 'card', at: place(b, 'words') });
					for (const c of i.items) {
						const v = 'slot' in c ? value(c.slot as string) : '';
						if (!v) continue;
						const s = c.type === 'button' ? 'cta' : c.type === 'list' ? 'items' : (c as { face?: string }).face === 'display' ? 'title' : 'text';
						out[`${id}.${s}`] = out[`${id}.${s}`] ? `${out[`${id}.${s}`]} ${v}` : v;
					}
				} else if (i.type === 'button') {
					const id = idFor(i.slot ?? 'button');
					blocks.push({ id, type: 'button', at: place(b, 'words') });
					out[`${id}.text`] = value(i.slot);
					options[`${id}.align`] = l.align ?? 'left';
				} else if (i.type === 'list') {
					const id = idFor(i.slot ?? 'list');
					blocks.push({ id, type: 'list', at: place(b, 'words') });
					out[`${id}.items`] = value(i.slot);
				} else {
					const id = idFor(i.slot ?? 'text');
					blocks.push({ id, type: textBlock(i.face), at: place(b, l.valign === 'bottom' ? 'words-up' : 'words') });
					out[`${id}.text`] = value(i.slot);
					if (i.face !== 'label') options[`${id}.size`] = Math.round(i.size * 10) / 10;
					options[`${id}.align`] = i.align ?? l.align ?? 'left';
					if (l.valign && l.valign !== 'top') options[`${id}.valign`] = l.valign;
				}
				y += h;
			});
		}
	}
	const theme = variant && COMPOSE_THEMES[variant] ? variant : 'black';
	return { blocks, copy: out, grid, theme, options };
}
