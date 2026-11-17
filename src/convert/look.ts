import { tokens } from '../lib/brand.js';
import { parseColor } from './color.js';

// What an app's own stylesheets give its classes (.btn-primary { background: #2563eb }), read as Tailwind-like tokens
// (bg-[#2563eb], border, p-2, rounded) so the kinds and variants of elements styled with plain CSS read like those
// styled with utilities. Only simple selectors count: `.a`, `.a.b`, `tag.a`; states and descendants are left out.

type Decls = Map<string, string>;
export type StyleIndex = (classes: string[], tag: string) => string[];

const hex = (raw: string): string | undefined => {
	const c = parseColor(raw.trim());
	if (!c) return undefined;
	const h = `#${c.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')}`;
	return c[3] < 0.995 ? `${h}/${Math.round(c[3] * 100)}` : h;
};

export function buildStyleIndex(stylesheets: string[]): StyleIndex {
	const rules: { tag?: string; classes: string[]; decls: Decls }[] = [];
	// The brand's own variables resolve too, so a value a first run converted reads the same on a second.
	const vars = new Map<string, string>(Object.entries(tokens()).map(([n, v]) => [n, v.light]));
	for (const css of stylesheets) {
		const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
		for (const m of text.matchAll(/([^{}@;]+)\{([^{}]*)\}/g)) {
			const decls: Decls = new Map();
			for (const d of m[2].matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g)) decls.set(d[1].trim(), d[2].trim());
			for (const sel of m[1].split(',').map((s) => s.trim())) {
				if (sel === ':root' || sel === 'html' || sel === ':host') for (const [k, v] of decls) if (k.startsWith('--')) vars.set(k, v);
				const simple = sel.match(/^([a-z][\w-]*)?((?:\.[\w-]+)+)$/i);
				if (simple) rules.push({ tag: simple[1]?.toLowerCase(), classes: simple[2].split('.').filter(Boolean), decls });
			}
		}
	}
	const resolve = (v: string, depth = 0): string => (depth > 6 ? v : v.replace(/var\((--[\w-]+)(?:\s*,\s*([^)]+))?\)/g, (all, name: string, fallback?: string) => (vars.has(name) ? resolve(vars.get(name)!, depth + 1) : (fallback ?? all))));
	const firstColor = (v: string) => resolve(v).match(/#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch)\([^()]*\)|\b(?:white|black)\b/)?.[0];
	return (classes: string[], tag: string) => {
		if (!classes.length || !rules.length) return [];
		const own = new Set(classes);
		const merged: Decls = new Map();
		for (const r of rules) if (r.classes.every((c) => own.has(c)) && (!r.tag || r.tag === tag)) for (const [k, v] of r.decls) merged.set(k, v);
		const out: string[] = [];
		const bg = merged.get('background-color') ?? merged.get('background');
		const bgc = bg && firstColor(bg);
		if (bgc && hex(bgc)) out.push(`bg-[${hex(bgc)!.split('/')[0]}]${hex(bgc)!.includes('/') ? `/${hex(bgc)!.split('/')[1]}` : ''}`);
		const color = merged.get('color');
		const cc = color && firstColor(color);
		if (cc && hex(cc)) out.push(`text-[${hex(cc)!.split('/')[0]}]`);
		const border = merged.get('border') ?? merged.get('border-width') ?? merged.get('border-style');
		if (border && !/^(none|0|0px)(\s|$)/.test(resolve(border).trim())) {
			out.push('border');
			const bc = firstColor(merged.get('border-color') ?? border);
			if (bc && hex(bc)) out.push(`border-[${hex(bc)!.split('/')[0]}]`);
		}
		const pad = merged.get('padding') ?? merged.get('padding-inline') ?? merged.get('padding-left');
		if (pad && !/^0(px)?$/.test(resolve(pad).trim())) out.push('p-2');
		const radius = merged.get('border-radius');
		if (radius && !/^0(px)?$/.test(resolve(radius).trim())) out.push(/9999|50%|999px/.test(radius) ? 'rounded-full' : 'rounded');
		const shadow = merged.get('box-shadow');
		if (shadow && !/^none$/.test(shadow.trim())) out.push('shadow');
		const size = merged.get('font-size')?.match(/^(\d*\.?\d+)(px|rem)$/);
		if (size) out.push(`text-[${Number(size[1]) * (size[2] === 'rem' ? 16 : 1)}px]`);
		if (merged.get('position') === 'fixed' && (merged.get('inset') === '0' || (merged.get('top') === '0' && merged.get('left') === '0'))) out.push('fixed', 'inset-0');
		return out;
	};
}
