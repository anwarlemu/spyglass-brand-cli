import { capHeight, descent, measure } from '../image/text.js';
import type { Face } from '../image/fonts.js';
import type { LayerEdit } from '../design/types.js';
import { checkGlyphs, clean, faceFor, FitError, linesAt, longestPrefix, tooLong, type Faces4 } from './type.js';
import type { Box, StackItem, StackLayer } from './scene.js';

// A stack of copy, laid out: every item measured with the real faces, missing items left out, the whole stepping down
// together (to each item's floor) until it fits its box. The result is what the scene draws and reports.

export type PlacedText = { kind: 'text'; id: string; slot?: string; asked: string; face: Face; size: number; leading: number; min: number; tracking: number; caps: boolean; lines: { text: string; x: number; baseline: number; w: number }[]; box: Box; color?: string; opacity?: number; over: string[]; pinned: boolean; required?: boolean; listStart?: boolean };
export type PlacedKey = { kind: 'key'; id: string; slot?: string; box: Box; fill?: string; color?: string; radius?: number; label?: PlacedText; over: string[]; required?: boolean };
export type PlacedPanel = { kind: 'panel'; id: string; box: Box; fill: string; radius?: number; over: string[]; required?: boolean };
export type Placed = PlacedText | PlacedKey | PlacedPanel;

export type StackContext = { all: Faces4; slots: Record<string, string>; edits: Record<string, LayerEdit>; unit: number; floor: number; canvas: [number, number] };

export const itemId = (i: StackItem): string => i.id ?? ('slot' in i && i.slot ? i.slot : i.type);
const valueOf = (ctx: StackContext, i: { slot?: string; text?: string }) => clean((i.slot ? ctx.slots[i.slot] : undefined) ?? i.text ?? '');

/** The smallest size an item may step to: its own floor, else half its size for headlines and five sixths for text,
 * never under what reads at the width the image is shown at. */
export function floorOf(item: { face: string; size: number; min?: number }, unit: number, floor = 0): number {
	if (item.min !== undefined) return Math.max(floor, Math.min(item.size, item.min));
	if (item.face === 'display') return Math.max(floor, Math.min(item.size, Math.max(item.size * 0.5, 22 * unit, 16)));
	if (item.face === 'label') return Math.max(floor, item.size);
	return Math.max(floor, Math.min(item.size, Math.max(item.size * 0.8, 17 * unit, 14)));
}

type Measured = { item: StackItem; id: string; top: number; h: number; text?: { lines: string[]; size: number; leading: number; min: number; face: Face; tracking: number; caps: boolean; value: string; pinned: boolean }[]; offsets?: number[]; children?: Measured[]; w?: number; label?: Measured['text'] extends (infer T)[] | undefined ? T : never };

type Try = { s: number; pins: Map<string, number>; loose: boolean };

/** Items with something to draw, in order. */
function present(ctx: StackContext, items: StackItem[]): StackItem[] {
	return items.filter((i) => {
		if (ctx.edits[itemId(i)]?.hidden) return false;
		if (i.type === 'card') return present(ctx, i.items).length > 0;
		return valueOf(ctx, i) !== '';
	});
}

function textSet(ctx: StackContext, i: Extract<StackItem, { face: unknown }>, value: string, w: number, t: Try) {
	const face = faceFor(ctx.all, i.face);
	const caps = i.caps ?? i.face === 'label';
	const tracking = i.tracking ?? (i.face === 'label' ? 0.06 : 0);
	const v = caps ? value.toUpperCase() : value;
	checkGlyphs(face, v, i.slot);
	const min = floorOf(i, ctx.unit, ctx.floor);
	const pin = t.pins.get(itemId(i));
	const size = pin ?? Math.max(min, i.size * t.s);
	// An item's own measure is how it is set when it fits; copy that has to step down takes the whole width first.
	const own = i.w && t.s === 1 && !t.loose ? Math.min(i.w, w) : w;
	const lines = linesAt(face, v, size, own, tracking);
	return { lines, size, leading: i.leading * (size / i.size), min, face, tracking, caps, value: v, pinned: pin !== undefined };
}

