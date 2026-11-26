import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { packageRoot } from '../lib/brand.js';
import { adapter } from '../design/adapter.js';
import { checkDesign, contactSheet, create, errorsOf, infoFor, type DesignDoc, type DrawnLayer, type Edit, type Finding, type Format, type SheetItem, type SheetSpec } from '../design/index.js';
import { recipes } from '../commands/recipe.js';
import { compositionProblem, type Template } from './templates.js';
import { SIZES } from './sizes.js';
import { COPY_FIELDS, headingOf, sizesFor, type Brief, type BriefImage, type CopyField } from './brief.js';
import { arrangements, type Arrangement } from './arrange.js';

// `ad`: a brief to ads. brand/assets/ads.json says which layouts can carry which fields and what each suits; this file
// ranks them per size, draws every candidate through the design adapter (the same code as `image`, `recipe` and
// `design`), keeps only what passes the brand check and still reads at the size, and returns 2 to 4 distinct ads per
// size as design documents. Nothing is invented: copy is the brief's, pictures are the brief's.

type PictureSpec = { kinds?: BriefImage['kind'][]; min?: number; max?: number } & Record<string, unknown>;
export type Alternate = { name: string; options?: Record<string, string | number | boolean>; at?: Record<string, { col: number; row: number; cols: number; rows: number }> };
export type AdLayout = { id: string; from: 'template' | 'recipe' | 'composed'; arrangement?: Arrangement; alternates?: Alternate[]; fields: Partial<Record<CopyField, string>>; needs?: CopyField[]; pictures?: PictureSpec; sizes?: string[]; goals: string[]; look: string[]; logo?: boolean };
type Rule = { words: string[]; field?: CopyField; layer?: string; kind?: string; hide?: string; no?: string };
export type AdsData = {
	goals: Record<string, string[]>;
	always?: string[];
	required: Record<string, CopyField[]>;
	score: { goal: number; offGoal: number; look: number; field: number; leftOut: number; lead: number; noLogo: number };
	themes: Record<string, string[]>;
	sample: Partial<Record<CopyField, string>>;
	musts: Rule[];
	donts: Rule[];
	layouts: AdLayout[];
};

