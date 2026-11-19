import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { drawScene, rasterizeScene, FitError } from '../assets/scene.js';
import { catalogOf, findTemplate, sceneFor, slotNames } from '../assets/templates.js';
import { imagesToPdf } from '../assets/pdf.js';
import { rgbOf } from '../assets/png.js';
import { display, format, int, lightSource, list, readPhoto, str, write, type Flags } from '../assets/io.js';
import { helpRow } from '../lib/help-row.js';

// `deck` draws pitch deck slides at 1920 by 1080 (brand/assets/deck.json: the three covers from the brand assets and
// content slides derived from their rules), one PNG per slide and the whole deck as one PDF.

export const DECK_FLAGS = ['input', 'slide', 'image', 'seed', 'light', 'format', 'out', 'list'];

export function deckHelp(): string {
	const b = brand().bin;
	const row = (cmd: string, what: string) => helpRow(cmd, what, 50);
	return [
		'Pitch deck slides at 1920 by 1080: PNG per slide and one PDF (16:9 pages, 13.33 by 7.5 in).',
		'',
		row(`${b} deck --input deck.json --out deck`, 'Every slide in the file, then deck.pdf'),
		row(`${b} deck --slide cover-curved --headline "..."`, 'One slide'),
		row(`${b} deck --list`, 'Slide types with their slots'),
		'',
		'deck.json: { "seed": 0, "slides": [ { "type": "cover-row", "headline": "...", "images": ["a.png"] }, ... ] }.',
		`Each slide takes its type's slots (${slotNames('deck').join(', ')}); "images" fill its photo slots in order (paths relative to the file).`,
		'--format png (slides only), pdf (only deck.pdf), svg, or both (default: PNG and PDF).',
	].join('\n');
}

type SlideInput = { type: string; images?: string[] } & Record<string, unknown>;

export async function runDeck(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = catalogOf('deck');
		return { json: { slides: cat }, text: cat.map((t) => `${t.id.padEnd(16)}${t.group.padEnd(9)}${t.description}${t.photos ? ` Photos: ${t.photos}.` : ''} Slots: ${Object.keys(t.slots).join(', ') || 'none'}.`).join('\n') };
	}
	if (args.length) throw new Error(`deck takes no arguments. ${brand().bin} deck --input deck.json`);
	const fmt = format(flags, ['png', 'pdf', 'svg', 'both'], 'both');
	const light = lightSource(flags);
	let seed = int(flags, 'seed', 0, 0, 1_000_000);
	let slides: SlideInput[];
	let base = cwd;
	const input = str(flags.input);
	if (input && str(flags.slide)) throw new Error('Pass --input or --slide, not both.');
	if (input) {
		const path = isAbsolute(input) ? input : resolve(cwd, input);
		let doc: { seed?: number; slides?: SlideInput[] };
		try {
			doc = JSON.parse(readFileSync(path, 'utf8'));
		} catch (err) {
			throw new Error(`Could not read ${input} as JSON (${(err as Error).message}).`);
		}
		if (!Array.isArray(doc.slides) || !doc.slides.length) throw new Error(`${input} needs a "slides" list.`);
		slides = doc.slides;
		if (typeof doc.seed === 'number' && flags.seed === undefined) seed = Math.trunc(doc.seed);
		base = dirname(path);
	} else {
		const type = str(flags.slide);
		if (!type) throw new Error(`Pass --input deck.json or --slide <type>. ${brand().bin} deck --list`);
		const one: SlideInput = { type, images: list(flags.image) };
		for (const name of slotNames('deck')) if (typeof flags[name] === 'string') one[name] = flags[name] as string;
		slides = [one];
	}

	const dir = resolve(cwd, str(flags.out) ?? 'deck');
	const files: { path: string; format: string; slide?: string; width: number; height: number }[] = [];
	const pages: { rgb: Buffer; width: number; height: number }[] = [];
	for (const [i, s] of slides.entries()) {
		if (!s || typeof s.type !== 'string') throw new Error(`Slide ${i + 1} needs a "type". ${brand().bin} deck --list`);
		const t = findTemplate('deck', s.type);
		const slots: Record<string, string> = {};
		for (const [k, v] of Object.entries(s)) {
			if (k === 'type' || k === 'images') continue;
			if (typeof v === 'string') slots[k] = v;
			else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) slots[k] = v.join(' | ');
			else throw new Error(`Slide ${i + 1} (${s.type}): "${k}" takes text.`);
		}
		const photos = (s.images ?? []).map((p) => readPhoto(base, p));
		const { scene } = sceneFor(t, { slots, photos, seed: seed + i, light });
		let drawn;
		try {
			drawn = await drawScene(scene);
		} catch (err) {
			if (err instanceof FitError) throw new Error(`Slide ${i + 1} (${s.type}): ${err.message}`);
			throw err;
		}
		const name = join(dir, `slide-${String(i + 1).padStart(2, '0')}-${t.id}`);
		if (fmt === 'svg') {
			write(`${name}.svg`, drawn.svg);
			files.push({ path: display(cwd, `${name}.svg`), format: 'svg', slide: t.id, width: drawn.width, height: drawn.height });
			continue;
		}
		const r = await rasterizeScene(drawn);
		if (fmt !== 'pdf') {
			write(`${name}.png`, r.png);
			files.push({ path: display(cwd, `${name}.png`), format: 'png', slide: t.id, width: r.width, height: r.height });
		}
		pages.push({ rgb: rgbOf(r.pixels), width: r.width, height: r.height });
	}
	if (fmt === 'pdf' || fmt === 'both') {
		const pdf = join(dir, 'deck.pdf');
		write(pdf, imagesToPdf(pages, 960));
		files.push({ path: display(cwd, pdf), format: 'pdf', width: 1920, height: 1080 });
	}
	return { json: { files, seed, light, slides: slides.length }, text: files.map((f) => `${f.path}${f.slide ? `  ${f.width}x${f.height}` : `  ${slides.length} page${slides.length === 1 ? '' : 's'}`}`).join('\n') };
}
