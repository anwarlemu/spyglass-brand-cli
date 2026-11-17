import { join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { drawScene, rasterizeScene, FitError } from '../assets/scene.js';
import { findItem, merchCatalog, merchItems, merchScene, physicalSvg, PX_PER_IN } from '../assets/merch.js';
import { display, format, int, lightSource, str, write, type Flags } from '../assets/io.js';

// `merch` writes print files (never mockups): SVG at physical size and PNG at 300 dpi, bleed included.

export const MERCH_FLAGS = ['item', 'variant', 'seed', 'light', 'dpi', 'guides', 'format', 'out', 'list', 'all', 'headline', 'body', 'url'];

export function merchHelp(): string {
	const b = brand().bin;
	return [
		'Merch print files: SVG at physical size and PNG at 300 dpi with the bleed, using approved lockups, Black and White,',
		'and the light and texture generators. No mockups.',
		'',
		`  ${b} merch --item tee-front --variant full-color`,
		`  ${b} merch --item sticker --variant black --guides      (trim and safe lines for proofing)`,
		`  ${b} merch --item poster --headline "..." --seed 2`,
		`  ${b} merch --all --dpi 150 --out merch`,
		`  ${b} merch --list                                      (items, sizes, bleed, safe area, sources)`,
		'',
		`Items: ${merchItems().map((i) => i.id).join(', ')}.`,
		'Variants: full-color (light and texture on Black), white or black (one color on a transparent ground) where the item takes them.',
		'--dpi 72 to 600 (default 300). --format svg, png or both (default). --out is a directory (default merch/).',
		'The sticker\'s SVG holds a CutContour path (the die line); it is not printed. Sizes are conventions: confirm with the vendor template.',
	].join('\n');
}

export async function runMerch(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = merchCatalog();
		return { json: { items: cat }, text: cat.map((i) => `${i.id.padEnd(14)}${`${i.trim.width} x ${i.trim.height} in`.padEnd(16)}bleed ${String(i.bleed).padEnd(6)}safe ${String(i.safe).padEnd(6)}${`${i.pixels.width}x${i.pixels.height}px`.padEnd(14)}${i.variants.join(', ')}\n${' '.repeat(14)}${i.source}`).join('\n') };
	}
	if (args.length) throw new Error(`merch takes no arguments. ${brand().bin} merch --item tee-front`);
	const fmt = format(flags, ['svg', 'png', 'both'], 'both');
	const dpi = int(flags, 'dpi', PX_PER_IN, 72, 600);
	const seed = int(flags, 'seed', 0, 0, 1_000_000);
	const light = lightSource(flags);
	const slots: Record<string, string> = {};
	for (const k of ['headline', 'body', 'url']) if (typeof flags[k] === 'string') slots[k] = (flags[k] as string).trim();
	const jobs: { id: string; variant?: string }[] = [];
	if (flags.all === true) {
		for (const i of merchItems()) for (const v of Object.keys(i.variants)) jobs.push({ id: i.id, variant: v });
	} else {
		const id = str(flags.item);
		if (!id) throw new Error(`Name an item: ${brand().bin} merch --item tee-front (--list shows them).`);
		findItem(id);
		jobs.push({ id, variant: str(flags.variant) });
	}
	const dir = resolve(cwd, str(flags.out) ?? 'merch');
	const files: { path: string; format: string; item: string; variant: string; width: number; height: number; inches: string; dpi?: number }[] = [];
	for (const job of jobs) {
		const item = findItem(job.id);
		const { scene, variant, widthIn, heightIn } = merchScene(item, { variant: job.variant, seed, light, guides: flags.guides === true, slots: flags.all === true ? {} : slots });
		let drawn;
		try {
			drawn = await drawScene(scene);
		} catch (err) {
			if (err instanceof FitError) throw new Error(`${item.id}: ${err.message}`);
			throw err;
		}
		const base = join(dir, `${item.id}-${variant}`);
		const inches = `${widthIn} x ${heightIn} in`;
		if (fmt !== 'png') {
			write(`${base}.svg`, physicalSvg(drawn.svg, widthIn, heightIn));
			files.push({ path: display(cwd, `${base}.svg`), format: 'svg', item: item.id, variant, width: drawn.width, height: drawn.height, inches });
		}
		if (fmt !== 'svg') {
			const r = await rasterizeScene(drawn, { scale: dpi / PX_PER_IN, dpi });
			write(`${base}.png`, r.png);
			files.push({ path: display(cwd, `${base}.png`), format: 'png', item: item.id, variant, width: r.width, height: r.height, inches, dpi });
		}
	}
	return { json: { files, seed, light, dpi }, text: files.map((f) => `${f.path}  ${f.inches}${f.dpi ? `, ${f.width}x${f.height} px at ${f.dpi} dpi` : ''}`).join('\n') };
}
