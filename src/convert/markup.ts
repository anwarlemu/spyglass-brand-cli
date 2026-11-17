import type { Change } from './classes.js';
import { convertCss } from './css.js';
import { scriptLiterals } from './jsx.js';
import { type Edit, type ElementInfo, type FileOptions, type FileResult, StructureChanged, applyEdits, blankLiterals, convertElementInfo, convertScript, cssSignature, literals, mask, plain } from './shared.js';

// Markup in any language, read with one tolerant scanner: plain HTML, Svelte and Astro components, Angular templates
// and server templates (ERB, Blade, Django and Jinja, PHP, Handlebars, EJS, Liquid, Twig, Nunjucks). Template code
// (`<%= %>`, `{{ }}`, `{% %}`, `<?php ?>`, Svelte and Astro `{...}`) is opaque: never parsed as markup, never changed
// inside a class attribute, and where it decides which classes apply, the classes around it only change value for
// value. The structure check compares the file with every class and style value blanked.

export type Dialect = 'html' | 'template' | 'svelte' | 'astro' | 'angular';
type Span = { start: number; end: number };
type Attr = { name: string; start: number; nameEnd: number; end: number; value?: { start: number; end: number; quote: string; expr: boolean }; codes: Span[] };
export type Tag = { tag: string; start: number; nameEnd: number; end: number; attrs: Attr[]; depth: number; parent?: Tag; selfClosing: boolean; spread: boolean; codes: Span[] };
type Region = { kind: 'style' | 'script' | 'frontmatter' | 'code'; start: number; end: number; open?: string };

const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|!doctype)$/i;

/** Skips a balanced `{...}` from `i` (at `{`), minding strings; returns the index after the closing brace. */
function skipBraces(text: string, i: number): number {
	let depth = 0;
	for (let j = i; j < text.length; j++) {
		const c = text[j];
		if (c === '"' || c === "'" || c === '`') {
			let k = j + 1;
			while (k < text.length && text[k] !== c) {
				if (text[k] === '\\') k++;
				k++;
			}
			j = k;
			continue;
		}
		if (c === '{') depth++;
		else if (c === '}') {
			depth--;
			if (!depth) return j + 1;
		}
	}
	return text.length;
}

const PAIRS: [string, string][] = [['<%', '%>'], ['<?', '?>'], ['{{{', '}}}'], ['{{', '}}'], ['{%', '%}'], ['{#', '#}'], ['{!!', '!!}']];

