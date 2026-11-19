import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { drawScene, rasterizeScene, FitError } from '../assets/scene.js';
import { catalogOf, findTemplate, sceneFor, slotNames, templates } from '../assets/templates.js';
import { display, format, int, lightSource, list, readPhoto, str, write } from '../assets/io.js';
import { helpRow } from '../lib/help-row.js';
// `image` draws the brand's layouts (brand/assets/image.json: every post, ad, banner and logo background on the brand
// assets page, plus Open Graph and story sizes derived from them) with your copy and pictures.
export const IMAGE_FLAGS = ['template', 'size', 'variant', 'image', 'seed', 'light', 'format', 'out', 'list', 'all', 'title', 'text'];
/** Older names for two slots. */
const ALIASES = { title: 'headline', text: 'body' };
export function imageHelp() {
    const b = brand().bin;
    const row = (cmd, what) => helpRow(cmd, what, 58);
    const groups = [...new Set(templates('image').map((t) => t.group))];
    return [
        'Social posts, ads, banners, avatars, logo backgrounds, Open Graph cards and stories: the layouts on the brand',
        'assets page, drawn with your copy and pictures. The same inputs write the same bytes.',
        '',
        row(`${b} image --template post-offer --headline "..."`, 'One layout, PNG and SVG in imagery/'),
        row(`${b} image --template ad-search-bar --image a.png --image b.png`, 'Pictures fill the photo slots in order'),
        row(`${b} image --template banner-tagline --size linkedin`, 'Banners come in x, linkedin and linkedin-company'),
        row(`${b} image --template logo-background --variant yellow`, 'Approved backgrounds only'),
        row(`${b} image --template og --seed 4 --light generated`, 'A light generated from the seed, and its texture'),
        row(`${b} image --all --out imagery`, 'Every layout at every size and variant'),
        row(`${b} image --list`, 'Templates with their sizes, slots and photo count'),
        '',
        `Groups: ${groups.join(', ')}. Text goes in by slot: ${slotNames('image').map((s) => `--${s}`).join(', ')} (each template names its own).`,
        '--image is a PNG or JPEG; repeat it for templates with several pictures. Without one a slot is the card fill.',
        '--seed moves the ASCII texture (and a generated light). --light brand (default) keeps the brand heat map.',
        '--format png, svg or both (default). --out is a directory, or one .png or .svg file for one image.',
        'Copy that does not fit a layout at 75% of its size is an error: shorten it. Write in sentence case.',
    ].join('\n');
}
export async function runImage(cwd, args, flags) {
    if (flags.list === true || args[0] === 'list') {
        const cat = catalogOf('image');
        return {
            json: { templates: cat },
            text: cat.map((t) => `${t.id.padEnd(26)}${t.sizes.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}${t.variants.length ? `  variants: ${t.variants.join(', ')}` : ''}${t.photos ? `  photos: ${t.photos}` : ''}${Object.keys(t.slots).length ? `  slots: ${Object.keys(t.slots).join(', ')}` : ''}`).join('\n'),
        };
    }
    if (args.length)
        throw new Error(`image takes no arguments. Pass --template. ${brand().bin} image --list`);
    const fmt = format(flags, ['png', 'svg', 'both'], 'both');
    const seed = int(flags, 'seed', 0, 0, 1_000_000);
    const light = lightSource(flags);
    const photos = list(flags.image).map((p) => readPhoto(cwd, p));
    const slots = {};
    for (const name of [...slotNames('image'), ...Object.keys(ALIASES)]) {
        const v = flags[name];
        if (v === undefined)
            continue;
        if (typeof v !== 'string' || !v.trim())
            throw new Error(`--${name} needs a value.`);
        const key = ALIASES[name] ?? name;
        if (slots[key] !== undefined && slots[key] !== v.trim())
            throw new Error(`--${name} and --${key} disagree. Pass one.`);
        slots[key] = v.trim();
    }
    const jobs = [];
    if (flags.all === true) {
        if (str(flags.template))
            throw new Error('Pass --template or --all, not both.');
        for (const t of templates('image'))
            for (const size of Object.keys(t.sizes))
                for (const variant of t.variants ? Object.keys(t.variants) : [undefined])
                    jobs.push({ t, size, variant });
    }
    else {
        const id = str(flags.template);
        if (!id)
            throw new Error(`Name a template: ${brand().bin} image --template post-offer (--list shows them all).`);
        const t = findTemplate('image', id);
        const sizes = str(flags.size)?.toLowerCase() === 'all' ? Object.keys(t.sizes) : [str(flags.size)];
        for (const size of sizes)
            jobs.push({ t, size, variant: str(flags.variant) });
    }
    const out = str(flags.out);
    const single = out && /\.(png|svg)$/i.test(out) ? resolve(cwd, out) : undefined;
    if (single && (jobs.length > 1 || fmt === 'both'))
        throw new Error('--out names one file, so pass one template, one size and --format png or svg. For several files, pass a directory.');
    const dir = resolve(cwd, out && !single ? out : 'imagery');
    const files = [];
    for (const job of jobs) {
        const all = flags.all === true;
        const { scene, size, variant } = sceneFor(job.t, { size: job.size, variant: job.variant, slots: all ? {} : slots, photos: all ? [] : photos, seed, light });
        let drawn;
        try {
            drawn = await drawScene(scene);
        }
        catch (err) {
            if (err instanceof FitError)
                throw new Error(`${job.t.id}: ${err.message}`);
            throw err;
        }
        const base = single ? single.replace(/\.(png|svg)$/i, '') : join(dir, `${job.t.id}${Object.keys(job.t.sizes).length > 1 ? `-${size}` : ''}${variant && job.t.variants ? `-${variant}` : ''}`);
        if (fmt !== 'svg') {
            const r = await rasterizeScene(drawn);
            write(`${base}.png`, r.png);
            files.push({ path: display(cwd, `${base}.png`), format: 'png', template: job.t.id, size, variant, width: drawn.width, height: drawn.height });
        }
        if (fmt !== 'png') {
            write(`${base}.svg`, drawn.svg);
            files.push({ path: display(cwd, `${base}.svg`), format: 'svg', template: job.t.id, size, variant, width: drawn.width, height: drawn.height });
        }
    }
    return { json: { files, seed, light }, text: files.map((f) => `${f.path}  ${f.width}x${f.height}`).join('\n') };
}
