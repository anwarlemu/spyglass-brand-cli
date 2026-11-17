import { type Color, TW_PALETTE_NAMES, classify, paletteColor, parseColor } from './color.js';

// The app's ground: the color its page sits on (html, body or :root's background, a custom property it points at,
// or the background utility on <html> or <body>). Apply maps the app's ground to the brand's ground: on a dark app,
// neutral lightness reads mirrored (its near-black page is the brand's surface, its pale text the brand's fg), so a
// dark site keeps a dark page in a dark brand instead of turning inside out.

export type Ground = { dark: boolean; l: number };

const RULE = /([^{}]+)\{([^{}]*)\}/g;
// The page itself: html, body or :root alone (not a scrollbar, a descendant or a state of them).
const PAGE = /^(?:html|body|:root)(?:\s*,\s*(?:html|body|:root))*$/;
const BACKGROUND = /(?:^|;|\s)background(?:-color)?\s*:\s*([^;!}]+)/i;
const BODY_CLASS = /<(?:html|body)\b[^>]*\bclass(?:Name)?\s*=\s*["'{`]([^"'`}]*)/gi;

function resolve(value: string, sources: string[], depth = 0): Color | undefined {
	const v = value.trim();
	const ref = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
	if (ref) {
		if (depth > 4) return undefined;
		for (const s of sources) {
			const def = s.match(new RegExp(`${ref[1]}\\s*:\\s*([^;}]+)`));
			if (def) return resolve(def[1], sources, depth + 1);
		}
		return ref[2] ? resolve(ref[2], sources, depth + 1) : undefined;
	}
	const first = v.split(/\s+(?![^(]*\))/)[0];
	const rgba = parseColor(first);
	return rgba && rgba[3] > 0.5 ? classify(rgba) : undefined;
}

/** The ground of an app from its stylesheets and markup (the texts of its files), or undefined when none says. */
export function detectGround(sources: string[]): Ground | undefined {
	for (const raw of sources) {
		const s = raw.replace(/\/\*[\s\S]*?\*\//g, '');
		for (const m of s.matchAll(RULE)) {
			if (!PAGE.test(m[1].trim())) continue;
			const bg = m[2].match(BACKGROUND);
			const c = bg && resolve(bg[1], sources);
			if (c && c.family === 'neutral') return { dark: c.l < 0.5, l: c.l };
		}
	}
	const palette = new RegExp(`(?:^|\\s)bg-(${TW_PALETTE_NAMES})-(\\d{2,3})(?:\\s|$)`);
	for (const s of sources) {
		for (const m of s.matchAll(BODY_CLASS)) {
			const cls = ` ${m[1]} `;
			if (/\sbg-black\s/.test(cls)) return { dark: true, l: 0 };
			if (/\sbg-white\s/.test(cls)) return { dark: false, l: 1 };
			const p = cls.match(palette);
			const c = p && paletteColor(p[1], p[2]);
			if (c && c.family === 'neutral') return { dark: c.l < 0.5, l: c.l };
		}
	}
	return undefined;
}
