import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { brand, brandHexes, packageRoot, tokens, type TokenTable } from '../lib/brand.js';
import { suggest } from '../lib/names.js';

// The brand system an agent can query. Values come from brand/tokens.css (via tokens()), brand/brand.json,
// the logo files on disk, and brand/principles.md. Nothing here invents a token, a face, or a rule.

export const BRAND_SECTIONS = ['color', 'type', 'spacing', 'radii', 'motion', 'fonts', 'logos', 'voice', 'other'] as const;
export type BrandSection = (typeof BRAND_SECTIONS)[number];

const SECTION_ALIAS: Record<string, BrandSection> = { colour: 'color' };

export function sectionId(input: string): BrandSection {
	const key = input.trim().toLowerCase();
	const id = SECTION_ALIAS[key] ?? key;
	if (!(BRAND_SECTIONS as readonly string[]).includes(id)) {
		throw new Error(`Unknown section \`${input}\`. Sections: ${BRAND_SECTIONS.join(', ')}. \`colour\` is \`color\`.`);
	}
	return id as BrandSection;
}

type Classed = { section: BrandSection; group: string };

function classify(name: string): Classed {
	if (name.startsWith('--ds-color-')) return { section: 'color', group: 'color' };
	if (name.startsWith('--ds-font-')) return { section: 'type', group: 'font' };
	if (name.startsWith('--ds-text-')) return { section: 'type', group: 'text' };
	if (name.startsWith('--ds-tracking-')) return { section: 'type', group: 'tracking' };
	if (name.startsWith('--ds-space-')) return { section: 'spacing', group: 'space' };
	if (name.startsWith('--ds-size-')) return { section: 'spacing', group: 'size' };
	if (name.startsWith('--ds-layout-')) return { section: 'spacing', group: 'layout' };
	if (name.startsWith('--ds-border-')) return { section: 'spacing', group: 'border' };
	if (name.startsWith('--ds-radius-')) return { section: 'radii', group: 'radius' };
	if (name.startsWith('--ds-duration-')) return { section: 'motion', group: 'duration' };
	if (name.startsWith('--ds-easing-')) return { section: 'motion', group: 'easing' };
	return { section: 'other', group: 'other' };
}

export type TokenRecord = { name: string; value: string; light: string; dark: string; section: BrandSection; group: string };

export function tokenRecords(): TokenRecord[] {
	return Object.entries(tokens())
		.map(([name, v]) => ({ name, value: v.value, light: v.light, dark: v.dark, ...classify(name) }))
		.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

export function sectionTokens(section: BrandSection): TokenRecord[] {
	return tokenRecords().filter((t) => t.section === section);
}

/** One token by its full `--ds-` name. A shorter name is not expanded. */
export function tokenByName(name: string): TokenRecord {
	const table: TokenTable = tokens();
	const hit = table[name];
	if (!hit) {
		const near = suggest(name, Object.keys(table));
		throw new Error(`Unknown token \`${name}\`.${near.length ? ` Closest: ${near.map((n) => `\`${n}\``).join(', ')}.` : ''} Pass the full \`--ds-\` name.`);
	}
	return { name, value: hit.value, light: hit.light, dark: hit.dark, ...classify(name) };
}

export function fonts() {
	const files = brand().fonts.files.map((f) => {
		const path = `brand/fonts/${f.file}`;
		return { family: f.family, weight: f.weight, role: f.role, file: f.file, path, present: existsSync(join(packageRoot, path)) };
	});
	const missing = files.filter((f) => !f.present).map((f) => f.path);
	return {
		source: 'brand/brand.json',
		css: brand().fonts.css,
		files,
		missing,
		note: missing.length ? 'A face named in brand/brand.json has no file in brand/fonts. Nothing is substituted.' : 'Every face named in brand/brand.json has a woff2 file in brand/fonts.',
	};
}

type LogoFill = { hex: string; token?: string };
type LogoAsset = { path: string; kind: string; bytes: number; width?: number; height?: number; viewBox?: string; fills?: LogoFill[] };

function walk(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory() ? walk(path) : [path];
	});
}

