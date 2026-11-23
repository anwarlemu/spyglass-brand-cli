import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { brand } from '../lib/brand.js';
import { rasterizeScene, type Photo } from '../assets/scene.js';
import { catalogOf, drawTemplate, findTemplate, resolveSize, sizesOf, slotNames, templates, type SceneRequest, type Template } from '../assets/templates.js';
import { SIZES } from '../assets/sizes.js';
import { PLATFORMS } from '../design/platforms.js';
import { display, encodePixels, formats, int, lightSource, list, readPhoto, str, write, type Flags } from '../assets/io.js';
import { mustPass } from '../design/adapter.js';
import { helpRow } from '../lib/help-row.js';

// `image` draws the brand's layouts (brand/assets/image.json: every post, ad, banner and logo background on the brand
// assets page, plus Open Graph and story cards derived from them) with your copy and pictures, at any size each one
// flows to. Only copy that was passed is drawn, and all of it.

export const IMAGE_FLAGS = ['template', 'size', 'width', 'height', 'theme', 'variant', 'image', 'seed', 'light', 'texture', 'format', 'scale', 'out', 'list', 'all', 'sample', 'input', 'title', 'text'];

/** Older names for two slots. */
const ALIASES: Record<string, string> = { title: 'headline', text: 'body' };
export const IMAGE_FORMATS = ['png', 'svg', 'jpg', 'webp'];

export function imageHelp(): string {
	const b = brand().bin;
	const row = (cmd: string, what: string) => helpRow(cmd, what, 62);
	const groups = [...new Set(templates('image').map((t) => t.group))];
	return [
		'Social posts, ads, banners, avatars, logo backgrounds, Open Graph cards and stories: the layouts on the brand',
		'assets page, drawn with your copy and pictures. The same inputs write the same bytes.',
		'',
		row(`${b} image post-offer --headline "..."`, 'One layout, PNG and SVG in imagery/'),
		row(`${b} image post-offer --headline "..." --size og,story,x-banner`, 'The same copy re-flowed to several sizes'),
		row(`${b} image ad-search-bar --headline "..." --image a.png --image b.png`, 'Pictures fill the photo slots in order, and repeat'),
		row(`${b} image banner-tagline --headline "..." --size linkedin-banner`, 'Banners keep clear of the profile picture'),
		row(`${b} image og --headline "..." --size custom --width 1600 --height 900`, 'Any size (or --size 1600x900)'),
		row(`${b} image logo-background --theme yellow`, 'Approved backgrounds only'),
		row(`${b} image og --headline "..." --seed 4 --light generated`, 'A light generated from the seed, and its texture'),
		row(`${b} image --input carousel.json --out carousel`, 'A carousel: several posts from one file, numbered'),
		row(`${b} image post-offer --sample`, 'Sample copy, to look at a layout'),
		row(`${b} image --all --out imagery`, 'Every layout at every size, with sample copy'),
		row(`${b} image --list`, 'Templates with their sizes, slots and photo count'),
		'',
		`Groups: ${groups.join(', ')}. Text goes in by slot: ${slotNames('image').map((s) => `--${s}`).join(', ')} (each template names its own).`,
		`Sizes: ${SIZES.map((s) => `${s.id} ${s.width}x${s.height}`).join(', ')}, or custom. A template says which it flows to.`,
		'Only what you pass is drawn (and the address); a slot you leave out closes up. Copy steps down and re-wraps to a',
		'readable floor; past that it is an error that says how much to shorten. Words are never dropped.',
		'--image is a PNG, JPEG or WebP; repeat it for templates with several pictures.',
		'--seed moves the ASCII texture (and a generated light). --light brand (default) keeps the brand heat map. --texture false leaves it out.',
		'--format png, svg, jpg, webp, several with commas, or both (PNG and SVG, the default). --scale 1 to 4 for more pixels.',
		'--out is a directory, or one file for one image (its extension picks the format).',
		'carousel.json: { "size": "square", "seed": 0, "template": "post-every-market", "slides": [ { "headline": "...", "body": "..." }, { "template": "post-photo", "images": ["a.png"] } ] }.',
		`To change a design after you see it: ${b} design --help.`,
	].join('\n');
}

