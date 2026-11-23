import { PLATFORMS, platformOf, zonePx, type Platform } from '../design/platforms.js';
import { SMALL_FLOOR } from '../design/check.js';
import type { Rect } from '../design/types.js';

// The sizes image templates are drawn at: the shared platform sizes (src/design/platforms.ts: ids, pixels, the zones
// each platform covers or crops, and its upload limit) and the ones only a logo or a second square needs.

export type SizeSpec = { id: string; width: number; height: number; use: string; aliases: string[] };

const OWN: SizeSpec[] = [
	{ id: 'linkedin-square', width: 1200, height: 1200, use: 'LinkedIn square post', aliases: ['li-square'] },
	{ id: 'tile', width: 600, height: 600, use: 'A logo on an approved background', aliases: [] },
	{ id: 'primary', width: 1920, height: 1080, use: 'The logo on its primary background', aliases: [] },
];
/** Names older versions took, beside the shared ones. */
const OLD: Record<string, string[]> = { landscape: ['card'], linkedin: ['li-link', 'li'], 'linkedin-banner': ['li-profile'], youtube: ['yt'], 'x-banner': ['banner-x'] };

export const SIZES: SizeSpec[] = [...PLATFORMS.map((p) => ({ id: p.id, width: p.width, height: p.height, use: p.label, aliases: [...p.aliases, ...(OLD[p.id] ?? [])] })), ...OWN];
export const CUSTOM_RANGE = { min: 200, max: 4000 };

const key = (s: string) => s.trim().toLowerCase().replace(/[\s_]+/g, '-');
export function sizeSpec(typed: string): SizeSpec | undefined {
	const k = key(typed);
	return SIZES.find((s) => s.id === k) ?? SIZES.find((s) => s.aliases.includes(k));
}

/** What a layout needs to know about a size: the part the platform shows, what it covers, and the smallest readable text. */
export function zonesOf(id: string, width: number, height: number): { safe?: Rect; avoid: Rect[]; floor: number; platform: Platform } {
	const p = platformOf(id, width, height);
	return { safe: p.safe && id !== 'avatar' ? zonePx(p.safe, width, height) : undefined, avoid: p.avoid.map((z) => zonePx(z, width, height)), floor: Math.ceil(((SMALL_FLOOR * width) / p.shown) * 10) / 10, platform: p };
}
