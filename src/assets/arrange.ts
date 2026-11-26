import type { BriefImage, Brief, CopyField } from './brief.js';
import { gridOf } from '../design/compose.js';

// Layouts made from the brief itself, not picked from the templates: the brief's parts (headline, stat, quote, search
// bar, pricing card, pictures, button) laid out as compose blocks on a grid. The brief's `Layout` section says how in
// plain words, one row per line from the top, parts side by side split by commas ("stat left, quote right"); without
// it, three arrangements of every part the brief gives (stacked, centered, split in two columns). Every block is drawn
// by the compose engine and checked like any other design, so what passes is on brand whatever the arrangement.

type At = { col: number; row: number; cols: number; rows: number };
export type Block = { id: string; type: string; at: At };
export type Arrangement = {
	id: string;
	/** What the arrangement is, for the sheet and the design file. */
	name: string;
	grid: { cols: number; rows: number };
	blocks: Block[];
	copy: Record<string, string>;
	options: Record<string, string | number | boolean>;
	pictures: Record<string, BriefImage>;
	draws: CopyField[];
	/** Made from the brief's own Layout words. */
	asked: boolean;
};

type Kind = 'eyebrow' | 'headline' | 'body' | 'stat' | 'quote' | 'search' | 'card' | 'list' | 'pictures' | 'chart' | 'button' | 'logo';
type Part = { kind: Kind; count?: number; align?: 'left' | 'center' | 'right'; big?: boolean; small?: boolean };
type Group = { parts: Part[]; pin?: 'top' | 'bottom' };

const WORDS: [Kind, string[]][] = [
	['search', ['search bar', 'search', 'prompt', 'query', 'search box']],
	['card', ['pricing card', 'plan card', 'price card', 'card', 'pricing', 'plan', 'price', 'offer']],
	['pictures', ['photos', 'photo', 'images', 'image', 'pictures', 'picture', 'creatives', 'creative', 'screenshots', 'screenshot', 'photo grid', 'photo row']],
	['headline', ['headline', 'title', 'heading', 'head']],
	['body', ['supporting line', 'supporting', 'subhead', 'body', 'line', 'text', 'copy', 'description']],
	['eyebrow', ['label', 'eyebrow', 'kicker', 'badge', 'tag']],
	['stat', ['stat', 'figure', 'number', 'metric', 'result']],
	['quote', ['quote', 'testimonial', 'review']],
	['list', ['features', 'feature list', 'list', 'bullets', 'points']],
	['chart', ['chart', 'graph', 'bars']],
	['button', ['button', 'cta', 'call to action']],
	['logo', ['logo', 'lockup', 'wordmark']],
];
const COUNTS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, a: 1, pair: 2 };