type Job = { t: Template; req: SceneRequest; name: string };
type Written = { path: string; format: string; template: string; size: string; variant?: string; width: number; height: number; bytes: number };

/** Writes one drawing in every format asked, with a warning when a file is over its platform's upload limit. */
export async function writeImage(cwd: string, base: string, d: Awaited<ReturnType<typeof drawTemplate>>, fmt: string[], scale: number, t: Template, notes: string[]): Promise<Written[]> {
	const out: Written[] = [];
	const { drawn } = d;
	const raster = fmt.some((f) => f !== 'svg') ? await rasterizeScene(drawn, { scale }) : undefined;
	for (const f of fmt) {
		const data = f === 'svg' ? Buffer.from(drawn.svg) : f === 'png' ? raster!.png : encodePixels(raster!.pixels, raster!.width, raster!.height, f as 'jpg' | 'webp');
		const path = `${base}.${f}`;
		write(path, data);
		out.push({ path: display(cwd, path), format: f, template: t.id, size: d.size, variant: d.variant, width: f === 'svg' ? drawn.width : raster!.width, height: f === 'svg' ? drawn.height : raster!.height, bytes: data.length });
		const p = PLATFORMS.find((x) => x.id === d.size);
		if (f !== 'svg' && p?.limit && data.length > p.limit.bytes) notes.push(`${display(cwd, path)} is ${(data.length / 1048576).toFixed(1)} MB and ${p.label} takes ${Math.round(p.limit.bytes / 1048576)} MB${p.limit.official ? '' : ' (approximate)'}: --format jpg or webp is smaller.`);
	}
	return out;
}

