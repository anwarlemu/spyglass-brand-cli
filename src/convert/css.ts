import { scales, tokens } from '../lib/brand.js';
import { type Change, convertClassList, nearestDuration } from './classes.js';
import { type Use, classify, cssRole, elements, hoverRole, parseColor, roleFor } from './color.js';

// CSS converted by role, in place: stylesheets, <style> blocks and style attributes. Only values change; selectors,
// comments, order and formatting are kept.

export type CssContext = { changes?: Change[]; selector?: string; merge?: boolean; plain?: boolean };

const COLOR = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\([^()]*\)|(?<![\w-])(?:white|black)(?![\w-])/g;
const DARK = /\.dark\b|\[data-(?:theme|mode)\s*=\s*["']?dark|prefers-color-scheme\s*:\s*dark/i;

const useOf = (prop: string): Use | undefined =>
	/^(background|background-color|background-image)$/.test(prop) ? 'bg' : /^(color|fill|stroke|caret-color|text-decoration-color|accent-color|-webkit-text-fill-color)$/.test(prop) ? 'text' : /^(border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|column-rule(-color)?)$/.test(prop) ? 'border' : undefined;

/** A custom property's role from its name: --text-muted is text, --border is a border, --bg-card a background. */
const useOfName = (name: string): Use => (/(text|fg|foreground|ink|font|heading|copy|link)/i.test(name) ? 'text' : /(border|line|divider|edge|outline|stroke|rule|ring|input)/i.test(name) ? 'border' : 'bg');

const steps = () => elements().text.steps;
const nearest = (px: number, table: Record<string, number>) => Object.entries(table).reduce((b, s) => (Math.abs(s[1] - px) < Math.abs(b[1] - px) ? s : b))[0];
const toPx = (n: string, unit: string) => Number(n) * (unit === 'rem' || unit === 'em' ? 16 : 1);

/** The dark value of a role as a primitive (a .dark block of a theme points at fixed values). */
function darkPrimitive(role: string) {
	const t = tokens()[`--ds-color-${role}`];
	if (!t) return `var(--ds-color-${role})`;
	const hex = t.dark.toUpperCase();
	const prim = Object.entries(tokens()).find(([n, v]) => n.startsWith('--ds-color-') && v.value.toUpperCase() === hex);
	return prim ? `var(${prim[0]})` : `var(--ds-color-${role})`;
}

function convertColors(value: string, use: Use, hover: boolean, record: (from: string, to: string) => void) {
	return value.replace(COLOR, (m) => {
		const rgba = parseColor(m);
		if (!rgba || rgba[3] === 0) return m;
		const c = classify(rgba);
		const role = (use === 'bg' && hover && hoverRole(c)) || roleFor(c, use);
		const to = cssRole(role, c.alpha);
		record(m, to);
		return to;
	});
}

function convertDurations(value: string, record: (from: string, to: string) => void) {
	// The first time in each comma-separated part is its duration; a second is a delay, which stays.
	return value
		.split(',')
		.map((part) => {
			let seen = false;
			return part.replace(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g, (m, n: string, unit: string) => {
				if (seen) return m;
				seen = true;
				const ms = Number(n) * (unit === 's' ? 1000 : 1);
				if (ms === 0) return m;
				const step = nearestDuration(ms);
				const name = scales().durations.find(([, v]) => v === step)?.[0];
				if (!name) return m;
				record(m, `var(${name})`);
				return `var(${name})`;
			});
		})
		.join(',');
}

/** One declaration's new value, or undefined to keep it. */
export function convertDeclaration(prop: string, value: string, selector: string, record: (from: string, to: string) => void): string | undefined {
	if (/var\(--ds-/.test(value) && !/(#|rgba?\(|hsla?\()/.test(value)) return undefined;
	const p = prop.toLowerCase();
	if (p.startsWith('--')) {
		const name = p.slice(2);
		if (/^(ds|tw)-/.test(name)) return undefined;
		const vars = elements().variables;
		const shadcn = vars[name];
		if (shadcn) {
			if (shadcn.startsWith('--')) return /^(0|0px)$/.test(value.trim()) ? undefined : `var(${shadcn})`;
			const to = DARK.test(selector) ? darkPrimitive(shadcn) : `var(--ds-color-${shadcn})`;
			if (value.trim() === to) return undefined;
			record(value.trim(), to);
			return to;
		}
		if (/^(font|font-family)(-|$)/.test(name) && !/^font-(size|weight)/.test(name) && /[a-z]/i.test(value) && !/^\d/.test(value.trim())) {
			// The name says the role first (--font-heading, --font-mono), then the face.
			const role = /mono|code/.test(name) ? 'code' : /heading|display|serif$|title/.test(name) ? 'heading' : /sans|body|text|base|ui/.test(name) ? 'text' : /mono|code|consol|menlo|courier/i.test(value) ? 'code' : /(^|[\s,"'])serif|georgia|times|playfair|merriweather/i.test(value) && !/sans-serif\s*$/i.test(value.split(',')[0]) ? 'heading' : 'text';
			const to = `var(${elements().fonts[role]})`;
			record(value.trim(), to);
			return to;
		}
		if (/radius/.test(name) && /\d(px|rem)/.test(value)) {
			const to = /9999|999px/.test(value) ? 'var(--ds-radius-full)' : 'var(--ds-radius-control)';
			record(value.trim(), to);
			return to;
		}
		if (/^\s*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\()[^,]*$/.test(value)) {
			const next = convertColors(value, useOfName(name), /hover/.test(name), record);
			return next === value ? undefined : next;
		}
		return undefined;
	}
	const use = useOf(p);
	if (use) {
		const next = convertColors(value, use, /:hover|:active/.test(selector), record);
		return next === value ? undefined : next;
	}
	if (p === 'box-shadow') {
		if (/^(none|inherit|initial|unset|0)$/.test(value.trim())) return undefined;
		record(value.trim(), 'none');
		return 'none';
	}
	if (p === 'font-family') {
		const role = /mono|code|consol|menlo|courier/i.test(value) ? 'code' : (/(^|[\s,"'])serif/i.test(value) && !/^\s*[^,]*sans-serif/i.test(value)) || /^h[1-6]\b|\sh[1-6]\b/.test(selector) && /serif|georgia|times/i.test(value) ? 'heading' : 'text';
		if (/^(inherit|initial|unset)$/.test(value.trim())) return undefined;
		const to = `var(${elements().fonts[role]})`;
		record(value.trim(), to);
		return to;
	}
	if (p === 'font-size') {
		const next = value.replace(/(?<![\w.#-])(\d*\.?\d+)(px|rem)\b/g, (m, n: string, unit: string) => {
			const to = `var(--ds-text-${nearest(toPx(n, unit), steps())})`;
			record(m, to);
			return to;
		});
		return next === value ? undefined : next;
	}
	if (p === 'font-weight' && /^(600|700|800|900|bold|bolder)$/.test(value.trim())) {
		record(value.trim(), 'var(--ds-font-weight-medium)');
		return 'var(--ds-font-weight-medium)';
	}
	if (/^border(-[a-z]+)*-radius$/.test(p)) {
		const kind = /(button|btn|input|select|textarea|field|control|tab|badge|tag|chip|pill)/i.test(selector) ? 'control' : 'container';
		const next = value.replace(/(?<![\w.#-])(\d*\.?\d+)(px|rem|em)\b/g, (m, n: string, unit: string) => {
			if (Number(n) === 0) return m;
			const to = toPx(n, unit) >= 999 ? 'var(--ds-radius-full)' : `var(--ds-radius-${kind})`;
			record(m, to);
			return to;
		});
		return next === value ? undefined : next;
	}
	if (/^(padding|margin|gap|row-gap|column-gap)(-[a-z]+)*$/.test(p)) {
		const next = value.replace(/(?<![\w.#-])(-?\d*\.?\d+)(px|rem)\b/g, (m, n: string, unit: string) => {
			const px = toPx(n, unit);
			if (Math.abs(px) <= 2 || Math.abs(px) % 2 === 0) return m;
			const to = `${Math.round(px / 2) * 2}px`;
			record(m, to);
			return to;
		});
		return next === value ? undefined : next;
	}
	if (/^(transition|transition-property|transition-duration|transition-timing-function|animation|animation-duration|animation-timing-function)$/.test(p)) {
		let next = value;
		if (/infinite/.test(next) && p.startsWith('animation')) return undefined;
		if (p === 'transition-property' && /(?<![\w-])all(?![\w-])/.test(next)) next = next.replace(/(?<![\w-])all(?![\w-])/, 'color, background-color, border-color, opacity, transform');
		if (p === 'transition' && /(?<![\w-])all(?![\w-])/.test(next)) {
			// `all 0.2s ease` becomes the same timing on each property that changes in an interface.
			next = next
				.split(',')
				.flatMap((part) => (/(?<![\w-])all(?![\w-])/.test(part) ? ['color', 'background-color', 'border-color', 'opacity', 'transform'].map((x) => part.replace(/(?<![\w-])all(?![\w-])/, x).trim()) : [part.trim()]))
				.join(', ');
		}
		if (/^(transition|transition-duration|animation|animation-duration)$/.test(p)) next = convertDurations(next, record);
		next = next.replace(/\bease-in\b(?!-)/g, () => {
			record('ease-in', 'var(--ds-easing-out)');
			return 'var(--ds-easing-out)';
		});
		next = next.replace(/cubic-bezier\([^()]*\)/g, (m) => {
			record(m, 'var(--ds-easing-standard)');
			return 'var(--ds-easing-standard)';
		});
		return next === value ? undefined : next;
	}
	return undefined;
}

/** Converts the declarations of a stylesheet (or of a style attribute, with `inline`). */
export function convertCss(css: string, ctx: CssContext = {}, inline = false): string {
	const record = (from: string, to: string) => ctx.changes?.push({ from, to });
	const decls = (seg: string, selector: string, fontFace: boolean, depth = 1): string => {
		if (fontFace || (!inline && depth === 0)) return seg;
		// @apply lists are classes.
		if (/@apply\s/.test(seg)) return seg.split(/(@apply\s[^;{}]*)/).map((part, i) => (i % 2 ? part.replace(/^(@apply\s+)([\s\S]*)$/, (_, head: string, list: string) => head + convertClassList(list, { changes: ctx.changes, merge: ctx.merge })) : decls(part, selector, fontFace, depth))).join('');
		if (!seg.includes(':')) return seg;
		let addBorder = false;
		const hasBorder = /(^|[;{\s])border(-width|-style)?\s*:/.test(seg);
		let out = seg.replace(/(^|[;{\s])(--[\w-]+|[a-zA-Z-]+)(\s*:\s*)((?:[^;{}"'(]|\([^()]*(?:\([^()]*\)[^()]*)*\)|"[^"]*"|'[^']*')+)/g, (all, lead: string, prop: string, colon: string, value: string) => {
			const trimmed = value.replace(/\s+$/, '');
			const tail = value.slice(trimmed.length);
			const next = convertDeclaration(prop, trimmed.trim(), selector, record);
			if (next === undefined) return all;
			if (prop.toLowerCase() === 'box-shadow' && !hasBorder && !/:(hover|focus|active)/.test(selector) && !inline) addBorder = true;
			const leadWs = trimmed.match(/^\s*/)?.[0] ?? '';
			return `${lead}${prop}${colon}${leadWs}${next}${tail}`;
		});
		if (addBorder) {
			record('(shadow)', 'border hairline');
			const indent = seg.match(/\n([ \t]+)\S/)?.[1] ?? ' ';
			const trimmedOut = out.replace(/\s*$/, '');
			out = `${trimmedOut}${trimmedOut.endsWith(';') ? '' : ';'}${seg.includes('\n') ? `\n${indent}` : ' '}border: var(--ds-border-hairline) solid var(--ds-color-edge);${out.slice(trimmedOut.length)}`;
		}
		return out;
	};
	if (inline) return decls(css, ctx.selector ?? '', false);
	let out = '';
	let segStart = 0;
	const stack: { selector: string; fontFace: boolean }[] = [];
	const top = () => stack[stack.length - 1] ?? { selector: '', fontFace: false };
	for (let i = 0; i < css.length; i++) {
		const ch = css[i];
		if (ch === '/' && css[i + 1] === '*') {
			out += decls(css.slice(segStart, i), top().selector, top().fontFace, stack.length);
			const close = css.indexOf('*/', i + 2);
			const end = close < 0 ? css.length : close + 2;
			out += css.slice(i, end);
			i = end - 1;
			segStart = end;
			continue;
		}
		if (ch === '"' || ch === "'") {
			const close = css.indexOf(ch, i + 1);
			i = close < 0 ? css.length : close;
			continue;
		}
		if (ch === '{') {
			let b = i - 1;
			while (b >= segStart && !';{}'.includes(css[b])) b--;
			out += decls(css.slice(segStart, b + 1), top().selector, top().fontFace, stack.length);
			const prelude = css.slice(b + 1, i);
			out += `${prelude}{`;
			const bare = prelude.replace(/\/\*[\s\S]*?\*\//g, '').trim();
			stack.push({ selector: bare.startsWith('@') ? `${top().selector} ${bare}` : bare, fontFace: /^@font-face\b/.test(bare) });
			segStart = i + 1;
		} else if (ch === '}') {
			out += decls(css.slice(segStart, i), top().selector, top().fontFace, stack.length);
			out += '}';
			stack.pop();
			segStart = i + 1;
		}
	}
	out += decls(css.slice(segStart), top().selector, top().fontFace, stack.length);
	return out;
}

