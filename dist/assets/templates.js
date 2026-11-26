import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { brand, packageRoot } from '../lib/brand.js';
import { suggest } from '../lib/names.js';
import { CUSTOM_RANGE, SIZES, sizeSpec, zonesOf } from './sizes.js';
import { CORNERS, drawScene, FitError, layerId, named } from './scene.js';
import { itemId } from './stack.js';
const { LAYOUTS } = (await import(pathToFileURL(join(packageRoot, 'brand', 'assets', 'layouts.mjs')).href));
const cache = new Map();
export function templates(kind) {
    const hit = cache.get(kind);
    if (hit)
        return hit;
    const doc = JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', `${kind}.json`), 'utf8'));
    const list = doc.templates.map((t) => (Array.isArray(t.sizes) ? { ...t, required: t.required ?? [], sizes: t.sizes } : { ...t, required: t.required ?? [], layouts: t.sizes, sizes: Object.keys(t.sizes) }));
    cache.set(kind, list);
    return list;
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
    return [...new Set(templates(kind).flatMap((t) => [...Object.keys(t.slots), ...Object.keys(t.aliases ?? {})]))].sort();
}
export function fill(value) {
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
/** The sizes a template takes, with `custom` where a layout flows. */
export function sizesOf(t) {
    return t.layouts ? t.sizes : [...t.sizes, 'custom'];
}
/** A size by id or alias, as a template takes it. */
export function resolveSize(t, typed, width, height) {
    if (t.layouts) {
        const id = typed?.trim().toLowerCase() ?? t.sizes[0];
        const l = t.layouts[id];
        if (!l)
            throw unknown(`size for ${t.id}`, typed, t.sizes);
        return { id, width: l.width, height: l.height };
    }
    const key = typed?.trim().toLowerCase();
    const dims = /^(\d{2,5})x(\d{2,5})$/.exec(key ?? '');
    if (key === 'custom' || dims || (!key && (width || height))) {
        const w = dims ? Number(dims[1]) : width;
        const h = dims ? Number(dims[2]) : height;
        if (!w || !h)
            throw new Error('A custom size takes --width and --height.');
        const { min, max } = CUSTOM_RANGE;
        for (const [n, v] of [['width', w], ['height', h]])
            if (!Number.isInteger(v) || v < min || v > max)
                throw new Error(`--${n} takes ${min} to ${max} whole pixels, not ${v}.`);
        if (w / h > 10 || h / w > 4)
            throw new Error(`${w}x${h} is too narrow for these layouts: a side may be at most 10 times as wide as tall, or 4 times as tall as wide.`);
        return { id: 'custom', width: w, height: h };
    }
    if (width || height)
        throw new Error('--width and --height go with --size custom.');
    const id = key ? t.sizeAliases?.[key] ?? (t.sizes.includes(key) ? key : sizeSpec(key)?.id) : t.sizes[0];
    if (!id || !t.sizes.includes(id)) {
        if (id) {
            const spec = sizeSpec(id);
            const others = templates('image').filter((x) => x.sizes.includes(id)).map((x) => x.id);
            throw new Error(`${t.id} does not flow to ${id} (${spec.width}x${spec.height}): its layout has no room for its parts there. It takes ${sizesOf(t).join(', ')}.${others.length ? ` At ${id}: ${others.join(', ')}.` : ''}`);
        }
        throw unknown(`size for ${t.id}`, typed, sizesOf(t));
    }
    const spec = SIZES.find((s) => s.id === id);
    return { id, width: spec.width, height: spec.height };
}
/** The slots a request draws: what was passed (aliases resolved), the address, and samples when asked. */
export function slotsFor(t, given, sample = false) {
    const out = {};
    for (const [name, value] of Object.entries(given)) {
        const key = name in t.slots ? name : t.aliases?.[name] ?? name;
        if (!(key in t.slots)) {
            const takes = Object.keys(t.slots);
            const others = takes.includes(key) ? [] : templates(t.layouts ? 'deck' : 'image').filter((x) => key in x.slots && x.group === t.group && x.id !== t.id).map((x) => x.id);
            throw new Error(`${t.id} does not draw --${name}.${takes.length ? ` It takes ${takes.map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}${others.length ? ` ${others.slice(0, 4).join(', ')} ${others.length > 1 ? 'draw' : 'draws'} it.` : ''}`);
        }
        if (out[key] !== undefined && out[key] !== value)
            throw new Error(`--${name} and --${key} disagree. Pass one.`);
        out[key] = value;
    }
    const sampled = [];
    const own = [];
    for (const [k, v] of Object.entries(t.slots)) {
        if (out[k] !== undefined)
            continue;
        if (k === 'url') {
            out[k] = fill(v);
            own.push(k);
        }
        else if (sample && v) {
            out[k] = fill(v);
            sampled.push(k);
        }
        else
            out[k] = '';
    }
    return { slots: out, sampled, own };
}
/** A template at one size, with the copy filled in, as a scene. */
export function sceneFor(t, req) {
    const size = resolveSize(t, req.size, req.width, req.height);
    const variants = t.variants ? Object.keys(t.variants) : [];
    let vars = {};
    let variant;
    if (req.variant) {
        if (!t.variants) {
            if (req.variant.trim().toLowerCase() !== 'black')
                throw new Error(`${t.id} has one theme, black: the brand's layouts stand on Black.`);
        }
        else {
            variant = req.variant.trim().toLowerCase();
            if (!t.variants[variant])
                throw unknown(`theme for ${t.id}`, variant, variants);
            vars = t.variants[variant];
        }
    }
    else if (t.variants) {
        variant = variants[0];
        vars = t.variants[variant];
    }
    const { slots, sampled, own } = slotsFor(t, req.slots ?? {}, req.sample);
    const missing = t.required.filter((s) => !slots[s]?.trim());
    if (missing.length)
        throw new Error(`${t.id} needs ${missing.map((s) => `--${s}`).join(' and ')} (--sample fills sample copy to look at the layout).`);
    const want = t.photos ?? 0;
    const passed = req.photos ?? [];
    if (passed.length > want)
        throw new Error(want ? `${t.id} holds ${want} picture${want === 1 ? '' : 's'}; ${passed.length} were passed with --image.` : `${t.id} holds no pictures, so --image has nowhere to go.`);
    const fake = req.sample === true || req.placeholders === true;
    if (!fake && passed.length < (t.minPhotos ?? 0))
        throw new Error(`${t.id} is built around pictures: pass ${want === 1 ? '--image' : `--image 1 to ${want} times`} (--sample draws placeholders to look at the layout).`);
    const photos = passed.length ? Array.from({ length: want }, (_, i) => passed[i % passed.length]) : [];
    const has = (s) => Boolean(slots[s]?.trim()) && !req.edits?.[s]?.hidden;
    const zones = zonesOf(size.id, size.width, size.height);
    const raw = t.layouts ? t.layouts[size.id] : { width: size.width, height: size.height, ...LAYOUTS[t.id]({ W: size.width, H: size.height, size: size.id, has, pictures: fake && !passed.length ? want : photos.length, real: photos.length, safe: zones.safe, avoid: zones.avoid, floor: zones.floor }) };
    const pictures = photos.length > 0 || (fake && want > 0);
    const layout = substitute({ ...raw, layers: raw.layers.filter((l) => !l.when || (l.when === 'pictures') === pictures) }, vars);
    return {
        scene: { logoAnchors: t.logoAnchors, width: size.width, height: size.height, ground: layout.ground ?? vars.ground ?? 'black', layers: layout.layers, frame: layout.frame, unit: layout.unit, floor: zones.floor, slots, sampled, own, photos, placeholders: fake, seed: req.seed, light: req.light, texture: req.texture, edits: req.edits },
        size: size.id,
        width: size.width,
        height: size.height,
        variant,
        given: Object.keys(req.slots ?? {}).map((k) => (k in t.slots ? k : t.aliases?.[k] ?? k)),
        repeats: passed.length > 0 && passed.length < want,
    };
}
/** Draws a template, and refuses to leave out a word that was passed. */
export async function drawTemplate(t, req) {
    const r = sceneFor(t, req);
    let drawn;
    try {
        drawn = await drawScene(r.scene);
    }
    catch (err) {
        if (err instanceof FitError)
            throw new FitError(`${t.id}${t.layouts ? '' : ` at ${r.size}`}: ${err.message}`, err.slot, err.detail);
        throw err;
    }
    checkDrawn(t.id + (t.layouts ? '' : ` at ${r.size}`), r.scene, r.given, drawn);
    const problem = compositionProblem(t, drawn, r.width, r.height);
    if (problem) {
        const others = templates('image').filter((x) => x.sizes.includes(r.size)).map((x) => x.id);
        throw new FitError(`${t.id} does not flow to ${r.size === 'custom' ? `${r.width}x${r.height}` : `${r.size} (${r.width}x${r.height})`}: ${problem}. It takes ${sizesOf(t).join(', ')}.${others.length && r.size !== 'custom' ? ` At ${r.size}: ${others.filter((x) => x !== t.id).join(', ')}.` : ''}`, 'size');
    }
    return { drawn, size: r.size, variant: r.variant, repeats: r.repeats, scene: r.scene };
}
/** Whether the composition still reads at this frame, from what was drawn: a template is refused at a size where its
 * pictures shrink below a usable size, its headline breaks into a narrow column on a wide strip, its headline dwarfs
 * the logo on a strip, or the frame is wider than the composition is made for. */
export function compositionProblem(t, drawn, width, height) {
    const aspect = width / height;
    const short = Math.min(width, height);
    if (t.maxAspect && aspect > t.maxAspect + 1e-6)
        return `a strip this wide (${aspect.toFixed(1)} to 1) has no room for its composition (it reads up to ${t.maxAspect} to 1)`;
    const pictures = drawn.layers.filter((l) => l.kind === 'picture').flatMap((l) => (l.ink?.length ? l.ink : [l.box]));
    if (pictures.length) {
        const largest = Math.max(...pictures.map((r) => Math.min(r.w, r.h)));
        const usable = Math.max(40, 0.06 * short);
        if (largest < usable)
            return `its pictures shrink to ${Math.max(0, Math.round(largest))}px, below a usable ${Math.round(usable)}px`;
    }
    const headline = drawn.layers.find((l) => l.id === 'headline' && l.text);
    const logo = drawn.layers.find((l) => l.kind === 'logo');
    if (headline && aspect >= 2.5) {
        const lines = headline.ink?.length ?? 1;
        if (lines > 3)
            return `the headline breaks into ${lines} lines in a narrow column: it is too long for this strip, so shorten it or use another size`;
        if (logo && headline.text.size / logo.box.h > 2.6)
            return `the headline (${Math.round(headline.text.size)}px) dwarfs the logo (${Math.round(logo.box.h)}px tall)`;
    }
    return undefined;
}
/** Every slot that was passed is in the drawing, whole. */
export function checkDrawn(name, scene, given, drawn) {
    for (const slot of given) {
        if (!scene.slots?.[slot]?.trim() || scene.edits?.[slot]?.hidden)
            continue;
        if (!drawn.layers.some((l) => l.id === slot && l.text))
            throw new Error(`${name} has no room for --${slot}. Leave it out, or use another size or template.`);
    }
}
/** Every layer a template draws at any of its sizes, and what an edit may do to each: the same at every size. */
export function layersOf(t) {
    const out = new Map();
    const add = (id, can) => {
        if (!out.has(id))
            out.set(id, can);
    };
    const hide = (id) => !t.required.includes(id);
    const all = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];
    const first = (a, list) => [a, ...list.filter((x) => x !== a)];
    const items = (list, anchors, inCard = false) => {
        list.forEach((i, k) => {
            const id = itemId(i);
            const lead = k === 0 && anchors ? { anchors } : {};
            if (i.type === 'card') {
                add(id, { move: true, ...lead });
                items(i.items, undefined, true);
            }
            else if (i.type === 'button')
                add(id, { move: true, scale: [0.8, 1.5], ...(inCard ? {} : { align: true }), hide: true, ...lead });
            else
                add(id, { move: true, scale: [i.face === 'label' ? 0.8 : 0.6, 1.6], align: true, hide: hide(id), ...lead });
        });
    };
    for (const size of t.sizes) {
        const spec = SIZES.find((s) => s.id === size);
        const zones = spec ? zonesOf(size, spec.width, spec.height) : undefined;
        const layers = t.layouts ? t.layouts[size].layers : LAYOUTS[t.id]({ W: spec.width, H: spec.height, size, has: () => true, pictures: t.photos ?? 0, safe: zones.safe, avoid: zones.avoid, floor: zones.floor }).layers;
        for (const l of named(layers)) {
            const id = layerId(l);
            if (l.type === 'stack') {
                const v = l.valign === 'center' ? '' : l.valign === 'bottom' ? 'bottom' : 'top';
                const h = l.align === 'right' ? 'right' : l.align === 'center' ? '' : 'left';
                const at = (v && h ? `${v}-${h}` : v || h || 'center');
                // A stack that takes most of the height cannot move far up or down: it keeps its own row of anchors.
                const tall = l.box[3] > 0.55 * (t.layouts ? t.layouts[size].height : spec.height);
                const row = all.filter((x) => (v === 'top' ? x.startsWith('top') : v === 'bottom' ? x.startsWith('bottom') : !x.startsWith('top') && !x.startsWith('bottom')));
                items(l.items, first(at, tall ? row : all));
            }
            else if (l.type === 'logo')
                add(id, { move: true, scale: [0.6, l.corner ? 1.8 : 1.4], hide: !l.required, ...(l.corner ? { anchors: t.logoAnchors ? CORNERS.filter((a) => t.logoAnchors.includes(a)).sort((x, y) => (x === l.corner ? -1 : y === l.corner ? 1 : 0)) : first(l.corner, CORNERS) } : {}) });
            else if (l.type === 'text')
                add(id, { move: true, scale: [0.8, 1.6], hide: hide(id), ...(l.corner ? { anchors: first(l.corner, CORNERS) } : {}) });
            else if (l.type === 'button')
                add(id, { move: true, scale: [0.8, 1.5], hide: true, ...(l.corner ? { anchors: first(l.corner, CORNERS) } : {}) });
            else if (l.type === 'inline') {
                add(id, { move: true, scale: [0.6, 1.4] });
                // The pictures set between its words are a layer of their own (they follow the words).
                if (l.lines.some((line) => line.some((x) => 'photo' in x)))
                    add('pictures', { hide: !t.minPhotos });
            }
            else if (l.type === 'search') {
                add(id, { move: true, scale: [0.8, 1.2], hide: true });
                // A labeled key is drawn as its own layer; it stays on the bar.
                if (l.button)
                    add(`${id}-key`, {});
            }
            else if (l.type === 'photo' || l.type === 'panel' || l.type === 'split')
                add(id, { move: true, scale: [0.6, 1.4], hide: !t.minPhotos });
            else if (l.type === 'light' && id !== 'pictures')
                add(id, l.b ? { move: true, scale: [0.6, 1.8], hide: true } : { hide: true });
            else if (l.type === 'ascii' || l.type === 'art')
                add(id, { hide: true });
            else if (l.type === 'rect')
                add(id, { move: true, hide: !l.required });
        }
    }
    return [...out].map(([id, can]) => ({ id, can }));
}
/** What gives way on purpose when a layer changes (the core's reflows): the other items of its stack close up or move
 * down, an inline heading's pictures follow its words, the light and pictures that keep clear of copy move, and copy
 * steps aside for the logo's clear space when the logo goes to another corner. */
export function reflowsOf(t) {
    const out = new Map();
    const give = (id, ids) => {
        const set = out.get(id) ?? new Set();
        for (const x of ids)
            if (x !== id)
                set.add(x);
        out.set(id, set);
    };
    const ids = (list) => list.flatMap((i) => (i.type === 'card' ? [itemId(i), ...ids(i.items)] : [itemId(i)]));
    for (const size of t.sizes) {
        const spec = SIZES.find((s) => s.id === size);
        const zones = spec ? zonesOf(size, spec.width, spec.height) : undefined;
        const layers = named(t.layouts ? t.layouts[size].layers : LAYOUTS[t.id]({ W: spec.width, H: spec.height, size, has: () => true, pictures: t.photos ?? 0, safe: zones.safe, avoid: zones.avoid, floor: zones.floor }).layers);
        const art = layers.filter((l) => l.type === 'light' || l.type === 'art' || l.type === 'photo' || l.type === 'panel' || l.type === 'split').map(layerId);
        const words = [];
        for (const l of layers) {
            if (l.type === 'stack') {
                const group = ids(l.items);
                words.push(...group);
                for (const id of group)
                    give(id, [...group, ...art]);
            }
            else if (l.type === 'inline') {
                words.push(layerId(l));
                give(layerId(l), ['pictures', ...art]);
            }
            else if (l.type === 'text' || l.type === 'button' || l.type === 'search') {
                words.push(layerId(l));
                give(layerId(l), art);
            }
        }
        give('logo', [...words, ...art]);
    }
    return Object.fromEntries([...out].map(([k, v]) => [k, [...v]]));
}
export function catalogOf(kind) {
    return templates(kind).map((t) => ({
        id: t.id,
        group: t.group,
        name: t.name,
        description: t.description,
        figma: t.figma,
        sizes: t.sizes.map((id) => {
            const l = t.layouts?.[id] ?? SIZES.find((s) => s.id === id);
            return { id, width: l.width, height: l.height };
        }),
        custom: !t.layouts,
        variants: t.variants ? Object.keys(t.variants) : [],
        themes: t.variants ? Object.keys(t.variants) : ['black'],
        slots: Object.fromEntries(Object.entries(t.slots).map(([k, v]) => [k, fill(v)])),
        required: t.required,
        aliases: t.aliases ?? {},
        photos: t.photos ?? 0,
        minPhotos: t.minPhotos ?? 0,
    }));
}
