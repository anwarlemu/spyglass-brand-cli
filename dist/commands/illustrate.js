import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { display, format, int, list, readPhoto, str, write } from '../assets/io.js';
import { unknown } from '../assets/templates.js';
import { helpRow } from '../lib/help-row.js';
import { illustrate, illustrateData, LIGHT_FRAMES, STYLES } from '../illustrate/build.js';
// `illustrate` writes the brand's own imagery: the pattern, the light, the texture and the photo light split
// (brand/assets/illustrate.json; the rules are brand/illustration.md). PNG and SVG, the same bytes for the same inputs.
export const ILLUSTRATE_FLAGS = ['image', 'variant', 'source', 'seed', 'width', 'height', 'density', 'texture', 'format', 'out', 'list', 'all'];
export function illustrateHelp() {
    const b = brand().bin;
    const row = (cmd, what) => helpRow(cmd, what, 64);
    return [
        "The brand's own imagery as files: the pattern, the light, the ASCII texture and the photo light split.",
        'PNG and SVG; the same inputs write the same bytes. Rules and sources: brand/illustration.md.',
        '',
        row(`${b} illustrate pattern --variant corner --seed 2`, 'The light flowing in, the texture behind it'),
        row(`${b} illustrate light --variant strip-left`, 'The light alone, any named variant'),
        row(`${b} illustrate texture --density 0.6`, 'The ASCII texture alone'),
        row(`${b} illustrate split --image photo.jpg`, 'A picture split into its color channels'),
        row(`${b} illustrate --list`, 'Styles and light variants'),
        row(`${b} illustrate --all --out illustrations`, 'A gallery of every style'),
        '',
        `Styles: ${STYLES().join(', ')}. split takes --image (PNG or JPEG).`,
        `Variants (light, pattern): ${Object.keys(LIGHT_FRAMES).join(', ')}. --source brand (default) or generated, --seed.`,
        '--width and --height override the frame. --texture false leaves the texture out of the pattern.',
        '--format png, svg or both (default). --out is a directory (default illustrations/) or one .png or .svg file.',
    ].join('\n');
}
function catalog() {
    const d = illustrateData();
    return {
        styles: Object.entries(d.styles).map(([id, s]) => ({ id, ...s })),
        variants: Object.entries(LIGHT_FRAMES).map(([id, [width, height]]) => ({ id, width, height })),
    };
}
const num = (flags, key) => {
    const v = flags[key];
    if (v === undefined)
        return undefined;
    const n = Number(v);
    if (typeof v !== 'string' || !Number.isFinite(n))
        throw new Error(`--${key} takes a number, not \`${String(v)}\`.`);
    return n;
};
export async function runIllustrate(cwd, args, flags) {
    if (flags.list === true || args[0] === 'list') {
        const c = catalog();
        return {
            json: c,
            text: [
                ...c.styles.map((s) => `${s.id.padEnd(10)}${s.description}`),
                '',
                `Variants: ${c.variants.map((v) => `${v.id} ${v.width}x${v.height}`).join(', ')}`,
            ].join('\n'),
        };
    }
    const fmt = format(flags, ['png', 'svg', 'both'], 'both');
    const seed = int(flags, 'seed', 0, 0, 1_000_000);
    const source = str(flags.source);
    if (source !== undefined && source !== 'brand' && source !== 'generated')
        throw new Error(`--source takes brand or generated, not \`${source}\`.`);
    if (flags.texture !== undefined && flags.texture !== 'true' && flags.texture !== 'false')
        throw new Error('--texture takes true or false.');
    const density = num(flags, 'density');
    if (density !== undefined && (density < 0 || density > 1))
        throw new Error('--density takes 0 to 1.');
    const jobs = [];
    if (flags.all === true) {
        if (args.length)
            throw new Error('Pass a style or --all, not both.');
        jobs.push({ name: 'pattern', req: { style: 'pattern', seed } });
        for (const v of Object.keys(LIGHT_FRAMES))
            jobs.push({ name: `light-${v}`, req: { style: 'light', variant: v, seed } });
        jobs.push({ name: 'texture', req: { style: 'texture', seed } });
    }
    else {
        const style = args[0];
        if (!style)
            throw new Error(`Name a style: ${STYLES().join(', ')}. ${brand().bin} illustrate --list`);
        if (!STYLES().includes(style))
            throw unknown('style', style, STYLES());
        if (args.length > 1)
            throw new Error(`illustrate takes one style; got ${args.join(' ')}.`);
        const images = list(flags.image);
        if (images.length > 1)
            throw new Error('--image takes one picture here.');
        const photo = images[0] ? await readPhoto(cwd, images[0], { alpha: true }) : undefined;
        const req = {
            style: style,
            photo,
            variant: str(flags.variant),
            source: source,
            seed,
            width: num(flags, 'width'),
            height: num(flags, 'height'),
            density,
            texture: flags.texture === undefined ? undefined : flags.texture === 'true',
        };
        const tag = style === 'light' || style === 'pattern' ? req.variant ?? (style === 'pattern' ? illustrateData().pattern.variant : 'band') : '';
        jobs.push({ name: [style, tag, String(seed)].filter(Boolean).join('-'), req });
    }
    const out = str(flags.out);
    const single = out && /\.(png|svg)$/i.test(out) ? resolve(cwd, out) : undefined;
    if (single && jobs.length > 1)
        throw new Error('--out names one file; --all writes many. Pass a directory.');
    const singleFormat = single ? (single.toLowerCase().endsWith('.svg') ? 'svg' : 'png') : fmt;
    const dir = resolve(cwd, out && !single ? out : 'illustrations');
    const files = [];
    for (const job of jobs) {
        const r = await illustrate(job.req);
        const base = single ? single.replace(/\.(png|svg)$/i, '') : join(dir, job.name);
        if (singleFormat !== 'svg') {
            write(`${base}.png`, r.png);
            files.push({ path: display(cwd, `${base}.png`), format: 'png', width: r.width, height: r.height, vector: false, ...r.meta });
        }
        if (singleFormat !== 'png') {
            write(`${base}.svg`, r.svg);
            files.push({ path: display(cwd, `${base}.svg`), format: 'svg', width: r.width, height: r.height, vector: r.vector, ...r.meta });
        }
    }
    return { json: { files }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
}
