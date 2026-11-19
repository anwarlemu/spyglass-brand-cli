import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { packageRoot, tokens } from '../lib/brand.js';
import { codeFace, faces } from '../image/fonts.js';
import { capHeight, descent, measure, normalize } from '../image/text.js';
import { cropStraight, encodePng } from './png.js';
// ----- Colors -----
/** A color by token name (`white`, `card-fill`, `neutral-4`, `--ds-color-...`) or hex. */
export function color(value, fallback = '#FFFFFF') {
    if (!value)
        return fallback;
    if (/^#[0-9a-f]{3,8}$/i.test(value) || value === 'none')
        return value.toUpperCase() === 'NONE' ? 'none' : value.toUpperCase();
    const name = value.startsWith('--') ? value : `--ds-color-${value}`;
    const t = tokens()[name];
    const hex = t?.light?.trim();
    if (!hex || !/^#[0-9a-f]{6}$/i.test(hex))
        throw new Error(`Unknown color \`${value}\` (no token ${name}).`);
    return hex.toUpperCase();
}
const loaded = new Map();
export async function generator(name) {
    if (loaded.has(name))
        return loaded.get(name);
    const file = join(packageRoot, 'build', 'generators', `${name}.mjs`);
    if (!existsSync(file))
        throw new Error(`build/generators/${name}.mjs is missing: run the build first.`);
    const mod = (await import(pathToFileURL(file).href));
    loaded.set(name, mod);
    return mod;
}
// ----- Logos -----
const logoCache = new Map();
export function logoNames() {
    const dir = join(packageRoot, 'brand', 'logo', 'svg');
    return ['horizontal', 'vertical', 'mark', 'wordmark', 'horizontal-3d', 'vertical-3d', 'mark-3d'].filter((n) => existsSync(join(dir, `${n}-white.svg`)));
}
function logo(lockup, tone) {
    const key = `${lockup}-${tone}`;
    const hit = logoCache.get(key);
    if (hit)
        return hit;
    const file = join(packageRoot, 'brand', 'logo', 'svg', `${key}.svg`);
    if (!existsSync(file))
        throw new Error(`Unknown lockup \`${lockup}\` in ${tone}. Lockups: ${logoNames().join(', ')} (white or black).`);
    const raw = readFileSync(file, 'utf8');
    const viewBox = /viewBox="([^"]+)"/.exec(raw)?.[1] ?? '0 0 100 100';
    const [, , vw, vh] = viewBox.split(/[\s,]+/).map(Number);
    const fill = /<svg[^>]*\sfill="([^"]+)"/.exec(raw)?.[1] ?? (tone === 'white' ? '#FFFFFF' : '#000000');
    const body = `<g fill="${fill}">${raw.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/g, '')}</g>`;
    const entry = { viewBox, body, vw: vw, vh: vh };
    logoCache.set(key, entry);
    return entry;
}
/** A lockup fitted into a box (kept in proportion, aligned in the box). */
export function logoSvg(lockup, tone, box, align = 'center') {
    const l = logo(lockup, tone);
    const [x, y, w, h] = box;
    const scale = Math.min(w / l.vw, h / l.vh);
    const lw = l.vw * scale;
    const lh = l.vh * scale;
    const lx = align === 'left' ? x : align === 'right' ? x + w - lw : x + (w - lw) / 2;
    return `<svg x="${f(lx)}" y="${f(y + (h - lh) / 2)}" width="${f(lw)}" height="${f(lh)}" viewBox="${l.viewBox}">${l.body}</svg>`;
}
/** Ratio (width over height) of a lockup. */
export function logoRatio(lockup) {
    const l = logo(lockup, 'white');
    return l.vw / l.vh;
}
let facesPending;
export function allFaces() {
    facesPending ??= (async () => {
        const f = await faces();
        const code = await codeFace();
        return { display: f.heading, body: f.text, medium: f.medium, code };
    })();
    return facesPending;
}
function faceFor(all, role) {
    return role === 'display' ? all.display : role === 'body' ? all.body : role === 'code' ? all.code : all.medium;
}
/** Wraps text into lines that fit a width at a size (explicit line breaks kept). A line may run 0.5% past the box:
 * the brand's boxes are set tight to the type, and the vendored faces measure a hair wider than the design tool's. */
