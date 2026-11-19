import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { draw } from './draw.js';
import { faces } from './fonts.js';
import { catalog, groundById, sizeById, templateById, theme } from './spec.js';
export async function renderImages(req) {
    const title = req.title.trim();
    if (!title)
        throw new Error('A title is required.');
    const out = [];
    for (const id of req.sizes) {
        const size = sizeById(id);
        if (!size)
            continue;
        const copy = { template: req.template, ground: req.ground, title, text: req.text, eyebrow: req.eyebrow, by: req.by, image: req.image };
        const svg = await draw(copy, size);
        out.push({ template: req.template, size: id, ground: req.ground, width: size.width, height: size.height, svg, png: await raster(svg, theme(req.ground).bg) });
    }
    return out;
}
/** Rasterize with the vendored faces only, so a second machine cannot pick up a different system font. */
export async function rasterize(svg, background) {
    const loaded = await faces();
    const resvg = new Resvg(svg, {
        background,
        fitTo: { mode: 'original' },
        textRendering: 2,
        font: {
            loadSystemFonts: false,
            fontFiles: [loaded.heading.ttfPath, loaded.text.ttfPath, loaded.medium.ttfPath],
            defaultFontFamily: loaded.text.family,
            serifFamily: loaded.heading.family,
            sansSerifFamily: loaded.text.family,
        },
    });
    const rendered = resvg.render();
    return { png: Buffer.from(rendered.asPng()), pixels: Buffer.from(rendered.pixels), width: rendered.width, height: rendered.height };
}
export async function raster(svg, background) {
    return (await rasterize(svg, background)).png;
}
export function pngSize(png) {
    if (png.length < 24 || png.toString('ascii', 12, 16) !== 'IHDR')
        throw new Error('Output is not a PNG.');
    return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}
export function writeImages(cwd, out, rendered, format) {
    if (!rendered.length)
        return [];
    const named = out && /\.(png|svg)$/i.test(out) ? resolve(cwd, out) : undefined;
    if (named && rendered.length > 1)
        throw new Error('--out is a file, so pass one --size. For several images, pass a directory.');
    const dir = named ? dirname(named) : resolve(cwd, out ?? 'imagery');
    mkdirSync(dir, { recursive: true });
    const written = [];
    for (const image of rendered) {
        const base = named ? named.replace(/\.(png|svg)$/i, '') : join(dir, fileBase(image));
        const targets = [];
        if (format !== 'svg')
            targets.push(['png', image.png]);
        if (format !== 'png')
            targets.push(['svg', image.svg]);
        for (const [ext, data] of targets) {
            const path = `${base}.${ext}`;
            writeFileSync(path, data);
            written.push({ path: display(cwd, path), format: ext, template: image.template, size: image.size, ground: image.ground, width: image.width, height: image.height });
        }
    }
    return written;
}
export function resolveRequest(input) {
    const template = templateById(input.template || 'statement');
    if (!template)
        throw new Error(`Unknown template \`${input.template}\`. Templates: ${catalog().templates.map((t) => t.id).join(', ')}.`);
    const ground = groundById(input.ground || 'paper');
    if (!ground)
        throw new Error(`Unknown ground \`${input.ground}\`. Grounds: paper, ink.`);
    const format = (input.format || 'both').toLowerCase();
    if (format !== 'png' && format !== 'svg' && format !== 'both')
        throw new Error('Unknown format. Use png, svg or both.');
    const tokens = [...(input.sizes ?? []), ...(input.size ? input.size.split(',') : [])].map((s) => s.trim()).filter(Boolean);
    const asked = tokens.length ? tokens : ['og'];
    const sizes = [];
    for (const token of asked) {
        if (token.toLowerCase() === 'all') {
            for (const s of catalog().sizes)
                if (!sizes.includes(s.id))
                    sizes.push(s.id);
            continue;
        }
        const size = sizeById(token);
        if (!size)
            throw new Error(`Unknown size \`${token}\`. Sizes: ${catalog().sizes.map((s) => s.id).join(', ')}, or all.`);
        if (!sizes.includes(size.id))
            sizes.push(size.id);
    }
    return { template, sizes, ground, format };
}
function fileBase(image) {
    return `${image.template}-${image.size}${image.ground === 'ink' ? '-ink' : ''}`;
}
function display(cwd, path) {
    const rel = relative(cwd, path);
    return !rel || rel.startsWith('..') || isAbsolute(rel) ? path : rel;
}
export function mimeOf(data) {
    if (data.length > 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47)
        return 'image/png';
    if (data.length > 3 && data[0] === 0xff && data[1] === 0xd8)
        return 'image/jpeg';
    return undefined;
}