/** One part of a Layout line: what it is and how it sits. Unknown words are an error that lists what is read. */
function partOf(text: string): Part {
	const t = ` ${text.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
	let kind: Kind | undefined;
	let at = Infinity;
	for (const [k, words] of WORDS)
		for (const w of words) {
			const i = t.indexOf(` ${w} `);
			if (i >= 0 && (i < at || (i === at && kind === undefined))) {
				kind = k;
				at = i;
			}
		}
	if (!kind) throw new Error(`Layout: "${text.trim()}" names no part. Name one of: headline, supporting line, label, stat, quote, search bar, pricing card, features, photos, chart, button, logo (with left, right, center, top, bottom, big or small).`);
	const n = /\b(\d)\b/.exec(t)?.[1];
	const word = Object.keys(COUNTS).find((w) => t.includes(` ${w} `) && w !== 'a');
	const align = / left /.test(t) ? 'left' : / right /.test(t) ? 'right' : / (center|centre|centered|middle) /.test(t) ? 'center' : undefined;
	return { kind, count: n ? Number(n) : word ? COUNTS[word] : / (row|grid) /.test(t) && kind === 'pictures' ? 3 : undefined, align, big: / (big|bigger|large|larger|huge|hero) /.test(t), small: / (small|smaller|little) /.test(t) };
}

/** The Layout section as rows: each line a row from the top, its parts side by side. */
export function parseLayout(lines: string[]): Group[] {
	return lines
		.map((l) => l.replace(/^[-*\d.)\s]+/, '').trim())
		.filter(Boolean)
		.map((line) => {
			const pin = /\b(at the )?(top|first)\b/i.test(line) && !/\btop (left|right)\b/i.test(line) ? undefined : undefined;
			void pin;
			const parts = line.split(/,|;|\bnext to\b|\bbeside\b|\band then\b/i).map((s) => s.trim()).filter(Boolean).map(partOf);
			const p = line.toLowerCase();
			return { parts, pin: /\b(bottom|foot|footer|at the end)\b/.test(p) ? 'bottom' : /\b(top|header)\b/.test(p) ? 'top' : undefined } as Group;
		});
}

const has = (b: Brief, f: CopyField) => Boolean(b.copy[f]?.trim());

/** The parts the brief's copy and pictures give, in reading order, for arrangements made without Layout words. */
function partsOf(b: Brief): Part[] {
	const out: Part[] = [];
	if (has(b, 'label')) out.push({ kind: 'eyebrow' });
	if (has(b, 'headline')) out.push({ kind: 'headline' });
	if (has(b, 'supporting')) out.push({ kind: 'body' });
	if (has(b, 'stat')) out.push({ kind: 'stat' });
	if (has(b, 'quote')) out.push({ kind: 'quote' });
	if (has(b, 'search')) out.push({ kind: 'search' });
	const card = has(b, 'plan') || has(b, 'offer');
	if (card) out.push({ kind: 'card' });
	else if (has(b, 'features')) out.push({ kind: 'list' });
	if (b.images.length) out.push({ kind: 'pictures', count: Math.min(3, b.images.length) });
	if (has(b, 'cta') && !card) out.push({ kind: 'button' });
	return out;
}

const TEXT: Kind[] = ['eyebrow', 'headline', 'body'];
const FLEX: Kind[] = ['pictures', 'chart'];

/** Arrangements for one canvas: the brief's own Layout first (when it has one), else stacked, centered and split. */
export function arrangements(b: Brief, size: string, W: number, H: number, opts: { light: boolean; texture: boolean; theme?: string }): Arrangement[] {
	const R = Math.max(4, Math.min(24, Math.round((12 * H) / W)));
	const grid = { cols: 12, rows: R };
	// The grid as the compose engine lays it (inside the platform's safe area and the margins).
	const G = gridOf({ size: { id: size, width: W, height: H }, grid } as Parameters<typeof gridOf>[0]);
	const g = G.g;
	const cell0 = G.cell({ col: 0, row: 0, cols: 1, rows: 1 });
	const rowPx = cell0.h + g;
	const u = W / H > 1.2 ? Math.min(W / 1200, H / 630) : W / 1080;
	const rowsFor = (px: number) => Math.max(1, Math.ceil((px * u - g) / rowPx));
	const out: Arrangement[] = [];
	if (b.layout?.length) {
		const groups = parseLayout(b.layout);
		// Whatever the brief gives that the Layout does not place still goes in, after it, so no words are dropped.
		const named = new Set(groups.flatMap((x) => x.parts.map((p) => p.kind)));
		const rest = partsOf(b).filter((p) => !named.has(p.kind) && !(p.kind === 'button' && named.has('card')));
		const extra = rest.filter((p) => p.kind !== 'button').map((p) => ({ parts: [p] }) as Group);
		const button = rest.find((p) => p.kind === 'button');
		// A line that is only the button, at the foot, is the foot row.
		const footLine = groups.find((x) => x.parts.length === 1 && x.parts[0]!.kind === 'button' && (x.pin === 'bottom' || x === groups[groups.length - 1]));
		const body = groups.filter((x) => x !== footLine);
		const foot = footLine ?? (button ? { parts: [button] } : undefined);
		const a = build('asked', 'the brief\'s layout', [...body, ...extra], foot, 'left', true);
		if (a) out.push(a);
		return out;
	}
	const parts = partsOf(b);
	const button = parts.find((p) => p.kind === 'button');
	const body = parts.filter((p) => p.kind !== 'button');
	const stacked = build('stacked', 'stacked, left', body.map((p) => ({ parts: [p] })), button && { parts: [button] }, 'left', false);
	if (stacked) out.push(stacked);
	const centered = build('centered', 'centered', body.map((p) => ({ parts: [{ ...p, align: 'center' as const }] })), button && { parts: [{ ...button, align: 'center' as const }] }, 'center', false);
	if (centered) out.push(centered);
	// Two columns: the words on the left, what shows it on the right (a stat, a quote, a card, pictures, a chart).
	const words = body.filter((p) => TEXT.includes(p.kind));
	const shows = body.filter((p) => !TEXT.includes(p.kind) && p.kind !== 'search');
	if (shows.length && words.length && W / H > 0.55) {
		const split = build('split', 'two columns', [{ parts: [{ kind: 'headline', count: -1 }, ...shows.slice(0, 1)] }, ...shows.slice(1).map((p) => ({ parts: [p] })), ...body.filter((p) => p.kind === 'search').map((p) => ({ parts: [p] }))], button && { parts: [button] }, 'left', false, words);
		if (split) out.push(split);
	}
	return out;

	function build(id: string, name: string, groupsIn: Group[], foot: Group | undefined, align: 'left' | 'center', asked: boolean, column?: Part[]): Arrangement | undefined {
		const blocks: Block[] = [];
		const copy: Record<string, string> = {};
		const options: Record<string, string | number | boolean> = {};
		const pictures: Record<string, BriefImage> = {};
		const draws = new Set<CopyField>();
		const ids = new Map<string, number>();
		const idFor = (base: string) => {
			const n = (ids.get(base) ?? 0) + 1;
			ids.set(base, n);
			return n === 1 ? base : `${base}-${n}`;
		};
		let images = [...b.images];
		const wide = W / H > 1.2;
		const story = H / W > 1.6;

		// The logo: top left unless the layout puts it at the foot, then the button goes right.
		const logoPart = groupsIn.flatMap((x) => x.parts).find((p) => p.kind === 'logo');
		const logoAsked = logoPart ? groupsIn.find((x) => x.parts.includes(logoPart))?.pin : undefined;
		const groups = groupsIn.map((x) => ({ ...x, parts: x.parts.filter((p) => p.kind !== 'logo') })).filter((x) => x.parts.length);

		// The swoosh from the top edge when the words sit under it (centered, tall canvases, no search bar to carry the
		// light); the logo then stands at the foot, as the feed ads set it, unless the layout puts it at the top.
		const hasSearch = groups.some((x) => x.parts.some((p) => p.kind === 'search'));
		const swoosh = opts.light && !hasSearch && !wide && H / W >= 1.2 && (align === 'center' || asked) && logoAsked !== 'top';
		const logoFoot = logoAsked === 'bottom' || swoosh;
		// Under the swoosh: below its left tail (about 30% of the width down).
		const top0 = swoosh ? Math.max(logoFoot ? 0 : 1, Math.ceil((0.31 * W - cell0.y) / rowPx)) : logoFoot ? 0 : 1;
		const end = R - (foot || logoFoot ? 1 : 0);

		// The rows each group needs.
		const heightOf = (p: Part, cols: number): number => {
			const k = p.big ? 1.3 : p.small ? 0.8 : 1;
			const w = (cols / 12) * 950;
			const lines = (text: string | undefined, size: number) => Math.max(1, Math.ceil(((text?.length ?? 20) * size * 0.56) / w));
			switch (p.kind) {
				case 'eyebrow': return rowsFor(28);
				case 'headline': { const s = (wide ? 48 : 56) * k; return rowsFor(lines(b.copy.headline, s) * (s + 4) + 24); }
				case 'body': return rowsFor(lines(b.copy.supporting, 24) * 32 + 8);
				case 'stat': return rowsFor(220 * k);
				case 'quote': return rowsFor(lines(b.copy.quote, 44 * k) * 48 * k + 84);
				case 'search': return rowsFor(opts.light ? 240 : 88);
				case 'card': { const items = (b.copy.features ?? '').split('|').filter((s) => s.trim()).length; return rowsFor(40 + 44 + 56 + (has(b, 'offer') ? 48 : 0) + items * 44 + (has(b, 'cta') ? 104 : 0) + 40); }
				case 'list': { const items = (b.copy.features ?? '').split('|').filter((s) => s.trim()).length; return rowsFor(items * 44); }
				case 'pictures': return rowsFor((p.big ? 460 : 300) * (story ? 1.2 : 1));
				case 'chart': return rowsFor(300);
				case 'button': return 1;
				default: return 1;
			}
		};
		// In the split arrangement the words stack in the left column; the group's first part is that column.
		const colHeight = column ? column.reduce((s, p) => s + heightOf(p, 6), 0) + Math.max(0, column.length - 1) * 0 : 0;
		const rowsOf = (x: Group) => Math.max(...x.parts.map((p) => (p.count === -1 ? colHeight : heightOf(p, Math.floor(12 / x.parts.length)))));
		const need = groups.map(rowsOf);
		let room = end - top0;
		const air = !logoFoot && !swoosh ? 1 : 0;
		let gap = 1;
		const total = () => need.reduce((s, n) => s + n, 0) + gap * Math.max(0, groups.length - 1);
		if (total() + air <= room) room -= air;
		if (total() > room) gap = 0;
		// Too much for the canvas: pictures and charts give way first, down to two rows.
		for (let i = groups.length - 1; i >= 0 && total() > room; i--) if (groups[i]!.parts.some((p) => FLEX.includes(p.kind))) need[i] = Math.max(2, need[i]! - (total() - room));
		if (total() > room) return undefined;
		// Room to spare: pictures and charts grow into it (the stacked look), else the rest is spread as the arrangement sets it.
		let spare = room - total();
		const flex = need.findIndex((_, i) => groups[i]!.parts.some((p) => FLEX.includes(p.kind)));
		if (flex >= 0 && align === 'left' && !asked) {
			const grow = Math.min(spare, Math.round(rowsFor(560) - need[flex]!));
			if (grow > 0) {
				need[flex]! += grow;
				spare -= grow;
			}
		}
		// Pinned to the foot: everything from the first such group sits as low as it can.
		const firstBottom = groups.findIndex((x) => x.pin === 'bottom');
		let row = top0 + air + (align === 'center' && !asked ? Math.floor(spare / 2) : 0);
		// The brief's own layout: what is left over goes evenly between its rows, so it fills the canvas.
		const between = (asked || (align === 'left' && flex < 0)) && firstBottom < 0 && groups.length > 1 ? Math.floor(spare / groups.length) : 0;
		groups.forEach((x, i) => {
			if (i > 0) row += between;
			if (i === firstBottom || (firstBottom < 0 && i === groups.length - 1 && align === 'left' && !asked && groups.length > 1 && groups[i]!.parts.some((p) => FLEX.includes(p.kind) || p.kind === 'card'))) row += spare;
			const h = need[i]!;
			let col = 0;
			const n = x.parts.length;
			const span = Math.floor(12 / n);
			x.parts.forEach((p, j) => {
				const cols = n === 1 ? widthOf(p) : span;
				const c0 = n === 1 ? (p.align === 'center' || (align === 'center' && p.align !== 'left' && p.align !== 'right') ? Math.floor((12 - cols) / 2) : p.align === 'right' ? 12 - cols : 0) : j * span + (j === n - 1 ? 12 - span * n : 0);
				place(p, { col: c0, row, cols: n === 1 ? cols : j === n - 1 ? 12 - j * span : span, rows: h }, n === 1 ? (p.align ?? align) : 'left');
				col += cols;
			});
			row += h + gap;
		});

		// The texture under everything, the logo, the foot.
		if (opts.texture) blocks.unshift({ id: 'texture', type: 'ascii', at: { col: 0, row: 0, cols: 12, rows: R } }), (options['texture.density'] = 1);
		if (swoosh) {
			const lh = W * (1100 / 2160);
			blocks.splice(opts.texture ? 1 : 0, 0, { id: 'light', type: 'light', at: { col: 0, row: 0, cols: 12, rows: Math.min(R, rowsFor(lh / u)) } });
			options['light.geometry'] = JSON.stringify({ W0: W, H0: H, art: 'ad-swoosh', box: [0, 0, W, lh] });
		}
		blocks.push({ id: 'logo', type: 'logo', at: { col: 0, row: logoFoot ? R - 1 : 0, cols: Math.max(2, Math.round((230 * u) / (cell0.w + g))), rows: 1 } });
		if (foot) {
			const p = foot.parts[0]!;
			const right = logoFoot || p.align === 'right';
			const center = !logoFoot && (p.align === 'center' || align === 'center');
			place(p, { col: right ? 8 : center ? 4 : 0, row: R - 1, cols: 4, rows: 1 }, right ? 'right' : center ? 'center' : 'left');
		}
		if (blocks.filter((x) => !['ascii', 'light', 'logo'].includes(x.type)).length === 0) return undefined;
		return { id, name, grid, blocks, copy, options, pictures, draws: [...draws], asked };

		function widthOf(p: Part): number {
			switch (p.kind) {
				case 'headline': return wide ? 8 : align === 'center' ? 11 : 10;
				case 'body': return wide ? 7 : align === 'center' ? 9 : 8;
				case 'eyebrow': return 6;
				case 'stat': return 6;
				case 'quote': return 11;
				case 'list': return 8;
				case 'card': return wide ? 6 : 8;
				case 'button': return 4;
				default: return 12;
			}
		}

		function place(p: Part, at: At, al: 'left' | 'center' | 'right') {
			if (p.count === -1 && column) {
				// The left column: the words one under another.
				let r = at.row + Math.max(0, Math.floor((at.rows - colHeight) / 2));
				for (const c of column) {
					const h = heightOf(c, 6);
					place(c, { col: 0, row: r, cols: 6, rows: h }, 'left');
					r += h;
				}
				return;
			}
			const set = (blockId: string, slot: string, field: CopyField, value?: string) => {
				const v = value ?? b.copy[field];
				if (!v?.trim()) return false;
				copy[`${blockId}.${slot}`] = v.trim();
				draws.add(field);
				return true;
			};
			const align = (blockId: string) => {
				if (al !== 'left') options[`${blockId}.align`] = al;
			};
			switch (p.kind) {
				case 'eyebrow': { const id = idFor('eyebrow'); if (set(id, 'text', 'label')) { blocks.push({ id, type: 'eyebrow', at }); align(id); } break; }
				case 'headline': {
					const id = idFor('headline');
					if (!set(id, 'text', 'headline')) break;
					blocks.push({ id, type: 'headline', at });
					options[`${id}.size`] = Math.round((wide ? 48 : 56) * (p.big ? 1.3 : p.small ? 0.8 : 1) * u);
					align(id);
					break;
				}
				case 'body': { const id = idFor('body'); if (set(id, 'text', 'supporting')) { blocks.push({ id, type: 'body', at }); options[`${id}.size`] = Math.round(24 * u); align(id); } break; }
				case 'stat': {
					const id = idFor('stat');
					const [value, ...label] = (b.copy.stat ?? '').split('|');
					if (!value?.trim()) break;
					copy[`${id}.value`] = value.trim();
					if (label.join('|').trim()) copy[`${id}.label`] = label.join('|').trim();
					draws.add('stat');
					blocks.push({ id, type: 'stat', at });
					align(id);
					break;
				}
				case 'quote': {
					const id = idFor('quote');
					if (!set(id, 'text', 'quote')) break;
					set(id, 'name', 'name');
					set(id, 'role', 'role');
					blocks.push({ id, type: 'quote', at });
					align(id);
					break;
				}
				case 'search': {
					const id = idFor('search');
					if (!set(id, 'text', 'search')) break;
					if (opts.light) {
						// The pale band behind the bar, edge to edge, as the feed ads set it.
						const lid = idFor('light');
						blocks.push({ id: lid, type: 'light', at: { ...at, col: 0, cols: 12 } });
						options[`${lid}.variant`] = 'ad-band';
					}
					const sr = Math.min(at.rows, rowsFor(88));
					const mid = at.row + Math.floor((at.rows - sr) / 2);
					blocks.push({ id, type: 'search', at: { col: 0, row: mid, cols: 12, rows: sr } });
					options[`${id}.key`] = 'Search';
					break;
				}
				case 'card': {
					const id = idFor('card');
					let any = set(id, 'title', 'plan');
					any = set(id, 'text', 'offer') || any;
					if (b.copy.features?.trim()) any = set(id, 'items', 'features', b.copy.features.split('|').map((s) => s.trim()).filter(Boolean).join('|')) || any;
					any = set(id, 'cta', 'cta') || any;
					if (any) blocks.push({ id, type: 'card', at });
					break;
				}
				case 'list': { const id = idFor('list'); if (b.copy.features?.trim() && set(id, 'items', 'features', b.copy.features.split('|').map((s) => s.trim()).filter(Boolean).join('|'))) { blocks.push({ id, type: 'list', at }); align(id); } break; }
				case 'pictures': {
					const n = Math.max(1, Math.min(p.count ?? images.length, images.length, 4));
					if (!images.length) break;
					const each = Math.floor((at.cols + 1) / n);
					for (let i = 0; i < n; i++) {
						const id = idFor('picture');
						pictures[id] = images[i]!;
						blocks.push({ id, type: 'picture', at: { col: at.col + i * each, row: at.row, cols: i === n - 1 ? at.cols - i * each : each - (n > 1 ? 0 : 0), rows: at.rows } });
						options[`${id}.treatment`] = 'rounded';
					}
					images = images.slice(n);
					break;
				}
				case 'button': { const id = idFor('button'); if (set(id, 'text', 'cta')) { blocks.push({ id, type: 'button', at }); align(id); if (at.row === R - 1) options[`${id}.valign`] = 'bottom'; } break; }
				default: break;
			}
		}
	}
}