export function wrapLines(face, text, size, width, tracking) {
    const lines = [];
    for (const para of normalize(text).split('\n')) {
        const words = para.split(' ').filter(Boolean);
        let line = '';
        for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (!line || measure(face, next, size, tracking) <= width * 1.005)
                line = next;
            else {
                lines.push(line);
                line = word;
            }
        }
        lines.push(line);
    }
    return lines;
}
export class FitError extends Error {
}
/** The size a text box draws at: the brand size if the copy fits its line limit, else a step smaller (to 75%). */
export function fitText(face, text, layer) {
    const tracking = layer.tracking ?? 0;
    const max = layer.maxLines ?? 99;
    for (let size = layer.size; size >= layer.size * 0.75 - 0.01; size -= Math.max(1, layer.size / 40)) {
        const lines = wrapLines(face, text, size, layer.w, tracking);
        const fitsWide = lines.every((l) => measure(face, l, size, tracking) <= layer.w * 1.005 + 0.5 || !l.includes(' '));
        if (lines.length <= max && fitsWide)
            return { size, leading: layer.leading * (size / layer.size), lines };
    }
    throw new FitError(`The ${layer.slot ?? 'text'} is too long for this layout: it needs more than ${max} line${max === 1 ? '' : 's'} at ${Math.round(layer.size * 0.75)}px in a ${layer.w}px box. Shorten it.`);
}
/** Pins a line to the width it was measured at, so every renderer sets it as wide as it was wrapped and aligned
 * (one rasterizer sets the text face about 2% wider without it). */
