import { sizeSpec } from './sizes.js';

// An ad brief: plain sections (Markdown headings, "Key: value" lines, or JSON keys) read into one shape. Nothing here
// guesses: an unknown section, platform or look word is an error that names what is allowed, and copy is kept exactly
// as written (trimmed, with one pair of outer quotes taken off).

export type BriefImage = { name: string; file: string; shows: string; kind: 'screenshot' | 'creative' | 'photo' };
export type Look = { tone?: 'dark' | 'light'; style?: 'minimal' | 'bold'; lead?: 'picture' | 'type'; elements: Element[] };
export type Element = 'light' | 'ascii' | 'product-ui' | 'pricing-card' | 'search-bar' | 'stacked-cards' | 'corridor' | 'photo-grid';
export type Copy = Partial<Record<CopyField, string>>;
export type Brief = {
	name?: string;
	goal?: string;
	audience?: string;
	platforms: string[];
	copy: Copy;
	look: Look;
	images: BriefImage[];
	must: string[];
	donts: string[];
};

/** The words an ad can carry, in the order a missing-field error lists them. */
export const COPY_FIELDS = ['headline', 'supporting', 'cta', 'offer', 'plan', 'features', 'label', 'quote', 'name', 'role', 'stat', 'search'] as const;
export type CopyField = (typeof COPY_FIELDS)[number];

type FieldDef = { heading: string; names: string[]; about: string };
/** Every section a brief takes: its heading as written in the examples, the other names it answers to, what it holds. */
export const SECTIONS: Record<string, FieldDef> = {
	name: { heading: 'Name', names: ['name of the campaign', 'campaign', 'brief'], about: 'A name for the set (the Markdown title works too)' },
	goal: { heading: 'Goal', names: ['goal', 'goals', 'objective', 'purpose', 'aim'], about: 'What the ads are for: a launch, an offer, a feature, a customer story, hiring, an event' },
	audience: { heading: 'Audience', names: ['audience', 'who', 'for', 'target', 'target audience'], about: 'Who sees them (read, not drawn)' },
	platforms: { heading: 'Platforms', names: ['platforms', 'platform', 'sizes', 'size', 'platforms/sizes', 'platforms and sizes', 'channels', 'where'], about: 'Where they run, with commas: X, LinkedIn, Instagram feed, Instagram portrait, Instagram story, Facebook, TikTok cover, Google display, all social, or size ids' },
	headline: { heading: 'Headline', names: ['headline', 'title', 'heading', 'head'], about: 'The headline, drawn whole' },
	supporting: { heading: 'Supporting line', names: ['supporting line', 'supporting', 'subhead', 'subheadline', 'sub-headline', 'body', 'line', 'support'], about: 'One line under the headline' },
	cta: { heading: 'CTA', names: ['cta', 'call to action', 'call-to-action', 'button', 'action'], about: 'The button label' },
	offer: { heading: 'Offer', names: ['offer', 'price', 'offer/price', 'offer or price', 'pricing', 'deal'], about: 'The offer or price, such as $20 a month' },
	plan: { heading: 'Plan', names: ['plan', 'plan name', 'tier'], about: 'The plan name on a pricing card' },
	features: { heading: 'Features', names: ['features', 'included', 'points', 'what is included', "what's included"], about: 'What a plan includes, one per list item' },
	label: { heading: 'Label', names: ['label', 'eyebrow', 'kicker', 'badge', 'tag'], about: 'A short label above the headline, such as New or We are hiring' },
	quote: { heading: 'Quote', names: ['quote', 'testimonial'], about: 'A customer quote, drawn whole (Acme only, never a real person)' },
	name_: { heading: 'Quote name', names: ['quote name', 'quoted', 'attribution name', 'person'], about: 'Who said the quote' },
	role: { heading: 'Quote role', names: ['quote role', 'role', 'attribution', 'company'], about: 'Their role and company' },
	stat: { heading: 'Stat', names: ['stat', 'figure', 'metric', 'number', 'result'], about: 'A figure and its line, split by |: 3x | faster launch reviews' },
	search: { heading: 'Search prompt', names: ['search prompt', 'search', 'prompt', 'query'], about: 'What the search bar shows, for layouts with one' },
	look: { heading: 'Look', names: ['look', 'tone', 'tone/look', 'tone and look', 'style', 'feel'], about: 'dark or light theme, minimal or bold, picture-led or type-led, and the brand elements: the brand light, ASCII texture, product UI, pricing card, search bar, stacked cards, corridor, photo grid' },
	images: { heading: 'Images', names: ['images', 'image', 'pictures', 'picture', 'assets', 'photos', 'screenshots'], about: 'One per list item: file: what it shows (or name=file: what it shows)' },
	must: { heading: 'Must-haves', names: ['must-haves', 'must haves', 'must have', 'must', 'musts', 'requirements', 'required'], about: 'What every ad must show' },
	donts: { heading: "Don'ts", names: ["don'ts", 'donts', "don't", 'dont', 'avoid', 'never', 'do not'], about: 'What no ad may show' },
};
const FIELD_OF_SECTION: Record<string, CopyField> = { headline: 'headline', supporting: 'supporting', cta: 'cta', offer: 'offer', plan: 'plan', features: 'features', label: 'label', quote: 'quote', name_: 'name', role: 'role', stat: 'stat', search: 'search' };

