import { TW_PALETTE_NAMES, classify, paletteColor, parseColor } from './color.js';
const RULE = /([^{}]+)\{([^{}]*)\}/g;
// The page itself: html, body or :root alone (not a scrollbar, a descendant or a state of them).
const PAGE = /^(?:html|body|:root)(?:\s*,\s*(?:html|body|:root))*$/;
const BACKGROUND = /(?:^|;|\s)background(?:-color)?\s*:\s*([^;!}]+)/i;
const BODY_CLASS = /<(?:html|body)\b[^>]*\bclass(?:Name)?\s*=\s*["'{`]([^"'`}]*)/gi;
function resolve(value, sources, depth = 0) {
    const v = value.trim();
    const ref = v.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)$/);
    if (ref) {
        if (depth > 4)
            return undefined;
        for (const s of sources) {
            const def = s.match(new RegExp(`${ref[1]}\\s*:\\s*([^;}]+)`));
            if (def)
                return resolve(def[1], sources, depth + 1);
        }
        return ref[2] ? resolve(ref[2], sources, depth + 1) : undefined;
    }
    const first = v.split(/\s+(?![^(]*\))/)[0];
    const rgba = parseColor(first);
    return rgba && rgba[3] > 0.5 ? classify(rgba) : undefined;
}
/** The ground of an app from its stylesheets and markup (the texts of its files), or undefined when none says. */
export function detectGround(sources) {
    for (const raw of sources) {
        const s = raw.replace(/\/\*[\s\S]*?\*\//g, '');
        for (const m of s.matchAll(RULE)) {
            if (!PAGE.test(m[1].trim()))
                continue;
            const bg = m[2].match(BACKGROUND);
            const c = bg && resolve(bg[1], sources);
            if (c && c.family === 'neutral')
                return { dark: c.l < 0.5, l: c.l };
        }
    }
    const palette = new RegExp(`(?:^|\\s)bg-(${TW_PALETTE_NAMES})-(\\d{2,3})(?:\\s|$)`);
    for (const s of sources) {
        for (const m of s.matchAll(BODY_CLASS)) {
            const cls = ` ${m[1]} `;
            if (/\sbg-black\s/.test(cls))
                return { dark: true, l: 0 };
            if (/\sbg-white\s/.test(cls))
                return { dark: false, l: 1 };
            const p = cls.match(palette);
            const c = p && paletteColor(p[1], p[2]);
            if (c && c.family === 'neutral')
                return { dark: c.l < 0.5, l: c.l };
        }
    }
    return undefined;
}
