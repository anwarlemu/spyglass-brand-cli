import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import { brand, packageRoot } from '../lib/brand.js';
import { codeFace } from '../image/fonts.js';
import { suggest } from '../lib/names.js';
const FRAMES = { band: [1080, 240], field: [1080, 612], corner: [1080, 1080], 'strip-left': [160, 1080], 'strip-right': [160, 1080], tile: [200, 200], 'close-up': [280, 208], 'curved-strip': [1920, 619] };
async function generator(name) {
    const file = join(packageRoot, 'build', 'generators', `${name}.mjs`);
    if (!existsSync(file))
        throw new Error(`build/generators/${name}.mjs is missing: run the build first.`);
    return (await import(pathToFileURL(file).href));
}
const num = (flags, key, fallback) => {
    const v = flags[key];
    if (v === undefined)
        return fallback;
    const n = Number(v);
    if (typeof v !== 'string' || !Number.isFinite(n))
        throw new Error(`--${key} takes a number, not \`${String(v)}\`.`);
    return n;
};
const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
async function write(svg, out, format, width, fontFiles = []) {
    mkdirSync(dirname(out), { recursive: true });
    if (format === 'svg')
        writeFileSync(out, svg);
    else
        writeFileSync(out, new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles, loadSystemFonts: false } }).render().asPng());
    return out;
}
export function patternHelp(kind) {
    const b = brand().bin;
    if (kind === 'light') {
        return [
            "The brand light as a file: one shape in Blue, Green and Red, shifted, blurred and blended plus-lighter on Black.",
            'Seeded: the same options write the same bytes. Seeds below the number of brand windows for a variant are the brand',
            "assets' own windows onto the brand's heat map (--source brand, the default); --source generated builds a new heat map.",
            '',
            `  ${b} light --variant band --seed 1 --out band.svg`,
            `  ${b} light --variant corner --source generated --seed 7 --width 1080 --height 1350 --format png --out corner.png`,
            `  ${b} light --list`,
            '',
            `Variants: ${Object.keys(FRAMES).join(', ')}. --width and --height default to the variant's frame in the brand assets.`,
            '--format svg (default; blended with CSS plus-lighter) or png (the same light, added in an SVG filter and rasterized).',
            '--ground false leaves the Black out (SVG only). --out defaults to light-<variant>-<seed>.<format>.',
        ].join('\n');
    }
    return [
        'The ASCII texture as a file: Geist Mono characters from " .:-=+*#" off a soft heat map, White at 0.35 opacity.',
        'Seeded: the same options write the same bytes.',
        '',
        `  ${b} ascii --seed 4 --width 1080 --height 1080 --out texture.svg`,
        `  ${b} ascii --seed 4 --density 0.6 --format png --ground true --out texture.png`,
        '',
        '--density 0 to 1 (default 0.5). --ground true paints Black under it. --format svg (default) or png.',
    ].join('\n');
}
export async function runLight(cwd, args, flags) {
    if (flags.help === true)
        return { json: { help: true }, text: patternHelp('light') };
    const mod = await generator('light');
    if (flags.list === true) {
        const list = mod.LIGHT_VARIANTS.map((v) => ({ variant: v, width: FRAMES[v][0], height: FRAMES[v][1] }));
        return { json: { variants: list, sources: ['brand', 'generated'], formats: ['svg', 'png'] }, text: list.map((v) => `${v.variant.padEnd(14)}${v.width}x${v.height}`).join('\n') };
    }
    if (args.length)
        throw new Error(`light takes no arguments; pass --variant. ${brand().bin} light --list`);
    const variant = str(flags.variant) ?? 'band';
    if (!mod.LIGHT_VARIANTS.includes(variant))
        throw new Error(`Unknown variant \`${variant}\`. Variants: ${mod.LIGHT_VARIANTS.join(', ')}.${suggest(variant, mod.LIGHT_VARIANTS).length ? ` Did you mean ${suggest(variant, mod.LIGHT_VARIANTS)[0]}?` : ''}`);
    const source = str(flags.source) ?? 'brand';
    if (source !== 'brand' && source !== 'generated')
        throw new Error(`--source takes brand or generated, not \`${source}\`.`);
    const format = str(flags.format) ?? 'svg';
    if (format !== 'svg' && format !== 'png')
        throw new Error(`--format takes svg or png, not \`${format}\`.`);
    const [fw, fh] = FRAMES[variant];
    const width = num(flags, 'width', fw);
    const height = num(flags, 'height', fh);
    const seed = Math.trunc(num(flags, 'seed', 0));
    if (!(width > 0 && height > 0) || width > 8000 || height > 8000)
        throw new Error('--width and --height take 1 to 8000.');
    if (flags.ground !== undefined && flags.ground !== 'true' && flags.ground !== 'false')
        throw new Error('--ground takes true or false.');
    const ground = flags.ground !== 'false';
    const svg = mod.lightSvg({ width, height, variant, seed, source, ground: format === 'png' ? true : ground, blend: format === 'png' ? 'filter' : 'css' });
    const out = resolve(cwd, str(flags.out) ?? `light-${variant}-${seed}.${format}`);
    await write(svg, out, format, width);
    const from = variant === 'curved-strip' ? 'a generated curved strip' : source === 'brand' ? `the brand window of ${mod.lightWindow(variant, seed, width, height).from}` : `a heat map generated from seed ${seed}`;
    const result = { file: out, variant, source, seed, width, height, format, from };
    return { json: result, text: `${out} (${width}x${height}, ${variant}, seed ${seed}: ${from})` };
}
export async function runAscii(cwd, args, flags) {
    if (flags.help === true)
        return { json: { help: true }, text: patternHelp('ascii') };
    if (args.length)
        throw new Error(`ascii takes no arguments. ${brand().bin} ascii --seed 4 --out texture.svg`);
    const mod = await generator('ascii');
    const format = str(flags.format) ?? 'svg';
    if (format !== 'svg' && format !== 'png')
        throw new Error(`--format takes svg or png, not \`${format}\`.`);
    const width = num(flags, 'width', 1080);
    const height = num(flags, 'height', 1080);
    const seed = Math.trunc(num(flags, 'seed', 0));
    const density = num(flags, 'density', 0.5);
    if (!(width > 0 && height > 0) || width > 8000 || height > 8000)
        throw new Error('--width and --height take 1 to 8000.');
    if (density < 0 || density > 1)
        throw new Error('--density takes 0 to 1.');
    const face = await codeFace();
    const svg = mod.asciiSvg({ width, height, seed, density, ground: flags.ground === 'true', font: face.family });
    const out = resolve(cwd, str(flags.out) ?? `ascii-${seed}.${format}`);
    await write(svg, out, format, width, [face.ttfPath]);
    const result = { file: out, seed, width, height, density, format };
    return { json: result, text: `${out} (${width}x${height}, seed ${seed})` };
}