/** One pass at a step: undefined when a line is too wide or an item takes more lines than it may. */
function measureItems(ctx: StackContext, items: StackItem[], w: number, t: Try): { list: Measured[]; h: number } | undefined {
	const list: Measured[] = [];
	const gs = Math.max(0.55, t.s);
	let y = 0;
	let first = true;
	for (const item of items) {
		const gap = first ? 0 : (item.gap ?? 0) * gs;
		const top = y + gap;
		if (item.type === 'card') {
			const kids = present(ctx, item.items);
			const inner = measureItems(ctx, kids, Math.min(item.w, w) - 2 * item.pad, t);
			if (!inner) return undefined;
			const h = (item.padTop ?? item.pad) + inner.h + (item.padBottom ?? item.pad);
			list.push({ item, id: itemId(item), top, h, children: inner.list, w: Math.min(item.w, w) });
			y = top + h;
		} else if (item.type === 'button') {
			const size = item.size;
			const label = valueOf(ctx, item);
			const face = ctx.all.medium;
			checkGlyphs(face, label, item.slot);
			const scale = t.pins.get(itemId(item)) ?? 1;
			const lw = measure(face, label, size * scale, 0);
			const bw = Math.max(Math.min(item.w * scale, w), lw + 2 * padOf(item.h) * scale);
			if (bw > w + 0.5) return undefined;
			list.push({ item, id: itemId(item), top, h: item.h * scale, w: bw });
			y = top + item.h * scale;
		} else if (item.type === 'list') {
			const parts = valueOf(ctx, item).split('|').map((x) => x.trim()).filter(Boolean);
			let ly = top;
			const text: NonNullable<Measured['text']> = [];
			const offsets: number[] = [];
			for (const [k, p] of parts.entries()) {
				const set = textSet(ctx, item, p, w, t);
				if (!set.lines || set.lines.length > allowed(item.maxLines ?? 3, t)) return undefined;
				if (k) ly += item.itemGap * gs;
				offsets.push(ly - top);
				text.push({ ...set, lines: set.lines });
				ly += capHeight(set.face, set.size) + (set.lines.length - 1) * set.leading;
			}
			list.push({ item, id: itemId(item), top, h: ly - top, text, offsets });
			y = ly;
		} else {
			const set = textSet(ctx, item, valueOf(ctx, item), w, t);
			if (!set.lines || set.lines.length > allowed(item.maxLines ?? 99, t)) return undefined;
			const h = capHeight(set.face, set.size) + (set.lines.length - 1) * set.leading;
			list.push({ item, id: itemId(item), top, h, text: [{ ...set, lines: set.lines }] });
			y = top + h;
		}
		first = false;
	}
	return { list, h: y };
}

const allowed = (max: number, t: Try) => (t.loose ? 99 : Math.ceil(max / t.s - 0.001));

function tail(list: Measured[]): number {
	const last = list[list.length - 1];
	const t = last?.text?.[last.text.length - 1];
	return t && !t.caps ? descent(t.face, t.size) : 0;
}

export function layoutStack(ctx: StackContext, stack: StackLayer, box: Box): Placed[] {
	const items = present(ctx, stack.items);
	if (!items.length) return [];
	const flat = flatten(items);
	const edits = ctx.edits;
	const widths = stack.grow && stack.grow > box[2] ? [box[2], stack.grow] : [box[2]];
	const fits = (r: { list: Measured[]; h: number } | undefined) => r && r.h <= box[3] + 0.5 && r.h + tail(r.list) <= box[3] + Math.max(0.5, tail(r.list));
	const search = (pins: Map<string, number>, loose: boolean, only?: StackItem[]) => {
		for (let s = 1; s > 0.28; s = Math.round((s - 0.02) * 100) / 100) {
			for (const w of widths) {
				const r = measureItems(ctx, only ?? items, w, { s, pins, loose });
				if (r && fits(r)) return { ...r, w, s };
			}
		}
		return undefined;
	};
	const plain = search(new Map(), false) ?? search(new Map(), true);
	if (!plain) throw stackError(ctx, items, flat, widths[widths.length - 1]!, box[3]);

	// A scaled item is set at its own size times the edit, and everything else fits around it.
	const pins = new Map<string, number>();
	const sizes = new Map<string, number>();
	const walk = (l: Measured[]) => l.forEach((m) => (m.children ? walk(m.children) : sizes.set(m.id, m.text ? Math.min(...m.text.map((x) => x.size)) : 1)));
	walk(plain.list);
	for (const m of flat) {
		const id = itemId(m);
		const k = edits[id]?.scale;
		if (k !== undefined && k !== 1 && m.type !== 'card') pins.set(id, (sizes.get(id) ?? 1) * k);
	}
	let got: typeof plain | undefined = plain;
	if (pins.size) {
		got = search(pins, true);
		if (!got) {
			for (const [id, size] of pins) {
				const base = sizes.get(id) ?? 1;
				let best = 1;
				for (let k = 1; k <= size / base + 0.001; k = Math.round((k + 0.02) * 100) / 100) {
					const p = new Map(pins);
					p.set(id, base * k);
					if (search(p, true)) best = k;
				}
				throw new FitError(`The ${id} does not fit at ${edits[id]!.scale}x: up to ${best}x fits here. Shorten the copy, hide another layer, or use a size with more room.`, id, { layer: id, max: best });
			}
		}
	}
	const r = got!;
	// A grown measure widens away from the side the copy is set on.
	const align = stack.align ?? 'left';
	const bw = r.w;
	const bx = align === 'right' ? box[0] + box[2] - bw : align === 'center' ? box[0] + (box[2] - bw) / 2 : box[0];
	const valign = stack.valign ?? 'top';
	let y: number;
	if (valign === 'center') y = (stack.prefer ?? box[1] + box[3] / 2) - r.h / 2;
	else if (valign === 'bottom') y = (stack.prefer ?? box[1] + box[3]) - r.h;
	else y = stack.prefer ?? box[1];
	y = Math.max(box[1], Math.min(y, box[1] + box[3] - r.h));

	const out: Placed[] = [];
	place(ctx, r.list, bx, y, bw, align, [], out, leadAlign(ctx, items));
	return out;
}