export async function runImage(cwd: string, args: string[], flags: Flags): Promise<{ json: unknown; text: string }> {
	if (flags.list === true || args[0] === 'list') {
		const cat = catalogOf('image');
		return {
			json: { templates: cat, sizes: SIZES },
			text: [
				...cat.map((t) => `${t.id.padEnd(26)}${t.sizes.map((s) => s.id).join(', ')}, custom${t.variants.length > 1 ? `\n${' '.repeat(26)}themes: ${t.variants.join(', ')}` : ''}${t.photos ? `\n${' '.repeat(26)}pictures: ${t.minPhotos} to ${t.photos}` : ''}${Object.keys(t.slots).length ? `\n${' '.repeat(26)}copy: ${Object.keys(t.slots).map((s) => (t.required.includes(s) ? `${s} (required)` : s)).join(', ')}` : ''}`),
				'',
				`Sizes: ${SIZES.map((s) => `${s.id} ${s.width}x${s.height}${s.aliases.length ? ` (${s.aliases.join(', ')})` : ''}`).join(', ')}`,
			].join('\n'),
		};
	}
	if (args.length > 1) throw new Error(`image takes one template: ${brand().bin} image ${args[0]}. Repeat the command for another.`);
	const fmt = formats(flags, IMAGE_FORMATS, ['png', 'svg'], { both: ['png', 'svg'], all: IMAGE_FORMATS });
	const seed = int(flags, 'seed', 0, 0, 1_000_000);
	const scale = int(flags, 'scale', 1, 1, 4);
	const light = lightSource(flags);
	const texture = textureFlag(flags);
	const sample = flags.sample === true;
	const typed = str(flags.template);
	if (typed && args[0] && typed.toLowerCase() !== args[0].toLowerCase()) throw new Error(`--template ${typed} and ${args[0]} disagree. Pass one.`);
	const id = typed ?? args[0];
	const theme = str(flags.theme);
	if (theme && str(flags.variant) && theme !== str(flags.variant)) throw new Error('--theme and --variant are the same thing and disagree. Pass one.');
	const variant = theme ?? str(flags.variant);
	const slots = slotFlags(flags, [...slotNames('image'), ...Object.keys(ALIASES)]);
	const out = str(flags.out);
	const one = out ? /\.(png|svg|jpe?g|webp)$/i.exec(out) : null;
	const single = out && one ? resolve(cwd, out) : undefined;
	const used = single ? [one![1]!.toLowerCase().replace('jpeg', 'jpg')] : fmt;
	if (single && flags.format !== undefined && (fmt.length > 1 || fmt[0] !== used[0])) throw new Error(`--out names a ${used[0]!.toUpperCase()} file and --format says ${fmt.join(', ')}. Pass one, or a directory.`);

	const jobs: Job[] = [];
	if (str(flags.input)) {
		if (id || flags.all === true || Object.keys(slots).length) throw new Error('--input holds the templates and the copy: pass --input alone (with --size, --seed, --format or --out).');
		jobs.push(...(await carousel(cwd, str(flags.input)!, { size: str(flags.size), seed: flags.seed === undefined ? undefined : seed, light, texture })));
	} else if (flags.all === true) {
		if (id) throw new Error('Pass a template or --all, not both.');
		if (Object.keys(slots).length) throw new Error('--all draws every layout with sample copy, so it takes no copy of its own.');
		for (const t of templates('image')) for (const size of t.sizes) for (const v of t.variants ? Object.keys(t.variants) : [undefined]) jobs.push({ t, req: { size, variant: v, sample: true, seed, light, texture }, name: nameOf(t, size, v) });
	} else {
		if (!id) throw new Error(`Name a template: ${brand().bin} image post-offer --headline "..." (--list shows them all).`);
		const t = findTemplate('image', id);
		const photos = await Promise.all(list(flags.image).map((p) => readPhoto(cwd, p)));
		const width = flags.width === undefined ? undefined : int(flags, 'width', 0, 1, 100000);
		const height = flags.height === undefined ? undefined : int(flags, 'height', 0, 1, 100000);
		const asked = str(flags.size);
		if (flags.size !== undefined && !asked) throw new Error('--size needs a value.');
		const sizes = asked?.toLowerCase() === 'all' ? t.sizes : asked ? asked.split(',').map((x) => x.trim()).filter(Boolean) : [undefined];
		const seen = new Set<string>();
		for (const size of sizes) {
			const r = resolveSize(t, size, width, height);
			if (seen.has(`${r.id}${r.width}`)) continue;
			seen.add(`${r.id}${r.width}`);
			jobs.push({ t, req: { size, width, height, variant, slots: Object.fromEntries(Object.entries(slots).map(([k, v]) => [k in t.slots ? k : ALIASES[k] ?? k, v])), photos, sample, seed, light, texture }, name: nameOf(t, r.id === 'custom' ? `${r.width}x${r.height}` : r.id, t.variants ? variant ?? Object.keys(t.variants)[0] : undefined) });
		}
	}

	if (single && jobs.length > 1) throw new Error(`--out names one file and this writes ${jobs.length} images. Pass a directory.`);
	const dir = resolve(cwd, out && !single ? out : 'imagery');
	const files: Written[] = [];
	const notes: string[] = [];
	// Everything is drawn before anything is written: one size that cannot hold the copy leaves no half set behind.
	const all = [];
	for (const job of jobs) {
		const d = await drawTemplate(job.t, job.req);
		await mustPass(`${job.t.id} at ${d.size}`, job.t, 'image', d.drawn, { size: d.size, variant: d.variant, copy: job.req.slots ?? {} });
		all.push({ job, d });
	}
	for (const { job, d } of all) {
		if (d.repeats) notes.push(`${job.t.id} holds ${job.t.photos} pictures; ${new Set(job.req.photos).size} ${job.req.photos!.length === 1 ? 'was' : 'were'} passed, so they repeat.`);
		const base = single ? single.replace(/\.(png|svg|jpe?g|webp)$/i, '') : join(dir, job.name);
		files.push(...(await writeImage(cwd, base, d, used, scale, job.t, notes)));
	}
	return { json: { files, seed, light, notes }, text: [...files.map((f) => `${f.path}  ${f.width}x${f.height}`), ...notes.map((n) => `note: ${n}`)].join('\n') };
}

