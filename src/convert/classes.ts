import { scales } from '../lib/brand.js';
import { type Color, type Use, TW_FAMILIES, brandColor, classify, elements, hoverRole, paletteColor, parseColor, roleFor } from './color.js';

// Tailwind classes, converted by role: palette and arbitrary colors to the brand's color utilities, type sizes to its
// steps, radii to its square controls and containers, shadows to a hairline, motion to its durations and easings.
// Classes already on the brand (and layout, spacing on the scale, anything unknown) are kept as they are.

export type Change = { from: string; to: string };
export type ClassContext = {
	/** The element's tag (button, input, h1...), when known. */
	tag?: string;
	/** Tailwind merge is in the app: sizes go as text-[length:var(...)] so it does not drop them as colors. */
	merge?: boolean;
	changes?: Change[];
};

export type Parsed = { raw: string; prefix: string; important: string; utility: string; variants: string[] };

/** Splits `md:hover:!bg-blue-500/50` into its variants and utility, minding brackets in arbitrary variants. */
export function parseClass(raw: string): Parsed {
	const variants: string[] = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < raw.length; i++) {
		const c = raw[i];
		if (c === '[' || c === '(') depth++;
		else if (c === ']' || c === ')') depth--;
		else if (c === ':' && depth === 0) {
			variants.push(raw.slice(start, i));
			start = i + 1;
		}
	}
	let utility = raw.slice(start);
	let important = '';
	if (utility.startsWith('!')) {
		important = '!';
		utility = utility.slice(1);
	} else if (utility.endsWith('!')) {
		important = '!';
		utility = utility.slice(0, -1);
	}
	const prefix = variants.map((v) => `${v}:`).join('');
	return { raw, prefix, important, utility, variants };
}

const join = (p: Parsed, utility: string) => (utility ? `${p.prefix}${p.important}${utility}` : '');

const COLOR_UTIL = /^(bg|text|border(?:-[xytrblse])?|divide|ring(?:-offset)?|outline|fill|stroke|from|via|to|decoration|placeholder|caret|accent|shadow)-(.+)$/;
const TEXT_SIZE = new Set(Object.keys(elements().text.tailwind));
let brandText: Set<string> | undefined;
const BRAND_TEXT = () => (brandText ??= new Set(scales().text.map(([n]) => n.slice('--ds-text-'.length))));
const ALIGN = /^(left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip|shadow.*)$/;