/** The alignment edit on the first text: what follows it takes the same, unless it has its own. */
function leadAlign(ctx: StackContext, items: StackItem[]) {
	for (const i of flatten(items)) if (i.type !== 'card') return ctx.edits[itemId(i)]?.align;
	return undefined;
}

function flatten(items: StackItem[]): StackItem[] {
	return items.flatMap((i) => (i.type === 'card' ? [i, ...flatten(i.items)] : [i]));
}

function place(ctx: StackContext, list: Measured[], x: number, y0: number, w: number, align: 'left' | 'center' | 'right', over: string[], out: Placed[], lead?: 'left' | 'center' | 'right') {
	const [W, H] = ctx.canvas;
	for (const m of list) {
		const e = ctx.edits[m.id] ?? {};
		const dx = (e.dx ?? 0) * W;
		const dy = (e.dy ?? 0) * H;
		const a = e.align ?? lead ?? ('align' in m.item ? m.item.align : undefined) ?? align;
		const top = y0 + m.top + dy;
		const at = (bw: number) => (a === 'left' ? x : a === 'right' ? x + w - bw : x + (w - bw) / 2) + dx;
		if (m.item.type === 'card') {
			const k = e.scale ?? 1;
			const box: Box = [at(m.w!), top, m.w! * k, m.h];
			out.push({ kind: 'panel', id: m.id, box, fill: m.item.fill, radius: m.item.radius, over, required: m.item.required });
			place(ctx, m.children!, box[0] + m.item.pad, top + (m.item.padTop ?? m.item.pad), m.w! - 2 * m.item.pad, m.item.align ?? 'left', [...over, m.id, 'light', 'light-2'], out, undefined);
		} else if (m.item.type === 'button') {
			const i = m.item;
			const box: Box = [at(m.w!), top, m.w!, m.h];
			out.push(keyOf(ctx, { id: m.id, slot: i.slot, value: valueOf(ctx, i), size: i.size * (m.h / i.h), box, fill: i.fill, color: i.color, radius: i.radius, over, required: i.required }));
		} else {
			const i = m.item;
			for (const [k, t] of m.text!.entries()) {
				const tw = w;
				const tx = a === 'left' ? x : a === 'right' ? x + w - tw : x + (w - tw) / 2;
				out.push(textOf({ id: m.id, slot: i.slot, asked: i.type === 'list' ? valueOf(ctx, i).split('|').map((p) => p.trim()).filter(Boolean)[k]! : valueOf(ctx, i), face: t.face, size: t.size, leading: t.leading, min: t.min, tracking: t.tracking, caps: t.caps, lines: t.lines, x: tx + dx, top: top + (m.offsets?.[k] ?? 0), w: tw, align: a, color: i.color, opacity: i.opacity, over, pinned: t.pinned, required: i.required, listStart: k === 0 }));
			}
		}
	}
}