let cached: AdsData | undefined;
export function adsData(): AdsData {
	return (cached ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', 'ads.json'), 'utf8')) as AdsData);
}

const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const hasPhrase = (text: string, phrase: string) => ` ${norm(text)} `.includes(` ${norm(phrase)} `);

/** The goal a brief's goal line names (the most keyword hits, first listed on a tie), or awareness. */
export function goalOf(text: string | undefined): string {
	const d = adsData();
	let best = 'awareness';
	let most = 0;
	for (const [id, words] of Object.entries(d.goals)) {
		const hits = words.filter((w) => hasPhrase(text ?? '', w)).length;
		if (hits > most) {
			most = hits;
			best = id;
		}
	}
	return best;
}

/** The rule a must-have or don't line names: the longest phrase it contains wins. */
function ruleFor(line: string, rules: Rule[]): Rule | undefined {
	const text = line.replace(/^(no|never|don'?t( use| show)?|do not( use| show)?|avoid|without|always|show|include|must (show|have|include))\s+/i, '');
	let hit: Rule | undefined;
	let len = 0;
	for (const r of rules) for (const w of r.words) if (hasPhrase(text, w) && w.length > len) {
		hit = r;
		len = w.length;
	}
	return hit;
}

export type Needs = { musts: Rule[]; donts: Rule[]; unchecked: string[]; required: CopyField[] };

/** What the brief asks of every ad, and which of its lines the command cannot check (to look at by eye). */
export function needsOf(b: Brief, goal: string): Needs {
	const d = adsData();
	const unchecked: string[] = [];
	const musts: Rule[] = [];
	const donts: Rule[] = [];
	for (const w of d.always ?? []) {
		const r = ruleFor(w, d.musts);
		if (r) musts.push(r);
	}
	for (const m of b.must) {
		const r = ruleFor(m, d.musts);
		if (r) musts.push(r);
		else unchecked.push(`must: ${m}`);
	}
	for (const m of b.donts) {
		const r = ruleFor(m, d.donts);
		if (r) donts.push(r);
		else unchecked.push(`don't: ${m}`);
	}
	const required = new Set<CopyField>(d.required[goal] ?? d.required.all ?? []);
	for (const e of b.look.elements) for (const f of d.required[e] ?? []) required.add(f);
	for (const r of musts) if (r.field) required.add(r.field);
	return { musts, donts, unchecked, required: COPY_FIELDS.filter((f) => required.has(f)) };
}

/** The checks that need no drawing: missing fields (each named with its heading), pictures, platforms. */
export function validateBrief(b: Brief, opts: { sample?: boolean } = {}): { brief: Brief; goal: string; needs: Needs; sizes: string[]; sampled: CopyField[] } {
	const missingInfo: string[] = [];
	if (!b.goal?.trim()) missingInfo.push('goal');
	if (!b.platforms.length) missingInfo.push('platforms');
	const goal = goalOf(b.goal);
	const needs = needsOf(b, goal);
	const missing = needs.required.filter((f) => !b.copy[f]?.trim());
	const sampled: CopyField[] = [];
	let brief = b;
	if (missing.length && opts.sample) {
		const copy = { ...b.copy };
		for (const f of missing) {
			copy[f] = adsData().sample[f];
			sampled.push(f);
		}
		brief = { ...b, copy };
	}
	const words = opts.sample ? [] : missing;
	if (missingInfo.length || words.length) {
		const all = [...missingInfo, ...words] as (CopyField | 'goal' | 'platforms')[];
		throw new Error(`The brief is missing ${all.map((f) => `${f} (## ${headingOf(f)})`).join(', ')}.${words.length ? ' Every word on an ad is yours; --sample fills sample copy (Acme) to look at the layouts.' : ''}`);
	}
	if (b.look.lead === 'picture' && !b.images.length) throw new Error('The look is picture-led but the brief has no pictures: list them under ## Images (file.png: what it shows) or pass --image name=file.png. Pictures are never made up.');
	if (needs.musts.some((r) => r.kind === 'picture') && !b.images.length) throw new Error('A must-have asks for a picture but the brief has none: list them under ## Images or pass --image name=file.png.');
	if (needs.donts.some((r) => r.no === 'picture') && b.images.length) throw new Error("The don'ts say no pictures, and the brief lists some. Take one out.");
	const tone = b.look.tone;
	if (tone && needs.donts.some((r) => r.no === (tone === 'light' ? 'white' : 'black'))) throw new Error(`The look asks for a ${tone} theme and the don'ts rule it out. Take one out.`);
	return { brief, goal, needs, sizes: sizesFor(b.platforms).sizes, sampled };
}

type Candidate = { layout: AdLayout; score: number; draws: CopyField[]; leftOut: CopyField[]; themes: string[]; pictures: Record<string, BriefImage>; seeded: boolean };

const infos = () => adapter().templates();
function sizesOfLayout(l: AdLayout): string[] {
	if (l.sizes) return l.sizes;
	if (l.from === 'template') return infos().find((t) => t.id === l.id)?.sizes.filter((s) => s !== 'custom') ?? [];
	const r = recipes()[l.id];
	return r ? r.sizes ?? [r.size] : [];
}

/** The themes a layout may take for this brief, first preferred. */
function themesFor(l: AdLayout, b: Brief, needs: Needs): string[] {
	const d = adsData();
	const tone = b.look.tone;
	let pool: string[];
	if (l.from === 'template') pool = infos().find((t) => t.id === l.id)?.themes ?? ['black'];
	else {
		pool = [...(d.themes[tone ?? 'any'] ?? ['black'])];
		const color = b.look.style === 'bold' && !needs.donts.some((r) => r.no === 'color');
		if (color && tone !== 'light') pool.push(...(d.themes['bold-dark'] ?? []));
		if (color && tone !== 'dark') pool.push(...(d.themes['bold-light'] ?? []));
	}
	const out = pool.filter((t) => !needs.donts.some((r) => r.no === t));
	if (tone === 'light') return out.filter((t) => t !== 'black');
	if (tone === 'dark') return out.filter((t) => t !== 'white');
	return out;
}

/** The layouts that can carry this brief at a size, best first. Why the others cannot is in `refused`. */
export function candidates(b: Brief, goal: string, needs: Needs, size: string): { list: Candidate[]; refused: { layout: string; reason: string }[] } {
	const d = adsData();
	const given = COPY_FIELDS.filter((f) => b.copy[f]?.trim());
	const lead = (goal === 'story' ? ['quote', 'headline'] : ['headline']).filter((f) => given.includes(f as CopyField)) as CopyField[];
	const noPictures = needs.donts.some((r) => r.no === 'picture');
	const list: Candidate[] = [];
	const refused: { layout: string; reason: string }[] = [];
	d.layouts.forEach((l) => {
		if (!sizesOfLayout(l).includes(size)) return;
		const no = (reason: string) => refused.push({ layout: l.id, reason });
		if (!lead.some((f) => l.fields[f])) return no(`it carries no ${lead.join(' or ')}`);
		const lacking = (l.needs ?? []).filter((f) => !given.includes(f));
		if (lacking.length) return no(`it needs ${lacking.map((f) => headingOf(f)).join(' and ')}`);
		const mustMiss = needs.musts.filter((r) => r.field && !l.fields[r.field]).map((r) => headingOf(r.field!));
		if (mustMiss.length) return no(`it has no place for ${mustMiss.join(' and ')}, a must-have`);
		if (l.logo === false && needs.musts.some((r) => r.layer === 'logo')) return no('it has no logo, a must-have');
		if (needs.donts.some((r) => r.no === 'panel') && l.look.includes('pricing-card')) return no('the don\'ts rule out cards');
		// Pictures: by kind, in the brief's order; a layout built around pictures needs them.
		const pictures: Record<string, BriefImage> = {};
		const spec = l.pictures;
		if (spec) {
			if (l.from === 'template') {
				const pool = noPictures ? [] : spec.kinds!.flatMap((k) => b.images.filter((i) => i.kind === k));
				if (pool.length < (spec.min ?? 0)) return no(`it is built around ${spec.kinds!.join(' or ')} pictures and the brief has none`);
				const slots = infos().find((t) => t.id === l.id)!.images.map((i) => i.id);
				pool.slice(0, Math.min(spec.max ?? slots.length, slots.length)).forEach((img, i) => (pictures[slots[i]!] = img));
			} else {
				for (const [block, kinds] of Object.entries(spec)) {
					const img = noPictures ? undefined : b.images.find((i) => (kinds as string[]).includes(i.kind));
					if (!img) return no(`it is built around a ${(kinds as string[]).join(' or ')} picture and the brief has none`);
					pictures[block] = img;
				}
			}
		}
		if (needs.musts.some((r) => r.kind === 'picture') && !Object.keys(pictures).length) return no('it holds no picture, a must-have');
		const themes = themesFor(l, b, needs);
		if (!themes.length) return no(`it does not come in a ${b.look.tone ?? 'allowed'} theme`);
		const draws = given.filter((f) => l.fields[f]);
		const leftOut = given.filter((f) => !l.fields[f]);
		let score = draws.length * d.score.field + leftOut.length * d.score.leftOut;
		score += l.goals.includes(goal) ? d.score.goal : d.score.offGoal;
		const wants = [b.look.style, b.look.lead, ...b.look.elements].filter(Boolean) as string[];
		for (const w of wants) if (l.look.includes(w)) score += d.score.look;
		if (b.look.lead && !l.look.includes(b.look.lead)) score += d.score.lead;
		if (!b.look.lead && b.images.length && l.look.includes('picture') && Object.keys(pictures).length) score += d.score.look;
		if (l.logo === false) score += d.score.noLogo;
		const seeded = l.from === 'template' && (infos().find((t) => t.id === l.id)?.options ?? []).some((o) => o.id === 'light');
		list.push({ layout: l, score, draws, leftOut, themes, pictures, seeded });
	});
	// Layouts made from the brief itself: its Layout words (ranked first), or stacked, centered and split arrangements
	// of every part it gives, so a brief never has to fit a template.
	const spec = SIZES.find((s) => s.id === size);
	if (spec) {
		const themes = themesFor({ id: 'composed', from: 'recipe', fields: {}, goals: [], look: [] }, b, needs).filter((t) => t === 'black' || t === 'white');
		const hideLight = needs.donts.some((r) => r.hide === 'light');
		const hideTexture = needs.donts.some((r) => r.hide === 'texture');
		const noPictures = needs.donts.some((r) => r.no === 'picture');
		const brief = noPictures ? { ...b, images: [] } : b;
		for (const a of arrangements(brief, size, spec.width, spec.height, { light: !hideLight, texture: !hideTexture })) {
			if (!themes.length) break;
			const draws = a.draws;
			const leftOut = given.filter((f) => !draws.includes(f));
			const layout: AdLayout = { id: `composed-${a.id}`, from: 'composed', arrangement: a, fields: Object.fromEntries(draws.map((f) => [f, f])), goals: [goal], look: ['composed', 'light', 'ascii', ...(Object.keys(a.pictures).length ? ['picture'] : ['type'])] };
			const mustMiss = needs.musts.filter((r) => r.field && !draws.includes(r.field)).map((r) => headingOf(r.field!));
			if (mustMiss.length) {
				refused.push({ layout: layout.id, reason: `it has no place for ${mustMiss.join(' and ')}, a must-have` });
				continue;
			}
			let score = draws.length * d.score.field + leftOut.length * d.score.leftOut + d.score.goal;
			const wants = [b.look.style, b.look.lead, ...b.look.elements].filter(Boolean) as string[];
			for (const w of wants) if (layout.look.includes(w)) score += d.score.look;
			// What the brief asked for in words comes before any template.
			if (a.asked) score += 1000;
			list.push({ layout, score, draws, leftOut, themes, pictures: a.pictures, seeded: false });
		}
	}
	// Best first; the data's order breaks ties, so the same brief always ranks the same way.
	const order = new Map(d.layouts.map((l, i) => [l.id, i]));
	list.sort((x, y) => y.score - x.score || (order.get(x.layout.id) ?? 1e6) - (order.get(y.layout.id) ?? 1e6));
	return { list, refused };
}

export type Ad = { size: string; width: number; height: number; n: number; layout: string; alternate?: string; from: 'template' | 'recipe' | 'composed'; theme?: string; seed?: number; doc: DesignDoc; files: Record<string, Uint8Array>; layers: DrawnLayer[]; findings: Finding[]; draws: CopyField[]; leftOut: CopyField[]; pictures: string[] };
type Attempt = { c: Candidate; theme: string; seed?: number; alt?: Alternate };

const rel = (from: string, file: string) => relative(from, file).split(sep).join('/') || file;
const isLight = (id: string) => id === 'light' || /^light-\d+$/.test(id);

/** The design document for one attempt, as `design new` or `recipe` would write it. */
function docFor(a: Attempt, b: Brief, needs: Needs, size: string, outDir: string, imageDir: (img: BriefImage) => string): DesignDoc {
	const ad = adapter();
	const l = a.c.layout;
	const hideLight = needs.donts.some((r) => r.hide === 'light');
	const hideTexture = needs.donts.some((r) => r.hide === 'texture');
	const picture = (img: BriefImage) => rel(outDir, resolve(imageDir(img), img.file));
	if (l.from === 'template') {
		const info = infoFor(ad, { template: l.id });
		const edits: Edit[] = [];
		for (const f of a.c.draws) edits.push({ op: 'copy', slot: l.fields[f]!, value: b.copy[f]! });
		for (const [slot, img] of Object.entries(a.c.pictures)) edits.push({ op: 'image', slot, value: picture(img) });
		if (a.theme && info.themes.length > 1) edits.push({ op: 'theme', value: a.theme });
		if (a.seed !== undefined && a.c.seeded) edits.push({ op: 'seed', value: a.seed });
		if (hideTexture && info.options.some((o) => o.id === 'texture')) edits.push({ op: 'option', id: 'texture', value: 'false' });
		for (const layer of info.layers) {
			if (!layer.can.hide) continue;
			if ((hideLight && isLight(layer.id)) || (hideTexture && layer.id === 'texture' && !info.options.some((o) => o.id === 'texture'))) edits.push({ op: 'layer', layer: layer.id, set: { hidden: true } });
		}
		return create(ad, l.id, size, edits).doc;
	}
	if (l.from === 'composed') {
		const arr = l.arrangement!;
		const base = create(ad, 'compose', size, []).doc;
		const images: Record<string, string> = {};
		for (const [block, img] of Object.entries(arr.pictures)) images[block] = picture(img);
		return { ...base, blocks: arr.blocks, grid: arr.grid, theme: a.theme, copy: { ...arr.copy }, images, options: { ...base.options, ...arr.options } } as DesignDoc;
	}
	const r = recipes()[l.id]!;
	const base = create(ad, 'compose', size, []).doc;
	const copy: Record<string, string> = {};
	for (const f of a.c.draws) {
		const target = l.fields[f]!;
		if (f === 'stat' && !target.includes('.')) {
			const [value, ...label] = b.copy.stat!.split('|');
			copy[`${target}.value`] = value!.trim();
			if (label.join('|').trim()) copy[`${target}.label`] = label.join('|').trim();
		} else copy[target] = b.copy[f]!;
	}
	const images: Record<string, string> = {};
	for (const [block, img] of Object.entries(a.c.pictures)) images[block] = picture(img);
	// A block is kept when it draws: the light and texture unless a don't takes them out, words only when the brief has them.
	const words = new Set(['headline', 'body', 'eyebrow', 'badge', 'stat', 'quote', 'list', 'button', 'search', 'code', 'chart', 'table', 'card']);
	const blocks = r.blocks.map((blk) => (a.alt?.at?.[blk.id] ? { ...blk, at: a.alt.at[blk.id]! } : blk)).filter((blk) => {
		if (blk.type === 'light') return !hideLight;
		if (blk.type === 'ascii') return !hideTexture;
		if (blk.type === 'picture') return Boolean(images[blk.id]);
		if (words.has(blk.type)) return Object.keys(copy).some((k) => k.startsWith(`${blk.id}.`));
		return true;
	});
	const options = Object.fromEntries(Object.entries(r.options).filter(([k]) => blocks.some((blk) => k.startsWith(`${blk.id}.`))));
	const alt = Object.fromEntries(Object.entries(a.alt?.options ?? {}).filter(([k]) => blocks.some((blk) => k.startsWith(`${blk.id}.`))));
	return { ...base, blocks, grid: r.grid ?? { cols: 12, rows: 12 }, theme: a.theme, copy, images, options: { ...base.options, ...options, ...alt } } as DesignDoc;
}

/** Draws and checks one attempt: the reason it is refused, or the ad. */
async function tryAttempt(a: Attempt, b: Brief, needs: Needs, size: string, outDir: string, imageDir: (img: BriefImage) => string, formats: Format[]): Promise<{ ok: false; reason: string } | { ok: true; doc: DesignDoc; files: Record<string, Uint8Array>; layers: DrawnLayer[]; findings: Finding[] }> {
	const ad = adapter();
	let doc: DesignDoc;
	let r: Awaited<ReturnType<typeof ad.render>>;
	try {
		doc = docFor(a, b, needs, size, outDir, imageDir);
		r = await ad.render(doc, outDir, { formats, scale: 1 });
	} catch (err) {
		return { ok: false, reason: (err as Error).message.split('\n')[0]!.replace(/^[\w-]+ at [\w-]+: /, '') };
	}
	const findings = checkDesign({ doc, info: infoFor(ad, doc), layers: r.layers, adapter: ad, png: r.files.png });
	const errors = errorsOf(findings);
	if (errors.length) return { ok: false, reason: `the brand check: ${errors.map((f) => f.message).join(' ')}` };
	if (a.c.layout.from === 'recipe' || a.c.layout.from === 'composed') {
		const problem = compositionProblem({} as Template, { layers: r.layers } as Parameters<typeof compositionProblem>[1], doc.size.width, doc.size.height);
		if (problem) return { ok: false, reason: problem };
	}
	const has = (pred: (l: DrawnLayer) => boolean) => r.layers.some(pred);
	for (const m of needs.musts) {
		if (m.layer === 'light' && !has((l) => isLight(l.id))) return { ok: false, reason: 'it draws no brand light, a must-have' };
		if (m.layer === 'texture' && !has((l) => l.id === 'texture' || l.id.startsWith('texture'))) return { ok: false, reason: 'it draws no texture, a must-have' };
		if (m.layer === 'logo' && !has((l) => l.kind === 'logo')) return { ok: false, reason: 'it draws no logo, a must-have' };
		if (m.kind === 'picture' && !has((l) => l.kind === 'picture')) return { ok: false, reason: 'it draws no picture, a must-have' };
		if (m.kind === 'panel' && !has((l) => l.kind === 'panel')) return { ok: false, reason: 'it draws no card, a must-have' };
	}
	if (needs.donts.some((d) => d.hide === 'light') && has((l) => isLight(l.id))) return { ok: false, reason: "its light cannot be taken out, and the don'ts rule it out" };
	if (needs.donts.some((d) => d.hide === 'texture') && has((l) => l.id === 'texture')) return { ok: false, reason: "its texture cannot be taken out, and the don'ts rule it out" };
	if (needs.donts.some((d) => d.no === 'panel') && has((l) => l.kind === 'panel')) return { ok: false, reason: "it draws a card, and the don'ts rule cards out" };
	return { ok: true, doc, files: r.files, layers: r.layers, findings };
}

/** Where each part of an ad sits, to the nearest 2% of the canvas: two ads with the same signature look the same. */
function signature(layers: DrawnLayer[], w: number, h: number): string {
	const q = (v: number, of: number) => Math.round((v / of) * 50);
	return layers.filter((l) => l.kind !== 'art').map((l) => `${l.kind}:${l.text?.drawn ?? ''}:${q(l.box.x, w)},${q(l.box.y, h)},${q(l.box.w, w)},${q(l.box.h, h)}`).sort().join('|');
}

/** Every attempt in the order tried: each layout once, then its other themes; layouts with no logo last. (Another seed
 * only moves the light, which is not a different ad.) */
function attempts(list: Candidate[]): Attempt[] {
	const withLogo = list.filter((c) => c.layout.logo !== false);
	const noLogo = list.filter((c) => c.layout.logo === false);
	const out: Attempt[] = [];
	for (const c of withLogo) out.push({ c, theme: c.themes[0]! });
	for (const c of withLogo) for (const t of c.themes.slice(1)) out.push({ c, theme: t });
	// A layout's other arrangements (brand/assets/ads.json `alternates`), in each of its themes.
	for (const c of withLogo) for (const alt of c.layout.alternates ?? []) for (const t of c.themes) out.push({ c, theme: t, alt });
	for (const c of noLogo) out.push({ c, theme: c.themes[0]! });
	return out;
}

export type AdsResult = { goal: string; sizes: string[]; ads: Ad[]; skipped: { size: string; layout: string; theme?: string; reason: string }[]; unchecked: string[]; sampled: CopyField[] };

/** Every ad for a brief: per size, the best `variants` that pass. Throws, writing nothing, when a size has fewer than two. */
export async function makeAds(input: Brief, o: { variants: number; sample?: boolean; outDir: string; imageDir: (img: BriefImage) => string; formats: Format[] }): Promise<AdsResult> {
	const { brief, goal, needs, sizes, sampled } = validateBrief(input, { sample: o.sample });
	for (const img of brief.images) {
		const path = resolve(o.imageDir(img), img.file);
		if (!existsSync(path)) throw new Error(`There is no picture at ${img.file} (${img.name}).`);
	}
	const ads: Ad[] = [];
	const skipped: AdsResult['skipped'] = [];
	const short: string[] = [];
	for (const size of sizes) {
		const { list, refused } = candidates(brief, goal, needs, size);
		for (const r of refused) skipped.push({ size, ...r });
		const got: Ad[] = [];
		for (const a of attempts(list)) {
			if (got.length >= o.variants) break;
			const r = await tryAttempt(a, brief, needs, size, o.outDir, o.imageDir, o.formats);
			if (!r.ok) {
				skipped.push({ size, layout: `${a.c.layout.id}${a.alt ? ` ${a.alt.name}` : ''}`, theme: a.theme, reason: r.reason });
				continue;
			}
			// Distinct means it looks different: the same parts in the same places on the same ground is the same ad.
			const twin = got.find((g) => g.theme === r.doc.theme && signature(g.layers, g.width, g.height) === signature(r.layers, r.doc.size.width, r.doc.size.height));
			if (twin) {
				skipped.push({ size, layout: a.c.layout.id, theme: a.theme, reason: `it draws the same as ad ${twin.n} (${twin.layout})` });
				continue;
			}
			const spec = SIZES.find((s) => s.id === size)!;
			got.push({ size, width: spec.width, height: spec.height, n: got.length + 1, layout: a.c.layout.id, alternate: a.alt?.name, from: a.c.layout.from, theme: r.doc.theme, seed: r.doc.seed, doc: r.doc, files: r.files, layers: r.layers, findings: r.findings, draws: a.c.draws, leftOut: a.c.leftOut, pictures: Object.values(a.c.pictures).map((p) => p.name) });
		}
		if (got.length < 2) {
			// What was drawn and refused says more than what was never tried, so it comes first.
			const here = skipped.filter((s) => s.size === size);
			const why = [...here.filter((s) => s.theme), ...here.filter((s) => !s.theme)].map((s) => `${s.layout}${s.theme && s.theme !== 'black' ? ` ${s.theme}` : ''}: ${s.reason}`);
			short.push(`${size}: ${got.length ? `only ${got[0]!.layout} reads` : 'no layout reads'}${why.length ? ` (${why.slice(0, 6).join('; ')}${why.length > 6 ? `; ${why.length - 6} more in --json` : ''})` : ''}`);
		}
		ads.push(...got);
	}
	if (short.length) throw new Error(`Every size needs at least two ads that pass the brand check, so nothing was written.\n${short.map((s) => `  ${s}`).join('\n')}\nShorten the copy, add pictures, loosen the look, or drop the platform.`);
	return { goal, sizes, ads, skipped, unchecked: needs.unchecked, sampled };
}

/** The labeled sheet: one row per size, its name above, each ad's layout and what it leaves out under it. */
export function adSheet(ads: Ad[], notes: string[], from: Record<string, string> = {}): SheetSpec {
	const WIDTH = 1920;
	const TITLE = 48;
	const out: SheetSpec = { width: WIDTH, height: 0, background: '#ebebeb', pictures: [], labels: [] };
	let y = 0;
	const sizes = [...new Set(ads.map((a) => a.size))];
	for (const size of sizes) {
		const row = ads.filter((a) => a.size === size);
		const items: SheetItem[] = row.map((a) => ({ png: a.files.png!, label: `${a.n}. ${a.layout}${a.alternate ? ` ${a.alternate}` : ''}${a.theme && a.theme !== 'black' ? `, ${a.theme}` : ''}${a.leftOut.length ? ` (leaves out ${a.leftOut.join(', ')})` : ''}` }));
		const spec = contactSheet(items, { columns: Math.max(row.length, row[0]!.width / row[0]!.height > 2.2 ? 2 : 3), width: WIDTH });
		const a = row[0]!;
		out.labels.push({ text: `${from[size] && from[size] !== size ? `${from[size]}: ` : ''}${size} ${a.width}x${a.height}`, x: 32, y: y + TITLE - 8, size: 26, color: '#1a1a1a' });
		for (const p of spec.pictures) out.pictures.push({ ...p, y: p.y + y + TITLE - 16 });
		for (const l of spec.labels) out.labels.push({ ...l, y: l.y + y + TITLE - 16 });
		y += TITLE - 16 + spec.height;
	}
	for (const n of notes) {
		out.labels.push({ text: n, x: 32, y: y + 22, size: 17, color: '#4a4a4a' });
		y += 26;
	}
	out.height = Math.ceil(y + (notes.length ? 24 : 0));
	return out;
}