/** The color a color utility's value names, if any. `transparent` and `current` are colors with no role. */
export function colorOf(value: string): Color | 'none' | undefined {
	const [name, alphaRaw] = value.startsWith('[') ? [value, undefined] : value.split('/');
	const alpha = alphaRaw && /^\d+$/.test(alphaRaw) ? Number(alphaRaw) / 100 : 1;
	if (['transparent', 'current', 'inherit', 'initial'].includes(name)) return 'none';
	if (name === 'white') return { family: 'neutral', l: 1, alpha };
	if (name === 'black') return { family: 'neutral', l: 0, alpha };
	const pal = name.match(new RegExp(`^(${Object.keys(TW_FAMILIES).join('|')})-(50|[1-9]00|950)$`));
	if (pal) return paletteColor(pal[1], pal[2], alpha);
	const arb = name.match(/^\[(?:color:)?(#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch)\([^\]]*\))\](?:\/(\d+))?$/);
	if (arb) {
		const rgba = parseColor(arb[1].replace(/_/g, ' '));
		if (rgba) return classify(rgba);
	}
	const brand = brandColor(name);
	if (brand) return { ...brand, alpha };
	return undefined;
}

/** True when a color utility's value is the app's own written color (palette, white/black, a literal), not a theme name. */
function isRawColor(value: string) {
	const name = value.startsWith('[') ? value : value.split('/')[0];
	if (name === 'white' || name === 'black') return true;
	if (new RegExp(`^(${Object.keys(TW_FAMILIES).join('|')})-(50|[1-9]00|950)$`).test(name)) return true;
	return /^\[(?:color:)?(#|rgba?\(|hsla?\(|oklch\()/.test(name);
}

const useOf = (util: string): Use => (/^(bg|from|via|to)$/.test(util) ? 'bg' : /^(border|divide|ring|outline)/.test(util) ? 'border' : 'text');

export type Group = 'bg' | 'text-color' | 'border-color' | 'border-width' | 'radius' | 'shadow' | 'ring' | 'outline' | 'padding' | 'height' | 'type' | 'motion' | 'state' | 'placeholder' | 'decoration' | 'accent' | 'other';

/** What a class styles, for the kind recipes: they replace only the groups they name. */
export function groupOf(raw: string): Group {
	const p = parseClass(raw);
	const u = p.utility.replace(/^-/, '');
	// A class for children or for a relation (`[&_svg]:size-4`, `*:rounded`, `has-[>svg]:px-3`, `group-hover:`) is not
	// the element's own look.
	if (p.variants.some((v) => /^(\[|\*|has-|in-|group-|peer-|not-)/.test(v))) return 'other';
	// A pseudo-element's look (a dialog's backdrop, a file button, list markers) is not the element's own either.
	if (p.variants.some((v) => /^(backdrop|file|marker|selection|first-letter|first-line|before|after)$/.test(v))) return 'other';
	if (p.variants.includes('disabled')) return 'state';
	if (p.variants.includes('placeholder')) return 'placeholder';
	const c = u.match(COLOR_UTIL);
	if (c) {
		const [, util, value] = c;
		if (util === 'text') {
			if (TEXT_SIZE.has(value) || BRAND_TEXT().has(value) || /^\[(length:|\d|var\(--ds-text)/.test(value)) return 'type';
			if (ALIGN.test(value)) return 'other';
		}
		if (util === 'shadow') return 'shadow';
		if (util.startsWith('ring')) return 'ring';
		if (util === 'outline') return colorOf(value) ? 'outline' : /^(none|hidden|\d|offset|dashed|dotted|solid|double)/.test(value) ? 'outline' : 'outline';
		if (util === 'decoration') return 'decoration';
		if (util === 'accent') return 'accent';
		if (util.startsWith('border') || util === 'divide') {
			if (/^(\d+|\[\d+px\])$/.test(value)) return 'border-width';
			if (/^(solid|dashed|dotted|double|none|hidden|collapse|separate|spacing.*)$/.test(value)) return 'other';
		}
		if (util === 'bg' && /^(gradient|linear|radial|conic|none|cover|contain|center|top|bottom|left|right|no-repeat|repeat|fixed|local|scroll|clip|origin|blend|auto|\[url)/.test(value)) return 'other';
		const col = colorOf(value);
		if (col) return util === 'bg' || util === 'from' || util === 'via' || util === 'to' ? 'bg' : util === 'text' || util === 'fill' || util === 'stroke' || util === 'caret' ? 'text-color' : util.startsWith('border') || util === 'divide' ? 'border-color' : 'other';
		return 'other';
	}
	if (/^border(-[xytrblse])?$/.test(u)) return 'border-width';
	if (/^rounded/.test(u)) return 'radius';
	if (/^(shadow|drop-shadow)/.test(u)) return 'shadow';
	if (/^ring(-\d+|-inset)?$/.test(u) || /^ring-(offset|\[)/.test(u)) return 'ring';
	if (/^outline/.test(u)) return 'outline';
	if (/^p[xytrblse]?-/.test(u)) return 'padding';
	if (/^(h|min-h|size)-/.test(u)) return 'height';
	if (/^(font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono|heading|text|code|\[))|^(leading|tracking)-|^(uppercase|lowercase|capitalize|normal-case)$|^type-/.test(u)) return 'type';
	if (/^(transition|duration|ease|delay)/.test(u)) return 'motion';
	if (/^(underline|no-underline|underline-offset|decoration-)/.test(u)) return 'decoration';
	return 'other';
}

const nearest = (px: number, steps: Record<string, number>) => Object.entries(steps).reduce((best, s) => (Math.abs(s[1] - px) < Math.abs(best[1] - px) ? s : best))[0];

function sizeClass(step: string, ctx: ClassContext) {
	return ctx.merge ? `text-[length:var(--ds-text-${step})]` : `text-${step}`;
}

/** A Tailwind text size (xs, 2xl, [15px]) as px, or undefined. */
export function textPx(value: string): number | undefined {
	const t = elements().text.tailwind[value];
	if (t) return t;
	const m = value.match(/^\[(\d*\.?\d+)(px|rem)\]$/);
	return m ? Number(m[1]) * (m[2] === 'rem' ? 16 : 1) : undefined;
}

const INTERACTIVE = /^(button|input|select|textarea|a|router-link|routerlink|nuxt-link|nuxtlink|summary|label|option)$/i;

const durationSteps = () => scales().durations.map(([, ms]) => ms).filter((ms) => ms > 0);
export const nearestDuration = (ms: number) => durationSteps().reduce((best, s) => (Math.abs(s - ms) < Math.abs(best - ms) ? s : best));

/** One class converted. Returns the replacement (possibly empty, to drop it) or undefined to keep it. */
export function convertClass(raw: string, ctx: ClassContext, list: Parsed[] = []): string | undefined {
	// Template code in a class list (a placeholder for `{{ size }}`) is never a class to convert.
	if (raw.includes('\u0000')) return undefined;
	const p = parseClass(raw);
	const neg = p.utility.startsWith('-') ? '-' : '';
	const u = neg ? p.utility.slice(1) : p.utility;
	const c = u.match(COLOR_UTIL);
	if (c && !neg) {
		const [, util, value] = c;
		if (util === 'text') {
			if (TEXT_SIZE.has(value) || /^\[\d*\.?\d+(px|rem)\]$/.test(value)) {
				const px = textPx(value)!;
				const step = value === 'base' ? elements().text.base : nearest(px, elements().text.steps);
				return join(p, sizeClass(step, ctx).slice(0));
			}
		}
		if (util === 'shadow') return '';
		if (isRawColor(value)) {
			const col = colorOf(value);
			if (!col || col === 'none') return undefined;
			const alphaSuffix = value.startsWith('[') ? (col.alpha < 0.995 ? `/${Math.round(col.alpha * 100)}` : '') : value.includes('/') ? `/${value.split('/')[1]}` : '';
			const use = useOf(util);
			const hovering = p.variants.some((v) => /^(hover|active|group-hover|peer-hover|focus|focus-visible)$/.test(v));
			const role = (use === 'bg' && hovering && hoverRole(col)) || roleFor(col, use);
			// A role with its own alpha (fg-inverse/70) keeps the app's alpha when the app set one.
			const [roleName, roleAlpha] = role.split('/');
			return join(p, `${util}-${roleName}${alphaSuffix || (roleAlpha ? `/${roleAlpha}` : '')}`);
		}
		return undefined;
	}
	if (/^rounded/.test(u)) {
		const m = u.match(/^rounded(-[trblse]{1,2})?(?:-(none|full|xs|sm|md|lg|xl|2xl|3xl|4xl|\[[^\]]+\]|control|container))?$/);
		if (!m) return undefined;
		const [, side = '', size] = m;
		if (size === 'none' || size === 'full' || size === 'control' || size === 'container') return undefined;
		if (size?.startsWith('[') && /9999|50%|100%/.test(size)) return join(p, `rounded${side}-full`);
		return join(p, `rounded${side}-${INTERACTIVE.test(ctx.tag ?? '') ? 'control' : 'container'}`);
	}
	if (/^shadow(-(2xs|xs|sm|md|lg|xl|2xl|inner|\[.*\]))?$/.test(u)) return '';
	if (/^(transition|transition-all)$/.test(u)) {
		const moves = list.some((x) => /^-?(scale|translate|rotate|skew|transform)/.test(x.utility));
		const fades = list.some((x) => /^opacity-/.test(x.utility));
		return join(p, moves || fades ? `transition-[color,background-color,border-color${fades ? ',opacity' : ''}${moves ? ',transform,translate,scale,rotate' : ''}]` : 'transition-colors');
	}
	const dur = u.match(/^duration-(?:(\d+)|\[(\d*\.?\d+)(ms|s)\])$/);
	if (dur) {
		const ms = dur[1] ? Number(dur[1]) : Number(dur[2]) * (dur[3] === 's' ? 1000 : 1);
		if (ms === 0 || durationSteps().includes(ms)) return dur[1] ? undefined : join(p, `duration-${ms}`);
		return join(p, `duration-${nearestDuration(ms)}`);
	}
	if (u === 'ease-in') return join(p, 'ease-out');
	if (/^ease-\[/.test(u)) return join(p, 'ease-standard');
	if (/^font-(semibold|bold|extrabold|black)$/.test(u)) return join(p, 'font-medium');
	if (/^font-\[/.test(u) && !/var\(--ds-/.test(u)) return join(p, 'font-text');
	if (u === 'uppercase') return '';
	// Arbitrary spacing and leading back on the 4px grid (an even pixel value).
	const sp = u.match(/^(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|leading|top|right|bottom|left|inset(?:-[xy])?)-\[(-?\d*\.?\d+)(px|rem)\]$/);
	if (sp) {
		const px = Number(sp[2]) * (sp[3] === 'rem' ? 16 : 1);
		const even = Math.round(px / 2) * 2;
		return join(p, `${neg}${sp[1]}-${even / 4}`);
	}
	const tr = u.match(/^tracking-\[(-?)[\d.]+(em|px|rem)\]$/);
	if (tr) return join(p, tr[1] ? 'tracking-tight' : 'tracking-wide');
	const rad = u.match(/^text-\[(\d*\.?\d+)(px|rem)\]$/);
	if (rad) return join(p, sizeClass(nearest(Number(rad[1]) * (rad[2] === 'rem' ? 16 : 1), elements().text.steps), ctx));
	return undefined;
}

/** A class list converted; keeps spacing between classes as written. */
export function convertClassList(text: string, ctx: ClassContext): string {
	const tokens = [...text.matchAll(/\S+/g)];
	if (!tokens.length) return text;
	const parsed = tokens.map((t) => parseClass(t[0]));
	let out = '';
	let last = 0;
	let droppedShadow = false;
	for (let i = 0; i < tokens.length; i++) {
		const t = tokens[i];
		const at = t.index ?? 0;
		const sep = text.slice(last, at);
		const next = convertClass(t[0], ctx, parsed);
		last = at + t[0].length;
		if (next === undefined) {
			out += sep + t[0];
			continue;
		}
		ctx.changes?.push({ from: t[0], to: next });
		if (next === '' && /^shadow/.test(parsed[i].utility) && !parsed[i].prefix) droppedShadow = true;
		if (next === '') out += i === 0 ? sep : '';
		else out += sep + next;
	}
	out += text.slice(last);
	// A shadow set an element apart: the brand does that with a hairline. A ring does not change the layout.
	if (droppedShadow && !parsed.some((x) => !x.prefix && (/^border(-[xytrblse])?(-\d+)?$/.test(x.utility) || /^ring(-\d+)?$/.test(x.utility)))) {
		// On a dark fill the hairline is the dark theme's edge, so it does not draw a light line.
		const dark = parsed.some((x) => !x.prefix && /^bg-/.test(x.utility) && (() => { const c = colorOf(x.utility.slice(3)); return c && c !== 'none' && c.alpha > 0.5 && c.l < 0.45; })());
		const ring = dark ? 'ring-1 ring-fg-soft' : 'ring-1 ring-edge';
		ctx.changes?.push({ from: '(shadow)', to: ring });
		out = `${out.trimEnd()} ${ring}${out.match(/\s*$/)?.[0] ?? ''}`;
	}
	return tidy(out, text);
}

/** Collapses the gaps a removed class left, keeping the list's own leading and trailing space. */
function tidy(out: string, original: string) {
	const lead = original.match(/^\s*/)?.[0] ?? '';
	const trail = original.match(/\s*$/)?.[0] ?? '';
	const core = out.trim().replace(/[ \t]{2,}/g, ' ');
	if (original.includes('\n')) return lead + out.trim().replace(/[ \t]{2,}/g, ' ') + trail;
	return lead + core + trail;
}
