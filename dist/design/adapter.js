import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { brand } from '../lib/brand.js';
import { brandColors, color, groundsOf, rasterizeScene, rasterizeSvg } from '../assets/scene.js';
import { drawTemplate, fill, findTemplate, layersOf, reflowsOf, resolveSize, sizesOf, templates } from '../assets/templates.js';
import { drawMerch, findItem, merchItems, physicalSvg, PX_PER_IN } from '../assets/merch.js';
import { imagesToPdf } from '../assets/pdf.js';
import { rgbOf } from '../assets/png.js';
import { encodePixels, readPhoto } from '../assets/io.js';
import { renderVideo, videoDoc, hasFfmpeg } from '../commands/video.js';
import { illustrate, illustrateData, LIGHT_FRAMES } from '../illustrate/build.js';
import { checkDesign, checkText, errorsOf, sheetSvg } from './index.js';
import { PLATFORMS } from './platforms.js';
import { BLOCKS, COMPOSE_THEMES, drawCompose, recipeFor } from '../assets/compose.js';
import { SIZES } from '../assets/sizes.js';
import { blockRects } from './compose.js';
import { SECTIONS, writePage } from '../assets/page.js';
// This brand's side of the design core: every template, slide, print item, illustration and loop as something a design
// file can hold, and a document as the engine's own request. The layout, the copy and the edits all go through the same
// drawing code the image, deck, merch, illustrate and video commands use, so a design nobody edited is their bytes.
const PLACEHOLDER = 'sample:placeholder';
/** The picture slots of a template: `picture`, or `picture-1` and on. */
const pictureSlots = (n) => (n === 1 ? ['picture'] : Array.from({ length: n }, (_, i) => `picture-${i + 1}`));
const LIGHT_OPTIONS = [
    { id: 'light', values: ['brand', 'generated'], description: 'The brand heat map, or one generated from the seed' },
    { id: 'texture', values: ['true', 'false'], description: 'The ASCII texture' },
];
const seeded = (t) => layersOf(t).some((l) => l.id === 'texture' || l.id === 'light');
function templateInfo(t, kind) {
    const pics = pictureSlots(t.photos ?? 0);
    const themes = t.variants ? Object.keys(t.variants) : ['black'];
    return {
        id: t.id,
        kind,
        description: t.description,
        sizes: sizesOf(t),
        themes,
        grounds: Object.fromEntries(themes.map((v) => [v, color(t.variants?.[v]?.ground ?? 'black')])),
        copy: Object.keys(t.slots).map((id) => ({ id, ...(t.required.includes(id) ? { required: true } : {}), ...(id === 'url' ? { description: 'The address; the brand\'s own when it is not passed' } : id === 'page' ? { description: 'A carousel\'s page number, such as 2 / 5' } : ['features', 'items'].includes(id) ? { description: 'Several points, with | between them' } : {}) })),
        images: (t.photos ? pics : []).map((id, i) => ({ id, ...(i < (t.minPhotos ?? 0) ? { required: true } : {}), values: [PLACEHOLDER] })),
        options: seeded(t) ? LIGHT_OPTIONS : [],
        layers: layersOf(t),
        reflows: reflowsOf(t),
        formats: kind === 'slide' ? ['png', 'svg', 'jpg', 'webp', 'pdf'] : ['png', 'svg', 'jpg', 'webp'],
    };
}
function merchInfo() {
    return merchItems().map((i) => ({
        id: i.id,
        kind: 'merch',
        description: `${i.name}: a print file, ${i.size[0]} by ${i.size[1]} in${i.bleed ? ` and ${i.bleed} in bleed` : ''} (${i.method}).`,
        sizes: ['print'],
        themes: Object.keys(i.variants),
        copy: Object.keys(i.slots ?? {}).map((id) => ({ id, ...(i.required?.includes(id) ? { required: true } : {}) })),
        images: [],
        options: [...('full-color' in i.variants ? LIGHT_OPTIONS : []), { id: 'guides', values: ['true', 'false'], description: 'The trim and safe lines, for proofing' }],
        layers: [],
        formats: ['png', 'svg', 'pdf'],
    }));
}
const ILL_SIZES = ['native', 'square', 'portrait', 'story', 'og', 'landscape', 'x-banner', 'linkedin-banner', 'youtube', 'custom'];
function illustrationInfo() {
    const d = illustrateData();
    return Object.entries(d.styles).map(([id, s]) => {
        const options = [];
        if (id === 'pattern' || id === 'light')
            options.push({ id: 'variant', values: Object.keys(LIGHT_FRAMES) }, { id: 'source', values: ['brand', 'generated'] });
        if (id === 'pattern')
            options.push({ id: 'texture', values: ['true', 'false'] });
        if (id === 'pattern' || id === 'texture')
            options.push({ id: 'density', range: [0, 1] });
        return {
            id,
            kind: 'illustration',
            description: s.description,
            sizes: ILL_SIZES,
            themes: ['black'],
            grounds: { black: color('black') },
            copy: [],
            images: s.image ? [{ id: 'picture', ...(s.image === 'required' ? { required: true } : {}) }] : [],
            options,
            layers: [],
            formats: ['png', 'svg'],
        };
    });
}
function videoInfo() {
    const d = videoDoc();
    return d.templates.map((t) => ({
        id: t.id,
        kind: 'video',
        description: `${t.description} A seamless loop; the PNG is its first frame.`,
        sizes: Object.keys(d.sizes),
        themes: ['black'],
        grounds: { black: color('black') },
        copy: [],
        images: [],
        options: [{ id: 'light', values: ['brand', 'generated'] }, { id: 'seconds', range: [2, 20] }, { id: 'fps', range: [12, 60] }],
        layers: [],
        formats: (hasFfmpeg() ? ['png', 'mp4'] : ['png']),
    }));
}
let infos;
const allTemplates = () => (infos ??= [...templates('image').map((t) => templateInfo(t, 'image')), ...templates('deck').map((t) => templateInfo(t, 'slide')), ...merchInfo(), ...illustrationInfo(), ...videoInfo()]);
const kindOf = (id) => allTemplates().find((t) => t.id === id).kind;
function nativeSize(id) {
    const d = illustrateData();
    if (id === 'light')
        return LIGHT_FRAMES.band;
    return d.styles[id].size ?? [1080, 1080];
}
const yes = (v) => (v === undefined ? undefined : v === true || v === 'true');
/** The engine's request for an image or slide document. */
async function requestOf(doc, dir) {
    const t = findTemplate(doc.kind === 'slide' ? 'deck' : 'image', doc.template);
    const files = pictureSlots(t.photos ?? 0).map((s) => doc.images[s]).filter((v) => Boolean(v));
    const sample = files.includes(PLACEHOLDER);
    const photos = await Promise.all(files.filter((f) => f !== PLACEHOLDER).map((f) => readPhoto(dir, f)));
    const custom = doc.size.id === 'custom' ? { width: doc.size.width, height: doc.size.height } : {};
    return { t, req: { size: doc.size.id, ...custom, variant: doc.theme, slots: doc.copy, photos, placeholders: sample, seed: doc.seed, light: doc.options.light, texture: yes(doc.options.texture), edits: doc.layers } };
}
async function filesOf(drawn, formats, scale, pdfWidth) {
    const files = {};
    const raster = formats.some((f) => f !== 'svg') ? await rasterizeScene(drawn, { scale }) : undefined;
    for (const f of formats) {
        if (f === 'svg')
            files.svg = Buffer.from(drawn.svg);
        else if (f === 'png')
            files.png = raster.png;
        else if (f === 'jpg' || f === 'webp')
            files[f] = encodePixels(raster.pixels, raster.width, raster.height, f);
        else if (f === 'pdf')
            files.pdf = imagesToPdf([{ rgb: rgbOf(raster.pixels), width: raster.width, height: raster.height }], pdfWidth ?? 960);
    }
    return files;
}
async function renderCompose(doc, dir, formats, scale) {
    const pictures = {};
    for (const { block } of blockRects(doc)) {
        const v = doc.images[block.id];
        if (block.type === 'picture' && v && v !== PLACEHOLDER && v !== 'none')
            pictures[block.id] = await readPhoto(dir, v);
    }
    const { drawn, layers } = await drawCompose(doc, pictures);
    // Print sizes are 300 dpi; a PDF of anything else is a screen picture.
    const print = ['a4', 'letter', 'business-card'].includes(doc.size.id);
    return { files: await filesOf(drawn, formats, scale, print ? (doc.size.width / 300) * 72 : undefined), layers };
}
async function renderMerch(doc, formats, scale) {
    const item = findItem(doc.template);
    const { drawn, widthIn, heightIn, scene } = await drawMerch(item, { variant: doc.theme, seed: doc.seed, light: doc.options.light, texture: yes(doc.options.texture), guides: yes(doc.options.guides), slots: doc.copy });
    if (!scene.ground && formats.includes('pdf'))
        throw new Error(`${item.id} in ${doc.theme} is one color on a clear ground, which a PDF page cannot hold: use png or svg.`);
    const files = {};
    const raster = formats.some((f) => f !== 'svg') ? await rasterizeScene(drawn, { scale, dpi: Math.round(PX_PER_IN * scale) }) : undefined;
    if (formats.includes('svg'))
        files.svg = Buffer.from(physicalSvg(drawn.svg, widthIn, heightIn));
    if (formats.includes('png'))
        files.png = raster.png;
    if (formats.includes('pdf'))
        files.pdf = imagesToPdf([{ rgb: rgbOf(raster.pixels), width: raster.width, height: raster.height }], widthIn * 72);
    return { files, layers: await groundsOf(drawn) };
}
async function renderIllustration(doc, dir, formats, scale) {
    const o = doc.options;
    const native = doc.size.id === 'native';
    const photo = doc.images.picture ? await readPhoto(dir, doc.images.picture, { alpha: true }) : undefined;
    const r = await illustrate({
        style: doc.template,
        photo,
        variant: o.variant,
        source: o.source,
        seed: doc.seed,
        ...(native ? {} : { width: doc.size.width, height: doc.size.height }),
        density: o.density,
        texture: yes(o.texture),
    });
    const files = {};
    if (formats.includes('svg'))
        files.svg = Buffer.from(r.svg);
    if (formats.includes('png'))
        files.png = scale === 1 ? r.png : (await rasterizeSvg(r.svg, { scale })).png;
    return { files, layers: [] };
}
async function renderLoop(doc, formats) {
    const work = mkdtempSync(join(tmpdir(), 'ds-design-video-'));
    try {
        const files = {};
        const req = { template: doc.template, size: doc.size.id, seed: doc.seed ?? 0, light: doc.options.light ?? 'brand', seconds: doc.options.seconds, fps: doc.options.fps };
        if (formats.includes('png'))
            files.png = (await renderVideo(req)).still;
        if (formats.includes('mp4'))
            files.mp4 = await renderVideo.mp4(req, work);
        return { files, layers: [] };
    }
    finally {
        rmSync(work, { recursive: true, force: true });
    }
}
export function adapter() {
    return {
        brand: brand().bin,
        templates: allTemplates,
        defaults(template, size) {
            if (template === 'compose') {
                const p = SIZES.find((x) => x.id === size);
                const [width, height] = p ? [p.width, p.height] : [1200, 675];
                return { size: { id: size, width, height }, theme: 'black', seed: 0, options: {} };
            }
            const kind = kindOf(template);
            if (kind === 'image' || kind === 'slide') {
                const t = findTemplate(kind === 'slide' ? 'deck' : 'image', template);
                const s = size === 'custom' ? { id: 'custom', width: 1200, height: 675 } : resolveSize(t, size);
                return { size: { id: s.id, width: s.width, height: s.height }, theme: t.variants ? Object.keys(t.variants)[0] : 'black', seed: seeded(t) ? 0 : undefined, options: seeded(t) ? { light: 'brand', texture: true } : {} };
            }
            if (kind === 'merch') {
                const i = findItem(template);
                const px = (n) => Math.round((n + 2 * i.bleed) * PX_PER_IN);
                return { size: { id: 'print', width: px(i.size[0]), height: px(i.size[1]) }, theme: Object.keys(i.variants)[0], seed: 'full-color' in i.variants ? 0 : undefined, options: {} };
            }
            if (kind === 'video') {
                const [width, height] = videoDoc().sizes[size];
                return { size: { id: size, width, height }, theme: 'black', seed: 0, options: {} };
            }
            const p = PLATFORMS.find((x) => x.id === size);
            const [width, height] = p ? [p.width, p.height] : size === 'custom' ? [1600, 900] : nativeSize(template);
            const d = illustrateData();
            const options = template === 'pattern' ? { variant: d.pattern.variant, source: 'brand' } : template === 'light' ? { variant: 'band', source: 'brand' } : {};
            return { size: { id: size, width, height }, theme: 'black', seed: template === 'split' ? undefined : 0, options };
        },
        async render(doc, dir, out) {
            if (doc.template === 'compose')
                return renderCompose(doc, dir, out.formats, out.scale);
            if (doc.kind === 'merch')
                return renderMerch(doc, out.formats, out.scale);
            if (doc.kind === 'illustration')
                return renderIllustration(doc, dir, out.formats, out.scale);
            if (doc.kind === 'video')
                return renderLoop(doc, out.formats);
            const { t, req } = await requestOf(doc, dir);
            const { drawn } = await drawTemplate(t, req);
            return { files: await filesOf(drawn, out.formats, out.scale), layers: await groundsOf(drawn) };
        },
        compose: {
            // A layout made from scratch stands on the brand's ASCII texture at full strength, as its feed ads do.
            ground: ({ grid }) => ({ blocks: [{ id: 'texture', type: 'ascii', at: { col: 0, row: 0, cols: grid.cols, rows: grid.rows } }], options: { 'texture.density': 1 } }),
            blocks: () => BLOCKS,
            themes: Object.keys(COMPOSE_THEMES),
            grounds: Object.fromEntries(Object.entries(COMPOSE_THEMES).map(([k, v]) => [k, color(v.ground)])),
            // Square first: every template's recipe draws there as well as at its own size.
            sizes: ['square', ...SIZES.map((x) => x.id).filter((id) => id !== 'square'), 'custom'],
            formats: ['png', 'svg', 'jpg', 'webp', 'pdf'],
            recipe: (template, size, copy) => recipeFor(template, size, copy),
        },
        page: { sections: () => SECTIONS, flavors: ['react', 'elements', 'html'], write: writePage },
        sample(template) {
            if (template === 'compose')
                return {};
            const kind = kindOf(template);
            const slots = kind === 'image' || kind === 'slide' ? findTemplate(kind === 'slide' ? 'deck' : 'image', template).slots : kind === 'merch' ? findItem(template).slots ?? {} : {};
            return Object.fromEntries(Object.entries(slots).filter(([k, v]) => v && k !== 'url').map(([k, v]) => [k, fill(v)]));
        },
        colors: brandColors,
        // A chart's points are drawn one under each bar, so the commas between them are not words.
        words: (t) => t.replace(/,(?=\s|$)/g, ''),
        aliases: {
            sizes: { x: 'x-banner', 'linkedin-company': 'linkedin-page', card: 'landscape', tile: 'tile' },
            themes: { dark: 'black', light: 'white' },
            copy: { title: 'headline', text: 'body' },
            layers: { band: 'light', glow: 'light', ascii: 'texture', address: 'url', photos: 'pictures', picture: 'pictures', image: 'pictures' },
        },
    };
}
/** Contact sheets, in the brand's body face. */
export const paint = async (spec) => (await rasterizeSvg(sheetSvg(spec, brand().fonts.files.find((f) => f.role === 'text').family))).png;
/** What the plain image and deck commands drew, against the same rules a design keeps. */
export async function checkPlain(t, kind, drawn, d) {
    const info = allTemplates().find((x) => x.id === t.id);
    const doc = { version: 1, brand: brand().bin, kind, template: t.id, size: { id: d.size, width: drawn.width, height: drawn.height }, theme: d.variant, copy: d.copy, images: {}, options: {}, layers: {}, history: [], future: [] };
    return checkDesign({ doc, info, layers: await groundsOf(drawn), adapter: { colors: brandColors } });
}
/** Throws when a drawing breaks a rule: nothing that fails the check is written. */
export async function mustPass(name, ...args) {
    const findings = errorsOf(await checkPlain(...args));
    if (findings.length)
        throw new Error(`${name} breaks a rule, so nothing was written.\n${checkText(findings)}`);
}
