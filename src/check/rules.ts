import { brand, brandHexes, cli, isToken, scales } from '../lib/brand.js';
import type { SourceFile } from './source.js';

// The value check: every style value comes from the brand. Deterministic, fast, no model. Each finding says what to
// use. Ported from the sibling harness (inkbox-brand-cli/src/check/rules.ts), which is framework-agnostic, and fitted
// to this brand: square controls, no shadows, the console's motion steps.

export type RawFinding = { rule: string; message: string; hint: string; offset: number; length?: number; fix?: { start: number; end: number; text: string } };
type Push = (f: RawFinding) => void;

const COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\([^()]*\)/g;
const NAMED_COLOR = /(?<![\w-])(white|black|red|blue|green|gray|grey|orange|purple|yellow|pink|navy|teal|silver|maroon|olive|aqua|fuchsia|lime)(?![\w-])/gi;
const LENGTH = /(?<![\w.#-])(-?\d*\.?\d+)(px|rem)\b/g;

const hexOf = (raw: string) => {
	const v = raw.trim().toLowerCase();
	const h = v.match(/^#([0-9a-f]{3,8})$/)?.[1];
	if (h && [3, 6].includes(h.length)) return `#${(h.length === 3 ? [...h].map((c) => c + c).join('') : h).toUpperCase()}`;
	const fn = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[,/]\s*(1|1\.0|100%))?\s*\)$/);
	if (fn) return `#${[fn[1], fn[2], fn[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
	return undefined;
};

export type Decl = { prop: string; value: string; offset: number; valueOffset: number; fontFace: boolean; selector: string };

/** The declarations of a stylesheet, with their offsets and the selector they sit under. */
export function declarations(css: string): Decl[] {
	const out: Decl[] = [];
	const stack: { fontFace: boolean; selector: string }[] = [];
	let segStart = 0;
	const flush = (end: number) => {
		const seg = css.slice(segStart, end);
		for (const m of seg.matchAll(/(^|[\s;{])(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;{}]+)/g)) {
			const start = segStart + (m.index ?? 0) + m[1].length;
			const lead = m[3].length - m[3].trimStart().length;
			out.push({ prop: m[2].toLowerCase(), value: m[3].trim(), offset: start, valueOffset: start + m[0].length - m[1].length - m[3].length + lead, fontFace: stack.at(-1)?.fontFace ?? false, selector: stack.at(-1)?.selector ?? '' });
		}
	};
	for (let i = 0; i < css.length; i++) {
		const ch = css[i];
		if (ch === '/' && css[i + 1] === '*') {
			flush(i);
			const close = css.indexOf('*/', i + 2);
			i = close < 0 ? css.length : close + 1;
			segStart = i + 1;
			continue;
		}
		if (ch === '{') {
			let b = i - 1;
			while (b >= segStart && !';{}'.includes(css[b])) b--;
			flush(b + 1);
			const header = css.slice(b + 1, i).trim();
			stack.push({ fontFace: /^@font-face/.test(header), selector: `${stack.at(-1)?.selector ?? ''} ${header.startsWith('@') ? '' : header}`.trim() });
			segStart = i + 1;
		} else if (ch === '}') {
			flush(i);
			stack.pop();
			segStart = i + 1;
		}
	}
	flush(css.length);
	return out;
}

const durationTokens = () => new Map(scales().durations.map(([n, ms]) => [ms, n]));

/** One declaration checked against the brand. */
export function checkDecl(d: Decl, push: Push) {
	if (d.fontFace || d.prop.startsWith('--')) return;
	const at = (i = 0) => d.valueOffset + i;
	// Colors: brand variables only (a color-mix of brand variables is fine).
	for (const m of d.value.matchAll(COLOR)) {
		const hex = hexOf(m[0]);
		const exact = hex && brandHexes().get(hex);
		push({ rule: 'raw-color', message: `Raw color \`${m[0]}\` in \`${d.prop}\``, hint: exact ? `Use var(${exact}).` : `Use a brand color token (\`${cli()} tokens color\`).`, offset: at(m.index), length: m[0].length, fix: exact ? { start: at(m.index), end: at(m.index) + m[0].length, text: `var(${exact})` } : undefined });
	}
	if (/^(color|background|background-color|border|border-color|border-(top|right|bottom|left)(-color)?|outline|outline-color|fill|stroke|text-decoration-color|caret-color|accent-color)$/.test(d.prop))
		for (const m of d.value.matchAll(NAMED_COLOR)) push({ rule: 'raw-color', message: `Named color \`${m[0]}\` in \`${d.prop}\``, hint: 'Use a brand color token.', offset: at(m.index) });
	if (d.prop === 'box-shadow' && !/^(none|inherit|initial|unset)$/.test(d.value)) push({ rule: 'shadow', message: 'A shadow', hint: 'The brand has no shadows: separate with a hairline (var(--ds-color-edge)) or a fill.', offset: at() });
	if (d.prop === 'font-family' && !/var\(--ds-font-|^(inherit|initial|unset)$/.test(d.value)) push({ rule: 'font', message: `Font \`${d.value.slice(0, 40)}\``, hint: 'Use var(--ds-font-text), var(--ds-font-heading) for headings or var(--ds-font-code) for code.', offset: at() });
	if (d.prop === 'font-weight' && !brand().type.bold && /^(600|700|800|900|bold|bolder)$/.test(d.value)) push({ rule: 'font', message: `Weight \`${d.value}\``, hint: 'The console uses 400 and 500 only: var(--ds-font-weight-regular) or var(--ds-font-weight-medium).', offset: at() });
	// Radii and font sizes on the brand scale; spacing on the 2px grid.
	if (/^(font-size|border(-[a-z]+)*-radius)$/.test(d.prop) || /^(padding|margin|gap|row-gap|column-gap)(-[a-z]+)*$/.test(d.prop)) {
		const radius = /radius/.test(d.prop);
		const font = d.prop === 'font-size';
		const scale = new Map((radius ? scales().radius : scales().text).map(([n, v]) => [v, n]));
		for (const m of d.value.matchAll(LENGTH)) {
			const px = Number(m[1]) * (m[2] === 'rem' ? 16 : 1);
			if (radius || font) {
				if (px === 0) continue;
				const exact = scale.get(Math.abs(px));
				push({ rule: 'off-scale', message: `\`${m[0]}\` in \`${d.prop}\``, hint: exact ? `Use var(${exact}).` : `Use a brand step (\`${cli()} tokens ${radius ? 'radius' : 'text'}\`).`, offset: at(m.index), length: m[0].length, fix: exact ? { start: at(m.index), end: at(m.index) + m[0].length, text: `var(${exact})` } : undefined });
			} else if (Math.abs(px) > 2 && Math.abs(px) % 2 !== 0) {
				push({ rule: 'off-scale', message: `\`${m[0]}\` in \`${d.prop}\``, hint: 'Space sits on the 2px grid (4px base): use a --ds-space-* step or an even value.', offset: at(m.index), length: m[0].length });
			}
		}
	}
	if (/^(transition|transition-property|transition-duration|transition-timing-function|animation|animation-duration|animation-timing-function)$/.test(d.prop)) {
		if (/(?<![\w-])all(?![\w-])/.test(d.value) && d.prop.startsWith('transition')) push({ rule: 'motion', message: '`transition: all`', hint: 'Name the properties that change (color, background-color, border-color, opacity, transform).', offset: at() });
		if (/\bease-in\b(?!-)/.test(d.value)) push({ rule: 'motion', message: '`ease-in` easing', hint: 'Use var(--ds-easing-out) or var(--ds-easing-standard): interface motion never eases in.', offset: at() });
		const looping = d.prop.startsWith('animation') && /infinite/.test(d.value);
		const known = durationTokens();
		// The first time in each comma-separated part is its duration; a second is a delay (a stagger), which is free.
		// A duration token counts as the part's duration (0ms here, so it passes); other functions are blanked.
		let masked = d.value.replace(/var\(--ds-duration-[\w-]+\)/g, (s) => `0ms${' '.repeat(s.length - 3)}`).replace(/var\([^()]*\)/g, (s) => ' '.repeat(s.length));
		masked = masked.replace(/(?:calc|cubic-bezier|steps)\([^()]*\)/g, (s) => ' '.repeat(s.length));
		const durationsOnly: RegExpMatchArray[] = [];
		let partStart = 0;
		for (const part of masked.split(',')) {
			const first = [...part.matchAll(/(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g)][0];
			if (first) durationsOnly.push(Object.assign(first, { index: partStart + (first.index ?? 0) }));
			partStart += part.length + 1;
		}
		for (const m of durationsOnly) {
			const ms = Number(m[1]) * (m[2] === 's' ? 1000 : 1);
			if (ms === 0 || looping) continue;
			const exact = known.get(ms);
			push({ rule: 'motion', message: `Duration \`${m[0]}\``, hint: exact ? `Use var(${exact}).` : `Use a --ds-duration-* step (\`${cli()} tokens duration\`): micro 120ms for colour, glide 160ms for small moves, enter 200ms, exit 120ms.`, offset: at(m.index), length: m[0].length, fix: exact ? { start: at(m.index), end: at(m.index) + m[0].length, text: `var(${exact})` } : undefined });
		}
		if (/cubic-bezier\(/.test(d.value)) push({ rule: 'motion', message: 'Custom easing', hint: 'Use var(--ds-easing-out), var(--ds-easing-standard) or var(--ds-easing-swap).', offset: at() });
	}
	for (const m of d.value.matchAll(/var\((--ds-[\w-]+)/g)) if (!isToken(m[1])) push({ rule: 'unknown-token', message: `\`${m[1]}\` is not a brand token`, hint: `Find the right one with \`${cli()} tokens <term>\`.`, offset: at(m.index) });
}

// Tailwind classes: palette colors, arbitrary values, default type sizes, shadows and broad or ease-in motion.
const V = '(?:[\\w-]+:|\\[[^\\]]*\\]:)*!?';
const TW_PALETTE = new RegExp(`^${V}-?(bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|divide|fill|stroke|from|via|to|decoration|placeholder|caret|accent|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|[1-9]00|950)(\\/\\d+)?$`);
const TW_NAMED = new RegExp(`^${V}(bg|text|border|fill|stroke|outline|ring)-(white|black)(\\/\\d+)?$`);
const TW_ARBITRARY_COLOR = new RegExp(`^${V}(bg|text|border(?:-[xytrblse])?|ring|outline|fill|stroke|from|via|to|decoration|divide|shadow)-\\[(#[0-9a-fA-F]{3,8}|rgba?\\([^\\]]*\\)|hsla?\\([^\\]]*\\))\\]`);
const TW_ARBITRARY_SIZE = new RegExp(`^${V}-?(p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|text|rounded(?:-[a-z]+)?|tracking|leading|duration|delay)-\\[(-?\\d*\\.?\\d+(?:px|rem|ms|s|em)?)\\]$`);
const TW_TEXT_DEFAULT = new RegExp(`^${V}text-(xs|sm|base|lg|xl|[2-9]xl)$`);
const TW_WEIGHT = new RegExp(`^${V}font-(semibold|bold|extrabold|black)$`);
const TW_SHADOW = new RegExp(`^${V}shadow(-(2xs|xs|sm|md|lg|xl|2xl|inner))?$`);
const TW_ROUNDED_DEFAULT = new RegExp(`^${V}rounded(-[trblse]{1,2})?(-(xs|sm|md|lg|xl|2xl|3xl|4xl))?$`);
const TW_EASE_IN = new RegExp(`^${V}ease-in$`);
const TW_TRANSITION_ALL = new RegExp(`^${V}transition(-all)?$`);
const TW_DURATION = new RegExp(`^${V}duration-(\\d+)$`);
const TW_UPPERCASE = new RegExp(`^${V}uppercase$`);

export function checkClass(token: string, offset: number, push: Push) {
	const cls = token.replace(/[,'"`]+$/, '');
	const f = (rule: string, message: string, hint: string) => push({ rule, message, hint, offset, length: cls.length });
	if (TW_PALETTE.test(cls) || TW_NAMED.test(cls)) f('raw-color', `Tailwind palette class \`${cls}\``, 'Use a brand class: bg-surface, bg-surface-subtle, text-fg, text-fg-soft, text-fg-muted, border-edge, border-edge-strong, bg-action-primary.');
	else if (TW_ARBITRARY_COLOR.test(cls)) f('raw-color', `Arbitrary color \`${cls}\``, 'Use a brand class or an arbitrary var(--ds-color-...).');
	else if (TW_ARBITRARY_SIZE.test(cls) && !/var\(--ds-/.test(cls)) f('off-scale', `Arbitrary value \`${cls}\``, 'Use the scale (p-2.5, gap-1.5, text-ui, text-meta, duration-120) or an arbitrary var(--ds-...).');
	else if (TW_TEXT_DEFAULT.test(cls)) f('off-scale', `Default text size \`${cls}\``, 'Use the brand type scale: text-caption, text-meta, text-ui, text-body, text-body-lg, text-heading-4 to text-heading-1, text-hero, or a type-* utility.');
	else if (TW_WEIGHT.test(cls) && !brand().type.bold) f('font', `\`${cls}\``, 'The console uses font-normal and font-medium only.');
	else if (TW_SHADOW.test(cls)) f('shadow', `Shadow \`${cls}\``, 'The brand has no shadows: a hairline (border border-edge) or a fill sets things apart.');
	else if (TW_ROUNDED_DEFAULT.test(cls)) f('off-scale', `Radius \`${cls}\``, 'Console controls and containers are square (rounded-control, rounded-container); brand surfaces use rounded-ds-sm, -ds-md, -ds-lg, -ds-xl or rounded-full.');
	else if (TW_EASE_IN.test(cls)) f('motion', '`ease-in`', 'Use ease-out or ease-standard.');
	else if (TW_TRANSITION_ALL.test(cls)) f('motion', `Broad transition \`${cls}\``, 'Name the properties: transition-colors, transition-opacity, transition-transform.');
	else if (TW_UPPERCASE.test(cls) && !brand().type.caps && !/type-tag/.test(cls)) f('font', '`uppercase`', 'Capitals are for the site tag only (type-tag); everything else is sentence case.');
	else {
		const d = cls.match(TW_DURATION);
		if (d && Number(d[1]) !== 0 && !durationTokens().has(Number(d[1]))) f('motion', `Duration \`${cls}\``, `Use a brand step (${[...durationTokens().keys()].filter(Boolean).map((ms) => `duration-${ms}`).join(', ')}).`);
	}
}

/** Colors written in code (chart configs, inline styles built in script): only the brand's literal values. */
export function checkCodeColor(value: string, offset: number, push: Push) {
	for (const m of value.matchAll(COLOR)) {
		const hex = hexOf(m[0]);
		if (hex && brandHexes().has(hex)) continue;
		push({ rule: 'raw-color', message: `Color \`${m[0]}\` in code`, hint: 'Use the brand value for its role, or var(--ds-color-...).', offset: offset + (m.index ?? 0), length: m[0].length });
	}
}

const ICON_PACKAGE = /^(lucide(-[\w-]+)?$|lucide-react|@heroicons\/|@tabler\/icons|react-icons|@radix-ui\/react-icons|feather-icons|@fortawesome\/|@mui\/icons-material|@iconify\/|@iconify-icon\/|ionicons|@phosphor-icons\/|phosphor-vue|@remixicon\/|remixicon|@primer\/octicons|@hugeicons\/|iconoir|boxicons|bootstrap-icons|@carbon\/icons|oh-vue-icons|@vicons\/|unplugin-icons)/;
const MODULE = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)(['"])([^'"\n]+)\1/g;

/** Imports of an icon library that is not the brand's. */
export function checkIcons(text: string, push: Push) {
	const icons = brand().icons;
	for (const m of text.matchAll(MODULE)) {
		const source = m[2];
		if (icons.packages.some((p) => source === p || source.startsWith(`${p}/`)) || !ICON_PACKAGE.test(source)) continue;
		push({ rule: 'icon-pack', message: `Icon library \`${source}\``, hint: `Every icon is ${icons.name}: import the glyph from ${icons.packages.map((p) => `\`${p}\``).join(' or ')} with a ${icons.stroke ?? 1.5} stroke.`, offset: (m.index ?? 0) + m[0].length - source.length - 1, length: source.length });
	}
}

const CLASS_LIST = /^(?:[!-]?[\w:[\]()./%#,-]+)(?:\s+[!-]?[\w:[\]()./%#,-]+)+$/;
const CLASS_HINT = /(?:^|\s)(?:[\w-]+:)*(?:bg|text|border|rounded|shadow|transition|duration|ease|p[xytrbl]?|m[xytrbl]?|gap|font)-/;

/** Runs every rule on a loaded file. */
export function runRules(file: SourceFile): RawFinding[] {
	const out: RawFinding[] = [];
	const push: Push = (f) => out.push(f);
	if (file.styles.trim()) for (const d of declarations(file.styles)) checkDecl(d, push);
	for (const t of file.classTokens) checkClass(t.value, t.offset, push);
	for (const s of file.strings) {
		if (/^\s*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(s.value) && s.value.length < 40) checkCodeColor(s.value, s.offset, push);
		else if (CLASS_LIST.test(s.value.trim()) && CLASS_HINT.test(s.value)) for (const m of s.value.matchAll(/\S+/g)) checkClass(m[0], s.offset + (m.index ?? 0), push);
	}
	checkIcons(file.text, push);
	return out;
}
