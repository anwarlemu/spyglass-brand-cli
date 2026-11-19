import { themeTables } from './tokens.js';
function rgba(v) {
    const s = v.trim().toLowerCase();
    const hex = /^#([0-9a-f]{3,8})$/.exec(s);
    if (hex) {
        let h = hex[1];
        if (h.length <= 4)
            h = [...h].map((c) => c + c).join('');
        if (h.length !== 6 && h.length !== 8)
            return null;
        const n = (i) => Number.parseInt(h.slice(i, i + 2), 16);
        return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
    }
    const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(s);
    if (m)
        return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : m[4].endsWith('%') ? Number.parseFloat(m[4]) / 100 : Number(m[4])];
    return null;
}
const key = (c) => `${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${Math.round(c[3] * 100)}`;
let index;
function brandIndex() {
    if (index)
        return index;
    const colors = new Map();
    const list = [];
    const fonts = new Map();
    const scale = { size: [], radius: [], spacing: [] };
    // Every theme, plus the 1080 canvas values (--ds-asset-*): lengths in Figma are pixels, so rem never appears.
    const tables = themeTables().tables.map((t) => [t, 16]);
    for (const [table, root] of tables) {
        for (const [name, raw] of Object.entries(table)) {
            const v = raw.replace(/var\((--[\w-]+)(?:,\s*([^)]*))?\)/g, (_, n, fallback) => table[n] ?? fallback ?? '').trim();
            const c = rgba(v);
            if (c && name.startsWith('--ds-color-')) {
                if (!colors.has(key(c)))
                    colors.set(key(c), name);
                list.push([name, c]);
                continue;
            }
            if (name.startsWith('--ds-font-') && !name.includes('weight'))
                for (const fam of v.match(/"([^"]+)"/g) ?? [])
                    fonts.set(fam.slice(1, -1).toLowerCase(), name);
            const len = /^(-?[\d.]+)(px|rem)$/.exec(v);
            if (!len)
                continue;
            const px = Math.round(Number(len[1]) * (len[2] === 'rem' ? root : 1) * 100) / 100;
            const bucket = /^--ds-(asset-)?text-/.test(name) && !/leading$/.test(name) ? scale.size : /radius/.test(name) ? scale.radius : /^--ds-space-|^--ds-asset-(margin|card-padding|search-inset)/.test(name) ? scale.spacing : null;
            bucket?.push([name, px]);
        }
    }
    index = { colors, list, fonts, scale };
    return index;
}
function nearestColor(c) {
    let best = '';
    let bd = Infinity;
    for (const [name, t] of brandIndex().list) {
        const d = (t[0] - c[0]) ** 2 + (t[1] - c[1]) ** 2 + (t[2] - c[2]) ** 2 + ((t[3] - c[3]) * 255) ** 2;
        if (d < bd) {
            bd = d;
            best = name;
        }
    }
    return best;
}
function checkColor(value, where) {
    const c = rgba(value);
    if (!c)
        return null;
    const hit = brandIndex().colors.get(key(c));
    if (hit)
        return { kind: 'color', value, where, ok: true, token: hit, message: `${value} is ${hit}` };
    const near = nearestColor(c);
    return { kind: 'color', value, where, ok: false, nearest: near, message: `${value} is not a brand color; nearest ${near}` };
}
function checkLength(kind, px, value, where) {
    const list = brandIndex().scale[kind];
    const hit = list.find(([, v]) => Math.abs(v - px) < 0.05);
    if (hit || px === 0)
        return { kind, value, where, ok: true, token: hit?.[0], message: `${value} is ${hit?.[0] ?? 'zero'}` };
    const near = list.reduce((a, b) => (Math.abs(b[1] - px) < Math.abs(a[1] - px) ? b : a), list[0]);
    return { kind, value, where, ok: false, nearest: near?.[0], message: `${value} is off the brand ${kind} scale; nearest ${near?.[0]} (${near?.[1]}px)` };
}
function checkFont(family, where) {
    const f = family.replace(/^['"]|['"]$/g, '').trim();
    const hit = brandIndex().fonts.get(f.toLowerCase());
    return hit ? { kind: 'font', value: f, where, ok: true, token: hit, message: `${f} is ${hit}` } : { kind: 'font', value: f, where, ok: false, message: `${f} is not a brand font (${[...new Set(brandIndex().fonts.keys())].join(', ')})` };
}
/** get_variable_defs output: a map of variable name to value. */
function fromVariables(defs) {
    const out = [];
    for (const [name, raw] of Object.entries(defs)) {
        const v = String(raw);
        const where = `variable ${name}`;
        const color = checkColor(v, where);
        if (color)
            out.push(color);
        else if (/font\s*family|^font\//i.test(name) || /Font\(family:/.test(v)) {
            const fam = /family:\s*"?([^",)]+)/.exec(v)?.[1] ?? v;
            out.push(checkFont(fam, where));
        }
    }
    return out;
}
/** get_design_context output: reference code (React and Tailwind, or CSS) with literal values. */
function fromCode(code) {
    const out = [];
    const lineOf = (i) => `line ${code.slice(0, i).split('\n').length}`;
    for (const m of code.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) {
        const f = checkColor(m[0], lineOf(m.index));
        if (f)
            out.push(f);
    }
    for (const m of code.matchAll(/font-\[['"]?([^'"\]:]+?)(?::[^'"\]]*)?['"]?\]|font-family:\s*['"]?([^;'",]+)/g))
        out.push(checkFont((m[1] ?? m[2]).replace(/_/g, ' '), lineOf(m.index)));
    for (const m of code.matchAll(/fontFamily:\s*['"]([^'",]+)/g))
        out.push(checkFont(m[1], lineOf(m.index)));
    const lengths = [
        [/\btext-\[(\d+(?:\.\d+)?)px\]|font-size:\s*(\d+(?:\.\d+)?)px|fontSize:\s*['"]?(\d+(?:\.\d+)?)/g, 'size'],
        [/\brounded(?:-[trbl]{1,2})?-\[(\d+(?:\.\d+)?)px\]|border-radius:\s*(\d+(?:\.\d+)?)px|borderRadius:\s*['"]?(\d+(?:\.\d+)?)/g, 'radius'],
        [/\b(?:gap|p[xytrbl]?|m[xytrbl]?|space-[xy])-\[(\d+(?:\.\d+)?)px\]|\b(?:gap|padding|margin)(?:-\w+)?:\s*(\d+(?:\.\d+)?)px/g, 'spacing'],
    ];
    for (const [re, kind] of lengths)
        for (const m of code.matchAll(re)) {
            const n = Number(m[1] ?? m[2] ?? m[3]);
            out.push(checkLength(kind, n, `${n}px`, lineOf(m.index)));
        }
    return out;
}
/** Checks one saved MCP response: JSON variable definitions, JSON with a code field, or plain code. */
export function checkFigmaValues(text) {
    const trimmed = text.trim();
    if (trimmed.startsWith('{')) {
        try {
            const doc = JSON.parse(trimmed);
            const code = typeof doc.code === 'string' ? doc.code : undefined;
            if (code)
                return fromCode(code);
            return fromVariables(doc);
        }
        catch { }
    }
    return fromCode(text);
}
/** One finding per distinct value and verdict, so a color used fifty times is reported once. */
export function dedupe(findings) {
    const map = new Map();
    for (const f of findings) {
        const k = `${f.kind}|${f.value.toLowerCase()}`;
        const hit = map.get(k);
        if (hit)
            hit.count++;
        else
            map.set(k, { ...f, count: 1 });
    }
    return [...map.values()];
}
