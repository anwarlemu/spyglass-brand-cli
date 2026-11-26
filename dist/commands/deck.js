import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { rasterizeScene } from '../assets/scene.js';
import { catalogOf, drawTemplate, findTemplate, slotNames } from '../assets/templates.js';
import { imagesToPdf } from '../assets/pdf.js';
import { rgbOf } from '../assets/png.js';
import { display, encodePixels, formats, int, lightSource, list, readPhoto, str, write } from '../assets/io.js';
import { slotFlags, textureFlag } from './image.js';
import { mustPass } from '../design/adapter.js';
import { helpRow } from '../lib/help-row.js';
// `deck` draws pitch deck slides at 1920 by 1080 (brand/assets/deck.json: the three covers from the brand assets and
// content slides derived from their rules), one PNG per slide and the whole deck as one PDF.
export const DECK_FLAGS = ['input', 'slide', 'template', 'image', 'seed', 'light', 'texture', 'format', 'out', 'list', 'sample', 'all'];
const DECK_FORMATS = ['png', 'svg', 'jpg', 'webp', 'pdf'];
export function deckHelp() {
    const b = brand().bin;
    const row = (cmd, what) => helpRow(cmd, what, 50);
    return [
        'Pitch deck slides at 1920 by 1080: PNG per slide and one PDF (16:9 pages, 13.33 by 7.5 in).',
        '',
        row(`${b} deck --input deck.json --out deck`, 'Every slide in the file, then deck.pdf'),
        row(`${b} deck --slide cover-curved --headline "..."`, 'One slide'),
        row(`${b} deck --list`, 'Slide types with their slots'),
        row(`${b} deck --all`, 'Every slide type with sample copy'),
        '',
        'deck.json: { "seed": 0, "label": "...", "slides": [ { "type": "cover-row", "headline": "...", "images": ["a.png"] }, ... ] }.',
        `Each slide takes its type's slots (${slotNames('deck').join(', ')}); "images" fill its photo slots in order (paths relative to the file) and repeat.`,
        '"label" is drawn on every slide that has one. Only what you write is drawn; a slot you leave out closes up.',
        '--format png, svg, jpg, webp, pdf (several with commas), or both (PNG and PDF, the default). --sample fills sample copy.',
    ].join('\n');
}
export async function runDeck(cwd, args, flags) {
    if (flags.list === true || args[0] === 'list') {
        const cat = catalogOf('deck');
        return { json: { slides: cat }, text: cat.map((t) => `${t.id.padEnd(16)}${t.group.padEnd(9)}${t.description}${t.photos ? ` Photos: ${t.photos}.` : ''} Slots: ${Object.keys(t.slots).join(', ') || 'none'}.`).join('\n') };
    }
    if (args.length > 1)
        throw new Error(`deck takes one slide type: ${brand().bin} deck cover-row. Or --input deck.json for several.`);
    const fmt = formats(flags, DECK_FORMATS, ['png', 'pdf'], { both: ['png', 'pdf'], all: DECK_FORMATS });
    const light = lightSource(flags);
    const texture = textureFlag(flags);
    const sample = flags.sample === true || flags.all === true;
    let seed = int(flags, 'seed', 0, 0, 1_000_000);
    let slides;
    let base = cwd;
    let shared;
    const input = str(flags.input);
    const one = str(flags.slide) ?? str(flags.template) ?? args[0];
    if (input && one)
        throw new Error('Pass --input or a slide type, not both.');
    if (flags.all === true) {
        if (input || one)
            throw new Error('--all draws every slide type with sample copy: pass it alone.');
        slides = catalogOf('deck').map((t) => ({ type: t.id }));
    }
    else if (input) {
        const path = isAbsolute(input) ? input : resolve(cwd, input);
        let doc;
        try {
            doc = JSON.parse(readFileSync(path, 'utf8'));
        }
        catch (err) {
            throw new Error(`Could not read ${input} as JSON (${err.message}).`);
        }
        if (!Array.isArray(doc.slides) || !doc.slides.length)
            throw new Error(`${input} needs a "slides" list.`);
        slides = doc.slides;
        if (typeof doc.label === 'string' && doc.label.trim())
            shared = doc.label.trim();
        if (typeof doc.seed === 'number' && flags.seed === undefined)
            seed = Math.trunc(doc.seed);
        base = dirname(path);
    }
    else {
        if (!one)
            throw new Error(`Pass --input deck.json or a slide type: ${brand().bin} deck cover-row --headline "..." (--list shows them).`);
        slides = [{ type: one, images: list(flags.image), ...slotFlags(flags, slotNames('deck')) }];
    }
    const dir = resolve(cwd, str(flags.out) ?? 'deck');
    const files = [];
    const drawn = [];
    const notes = [];
    // Every slide is drawn before any is written: one that cannot hold its copy leaves no half deck behind.
    for (const [i, s] of slides.entries()) {
        const at = slides.length > 1 ? `Slide ${i + 1}` : 'The slide';
        if (!s || typeof s.type !== 'string')
            throw new Error(`Slide ${i + 1} needs a "type". ${brand().bin} deck --list`);
        const t = findTemplate('deck', s.type);
        const slots = {};
        for (const [k, v] of Object.entries(s)) {
            if (k === 'type' || k === 'images')
                continue;
            if (typeof v === 'string')
                slots[k] = v;
            else if (Array.isArray(v) && v.every((x) => typeof x === 'string'))
                slots[k] = v.join(' | ');
            else
                throw new Error(`${at} (${s.type}): "${k}" takes text.`);
        }
        if (shared && 'label' in t.slots && slots.label === undefined)
            slots.label = shared;
        try {
            const photos = await Promise.all((s.images ?? []).map((p) => readPhoto(base, p)));
            const d = await drawTemplate(t, { slots, photos, sample, seed: seed + i, light, texture });
            if (d.repeats)
                notes.push(`${at} (${t.id}) holds ${t.photos} pictures; ${photos.length} ${photos.length === 1 ? 'was' : 'were'} passed, so they repeat.`);
            await mustPass(t.id, t, 'slide', d.drawn, { size: 'slide', copy: slots });
            drawn.push({ t, d: d.drawn });
        }
        catch (err) {
            throw new Error(`${at}${err.message.startsWith(t.id) ? ': ' : ` (${t.id}): `}${err.message}`);
        }
    }
    const pages = [];
    for (const [i, { t, d }] of drawn.entries()) {
        const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${t.id}`);
        const r = fmt.some((f) => f !== 'svg') ? await rasterizeScene(d) : undefined;
        for (const f of fmt) {
            if (f === 'pdf')
                continue;
            write(`${name}.${f}`, f === 'svg' ? d.svg : f === 'png' ? r.png : encodePixels(r.pixels, r.width, r.height, f));
            files.push({ path: display(cwd, `${name}.${f}`), format: f, slide: t.id, width: d.width, height: d.height });
        }
        if (fmt.includes('pdf'))
            pages.push({ rgb: rgbOf(r.pixels), width: r.width, height: r.height });
    }
    if (fmt.includes('pdf')) {
        const pdf = join(dir, 'deck.pdf');
        write(pdf, imagesToPdf(pages, 960));
        files.push({ path: display(cwd, pdf), format: 'pdf', width: 1920, height: 1080 });
    }
    return { json: { files, seed, light, slides: slides.length, notes }, text: [...files.map((f) => `${f.path}${f.slide ? `  ${f.width}x${f.height}` : `  ${slides.length} page${slides.length === 1 ? '' : 's'}`}`), ...notes.map((n) => `note: ${n}`)].join('\n') };
}