/** Template code starting at `i`, if any: its end. */
function construct(text: string, i: number, dialect: Dialect, inTag: boolean): number | undefined {
	if (dialect === 'svelte' || dialect === 'astro') return text[i] === '{' ? skipBraces(text, i) : undefined;
	if (dialect === 'angular') {
		if (text.startsWith('{{', i)) {
			const close = text.indexOf('}}', i + 2);
			return close < 0 ? text.length : close + 2;
		}
		return undefined;
	}
	for (const [open, close] of PAIRS) {
		if (!text.startsWith(open, i)) continue;
		// `<?xml` is markup, not PHP.
		if (open === '<?' && text.startsWith('<?xml', i)) return undefined;
		const end = text.indexOf(close, i + open.length);
		return end < 0 ? text.length : end + close.length;
	}
	// Blade directives inside a tag: @class([...]), @disabled($x).
	if (inTag && dialect === 'template' && text[i] === '@' && /^@\w+\s*\(/.test(text.slice(i, i + 40))) {
		let depth = 0;
		for (let j = text.indexOf('(', i); j < text.length; j++) {
			if (text[j] === '(') depth++;
			else if (text[j] === ')' && !--depth) return j + 1;
		}
	}
	return undefined;
}

export function scan(text: string, dialect: Dialect): { tags: Tag[]; regions: Region[] } {
	const tags: Tag[] = [];
	const regions: Region[] = [];
	const stack: Tag[] = [];
	let i = 0;
	if (dialect === 'astro' && /^\s*---/.test(text)) {
		const open = text.indexOf('---');
		const close = text.indexOf('\n---', open + 3);
		if (close > 0) {
			regions.push({ kind: 'frontmatter', start: open + 3, end: close + 1 });
			i = close + 4;
		}
	}
	while (i < text.length) {
		if (text.startsWith('<!--', i)) {
			const close = text.indexOf('-->', i + 4);
			i = close < 0 ? text.length : close + 3;
			continue;
		}
		const code = construct(text, i, dialect, false);
		if (code !== undefined) {
			if (dialect === 'html' || dialect === 'template') regions.push({ kind: 'code', start: i, end: code });
			i = code;
			continue;
		}
		if (text[i] === '<' && text[i + 1] === '/' && /[A-Za-z]/.test(text[i + 2] ?? '')) {
			const name = text.slice(i + 2).match(/^[A-Za-z][\w:.-]*/)?.[0] ?? '';
			const at = stack.map((t) => t.tag.toLowerCase()).lastIndexOf(name.toLowerCase());
			if (at >= 0) stack.length = at;
			const close = text.indexOf('>', i);
			i = close < 0 ? text.length : close + 1;
			continue;
		}
		if (text[i] === '<' && /[A-Za-z!]/.test(text[i + 1] ?? '')) {
			const tag = parseTag(text, i, dialect);
			if (!tag) {
				i++;
				continue;
			}
			tag.depth = stack.length;
			tag.parent = stack[stack.length - 1];
			tags.push(tag);
			const lower = tag.tag.toLowerCase();
			if ((lower === 'script' || lower === 'style') && !tag.selfClosing) {
				const close = text.toLowerCase().indexOf(`</${lower}`, tag.end);
				const end = close < 0 ? text.length : close;
				regions.push({ kind: lower, start: tag.end, end, open: text.slice(tag.start, tag.end) });
				const gt = close < 0 ? text.length : text.indexOf('>', close);
				i = gt < 0 ? text.length : gt + 1;
				continue;
			}
			if (!tag.selfClosing && !VOID.test(lower) && lower !== '!doctype') stack.push(tag);
			i = tag.end;
			continue;
		}
		i++;
	}
	return { tags, regions };
}

function parseTag(text: string, start: number, dialect: Dialect): Tag | undefined {
	const name = text.slice(start + 1).match(/^!?[A-Za-z][\w:.-]*/)?.[0];
	if (!name) return undefined;
	const tag: Tag = { tag: name, start, nameEnd: start + 1 + name.length, end: 0, attrs: [], depth: 0, selfClosing: false, spread: false, codes: [] };
	let j = tag.nameEnd;
	while (j < text.length) {
		while (j < text.length && /\s/.test(text[j])) j++;
		if (text[j] === '>') {
			tag.end = j + 1;
			return tag;
		}
		if (text.startsWith('/>', j)) {
			tag.selfClosing = true;
			tag.end = j + 2;
			return tag;
		}
		if (text[j] === '<' && !construct(text, j, dialect, true)) return undefined;
		const code = construct(text, j, dialect, true);
		if (code !== undefined) {
			tag.spread = true;
			tag.codes.push({ start: j, end: code });
			j = code;
			continue;
		}
		const m = text.slice(j).match(/^[^\s=>"'/]+/);
		if (!m) {
			j++;
			continue;
		}
		const attr: Attr = { name: m[0], start: j, nameEnd: j + m[0].length, end: j + m[0].length, codes: [] };
		j = attr.nameEnd;
		let k = j;
		while (k < text.length && /\s/.test(text[k])) k++;
		if (text[k] === '=') {
			k++;
			while (k < text.length && /\s/.test(text[k])) k++;
			const q = text[k];
			if (q === '"' || q === "'") {
				let e = k + 1;
				while (e < text.length && text[e] !== q) {
					const c = construct(text, e, dialect, false);
					if (c !== undefined) {
						attr.codes.push({ start: e, end: c });
						e = c;
					} else e++;
				}
				attr.value = { start: k + 1, end: e, quote: q, expr: false };
				j = e + 1;
			} else if (q === '{' && (dialect === 'svelte' || dialect === 'astro')) {
				const e = skipBraces(text, k);
				attr.value = { start: k + 1, end: e - 1, quote: '{', expr: true };
				j = e;
			} else {
				let e = k;
				while (e < text.length && !/[\s>]/.test(text[e])) {
					const c = construct(text, e, dialect, false);
					if (c !== undefined) {
						attr.codes.push({ start: e, end: c });
						e = c;
					} else if (text.startsWith('/>', e)) break;
					else e++;
				}
				attr.value = { start: k, end: e, quote: '', expr: false };
				j = e;
			}
			attr.end = j;
		}
		tag.attrs.push(attr);
	}
	return undefined;
}

const DRAWS_NOTHING = /^(script|style|link|meta|title|head|base|noscript|template)$/i;
const isClassAttr = (name: string) => name === 'class' || name === 'className';
const isComponentTag = (tag: string, dialect: Dialect) => /^[A-Z]/.test(tag) || tag.includes('.') || (dialect === 'svelte' && tag.startsWith('svelte:')) || (dialect !== 'html' && /^x-[\w.-]+$/.test(tag));
const isExtraClass = (name: string) => /^[\w-]*(-class|Class)$/.test(name) && !isClassAttr(name);
/** Attributes whose value is code holding class strings: Astro class:list, Svelte and Astro class={...}, Angular and Vue/Alpine bindings. */
const isClassBinding = (name: string) => /^(\[class\]|\[ngClass\]|\[className\]|:class|x-bind:class|v-bind:class|class:list)$/.test(name);
const isStyleBinding = (name: string) => /^(\[ngStyle\]|\[style\]|:style|x-bind:style|v-bind:style)$/.test(name);
/** The class a directive names: Svelte class:active, Angular [class.active]. */
const directive = (name: string) => name.match(/^class:(?!list$)([^\s={}]+)$/) ?? name.match(/^\[class\.([^\]]+)\]$/);

/** A markup file restyled. */
export function convertMarkup(text: string, opts: FileOptions, dialect: Dialect, base = 0): FileResult {
	const changes: Change[] = [];
	const edits: Edit[] = [];
	convertMarkupInto(text, opts, dialect, edits, changes, base);
	const out = applyEdits(text, edits);
	if (out !== text && markupSignature(text, dialect) !== markupSignature(out, dialect)) throw new StructureChanged('the restyle would change more than style values');
	return { text: out, changes };
}

export function convertMarkupInto(text: string, opts: FileOptions, dialect: Dialect, edits: Edit[], changes: Change[], base = 0) {
	const { tags, regions } = scan(text, dialect);
	const dark = new Map<Tag, boolean | undefined>();
	const sub: Edit[] = [];
	for (const t of tags) {
		if (t.tag.startsWith('!')) continue;
		// Components (Svelte and Astro <Layout>, Blade <x-card>, Angular <app-card>) take class as a prop: never given one.
		// Their children count as roots when no element sits above them.
		const component = isComponentTag(t.tag, dialect);
		// A tag that draws nothing (a Svelte or Astro file's top-level <script> and <style>) is never the root.
		let root = !component && !DRAWS_NOTHING.test(t.tag);
		for (let p = t.parent; p && root; p = p.parent) if (!isComponentTag(p.tag, dialect)) root = false;
		const el: ElementInfo = { tag: t.tag, isRoot: root, attrs: {}, bindings: [], directives: [], styleBindings: [], extraClasses: [], insert: !t.spread && !component ? { at: t.nameEnd, attr: 'class' } : undefined };
		for (const a of t.attrs) {
			const v = a.value;
			const raw = v ? text.slice(v.start, v.end) : undefined;
			el.attrs[a.name] = raw === undefined ? true : a.codes.length || v?.expr ? '' : raw;
			const d = directive(a.name);
			if (d) {
				const at = a.start + a.name.indexOf(d[1]);
				el.directives.push({ start: at, end: at + d[1].length, value: d[1] });
				continue;
			}
			if (!v || raw === undefined) continue;
			if (isClassAttr(a.name)) {
				if (v.expr) el.bindings.push({ start: v.start, end: v.end, code: raw, name: 'class' });
				else el.staticClass = { start: v.start, end: v.end, value: raw, masked: a.codes.length ? mask(raw, a.codes, v.start) : undefined };
			} else if (a.name === 'style') {
				if (v.expr) el.styleBindings.push({ start: v.start, end: v.end, code: raw });
				else el.staticStyle = { start: v.start, end: v.end, value: raw, masked: a.codes.length ? mask(raw, a.codes, v.start) : undefined };
			} else if (isClassBinding(a.name)) el.bindings.push({ start: v.start, end: v.end, code: raw, name: 'class' });
			else if (isStyleBinding(a.name)) el.styleBindings.push({ start: v.start, end: v.end, code: raw });
			else if (isExtraClass(a.name) && !a.codes.length && !v.expr) el.extraClasses.push({ start: v.start, end: v.end, value: raw });
		}
		const onDark = t.parent ? (dark.get(t.parent) ?? false) : false;
		const d = convertElementInfo(text, el, opts, sub, changes, onDark);
		dark.set(t, d ?? onDark);
		// Template code in the tag (Blade's $attributes->merge(['class' => '...']), Svelte's {...spread}): its class strings.
		if (dialect === 'html' || dialect === 'template') for (const c of t.codes) convertScript(text.slice(c.start, c.end), c.start, text, { ...opts, componentKind: t.depth === 0 ? opts.componentKind : undefined }, sub, changes, { classesOnly: true, lits: literals(text.slice(c.start, c.end), c.start) });
	}
	for (const r of regions) {
		const content = text.slice(r.start, r.end);
		if (r.kind === 'style') {
			if (!opts.general || /lang=["']?(stylus|sass)\b/.test(r.open ?? '')) continue;
			const next = convertCss(content, { changes, merge: opts.merge && !plain(opts) });
			if (next !== content) sub.push({ start: r.start, end: r.end, text: next });
		} else if (r.kind === 'script' || r.kind === 'frontmatter') {
			if (r.kind === 'script' && (/\bsrc=/.test(r.open ?? '') || /type=["']?(application\/(ld\+)?json|text\/(template|x-template|html))/.test(r.open ?? ''))) continue;
			const lang = /lang=["']?ts|type=["']?text\/typescript/.test(r.open ?? '') || r.kind === 'frontmatter' ? 'x.ts' : 'x.js';
			convertScript(content, r.start, text, opts, sub, changes, { lits: scriptLiterals(content, lang, r.start) });
		} else if (r.kind === 'code' && opts.general) {
			convertScript(content, r.start, text, opts, sub, changes, { classesOnly: true, lits: literals(content, r.start) });
		}
	}
	for (const e of sub) edits.push({ start: e.start + base, end: e.end + base, text: e.text });
}

/** A markup file with every class and style value blanked (template code inside them kept), styles reduced to their selectors and strings in code blanked. */
export function markupSignature(text: string, dialect: Dialect): string {
	const { tags, regions } = scan(text, dialect);
	const spans: { start: number; end: number; text: string }[] = [];
	for (const t of tags) {
		if (dialect === 'html' || dialect === 'template') for (const c of t.codes) spans.push({ start: c.start, end: c.end, text: blankLiterals(text.slice(c.start, c.end)) });
		for (const a of t.attrs) {
			const v = a.value;
			const d = directive(a.name);
			if (d) {
				const at = a.start + a.name.indexOf(d[1]);
				spans.push({ start: at, end: at + d[1].length, text: '' });
				continue;
			}
			const classy = isClassAttr(a.name) || a.name === 'style' || isExtraClass(a.name);
			if (!v) continue;
			const raw = text.slice(v.start, v.end);
			if (classy && !v.expr && !a.codes.length) {
				let s = a.start;
				while (s > 0 && /\s/.test(text[s - 1])) s--;
				spans.push({ start: s, end: a.end, text: '' });
			} else if (classy && !v.expr) spans.push({ start: v.start, end: v.end, text: a.codes.map((c) => text.slice(c.start, c.end)).join('\u0001') });
			else if (classy || isClassBinding(a.name) || isStyleBinding(a.name)) spans.push({ start: v.start, end: v.end, text: blankLiterals(raw) });
		}
	}
	for (const r of regions) {
		const content = text.slice(r.start, r.end);
		if (r.kind === 'style') spans.push({ start: r.start, end: r.end, text: cssSignature(content) });
		else if (r.kind === 'code') spans.push({ start: r.start, end: r.end, text: blankLiterals(content) });
		else spans.push({ start: r.start, end: r.end, text: blankLiterals(content, scriptLiterals(content, r.kind === 'frontmatter' || /lang=["']?ts/.test(r.open ?? '') ? 'x.ts' : 'x.js').map((l) => ({ ...l }))) });
	}
	spans.sort((a, b) => a.start - b.start || b.end - a.end);
	let out = '';
	let last = 0;
	for (const s of spans) {
		if (s.start < last) continue;
		out += text.slice(last, s.start) + s.text;
		last = s.end;
	}
	return out + text.slice(last);
}