export function textOf(o: { id: string; slot?: string; asked: string; face: Face; size: number; leading: number; min: number; tracking: number; caps: boolean; lines: string[]; x: number; top: number; w: number; align: 'left' | 'center' | 'right'; color?: string; opacity?: number; over: string[]; pinned?: boolean; required?: boolean; listStart?: boolean }): PlacedText {
	const cap = capHeight(o.face, o.size);
	const lines = o.lines.map((text, i) => {
		const w = measure(o.face, text, o.size, o.tracking);
		const x = o.align === 'center' ? o.x + (o.w - w) / 2 : o.align === 'right' ? o.x + o.w - w : o.x;
		return { text, x, baseline: o.top + cap + i * o.leading, w };
	});
	const left = Math.min(...lines.map((l) => l.x));
	const right = Math.max(...lines.map((l) => l.x + l.w));
	const h = cap + (lines.length - 1) * o.leading + (o.caps ? 0 : descent(o.face, o.size));
	return { kind: 'text', id: o.id, slot: o.slot, asked: o.asked, face: o.face, size: o.size, leading: o.leading, min: o.min, tracking: o.tracking, caps: o.caps, lines, box: [left, o.top, right - left, h], color: o.color, opacity: o.opacity, over: o.over, pinned: o.pinned ?? false, required: o.required, listStart: o.listStart };
}

/** A button's side padding: the site's large button (56px) has 32, its others 40 percent of their height. */
export function padOf(h: number): number {
	return h >= 48 ? (h * 4) / 7 : Math.max(12, h * 0.4);
}

export function keyOf(ctx: StackContext, o: { id: string; slot?: string; value: string; size: number; box: Box; fill?: string; color?: string; radius?: number; over: string[]; required?: boolean }): PlacedKey {
	const face = ctx.all.medium;
	const cap = capHeight(face, o.size);
	const [x, y, w, h] = o.box;
	const label = o.value ? textOf({ id: o.id, slot: o.slot, asked: o.value, face, size: o.size, leading: o.size * 1.3, min: o.size, tracking: 0, caps: false, lines: [o.value], x, w, top: y + (h - cap) / 2, align: 'center', color: o.color ?? 'black', over: [o.id] }) : undefined;
	return { kind: 'key', id: o.id, slot: o.slot, box: o.box, fill: o.fill, color: o.color, radius: o.radius, label, over: o.over, required: o.required };
}

function stackError(ctx: StackContext, items: StackItem[], flat: StackItem[], w: number, h: number): FitError {
	// The longest copy is the one to shorten: how much of it fits with the rest as it is.
	const texts = flat.filter((i): i is Extract<StackItem, { face: unknown }> => i.type === 'text' || i.type === 'list');
	const value = (i: { slot?: string; text?: string }) => valueOf(ctx, i);
	// A word or a button label wider than the layout, first.
	for (const i of texts) {
		const face = faceFor(ctx.all, i.face);
		const min = floorOf(i, ctx.unit, ctx.floor);
		const tracking = i.tracking ?? (i.face === 'label' ? 0.06 : 0);
		const v = (i.caps ?? i.face === 'label') ? value(i).toUpperCase() : value(i);
		const longest = v.split(/[\s|]+/).reduce((a, b) => (measure(face, b, min, tracking) > measure(face, a, min, tracking) ? b : a), '');
		const room = w;
		if (measure(face, longest, min, tracking) > room) return tooLong(i.slot, longest, 0, `${Math.round(room)}px wide, at ${Math.round(min)}px, the smallest readable size`);
	}
	for (const i of flat) {
		if (i.type !== 'button') continue;
		const bw = measure(ctx.all.medium, value(i), i.size, 0) + 2 * padOf(i.h);
		if (bw > w) return tooLong(i.slot, value(i), longestPrefix(value(i), (t) => measure(ctx.all.medium, t, i.size, 0) + 2 * padOf(i.h) <= w), 'one line inside the button');
	}
	const worst = texts.reduce((a, b) => (value(b).length * b.size > value(a).length * a.size ? b : a), texts[0]!);
	if (!worst) return new FitError('The copy does not fit this layout.');
	const fits = longestPrefix(value(worst), (t) => {
		const slots = { ...ctx.slots, [worst.slot ?? '']: t };
		const c = { ...ctx, slots };
		for (let s = 1; s > 0.28; s -= 0.04) {
			const r = measureItems(c, items, w, { s, pins: new Map(), loose: true });
			if (r && r.h <= h + 0.5) return true;
		}
		return false;
	});
	if (fits === 0) return new FitError(`The copy is too long for this layout: ${flat.filter((i) => i.type !== 'card').map((i) => itemId(i)).join(', ')} do not fit together at their smallest readable sizes. Shorten the ${worst.slot ?? 'longest'}, or leave one out.`, worst.slot);
	return tooLong(worst.slot, value(worst), fits, `${Math.round(floorOf(worst, ctx.unit, ctx.floor))}px is the smallest readable size here`);
}
