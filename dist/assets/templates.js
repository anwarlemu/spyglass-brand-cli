import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { suggest } from '../lib/names.js';
const cache = new Map();
export function templates(kind) {
    const hit = cache.get(kind);
    if (hit)
        return hit;
    const doc = JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', `${kind}.json`), 'utf8'));
    cache.set(kind, doc.templates);
    return doc.templates;
}
export function unknown(what, typed, pool) {
    const near = suggest(typed, pool);
    return new Error(`Unknown ${what} \`${typed}\`.${near.length ? ` Did you mean ${near.map((n) => `\`${n}\``).join(' or ')}?` : ''} Choose from: ${pool.join(', ')}.`);
}
export function findTemplate(kind, id) {
    const all = templates(kind);
    const t = all.find((x) => x.id === id.trim().toLowerCase());
    if (!t)
        throw unknown(kind === 'deck' ? 'slide type' : 'template', id, all.map((x) => x.id));
    return t;
}
/** Every slot name any template takes (the command's text flags). */
export function slotNames(kind) {
    return [...new Set(templates(kind).flatMap((t) => Object.keys(t.slots)))].sort();
}
function fill(value) {
    const b = brand();
    const domain = b.domain ?? new URL(b.site).host.replace(/^www\./, '');
    return value.replaceAll('{domain}', domain).replaceAll('{tagline}', b.tagline ?? '');
}
function substitute(value, vars) {
    if (typeof value === 'string')
        return (value.startsWith('$') ? vars[value.slice(1)] ?? value : value);
    if (Array.isArray(value))
        return value.map((v) => substitute(v, vars));
    if (value && typeof value === 'object')
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substitute(v, vars)]));
    return value;
}
/** A template at one size, with the copy filled in, as a scene. */
export function sceneFor(t, req) {
    const sizes = Object.keys(t.sizes);
    const size = req.size ? req.size.trim().toLowerCase() : sizes[0];
    if (!t.sizes[size])
        throw unknown(`size for ${t.id}`, size, sizes);
    const variants = t.variants ? Object.keys(t.variants) : [];
    let vars = {};
    let variant;
    if (req.variant) {
        if (!t.variants)
            throw new Error(`${t.id} has no variants.`);
        variant = req.variant.trim().toLowerCase();
        if (!t.variants[variant])
            throw unknown(`variant for ${t.id}`, variant, variants);
        vars = t.variants[variant];
    }
    else if (t.variants) {
        variant = variants[0];
        vars = t.variants[variant];
    }
    const given = req.slots ?? {};
    for (const name of Object.keys(given)) {
        if (!(name in t.slots)) {
            const takes = Object.keys(t.slots);
            throw new Error(`${t.id} does not draw --${name}.${takes.length ? ` It takes ${takes.map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
        }
    }
    const slots = Object.fromEntries(Object.entries(t.slots).map(([k, v]) => [k, fill(given[k] ?? v)]));
    const want = t.photos ?? 0;
    if ((req.photos?.length ?? 0) > want)
        throw new Error(`${t.id} holds ${want} picture${want === 1 ? '' : 's'}; ${req.photos.length} were passed with --image.`);
    const layout = substitute(t.sizes[size], vars);
    return {
        scene: { width: layout.width, height: layout.height, ground: layout.ground ?? 'black', layers: layout.layers, slots, photos: req.photos, seed: req.seed, light: req.light },
        size,
        variant,
    };
}
export function catalogOf(kind) {
    return templates(kind).map((t) => ({
        id: t.id,
        group: t.group,
        name: t.name,
        description: t.description,
        figma: t.figma,
        sizes: Object.entries(t.sizes).map(([id, s]) => ({ id, width: s.width, height: s.height })),
        variants: t.variants ? Object.keys(t.variants) : [],
        slots: Object.fromEntries(Object.entries(t.slots).map(([k, v]) => [k, fill(v)])),
        photos: t.photos ?? 0,
    }));
}