function fixLength(w) {
    return ` textLength="${f(w)}" lengthAdjust="spacing"`;
}
function textSvg(all, layer, value) {
    const face = faceFor(all, layer.face);
    const caps = layer.caps ?? layer.face === 'label';
    const tracking = layer.tracking ?? (layer.face === 'label' ? 0.06 : 0);
    const text = caps ? value.toUpperCase() : value;
    const fitted = fitText(face, text, { ...layer, tracking });
    const cap = capHeight(face, fitted.size);
    const fill = color(layer.color, '#FFFFFF');
    const ls = tracking ? ` letter-spacing="${f(tracking * fitted.size)}"` : '';
    const op = layer.opacity !== undefined ? ` fill-opacity="${layer.opacity}"` : '';
    const out = fitted.lines.map((line, i) => {
        const w = measure(face, line, fitted.size, tracking);
        const x = layer.align === 'center' ? layer.x + (layer.w - w) / 2 : layer.align === 'right' ? layer.x + layer.w - w : layer.x;
        const y = layer.top + cap + i * fitted.leading;
        return `<text x="${f(x)}" y="${f(y)}" font-family="'${face.family}'" font-size="${f(fitted.size)}" font-weight="${face.weight}" fill="${fill}"${op}${ls}${fixLength(w)} xml:space="preserve">${esc(line)}</text>`;
    });
    const h = cap + (fitted.lines.length - 1) * fitted.leading + descent(face, fitted.size);
    return { svg: out.join(''), box: [layer.x, layer.top, layer.w, h], size: fitted.size };
}
function inlineSvg(all, layer, value, photos) {
    const face = faceFor(all, layer.face);
    const words = normalize(value).split(/\s+/).filter(Boolean);
    const cap = capHeight(face, layer.size);
    const fill = color(layer.color, '#FFFFFF');
    const space = measure(face, ' ', layer.size, 0);
    let at = 0;
    let right = layer.x;
    const out = [];
    layer.lines.forEach((line, li) => {
        const top = layer.top + li * layer.leading;
        let x = layer.x;
        let first = true;
        for (const part of line) {
            if ('photo' in part) {
                if (!first)
                    x += layer.gap;
                out.push(photoSvg([x, top, part.w, cap], photos[part.photo], 0));
                x += part.w;
            }
            else {
                const n = part.words === 'rest' ? words.length - at : part.words;
                const run = words.slice(at, at + n).join(' ');
                at += n;
                if (!run)
                    continue;
                if (!first)
                    x += layer.gap;
                out.push(`<text x="${f(x)}" y="${f(top + cap)}" font-family="'${face.family}'" font-size="${f(layer.size)}" font-weight="${face.weight}" fill="${fill}"${fixLength(measure(face, run, layer.size, 0))} xml:space="preserve">${esc(run)}</text>`);
                x += measure(face, run, layer.size, 0);
            }
            first = false;
        }
        right = Math.max(right, x);
    });
    if (at < words.length)
        throw new FitError(`The ${layer.slot} has ${words.length} words; this layout sets ${at}. Shorten it.`);
    void space;
    const h = (layer.lines.length - 1) * layer.leading + cap + descent(face, layer.size);
    return { svg: out.join(''), box: [layer.x, layer.top, right - layer.x, h] };
}
// ----- Photos -----
function href(p) {
    return `data:${p.mime};base64,${p.data.toString('base64')}`;
}
let uid = 0;
const nextId = (p) => `${p}${++uid}`;
function photoSvg(box, photo, radius = 0, clip) {
    const [x, y, w, h] = box;
    const c = clip ?? box;
    const id = nextId('ph');
    const clipEl = `<clipPath id="${id}"><rect x="${f(c[0])}" y="${f(c[1])}" width="${f(c[2])}" height="${f(c[3])}" rx="${f(radius)}"/></clipPath>`;
    if (!photo)
        return `<rect x="${f(c[0])}" y="${f(c[1])}" width="${f(c[2])}" height="${f(c[3])}" rx="${f(radius)}" fill="${color('card-fill')}"/>`;
    return `${clipEl}<image href="${href(photo)}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
}
/** A photo on a quad whose left and right edges are vertical (a panel seen in perspective): drawn in thin vertical
 * strips, each scaled to the quad's height there, so the picture narrows with the panel. */
function panelSvg(quad, photo, defs) {
    // Corners: top-left, top-right, bottom-right, bottom-left.
    const [tl, tr, br, bl] = quad;
    const poly = quad.map((p) => `${f(p[0])},${f(p[1])}`).join(' ');
    if (!photo)
        return `<polygon points="${poly}" fill="${color('card-fill')}"/>`;
    const id = nextId('pn');
    const x0 = tl[0];
    const x1 = tr[0];
    const width = x1 - x0;
    const aspectH = Math.max(bl[1] - tl[1], br[1] - tr[1]);
    defs.push(`<image id="${id}" href="${href(photo)}" width="${f(width)}" height="${f(aspectH)}" preserveAspectRatio="xMidYMid slice"/>`);
    const clip = nextId('pc');
    const strips = Math.max(4, Math.min(48, Math.round(Math.abs(width) / 6)));
    const parts = [`<clipPath id="${clip}"><polygon points="${poly}"/></clipPath><g clip-path="url(#${clip})">`];
    for (let i = 0; i < strips; i++) {
        const t0 = i / strips;
        const t1 = (i + 1) / strips;
        const tm = (t0 + t1) / 2;
        const top = tl[1] + (tr[1] - tl[1]) * tm;
        const bottom = bl[1] + (br[1] - bl[1]) * tm;
        const sx = x0 + width * t0;
        const sw = (width / strips) * 1.04;
        const sc = (bottom - top) / aspectH;
        const sid = nextId('ps');
        parts.push(`<clipPath id="${sid}"><rect x="${f(sx)}" y="${f(top - 2)}" width="${f(sw)}" height="${f(bottom - top + 4)}"/></clipPath><g clip-path="url(#${sid})"><use href="#${id}" transform="translate(${f(x0)} ${f(top)}) scale(1 ${f(sc)})"/></g>`);
    }
    parts.push('</g>');
    return parts.join('');
}
/** The brand's "photo light split": the photo three times, as its blue, green and red channels, shifted sideways
 * and added, so its edges separate like the light's. */
function splitSvg(box, photo, shift, bleed = 0) {
    const [x, y, w, h] = box;
    if (!photo)
        return `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${color('card-fill')}"/>`;
    const id = nextId('sp');
    const pad = shift * 2 + bleed;
    const channel = (k) => {
        const m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0];
        m[k * 5 + k] = 1;
        return m.join(' ');
    };
    const filter = `<filter id="${id}" x="${f(x - pad)}" y="${f(y - pad)}" width="${f(w + pad * 2)}" height="${f(h + pad * 2)}" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feOffset in="SourceGraphic" dx="${f(-shift)}" result="b0"/><feColorMatrix in="b0" type="matrix" values="${channel(2)}" result="b"/><feColorMatrix in="SourceGraphic" type="matrix" values="${channel(1)}" result="g"/><feOffset in="SourceGraphic" dx="${f(shift)}" result="r0"/><feColorMatrix in="r0" type="matrix" values="${channel(0)}" result="r"/><feComposite in="b" in2="g" operator="arithmetic" k2="1" k3="1" result="bg"/><feComposite in="bg" in2="r" operator="arithmetic" k2="1" k3="1"/></filter>`;
    const clip = nextId('spc');
    return `<defs>${filter}<clipPath id="${clip}"><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/></clipPath></defs><g clip-path="url(#${clip})"><image href="${href(photo)}" x="${f(x - bleed)}" y="${f(y - bleed)}" width="${f(w + bleed * 2)}" height="${f(h + bleed * 2)}" preserveAspectRatio="xMidYMid slice" filter="url(#${id})"/></g>`;
}
export async function drawScene(scene, opts = {}) {
    uid = 0;
    const all = await allFaces();
    const light = await generator('light');
    const ascii = await generator('ascii');
    const slots = scene.slots ?? {};
    const photos = scene.photos ?? [];
    const seed = Math.trunc(scene.seed ?? 0);
    const defs = [];
    const parts = [];
    // Lights are drawn as vectors in the file; the raster document holds a token per light, which rasterizeScene
    // replaces with that light rendered on its own (resvg clips some filter regions inside a larger drawing).
    const lights = [];
    const rasterParts = new Map();
    const ground = scene.ground ? color(scene.ground) : 'none';
    if (ground !== 'none')
        parts.push(`<rect width="${scene.width}" height="${scene.height}" fill="${ground}"/>`);
    // Areas the texture keeps clear: everything that carries copy, the logo or a picture.
    const pad = scene.clearPadding ?? 12;
    const clear = [];
    const keep = (b) => clear.push({ x: b[0] - pad, y: b[1] - pad, w: b[2] + pad * 2, h: b[3] + pad * 2 });
    const texts = new Map();
    const baselines = new Map();
    for (const layer of scene.layers) {
        if (layer.type === 'text') {
            const value = layer.slot ? slots[layer.slot] ?? layer.text : layer.text;
            if (value === undefined || value === '')
                continue;
            const top = layer.after && baselines.has(layer.after.slot) ? baselines.get(layer.after.slot) + layer.after.gap : layer.top;
            const t = textSvg(all, { ...layer, top }, value);
            texts.set(layer, t);
            if (layer.slot)
                baselines.set(layer.slot, t.box[1] + t.box[3] - descent(faceFor(all, layer.face), t.size));
            keep(t.box);
        }
        else if (layer.type === 'inline') {
            const t = inlineSvg(all, layer, slots[layer.slot] ?? '', photos);
            texts.set(layer, t);
            keep(t.box);
        }
        else if (layer.type === 'list') {
            const raw = layer.slot ? slots[layer.slot] : undefined;
            const items = raw !== undefined ? raw.split('|').map((s) => s.trim()).filter(Boolean) : layer.items ?? [];
            let top = layer.top;
            const svgs = [];
            const face = faceFor(all, layer.face);
            for (const item of items) {
                const t = textSvg(all, { ...layer, type: 'text', top, maxLines: layer.maxLines ?? 3 }, item);
                svgs.push(t.svg);
                top = t.box[1] + t.box[3] - descent(face, layer.size) + layer.gap;
            }
            const box = [layer.x, layer.top, layer.w, top - layer.top];
            texts.set(layer, { svg: svgs.join(''), box });
            keep(box);
        }
        else if (layer.type === 'logo' || layer.type === 'photo' || layer.type === 'button' || layer.type === 'search' || layer.type === 'split')
            keep(layer.type === 'photo' && layer.clip ? layer.clip : layer.box);
        else if (layer.type === 'rect' && layer.fill !== 'none' && (layer.radius ?? 0) > 0)
            keep(layer.box);
        else if (layer.type === 'panel') {
            const xs = layer.quad.map((p) => p[0]);
            const ys = layer.quad.map((p) => p[1]);
            keep([Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]);
        }
    }
    let lightIndex = 0;
    let margin = 0;
    for (const layer of scene.layers) {
        switch (layer.type) {
            case 'rect': {
                const [x, y, w, h] = layer.box;
                const stroke = layer.stroke ? ` stroke="${color(layer.stroke)}" stroke-width="1"` : '';
                const op = layer.opacity !== undefined ? ` opacity="${layer.opacity}"` : '';
                const inset = layer.stroke ? 0.5 : 0;
                parts.push(`<rect x="${f(x + inset)}" y="${f(y + inset)}" width="${f(w - inset * 2)}" height="${f(h - inset * 2)}" rx="${f(layer.radius ?? 0)}" fill="${color(layer.fill)}"${stroke}${op}/>`);
                break;
            }
            case 'text':
            case 'inline':
            case 'list': {
                const t = texts.get(layer);
                if (t)
                    parts.push(t.svg);
                break;
            }
            case 'logo':
                parts.push(logoSvg(layer.lockup, layer.color === 'black' ? 'black' : 'white', layer.box, layer.align));
                break;
            case 'light': {
                const win = layer.window ?? [0, 0, scene.width, scene.height];
                const source = layer.source ?? scene.light ?? 'brand';
                const lseed = seed + (layer.seed ?? 0) + lightIndex * 101;
                // A placed light (the brand's own window, from the Figma) or a named variant of the generator.
                const g = (layer.b
                    ? light.placedLightGeometry({ width: win[2], height: win[3], b: { x: layer.b[0], y: layer.b[1], w: layer.b[2], h: layer.b[3] }, shift: layer.shift ?? 34, source, seed: lseed })
                    : light.lightGeometry({ width: win[2], height: win[3], variant: layer.variant ?? 'band', seed: layer.seed ?? seed, source }));
                const lpad = Math.ceil(g.offset * 2 + g.blur * 4) + 24;
                margin = Math.max(margin, lpad);
                // The file blends with CSS plus-lighter, as the brand does; the raster adds the layers in a filter.
                const id = `l${lightIndex++}`;
                const svg = light.lightGeometrySvg(g, { ground: false, blend: 'css', id }).replace(/<svg /, '<svg overflow="hidden" ');
                const i = lights.length;
                lights.push({ svg: light.lightGeometrySvg(g, { ground: false, blend: 'filter', id }), win, pad: lpad });
                const wrap = (inner) => {
                    if (!layer.clipQuad)
                        return inner;
                    const cid = `lq${i}`;
                    return `<clipPath id="${cid}"><polygon points="${layer.clipQuad.map((p) => `${f(p[0])},${f(p[1])}`).join(' ')}"/></clipPath><g clip-path="url(#${cid})">${inner}</g>`;
                };
                parts.push(wrap(`<g transform="translate(${f(win[0])} ${f(win[1])})" style="isolation:isolate">${svg}</g>`));
                rasterParts.set(parts.length - 1, wrap(`\u0000L${i}\u0000`));
                break;
            }
            case 'ascii': {
                const [x, y, w, h] = layer.box ?? [0, 0, scene.width, scene.height];
                const local = clear.map((c) => ({ x: c.x - x, y: c.y - y, w: c.w, h: c.h }));
                const svg = ascii.asciiSvg({ width: w, height: h, seed: seed + (layer.seed ?? 0), density: layer.density ?? 0.7, ground: false, font: all.code.family, clearPx: local, size: layer.size });
                parts.push(`<g transform="translate(${f(x)} ${f(y)})">${svg.replace(/font-family="[^"]*"/, `font-family="'${all.code.family}'"`)}</g>`);
                break;
            }
            case 'photo':
                parts.push(photoSvg(layer.box, photos[layer.index], layer.radius ?? 0, layer.clip));
                break;
            case 'panel':
                parts.push(panelSvg(layer.quad, photos[layer.index], defs));
                break;
            case 'split':
                parts.push(splitSvg(layer.box, photos[layer.index], layer.shift, layer.bleed ?? 0));
                break;
            case 'button': {
                const [x, y, w, h] = layer.box;
                const label = (layer.slot ? slots[layer.slot] ?? layer.text : layer.text) ?? '';
                parts.push(`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(layer.radius ?? 10)}" fill="${color(layer.fill ?? 'white')}"/>`);
                if (label) {
                    const face = all.medium;
                    const cap = capHeight(face, layer.size);
                    const t = textSvg(all, { type: 'text', face: 'medium', size: layer.size, leading: layer.size * 1.3, x: x + 12, w: w - 24, top: y + (h - cap) / 2, align: 'center', color: layer.color ?? 'black', maxLines: 1, slot: layer.slot }, label);
                    parts.push(t.svg);
                }
                break;
            }
            case 'search': {
                const [x, y, w, h] = layer.box;
                const inset = 16;
                const bh = h - inset * 2;
                const label = layer.button ?? 'Search';
                const face = all.medium;
                const bw = Math.round(measure(face, label, 20, 0) + 70);
                parts.push(`<rect x="${f(x + 0.5)}" y="${f(y + 0.5)}" width="${f(w - 1)}" height="${f(h - 1)}" rx="10" fill="${color('black')}" stroke="${color('neutral-4')}" stroke-width="1"/>`);
                parts.push(`<rect x="${f(x + w - inset - bw)}" y="${f(y + inset)}" width="${f(bw)}" height="${f(bh)}" rx="10" fill="${color('white')}"/>`);
                const capB = capHeight(face, 20);
                parts.push(textSvg(all, { type: 'text', face: 'medium', size: 20, leading: 26, x: x + w - inset - bw, w: bw, top: y + inset + (bh - capB) / 2, align: 'center', color: 'black', maxLines: 1 }, label).svg);
                const prompt = (layer.slot ? slots[layer.slot] ?? layer.text : layer.text) ?? '';
                if (prompt) {
                    const capP = capHeight(all.body, layer.size);
                    parts.push(textSvg(all, { type: 'text', face: 'body', size: layer.size, leading: layer.size * 1.33, x: x + 32, w: w - 32 - bw - inset - 24, top: y + (h - capP) / 2, color: 'white', maxLines: 1, slot: layer.slot }, prompt).svg);
                }
                break;
            }
            case 'path': {
                const dash = layer.dash ? ` stroke-dasharray="${layer.dash}"` : '';
                const pid = layer.id ? ` id="${esc(layer.id)}"` : '';
                parts.push(`<path${pid} d="${layer.d}" fill="${layer.fill ? color(layer.fill) : 'none'}"${layer.stroke ? ` stroke="${color(layer.stroke)}" stroke-width="${layer.strokeWidth ?? 1}"` : ''}${dash}/>`);
                // A cut line is for the cutter, not the printer: it stays in the file and out of the picture.
                if (layer.svgOnly)
                    rasterParts.set(parts.length - 1, '');
                break;
            }
        }
    }
    const fontCss = opts.embedFonts === false ? '' : [all.display, all.body, all.medium, all.code]
        .map((face) => `@font-face{font-family:"${face.family}";font-weight:${face.weight};font-style:normal;src:url("data:font/woff2;base64,${face.woff2.toString('base64')}") format("woff2");}`)
        .join('');
    const head = `<defs>${fontCss ? `<style type="text/css"><![CDATA[${fontCss}]]></style>` : ''}${defs.join('')}</defs>`;
    const body = parts.join('\n');
    const W = scene.width;
    const H = scene.height;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${head}
${body}
</svg>
`;
    const m = margin;
    const rbody = parts.map((p, i) => rasterParts.get(i) ?? p).join('\n');
    const raster = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W + 2 * m}" height="${H + 2 * m}" viewBox="${-m} ${-m} ${W + 2 * m} ${H + 2 * m}">${head}${rbody}</svg>`;
    return { svg, raster, margin: m, width: W, height: H, ground, lights };
}
/** A drawn scene as PNG: rasterized in its margin at `scale`, cropped to the frame, straight alpha. */
export async function rasterizeScene(d, opts = {}) {
    const scale = opts.scale ?? 1;
    let raster = d.raster;
    for (const [i, l] of d.lights.entries()) {
        // The light alone, inside a margin wider than its filter, cropped to its window.
        const [, , w, h] = l.win;
        const doc = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w + 2 * l.pad}" height="${h + 2 * l.pad}" viewBox="${-l.pad} ${-l.pad} ${w + 2 * l.pad} ${h + 2 * l.pad}">${l.svg}</svg>`;
        const lr = await rasterizeSvg(doc, { scale });
        const p = Math.round(l.pad * scale);
        const lw = Math.max(1, Math.round(w * scale));
        const lh = Math.max(1, Math.round(h * scale));
        const png = encodePng(cropStraight(lr.pixels, lr.width, p, p, Math.min(lw, lr.width - p), Math.min(lh, lr.height - p)), Math.min(lw, lr.width - p), Math.min(lh, lr.height - p), 4);
        raster = raster.replace(`\u0000L${i}\u0000`, `<image href="data:image/png;base64,${png.toString('base64')}" x="${f(l.win[0])}" y="${f(l.win[1])}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="none"/>`);
    }
    const r = await rasterizeSvg(raster, { scale, background: d.ground });
    const m = Math.round(d.margin * scale);
    const w = Math.round(d.width * scale);
    const h = Math.round(d.height * scale);
    const pixels = cropStraight(r.pixels, r.width, m, m, Math.min(w, r.width - m), Math.min(h, r.height - m));
    return { png: encodePng(pixels, w, h, 4, opts.dpi), pixels, width: w, height: h };
}
/** Rasterizes an SVG with the vendored faces only. `scale` multiplies the pixel size (print files at 300 dpi). */
export async function rasterizeSvg(svg, opts = {}) {
    const all = await allFaces();
    const resvg = new Resvg(svg, {
        background: opts.background && opts.background !== 'none' ? opts.background : undefined,
        fitTo: opts.scale && opts.scale !== 1 ? { mode: 'zoom', value: opts.scale } : { mode: 'original' },
        textRendering: 2,
        font: { loadSystemFonts: false, fontFiles: [all.display.ttfPath, all.body.ttfPath, all.medium.ttfPath, all.code.ttfPath], defaultFontFamily: all.body.family },
    });
    const r = resvg.render();
    return { png: Buffer.from(r.asPng()), pixels: Buffer.from(r.pixels), width: r.width, height: r.height };
}
export function f(n) {
    const r = Math.round(n * 100) / 100;
    return Object.is(r, -0) ? '0' : String(r);
}
export function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
