import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { rasterizeScene } from '../assets/scene.js';
import { drawMerch, findItem, merchCatalog, merchItems, physicalSvg, PX_PER_IN } from '../assets/merch.js';
import { imagesToPdf } from '../assets/pdf.js';
import { rgbOf } from '../assets/png.js';
import { display, encodePixels, formats, int, lightSource, str, write, type Flags } from '../assets/io.js';
import { slotFlags, textureFlag } from './image.js';

// `merch` writes print files (never mockups): SVG at physical size and PNG at 300 dpi, bleed included.

export const MERCH_FLAGS = ['item', 'template', 'variant', 'theme', 'seed', 'light', 'texture', 'dpi', 'guides', 'format', 'out', 'list', 'all', 'sample', 'headline', 'body', 'url'];
const MERCH_FORMATS = ['svg', 'png', 'jpg', 'webp', 'pdf'];

export function merchHelp(): string {
	const b = brand().bin;
	return [
		'Merch print files: SVG at physical size and PNG at 300 dpi with the bleed, using approved lockups, Black and White,',
		'and the light and texture generators. No mockups.',
		'',
		`  ${b} merch tee-front --theme full-color`,
		`  ${b} merch sticker --theme black --guides               (trim and safe lines for proofing)`,
		`  ${b} merch poster --headline "..." --seed 2`,
		`  ${b} merch poster --headline "..." --format pdf         (the trim and bleed on one page)`,
		`  ${b} merch --all --dpi 150 --out merch                  (every item, with sample copy)`,
		`  ${b} merch --list                                      (items, sizes, bleed, safe area, sources)`,
		'',
		`Items: ${merchItems().map((i) => i.id).join(', ')}.`,
		'Themes (--theme, or --variant): full-color (light and texture on Black), white or black (one color on a transparent ground) where the item takes them.',
		'Only the copy you pass is drawn (and the address, on items that carry it); --sample fills sample copy.',
		'--dpi 72 to 600 (default 300). --format svg, png, jpg, webp, pdf, several with commas, or both (SVG and PNG, the default).',
		'--out is a directory (default merch/).',
		'The sticker\'s SVG holds a CutContour path (the die line); it is not printed. Sizes are conventions: confirm with the vendor template.',
	].join('\n');
}

export async function runMerch(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = merchCatalog();
		return { json: { items: cat }, text: cat.map((i) => `${i.id.padEnd(14)}${`${i.trim.width} x ${i.trim.height} in`.padEnd(16)}bleed ${String(i.bleed).padEnd(6)}safe ${String(i.safe).padEnd(6)}${`${i.pixels.width}x${i.pixels.height}px`.padEnd(14)}${i.variants.join(', ')}\n${' '.repeat(14)}${i.source}`).join('\n') };
	}
	if (args.length > 1) throw new Error(`merch takes one item: ${brand().bin} merch tee-front.`);
	const fmt = formats(flags, MERCH_FORMATS, ['svg', 'png'], { both: ['svg', 'png'], all: MERCH_FORMATS });
	const dpi = int(flags, 'dpi', PX_PER_IN, 72, 600);
	const seed = int(flags, 'seed', 0, 0, 1_000_000);
	const light = lightSource(flags);
	const texture = textureFlag(flags);
	const slots = slotFlags(flags, ['headline', 'body', 'url']);
	if (str(flags.theme) && str(flags.variant) && str(flags.theme) !== str(flags.variant)) throw new Error('--theme and --variant are the same thing and disagree. Pass one.');
	const jobs: { id: string; variant?: string }[] = [];
	if (flags.all === true) {
		if (Object.keys(slots).length) throw new Error('--all draws every item with sample copy, so it takes no copy of its own.');
		for (const i of merchItems()) for (const v of Object.keys(i.variants)) jobs.push({ id: i.id, variant: v });
	} else {
		const id = str(flags.item) ?? str(flags.template) ?? args[0];
		if (!id) throw new Error(`Name an item: ${brand().bin} merch tee-front (--list shows them).`);
		findItem(id);
		jobs.push({ id, variant: str(flags.theme) ?? str(flags.variant) });
	}
	const dir = resolve(cwd, str(flags.out) ?? 'merch');
	const files: { path: string; format: string; item: string; variant: string; width: number; height: number; inches: string; dpi?: number }[] = [];
	for (const job of jobs) {
		const item = findItem(job.id);
		const { drawn, variant, widthIn, heightIn, scene } = await drawMerch(item, { variant: job.variant, seed, light, texture, guides: flags.guides === true, slots, sample: flags.sample === true || flags.all === true });
		if (!scene.ground && fmt.some((f) => f === 'pdf' || f === 'jpg')) throw new Error(`${item.id} in ${variant} is one color on a clear ground, which a ${fmt.includes('pdf') ? 'PDF page' : 'JPEG'} cannot hold here: use --format svg or png.`);
		const base = join(dir, `${item.id}-${variant}`);
		const inches = `${widthIn} x ${heightIn} in`;
		const r = fmt.some((f) => f !== 'svg') ? await rasterizeScene(drawn, { scale: dpi / PX_PER_IN, dpi }) : undefined;
		for (const f of fmt) {
			const path = `${base}.${f}`;
			if (f === 'svg') write(path, physicalSvg(drawn.svg, widthIn, heightIn));
			else if (f === 'png') write(path, r!.png);
			else if (f === 'pdf') write(path, imagesToPdf([{ rgb: rgbOf(r!.pixels), width: r!.width, height: r!.height }], widthIn * 72));
			else write(path, encodePixels(r!.pixels, r!.width, r!.height, f as 'jpg' | 'webp'));
			files.push({ path: display(cwd, path), format: f, item: item.id, variant, width: f === 'svg' ? drawn.width : r!.width, height: f === 'svg' ? drawn.height : r!.height, inches, ...(f === 'svg' ? {} : { dpi }) });
		}
	}
	return { json: { files, seed, light, dpi }, text: files.map((f) => `${f.path}  ${f.inches}${f.dpi ? `, ${f.width}x${f.height} px at ${f.dpi} dpi` : ''}`).join('\n') };
}
