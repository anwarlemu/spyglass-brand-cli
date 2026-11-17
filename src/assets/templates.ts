import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
import { suggest } from '../lib/names.js';
import type { Layer, Photo, Scene } from './scene.js';

// Templates are data: brand/assets/<kind>.json holds each layout as a scene with slots. This file loads them,
// checks names (an unknown template, size, variant or slot exits 1 with the closest names) and turns a template, a
// size and the copy into a scene.

export type SizeLayout = { width: number; height: number; ground?: string; layers: Layer[] };
export type Template = {
	id: string;
	group: string;
	name: string;
	figma?: string;
	description: string;
	photos?: number;
	slots: Record<string, string>;
	variants?: Record<string, Record<string, string>>;
	sizes: Record<string, SizeLayout>;
};

const cache = new Map<string, Template[]>();
export function templates(kind: 'image' | 'deck'): Template[] {
	const hit = cache.get(kind);
	if (hit) return hit;
	const doc = JSON.parse(readFileSync(join(packageRoot, 'brand', 'assets', `${kind}.json`), 'utf8')) as { templates: Template[] };
	cache.set(kind, doc.templates);
	return doc.templates;
}

export function unknown(what: string, typed: string, pool: string[]): Error {
	const near = suggest(typed, pool);
	return new Error(`Unknown ${what} \`${typed}\`.${near.length ? ` Did you mean ${near.map((n) => `\`${n}\``).join(' or ')}?` : ''} Choose from: ${pool.join(', ')}.`);
}

export function findTemplate(kind: 'image' | 'deck', id: string): Template {
	const all = templates(kind);
	const t = all.find((x) => x.id === id.trim().toLowerCase());
	if (!t) throw unknown(kind === 'deck' ? 'slide type' : 'template', id, all.map((x) => x.id));
	return t;
}

/** Every slot name any template takes (the command's text flags). */
export function slotNames(kind: 'image' | 'deck'): string[] {
	return [...new Set(templates(kind).flatMap((t) => Object.keys(t.slots)))].sort();
}

function fill(value: string): string {
	const b = brand() as ReturnType<typeof brand> & { domain?: string; tagline?: string };
	const domain = b.domain ?? new URL(b.site).host.replace(/^www\./, '');
	return value.replaceAll('{domain}', domain).replaceAll('{tagline}', b.tagline ?? '');
}

function substitute<T>(value: T, vars: Record<string, string>): T {
	if (typeof value === 'string') return (value.startsWith('$') ? vars[value.slice(1)] ?? value : value) as T;
	if (Array.isArray(value)) return value.map((v) => substitute(v, vars)) as T;
	if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, substitute(v, vars)])) as T;
	return value;
}

export type SceneRequest = { size?: string; variant?: string; slots?: Record<string, string>; photos?: Photo[]; seed?: number; light?: 'brand' | 'generated' };

/** A template at one size, with the copy filled in, as a scene. */
export function sceneFor(t: Template, req: SceneRequest): { scene: Scene; size: string; variant?: string } {
	const sizes = Object.keys(t.sizes);
	const size = req.size ? req.size.trim().toLowerCase() : sizes[0]!;
	if (!t.sizes[size]) throw unknown(`size for ${t.id}`, size, sizes);
	const variants = t.variants ? Object.keys(t.variants) : [];
	let vars: Record<string, string> = {};
	let variant: string | undefined;
	if (req.variant) {
		if (!t.variants) throw new Error(`${t.id} has no variants.`);
		variant = req.variant.trim().toLowerCase();
		if (!t.variants[variant]) throw unknown(`variant for ${t.id}`, variant, variants);
		vars = t.variants[variant]!;
	} else if (t.variants) {
		variant = variants[0]!;
		vars = t.variants[variant]!;
	}
	const given = req.slots ?? {};
	for (const name of Object.keys(given)) {
		if (!(name in t.slots)) {
			const takes = Object.keys(t.slots);
			throw new Error(`${t.id} does not draw --${name}.${takes.length ? ` It takes ${takes.map((s) => `--${s}`).join(', ')}.` : ' It takes no text.'}`);
		}
	}
	const slots = Object.fromEntries(Object.entries(t.slots).map(([k, v]) => [k, fill(given[k] ?? v)]));
	const want = t.photos ?? 0;
	if ((req.photos?.length ?? 0) > want) throw new Error(`${t.id} holds ${want} picture${want === 1 ? '' : 's'}; ${req.photos!.length} were passed with --image.`);
	const layout = substitute(t.sizes[size]!, vars);
	return {
		scene: { width: layout.width, height: layout.height, ground: layout.ground ?? 'black', layers: layout.layers, slots, photos: req.photos, seed: req.seed, light: req.light },
		size,
		variant,
	};
}

export function catalogOf(kind: 'image' | 'deck') {
	return templates(kind).map((t) => ({
		id: t.id,
		group: t.group,
		name: t.name,
		description: t.description,
		figma: t.figma,
		sizes: Object.entries(t.sizes).map(([id, s]) => ({ id, width: s.width, height: s.height })),
		variants: t.variants ? Object.keys(t.variants) : [],
		slots: Object.fromEntries(Object.entries(t.slots).map(([k, v]) => [k, fill(v)])),
		photos: t.photos ?? 0,
	}));
}
