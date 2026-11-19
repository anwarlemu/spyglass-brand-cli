import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { color, drawScene, rasterizeScene } from '../assets/scene.js';
import { encodePng } from '../assets/png.js';
import { unknown } from '../assets/templates.js';
import { drawShader, subjectRect } from './shader.js';
import { rgbOf, toStraight } from './raster.js';
let cached;
export function illustrateData() {
    cached ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'illustrate.json'), 'utf8'));
    return cached;
}
export const STYLES = () => Object.keys(illustrateData().styles);
/** Light variant frames as the brand assets cut them (the light command's defaults). */
export const LIGHT_FRAMES = { band: [1080, 240], field: [1080, 612], corner: [1080, 1080], 'strip-left': [160, 1080], 'strip-right': [160, 1080], tile: [200, 200], 'close-up': [280, 208], 'curved-strip': [1920, 619] };
// ----- Subjects -----
/** The natural size of a PNG or JPEG, from its header. */
export function pictureSize(data) {
    if (data[0] === 0x89 && data[1] === 0x50)
        return { w: data.readUInt32BE(16), h: data.readUInt32BE(20) };
    let i = 2;
    while (i + 9 < data.length) {
        if (data[i] !== 0xff) {
            i++;
            continue;
        }
        const marker = data[i + 1];
        const len = data.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc)
            return { w: data.readUInt16BE(i + 7), h: data.readUInt16BE(i + 5) };
        i += 2 + len;
    }
    throw new Error('Could not read the picture size (a JPEG without a frame header).');
}
function logoBody(lockup) {
    const file = join(packageRoot, 'brand', 'logo', 'svg', `${lockup}-white.svg`);
    if (!existsSync(file))
        throw new Error(`brand/logo/svg/${lockup}-white.svg is missing.`);
    const raw = readFileSync(file, 'utf8');
    const [, , vw, vh] = (/viewBox="([^"]+)"/.exec(raw)?.[1] ?? '0 0 100 100').split(/[\s,]+/).map(Number);
    const body = raw.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<title>[\s\S]*?<\/title>/g, '');
    return { body: `<g fill="#FFFFFF">${body}</g>`, vw: vw, vh: vh };
}
/** A named subject as white shapes in its own coordinates. */
export function subjectShape(id) {
    const all = illustrateData().subjects;
    const def = all[id];
    if (!def)
        throw unknown('subject', id, Object.keys(all));
    if (def.logo)
        return logoBody(def.logo);
    if (def.wave) {
        const w = def.wave;
        const pts = [];
        for (let i = 0; i <= w.steps; i++)
            pts.push(`${i ? 'L' : 'M'}${w.x0 + i * w.dx} ${Math.round((w.y0 + Math.sin((i / w.steps) * Math.PI * w.turns) * w.amp) * 1000) / 1000}`);
        return { body: `<path d="${pts.join('')}" fill="none" stroke="#FFFFFF" stroke-width="${w.width}" stroke-linecap="round"/>`, vw: def.viewBox[0], vh: def.viewBox[1] };
    }
    return { body: def.svg, vw: def.viewBox[0], vh: def.viewBox[1] };
}
export function pictureSubject(photo) {
    const { w, h } = pictureSize(photo.data);
    return { body: `<image href="data:${photo.mime};base64,${photo.data.toString('base64')}" width="${w}" height="${h}" preserveAspectRatio="none"/>`, vw: w, vh: h };
}
export function shaderSettings(input) {
    const d = illustrateData().shader;
    const merged = { ...d.defaults };
    if (input.preset) {
        const p = d.presets[input.preset];
        if (!p)
            throw unknown('preset', input.preset, Object.keys(d.presets));
        for (const [k, v] of Object.entries(p))
            if (k !== 'name')
                merged[k] = v;
    }
    const keys = [...Object.keys(d.ranges), ...Object.keys(d.choices), 'look', 'width', 'height'];
    for (const [k, raw] of Object.entries(input.set ?? {})) {
        if (!keys.includes(k))
            throw unknown('setting', k, keys);
        if (k === 'look') {
            if (!d.looks[raw])
                throw unknown('look', raw, Object.keys(d.looks));
            merged.look = raw;
        }
        else if (d.choices[k]) {
            if (!d.choices[k].includes(raw))
                throw unknown(`value for ${k}`, raw, d.choices[k]);
            merged[k] = raw;
        }
        else {
            const n = Number(raw);
            const range = d.ranges[k] ?? [50, 6000];
            if (!Number.isFinite(n) || n < range[0] || n > range[1])
                throw new Error(`${k} takes a number from ${range[0]} to ${range[1]}, not \`${raw}\`.`);
            merged[k] = n;
        }
    }
    if (input.width !== undefined)
        merged.width = input.width;
    if (input.height !== undefined)
        merged.height = input.height;
    const settings = { ...merged, seed: input.seed ?? 0 };
    return { settings, look: String(merged.look), ground: String(merged.ground) };
}
export function shaderColors(look, ground) {
    const d = illustrateData().shader;
    const L = d.looks[look];
    if (!L)
        throw unknown('look', look, Object.keys(d.looks));
    const c = (t) => rgbOf(color(t));
    const g = ground === 'none' ? undefined : c(ground);
    const light = g ? 0.2126 * g[0] + 0.7152 * g[1] + 0.0722 * g[2] > 0.5 : false;
    return {
        trail: L.trail.map(([t, n]) => [t, c(n)]),
        split: L.split.map(([t, n]) => [t, c(n)]),
        ground: g,
        light,
        white: c('white'),
        ink: c(d.colors.ink),
        edge: [c(d.colors.edge[0]), c(d.colors.edge[1])],
        tile: light ? [c(d.colors.tileLight[0]), c(d.colors.tileLight[1])] : [c(d.colors.tileDark[0]), c(d.colors.tileDark[1])],
    };
}
function size(req, fallback) {
    const w = req.width ?? fallback[0];
    const h = req.height ?? fallback[1];
    if (!(w >= 16 && h >= 16 && w <= 6000 && h <= 6000))
        throw new Error('--width and --height take 16 to 6000.');
    return [Math.round(w), Math.round(h)];
}
async function sceneOut(scene, meta) {
    const drawn = await drawScene(scene);
    const r = await rasterizeScene(drawn);
    return { svg: drawn.svg, png: r.png, width: drawn.width, height: drawn.height, vector: true, meta };
}
export async function illustrate(req) {
    const data = illustrateData();
    const def = data.styles[req.style];
    if (!def)
        throw unknown('style', req.style, STYLES());
    const seed = Math.trunc(req.seed ?? 0);
    if (req.subject && !def.subjects)
        throw new Error(`The ${req.style} style draws no subject. Subjects belong to: ${STYLES().filter((s) => data.styles[s].subjects).join(', ')}.`);
    if (req.photo && !def.image)
        throw new Error(`The ${req.style} style takes no --image. Pictures go to: ${STYLES().filter((s) => data.styles[s].image).join(', ')}.`);
    if (req.style === 'light' || req.style === 'pattern') {
        const variant = req.variant ?? (req.style === 'pattern' ? data.pattern.variant : 'band');
        if (!LIGHT_FRAMES[variant])
            throw unknown('variant', variant, Object.keys(LIGHT_FRAMES));
        const [w, h] = size(req, req.style === 'light' ? LIGHT_FRAMES[variant] : def.size);
        const layers = [];
        if (req.style === 'pattern' && req.texture !== false)
            layers.push({ type: 'ascii', density: req.density ?? data.pattern.texture });
        layers.push({ type: 'light', variant, seed, source: req.source ?? 'brand' });
        return sceneOut({ width: w, height: h, ground: 'black', layers, seed, light: req.source ?? 'brand' }, { style: req.style, variant, seed, source: req.source ?? 'brand' });
    }
    if (req.variant)
        throw new Error(`--variant belongs to the light and pattern styles.`);
    if (req.style === 'texture') {
        const [w, h] = size(req, def.size);
        return sceneOut({ width: w, height: h, ground: 'black', layers: [{ type: 'ascii', density: req.density ?? 0.5 }], seed }, { style: 'texture', seed, density: req.density ?? 0.5 });
    }
    if (req.style === 'split') {
        if (!req.photo)
            throw new Error('The split style needs a picture: --image photo.jpg.');
        const ps = pictureSize(req.photo.data);
        const [w, h] = size(req, req.width || req.height ? def.size : fitLong(ps.w, ps.h, def.size[0]));
        const shift = Math.round(w * data.split.shift * 100) / 100;
        const bleed = Math.round(w * data.split.bleed * 100) / 100;
        return sceneOut({ width: w, height: h, ground: 'black', layers: [{ type: 'split', box: [0, 0, w, h], index: 0, shift, bleed }], photos: [req.photo], seed }, { style: 'split', shift, seed });
    }
    // The shader.
    const subject = req.photo ? pictureSubject(req.photo) : subjectShape(req.subject ?? 'lockup');
    const { settings, look, ground } = shaderSettings({ preset: req.preset, set: req.set, width: req.width, height: req.height, seed });
    const [w, h] = size({ width: settings.width, height: settings.height }, [settings.width, settings.height]);
    settings.width = w;
    settings.height = h;
    const colors = shaderColors(look, ground);
    const full = drawShader(settings, colors, subject);
    const png = encodePng(toStraight(full.img), w, h, 4);
    // SVG: the light as a picture, the subject over it in vector (a named subject in White or Black); a picture, or
    // the subject in its own colors, stays inside the picture.
    const vectorSubject = !req.photo && (settings.subject === 'white' || settings.subject === 'ink');
    let svg;
    if (vectorSubject) {
        const under = drawShader({ ...settings, subject: 'hidden', edgeSplit: settings.edgeSplit }, colors, subject, { keepEdge: true });
        const r = subjectRect(settings, subject.vw / subject.vh);
        const fillColor = color(settings.subject === 'white' ? 'white' : illustrateData().shader.colors.ink);
        const body = subject.body.replaceAll('#FFFFFF', fillColor);
        svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<image id="light" href="data:image/png;base64,${encodePng(toStraight(under.img), w, h, 4).toString('base64')}" width="${w}" height="${h}"/>\n<svg id="subject" x="${r2(r.x)}" y="${r2(r.y)}" width="${r2(r.w)}" height="${r2(r.h)}" viewBox="0 0 ${subject.vw} ${subject.vh}" preserveAspectRatio="none">${body}</svg>\n</svg>\n`;
    }
    else
        svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<image id="illustration" href="data:image/png;base64,${png.toString('base64')}" width="${w}" height="${h}"/>\n</svg>\n`;
    return { svg, png, width: w, height: h, vector: vectorSubject, meta: { style: 'shader', subject: req.photo ? 'image' : req.subject ?? 'lockup', preset: req.preset ?? null, effect: settings.effect, look, ground, seed } };
}
const r2 = (n) => Math.round(n * 100) / 100;
/** A picture's proportions with its long side at `long`. */
function fitLong(w, h, long) {
    return w >= h ? [long, Math.round((long * h) / w)] : [Math.round((long * w) / h), long];
}
