import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { unknown } from './templates.js';
// Merch print files: brand/assets/merch.json holds each item's trim size, bleed and safe area (inches, with their
// source) and layouts in inches from the trim. This turns an item and a variant into a scene in pixels at 300 per inch
// with the bleed around it; the command writes the SVG at physical size and the PNG at the asked dpi.
export const PX_PER_IN = 300;
let doc;
export function merchItems() {
    doc ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'merch.json'), 'utf8'));
    return doc.items;
}
export function findItem(id) {
    const all = merchItems();
    const hit = all.find((i) => i.id === id.trim().toLowerCase());
    if (!hit)
        throw unknown('item', id, all.map((i) => i.id));
    return hit;
}
export function merchCatalog() {
    return merchItems().map((i) => ({
        id: i.id,
        name: i.name,
        trim: { width: i.size[0], height: i.size[1], unit: 'in' },
        bleed: i.bleed,
        safe: i.safe,
        method: i.method,
        variants: Object.keys(i.variants),
        pixels: { width: Math.round((i.size[0] + 2 * i.bleed) * PX_PER_IN), height: Math.round((i.size[1] + 2 * i.bleed) * PX_PER_IN), dpi: PX_PER_IN },
        dieCut: Boolean(i.cut),
        source: i.source,
    }));
}
const LEN = new Set(['x', 'top', 'w', 'size', 'leading', 'gap', 'shift']);
/** Inches to pixels, moving positions by the bleed. */
function convert(layer, bleed, vars) {
    const o = bleed * PX_PER_IN;
    const px = (n) => n * PX_PER_IN;
    const out = {};
    for (const [k, v] of Object.entries(layer)) {
        if (typeof v === 'string' && v.startsWith('$'))
            out[k] = vars[v.slice(1)] ?? v;
        else if (k === 'box' || k === 'window')
            out[k] = v.map((n, i) => px(n) + (i < 2 ? o : 0));
        else if (k === 'b')
            out[k] = v.map((n, i) => px(n) + (i < 2 && !('window' in layer) ? o : 0));
        else if (k === 'quad' || k === 'clipQuad')
            out[k] = v.map(([x, y]) => [px(x) + o, px(y) + o]);
        else if (k === 'after')
            out[k] = { ...v, gap: px(v.gap) };
        else if (LEN.has(k) && typeof v === 'number')
            out[k] = k === 'x' || k === 'top' ? px(v) + o : px(v);
        else
            out[k] = v;
    }
    return out;
}
export function merchScene(item, req) {
    const names = Object.keys(item.variants);
    const variant = (req.variant ?? names[0]).toLowerCase();
    const vars = item.variants[variant];
    if (!vars)
        throw unknown(`variant for ${item.id}`, variant, names);
    const raw = Array.isArray(item.layers) ? item.layers : item.layers[variant] ?? item.layers.default ?? [];
    const layers = raw.map((l) => convert(l, item.bleed, vars));
    const widthIn = item.size[0] + 2 * item.bleed;
    const heightIn = item.size[1] + 2 * item.bleed;
    const W = Math.round(widthIn * PX_PER_IN);
    const H = Math.round(heightIn * PX_PER_IN);
    const o = item.bleed * PX_PER_IN;
    const tw = item.size[0] * PX_PER_IN;
    const th = item.size[1] * PX_PER_IN;
    const rect = (x, y, w, h, r = 0) => r ? `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z` : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    if (item.cut)
        layers.push({ type: 'path', id: 'CutContour', d: rect(o, o, tw, th, item.cut.radius * PX_PER_IN), stroke: 'magenta', strokeWidth: 3, svgOnly: true });
    if (req.guides) {
        const s = item.safe * PX_PER_IN;
        if (item.bleed)
            layers.push({ type: 'path', id: 'Trim', d: rect(o, o, tw, th), stroke: 'cyan', strokeWidth: 3 });
        layers.push({ type: 'path', id: 'Safe', d: rect(o + s, o + s, tw - 2 * s, th - 2 * s), stroke: 'cyan', strokeWidth: 3, dash: '18 12' });
    }
    const b = brand();
    const fill = (v) => v.replaceAll('{domain}', b.domain ?? new URL(b.site).host).replaceAll('{tagline}', b.tagline ?? '');
    const takes = item.slots ?? {};
    for (const k of Object.keys(req.slots ?? {}))
        if (!(k in takes))
            throw new Error(`${item.id} does not draw --${k}.${Object.keys(takes).length ? ` It takes ${Object.keys(takes).map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
    const slots = Object.fromEntries(Object.entries(takes).map(([k, v]) => [k, fill(req.slots?.[k] ?? v)]));
    const ground = vars.ground === 'none' ? undefined : vars.ground;
    return { scene: { width: W, height: H, ground, layers, slots, seed: req.seed, light: req.light, clearPadding: 0.05 * PX_PER_IN }, variant, widthIn, heightIn };
}
/** The SVG at physical size: inches on the root, pixels at 300 per inch inside. */
export function physicalSvg(svg, widthIn, heightIn) {
    return svg.replace(/(<svg [^>]*?)width="\d+(?:\.\d+)?" height="\d+(?:\.\d+)?"/, `$1width="${widthIn}in" height="${heightIn}in"`);
}