const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
function sectionOf(heading: string): string | undefined {
	const k = norm(heading).replace(/[:.]$/, '');
	for (const [id, def] of Object.entries(SECTIONS)) if (def.names.includes(k) || norm(def.heading) === k) return id;
	return undefined;
}
const knownHeadings = () => Object.values(SECTIONS).map((d) => d.heading).join(', ');

/** The platforms a brief can name, and the size ids each one is drawn at (src/assets/sizes.ts). */
export const PLATFORM_SIZES: { names: string[]; label: string; sizes: string[] }[] = [
	{ names: ['all social', 'social', 'every social', 'all social platforms'], label: 'All social', sizes: ['landscape', 'linkedin', 'square', 'portrait', 'story', 'facebook'] },
	{ names: ['x', 'twitter', 'x post', 'x feed', 'tweet', 'twitter post'], label: 'X post', sizes: ['landscape'] },
	{ names: ['linkedin', 'linkedin post', 'linkedin feed', 'linkedin ad', 'linkedin sponsored'], label: 'LinkedIn post', sizes: ['linkedin'] },
	{ names: ['linkedin square'], label: 'LinkedIn square', sizes: ['linkedin-square'] },
	{ names: ['instagram feed', 'instagram', 'instagram post', 'instagram square', 'ig feed', 'ig'], label: 'Instagram feed', sizes: ['square'] },
	{ names: ['instagram portrait', 'instagram 4:5', 'ig portrait'], label: 'Instagram portrait', sizes: ['portrait'] },
	{ names: ['instagram story', 'instagram stories', 'ig story', 'reels', 'instagram reels', 'stories'], label: 'Instagram story', sizes: ['story'] },
	{ names: ['facebook', 'facebook feed', 'facebook post', 'meta feed', 'fb'], label: 'Facebook feed', sizes: ['facebook'] },
	{ names: ['facebook story', 'facebook stories'], label: 'Facebook story', sizes: ['story'] },
	{ names: ['tiktok cover', 'tiktok', 'tik tok', 'tiktok video cover'], label: 'TikTok cover', sizes: ['story'] },
	{ names: ['google display', 'display', 'google ads display', 'display ads', 'gdn', 'banner ads'], label: 'Google display', sizes: ['ad-300x250', 'ad-336x280', 'ad-728x90', 'ad-300x600', 'ad-320x50', 'ad-160x600', 'ad-970x250'] },
];