export function logos() {
	const root = join(packageRoot, 'brand', 'logo');
	if (!existsSync(root)) throw new Error('brand/logo is not in this package.');
	const hexes = brandHexes();
	const assets: LogoAsset[] = walk(root)
		.sort()
		.map((abs) => {
			const path = relative(packageRoot, abs).split(sep).join('/');
			const data = readFileSync(abs);
			const asset: LogoAsset = { path, kind: path.split('.').pop() ?? '', bytes: statSync(abs).size };
			if (asset.kind === 'svg') {
				const raw = data.toString('utf8');
				const box = /viewBox="([^"]+)"/.exec(raw)?.[1];
				if (box) {
					asset.viewBox = box;
					const parts = box.split(/[\s,]+/).map(Number);
					if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
						asset.width = parts[2];
						asset.height = parts[3];
					}
				}
				const fills = new Set<string>();
				for (const match of raw.matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) fills.add(match[1].toUpperCase());
				asset.fills = [...fills].sort().map((hex) => ({ hex, token: hexes.get(hex) }));
			} else if (asset.kind === 'png' && data.length > 24 && data.toString('ascii', 12, 16) === 'IHDR') {
				asset.width = data.readUInt32BE(16);
				asset.height = data.readUInt32BE(20);
			}
			return asset;
		});
	const rules = assets
		.filter((asset) => asset.fills?.length)
		.map((asset) => `${asset.path} is filled ${asset.fills!.map((fill) => (fill.token ? `${fill.hex} (${fill.token})` : fill.hex)).join(', ')}.`);
	rules.push('image redraws brand/logo/svg/mark-white.svg in the foreground of the chosen ground. video logo redraws brand/logo/svg/horizontal-white.svg the same way, and every video draws mark-white.svg in the footer.');
	const spec = brand().logo;
	const missing: string[] = [];
	if (spec) {
		rules.push(spec.clearSpaceText);
		rules.push(`Clear space as a share of each lockup's height: ${Object.entries(spec.markHeight).map(([lockup, share]) => `${lockup} ${+(share * spec.clearSpace).toFixed(3)}`).join(', ')}.`);
		rules.push(`Minimum heights: ${Object.entries(spec.minHeight).map(([lockup, px]) => `${lockup} ${px}px`).join(', ')}. Source: ${spec.source}.`);
		const lockups = [...new Set(assets.map((asset) => /^brand\/logo\/svg\/(.+)-(black|white)\.svg$/.exec(asset.path)?.[1]).filter((name): name is string => Boolean(name)))];
		const unsized = lockups.filter((lockup) => !(lockup in spec.minHeight));
		if (unsized.length) missing.push(`The guidelines set no minimum size for ${unsized.join(', ')}. Do not invent one.`);
	} else missing.push('The guidelines set clear space and minimum sizes for the logo, but their values are not in this repository. Do not invent them.');
	return { source: 'brand/logo', assets, rules, missing };
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim();

export function about(): string {
	const md = readFileSync(join(packageRoot, 'brand', 'principles.md'), 'utf8');
	return squash(md.split(/^## /m)[0].replace(/^#[^\n]*\n/, ''));
}

export function voice() {
	const md = readFileSync(join(packageRoot, 'brand', 'principles.md'), 'utf8');
	const heading = md.match(/^## Voice[^\n]*\n([\s\S]*)$/m);
	if (!heading) throw new Error('brand/principles.md has no "## Voice" section.');
	const body = heading[1].trim();
	const neverAt = body.search(/Never:\s*/);
	if (neverAt < 0) throw new Error('brand/principles.md Voice section has no "Never:" list.');
	const never = body
		.slice(neverAt)
		.replace(/^Never:\s*/, '')
		.split(',')
		.map((word) => squash(word).replace(/\.$/, ''))
		.filter(Boolean);
	if (!never.length) throw new Error('brand/principles.md Voice section has an empty "Never:" list.');
	return { source: 'brand/principles.md', prose: squash(body.slice(0, neverAt)), never };
}

export type PrincipleRule = { id: string; text: string; source?: string };
export type PrincipleSurface = {
	id: string;
	title: string;
	appliesTo?: string;
	source: string;
	gap?: string;
	do: PrincipleRule[];
	dont: PrincipleRule[];
	rules: PrincipleRule[];
};

let principleCache: { product: PrincipleSurface; website: PrincipleSurface } | undefined;

export function principleSurfaces(): { product: PrincipleSurface; website: PrincipleSurface } {
	if (principleCache) return principleCache;
	const parsed = JSON.parse(readFileSync(join(packageRoot, 'brand', 'principles.json'), 'utf8')) as { product: PrincipleSurface; website: PrincipleSurface };
	for (const surface of [parsed.product, parsed.website]) {
		if (surface.id !== 'product' && surface.id !== 'website') throw new Error(`brand/principles.json has an unexpected surface \`${surface.id}\`.`);
		const ids = [...surface.do, ...surface.dont, ...surface.rules].map((rule) => rule.id);
		const seen = new Set<string>();
		for (const id of ids) {
			if (seen.has(id)) throw new Error(`Duplicate principle id ${surface.id}:${id}.`);
			seen.add(id);
		}
	}
	principleCache = parsed;
	return parsed;
}

export const SURFACE_IDS = ['product', 'website'] as const;
export type SurfaceId = (typeof SURFACE_IDS)[number];

export function surfaceId(input: string): SurfaceId {
	const id = input.trim().toLowerCase();
	if (!(SURFACE_IDS as readonly string[]).includes(id)) throw new Error(`Unknown surface \`${input}\`. Surfaces: ${SURFACE_IDS.join(', ')}.`);
	return id as SurfaceId;
}

const TOKEN_NOTE = 'Token values resolve from brand/tokens.css. light is :root. dark is [data-theme="dark"] when build/tokens.json is present, and the same as light when it is not.';

export function brandSection(id: BrandSection) {
	if (id === 'fonts') return { section: id, ...fonts() };
	if (id === 'logos') return { section: id, ...logos() };
	if (id === 'voice') return { section: id, ...voice() };
	return { section: id, source: 'brand/tokens.css', note: TOKEN_NOTE, tokens: sectionTokens(id) };
}

export function brandDocument() {
	const sections = Object.fromEntries(BRAND_SECTIONS.map((id) => [id, brandSection(id)])) as Record<BrandSection, ReturnType<typeof brandSection>>;
	return { sections, aliases: { colour: 'color' } };
}