function nameOf(t: Template, size: string, variant?: string): string {
	return `${t.id}${sizesOf(t).length > 1 && size !== t.sizes[0] ? `-${size}` : t.group === 'banner' ? `-${size}` : ''}${variant && t.variants && Object.keys(t.variants).length > 1 ? `-${variant}` : ''}`;
}

export function textureFlag(flags: Flags): boolean | undefined {
	if (flags.texture === undefined) return undefined;
	if (flags.texture === false || flags.texture === 'false') return false;
	if (flags.texture === true || flags.texture === 'true') return true;
	throw new Error('--texture takes true or false.');
}

export function slotFlags(flags: Flags, names: string[]): Record<string, string> {
	const slots: Record<string, string> = {};
	for (const name of names) {
		const v = flags[name];
		if (v === undefined) continue;
		if (typeof v !== 'string' || !v.trim()) throw new Error(`--${name} needs a value. Leave it out to leave it off the design.`);
		const key = ALIASES[name] ?? name;
		if (slots[key] !== undefined && slots[key] !== v.trim()) throw new Error(`--${name} and --${key} disagree. Pass one.`);
		slots[key] = v.trim();
	}
	return slots;
}

type CarouselSlide = { template?: string; images?: string[] } & Record<string, unknown>;
type CarouselDoc = { size?: string; seed?: number; template?: string; numbering?: boolean; slides?: CarouselSlide[] };

/** A carousel file as jobs: one size, one seed, and a page number on every slide. */
async function carousel(cwd: string, input: string, o: { size?: string; seed?: number; light: 'brand' | 'generated'; texture?: boolean }): Promise<Job[]> {
	const path = isAbsolute(input) ? input : resolve(cwd, input);
	let doc: CarouselDoc;
	try {
		doc = JSON.parse(readFileSync(path, 'utf8')) as CarouselDoc;
	} catch (err) {
		throw new Error(`Could not read ${input} as JSON (${(err as Error).message}).`);
	}
	if (!Array.isArray(doc.slides) || !doc.slides.length) throw new Error(`${input} needs a "slides" list.`);
	const size = o.size ?? doc.size ?? 'square';
	if (/,/.test(size)) throw new Error('A carousel is one size: square or portrait.');
	const extra = Object.keys(doc).filter((k) => !['size', 'seed', 'template', 'numbering', 'slides', '$comment'].includes(k));
	if (extra.length) throw new Error(`${input}: unknown key ${extra.map((k) => `"${k}"`).join(', ')}. A carousel takes size, seed, template, numbering and slides.`);
	const jobs: Job[] = [];
	for (const [i, s] of doc.slides.entries()) {
		const id = s.template ?? doc.template;
		if (!id) throw new Error(`Slide ${i + 1} needs a "template" (or one for the whole file).`);
		const t = findTemplate('image', String(id));
		if (!('page' in t.slots) && doc.numbering !== false) throw new Error(`Slide ${i + 1}: ${t.id} has no place for a page number. Templates that do: ${templates('image').filter((x) => 'page' in x.slots).map((x) => x.id).join(', ')}. Or set "numbering": false.`);
		const slots: Record<string, string> = {};
		for (const [k, v] of Object.entries(s)) {
			if (k === 'template' || k === 'images') continue;
			if (typeof v === 'string') slots[ALIASES[k] ?? k] = v;
			else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) slots[ALIASES[k] ?? k] = v.join(' | ');
			else throw new Error(`Slide ${i + 1}: "${k}" takes text.`);
		}
		if (doc.numbering !== false && slots.page === undefined) slots.page = `${i + 1} / ${doc.slides.length}`;
		const photos = await Promise.all((s.images ?? []).map((p) => readPhoto(dirname(path), p)));
		jobs.push({ t, req: { size, slots, photos, seed: (o.seed ?? Math.trunc(doc.seed ?? 0)) + i, light: o.light, texture: o.texture }, name: `${String(i + 1).padStart(2, '0')}-${t.id}` });
	}
	return jobs;
}

export type { Photo };