/** Every size a brief's platforms ask for, in the order named, each once. */
export function sizesFor(platforms: string[]): { sizes: string[]; from: Record<string, string> } {
	const sizes: string[] = [];
	const from: Record<string, string> = {};
	const bad: string[] = [];
	for (const raw of platforms) {
		const k = norm(raw).replace(/^(the|on)\s+/, '');
		if (!k) continue;
		const hit = PLATFORM_SIZES.find((p) => p.names.includes(k));
		const ids = hit ? hit.sizes : sizeSpec(k) ? [sizeSpec(k)!.id] : undefined;
		if (!ids) {
			bad.push(raw.trim());
			continue;
		}
		for (const id of ids) if (!sizes.includes(id)) {
			sizes.push(id);
			from[id] = hit?.label ?? id;
		}
	}
	if (bad.length) throw new Error(`Unknown platform${bad.length > 1 ? 's' : ''}: ${bad.map((b) => `"${b}"`).join(', ')}. Name ${PLATFORM_SIZES.map((p) => p.label).join(', ')}, or a size id (${['landscape', 'linkedin', 'square', 'portrait', 'story', 'facebook', 'ad-300x250'].join(', ')} ...).`);
	return { sizes, from };
}

const LOOK_WORDS: { words: string[]; set: (l: Look) => void }[] = [
	{ words: ['dark', 'dark theme', 'dark mode', 'black', 'on black', 'dark ground'], set: (l) => (l.tone = 'dark') },
	{ words: ['light theme', 'light mode', 'light ground', 'white', 'on white', 'white ground', 'bright'], set: (l) => (l.tone = 'light') },
	{ words: ['minimal', 'quiet', 'clean', 'simple', 'calm'], set: (l) => (l.style = 'minimal') },
	{ words: ['bold', 'loud', 'punchy', 'strong', 'colorful'], set: (l) => (l.style = 'bold') },
	{ words: ['picture-led', 'picture led', 'photo-led', 'photo led', 'image-led', 'image led', 'visual'], set: (l) => (l.lead = 'picture') },
	{ words: ['type-led', 'type led', 'typographic', 'text-led', 'text led', 'type only', 'words only'], set: (l) => (l.lead = 'type') },
	{ words: ['brand light', 'the light', 'the brand light', 'glow', 'light band'], set: (l) => add(l, 'light') },
	{ words: ['ascii', 'ascii texture', 'texture', 'the texture'], set: (l) => add(l, 'ascii') },
	{ words: ['product ui', 'product', 'ui', 'screenshot', 'the product'], set: (l) => add(l, 'product-ui') },
	{ words: ['search bar', 'search', 'search box', 'prompt', 'query'], set: (l) => (add(l, 'search-bar'), add(l, 'product-ui')) },
	{ words: ['stacked cards', 'card stack', 'stack of cards', 'fanned cards', 'isometric cards', 'isometric', 'cards in a row', 'creative row'], set: (l) => add(l, 'stacked-cards') },
	{ words: ['corridor', 'tunnel', 'hallway', 'perspective walls', 'wall of creatives'], set: (l) => add(l, 'corridor') },
	{ words: ['photo grid', 'photo row', 'three photos', 'image grid', 'image row', 'grid of photos', 'row of photos'], set: (l) => add(l, 'photo-grid') },
	{ words: ['pricing card', 'pricing', 'plan card', 'price card'], set: (l) => add(l, 'pricing-card') },
];
const add = (l: Look, e: Element) => {
	if (!l.elements.includes(e)) l.elements.push(e);
};

/** The look from its words: "dark, bold, type-led; the brand light, ASCII". */
export function parseLook(text: string | string[] | Record<string, unknown> | undefined): Look {
	const look: Look = { elements: [] };
	if (text === undefined) return look;
	const parts: string[] = typeof text === 'string' ? text.split(/[,;\n]|\band\b|\bwith\b|\//) : Array.isArray(text) ? text.flatMap((t) => String(t).split(/[,;]/)) : Object.values(text).flatMap((v) => (Array.isArray(v) ? v.map(String) : [String(v)]));
	const bad: string[] = [];
	for (const raw of parts) {
		const k = norm(raw).replace(/^[-*]\s*/, '').replace(/\.$/, '');
		if (!k) continue;
		const bare = k.replace(/^(?:(?:a|an|some|use|uses|using|show|shows|with)\s+)+/, '');
		if (bare === 'light') throw new Error('Look: "light" could mean the light theme or the brand light. Write "light theme" or "brand light".');
		const hit = LOOK_WORDS.find((w) => w.words.includes(bare)) ?? LOOK_WORDS.find((w) => w.words.includes(bare.replace(/^the\s+/, '')));
		if (hit) hit.set(look);
		else bad.push(raw.trim());
	}
	if (bad.length) throw new Error(`Look: ${bad.map((b) => `"${b}"`).join(', ')} ${bad.length > 1 ? 'are' : 'is'} not a look this command reads. It reads: dark or light theme, minimal or bold, picture-led or type-led, brand light, ASCII texture, product UI, pricing card, search bar, stacked cards, corridor, photo grid.`);
	return look;
}

const IMAGE_EXT = /\.(png|jpe?g|webp)$/i;
const KIND_WORDS: Record<BriefImage['kind'], string[]> = {
	screenshot: ['screenshot', 'screen', 'product', 'ui', 'dashboard', 'app', 'interface', 'search results', 'results', 'browser'],
	creative: ['creative', 'creatives', 'ad', 'ads', 'post', 'posts', 'campaign', 'campaigns', 'poster'],
	photo: [],
};
/** What a picture is, from its name and what the brief says it shows. */
export function kindOf(name: string, shows: string): BriefImage['kind'] {
	const words = norm(`${name} ${shows}`).split(/[^a-z0-9]+/);
	for (const kind of ['screenshot', 'creative'] as const) if (KIND_WORDS[kind].some((w) => (w.includes(' ') ? norm(`${name} ${shows}`).includes(w) : words.includes(w)))) return kind;
	return 'photo';
}

/** An image line: "shot.png: the dashboard", "screenshot=shot.png: the dashboard" or "screenshot: shot.png (the dashboard)". */
export function parseImage(line: string): BriefImage {
	const text = line.replace(/^\s*[-*]\s*/, '').trim();
	let m = /^([\w-]+)\s*=\s*(\S+?\.(?:png|jpe?g|webp))\s*(?::\s*(.*))?$/i.exec(text);
	if (m) return { name: m[1]!, file: m[2]!, shows: (m[3] ?? '').trim(), kind: kindOf(m[1]!, m[3] ?? '') };
	m = /^(\S+?\.(?:png|jpe?g|webp))\s*(?:[:(-]\s*(.*?)\)?)?$/i.exec(text);
	if (m) {
		const name = m[1]!.replace(/^.*[\\/]/, '').replace(IMAGE_EXT, '');
		return { name, file: m[1]!, shows: (m[2] ?? '').trim(), kind: kindOf(name, m[2] ?? '') };
	}
	m = /^([\w -]+?)\s*:\s*(\S+?\.(?:png|jpe?g|webp))\s*(?:\((.*)\)|[:-]\s*(.*))?$/i.exec(text);
	if (m) {
		const name = m[1]!.trim().replace(/\s+/g, '-').toLowerCase();
		const shows = (m[3] ?? m[4] ?? '').trim();
		return { name, file: m[2]!, shows, kind: kindOf(name, shows) };
	}
	throw new Error(`Images: "${text}" names no PNG, JPEG or WebP file. Write one per line as file.png: what it shows.`);
}

const unquote = (s: string) => {
	const t = s.trim();
	const m = /^(["“])([\s\S]*)(["”])$/.exec(t);
	return m && (m[1] === '"' ? m[3] === '"' : m[3] === '”') ? m[2]!.trim() : t;
};
const listOf = (text: string): string[] => {
	const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
	if (lines.some((l) => /^[-*]\s+/.test(l))) return lines.map((l) => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
	return lines.flatMap((l) => l.split(/[,;]/)).map((s) => s.trim()).filter(Boolean);
};
const lines = (text: string): string[] => text.split('\n').map((l) => l.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
const oneLine = (text: string) => unquote(text.split('\n').map((l) => l.trim()).filter(Boolean).join(' '));

/** A brief as Markdown or JSON. `name` is for messages (the file's name, or "The brief"). */
export function parseBrief(text: string, name = 'The brief'): Brief {
	const t = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
	return t.trimStart().startsWith('{') ? fromJson(t, name) : fromMarkdown(t, name);
}

function empty(): Brief {
	return { platforms: [], copy: {}, look: { elements: [] }, images: [], must: [], donts: [] };
}

function put(b: Brief, id: string, value: string | string[], name: string) {
	const text = Array.isArray(value) ? value.join('\n') : value;
	if (!text.trim()) return;
	const field = FIELD_OF_SECTION[id];
	if (field) {
		if (field === 'features') b.copy.features = (Array.isArray(value) ? value.map((v) => v.trim()) : listOf(text).length > 1 ? listOf(text) : text.split('|').map((s) => s.trim())).filter(Boolean).join(' | ');
		else b.copy[field] = oneLine(text);
		return;
	}
	if (id === 'name') b.name = oneLine(text);
	else if (id === 'goal') b.goal = oneLine(text);
	else if (id === 'audience') b.audience = oneLine(text);
	else if (id === 'platforms') b.platforms.push(...(Array.isArray(value) ? value : listOf(text)));
	else if (id === 'look') b.look = parseLook(Array.isArray(value) ? value : lines(text).join(', '));
	else if (id === 'images') b.images.push(...(Array.isArray(value) ? value : lines(text)).map(parseImage));
	else if (id === 'must') b.must.push(...(Array.isArray(value) ? value : lines(text)));
	else if (id === 'donts') b.donts.push(...(Array.isArray(value) ? value : lines(text)));
	else throw new Error(`${name}: unknown section ${id}.`);
}

function fromMarkdown(text: string, name: string): Brief {
	const b = empty();
	const found: Record<string, string[]> = {};
	let current: string | undefined;
	// A section opened by a heading runs to the next heading; one opened by "Key: value" runs to the next known key.
	let keyed = false;
	const seen = new Set<string>();
	const open = (heading: string, line: number) => {
		const id = sectionOf(heading);
		if (!id) throw new Error(`${name}, line ${line}: unknown section "${heading.trim()}". Sections: ${knownHeadings()}.`);
		if (seen.has(id)) throw new Error(`${name}, line ${line}: "${heading.trim()}" is a second ${SECTIONS[id]!.heading} section. Give each once.`);
		seen.add(id);
		found[id] = [];
		return id;
	};
	text.split('\n').forEach((line, i) => {
		const h1 = /^#\s+(.+?)\s*#*\s*$/.exec(line);
		if (h1 && !current && !b.name && !Object.keys(found).length) {
			b.name = h1[1]!.trim();
			return;
		}
		const h = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
		if (h) {
			current = open(h[1]!, i + 1);
			keyed = false;
			return;
		}
		// "Headline: Every ad, the day it ships." outside a section, or as the first line of nothing.
		const kv = /^\s*(?:[-*]\s+)?\*{0,2}([A-Za-z][A-Za-z '/’-]{0,30}?)\*{0,2}\s*:\s*(.*)$/.exec(line);
		if (kv && (!current || (keyed && !/^\s*[-*]\s/.test(line))) && sectionOf(kv[1]!)) {
			current = open(kv[1]!, i + 1);
			keyed = true;
			if (kv[2]!.trim()) found[current]!.push(kv[2]!);
			return;
		}
		if (current) found[current]!.push(line);
		else if (line.trim() && !/^<!--.*-->$/.test(line.trim())) throw new Error(`${name}, line ${i + 1}: "${line.trim().slice(0, 60)}" is outside a section. Start each part with a heading (## Headline) or a key (Headline: ...). Sections: ${knownHeadings()}.`);
	});
	for (const [id, body] of Object.entries(found)) put(b, id, body.join('\n').replace(/<!--[\s\S]*?-->/g, '').trim(), name);
	return b;
}

function fromJson(text: string, name: string): Brief {
	let raw: Record<string, unknown>;
	try {
		raw = JSON.parse(text) as Record<string, unknown>;
	} catch (err) {
		throw new Error(`${name} is not valid JSON (${(err as Error).message}).`);
	}
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(`${name} must be a JSON object of sections.`);
	const b = empty();
	for (const [key, v] of Object.entries(raw)) {
		if (key === '$comment' || key === '$schema') continue;
		const id = sectionOf(key.replace(/([a-z])([A-Z])/g, '$1 $2'));
		if (!id) throw new Error(`${name}: unknown key "${key}". Keys: ${Object.values(SECTIONS).map((d) => d.heading.toLowerCase()).join(', ')}.`);
		if (id === 'look' && v && typeof v === 'object' && !Array.isArray(v)) {
			b.look = parseLook(v as Record<string, unknown>);
			continue;
		}
		if (id === 'images' && Array.isArray(v)) {
			b.images.push(...v.map((x) => (typeof x === 'string' ? parseImage(x) : imageObject(x as Record<string, unknown>, name))));
			continue;
		}
		if (typeof v === 'string') put(b, id, v, name);
		else if (Array.isArray(v) && v.every((x) => typeof x === 'string')) put(b, id, v as string[], name);
		else throw new Error(`${name}: "${key}" takes text${['platforms', 'images', 'must', 'donts', 'features', 'look'].includes(id) ? ' or a list of text' : ''}.`);
	}
	return b;
}

function imageObject(x: Record<string, unknown>, name: string): BriefImage {
	if (typeof x?.file !== 'string' || !IMAGE_EXT.test(x.file)) throw new Error(`${name}: each image takes "file" (a PNG, JPEG or WebP) and "shows".`);
	const nm = typeof x.name === 'string' ? x.name : x.file.replace(/^.*[\\/]/, '').replace(IMAGE_EXT, '');
	const shows = typeof x.shows === 'string' ? x.shows : '';
	return { name: nm, file: x.file, shows, kind: typeof x.kind === 'string' && ['screenshot', 'creative', 'photo'].includes(x.kind) ? (x.kind as BriefImage['kind']) : kindOf(nm, shows) };
}

/** `--image name=file` on the command line, beside (or instead of) the brief's images. A name the brief uses replaces its file. */
export function withImages(b: Brief, flags: string[]): Brief {
	const images = [...b.images];
	for (const f of flags) {
		const m = /^([\w-]+)=(.+)$/.exec(f);
		const file = m ? m[2]! : f;
		if (!IMAGE_EXT.test(file)) throw new Error(`--image takes name=file.png (a PNG, JPEG or WebP), not "${f}".`);
		const name = m ? m[1]! : file.replace(/^.*[\\/]/, '').replace(IMAGE_EXT, '');
		const at = images.findIndex((i) => i.name === name);
		const shows = at >= 0 ? images[at]!.shows : '';
		const img = { name, file, shows, kind: at >= 0 ? images[at]!.kind : kindOf(name, shows), cli: true } as BriefImage;
		if (at >= 0) images[at] = img;
		else images.push(img);
	}
	return { ...b, images };
}

/** How a missing field is named in the error: its heading, as a brief writes it. */
export const headingOf = (field: CopyField | 'goal' | 'platforms') => SECTIONS[field === 'name' ? 'name_' : field]!.heading;
