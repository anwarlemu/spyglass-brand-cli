import { PLATFORMS, platformOf, zonePx } from '../design/platforms.js';
import { SMALL_FLOOR } from '../design/check.js';
const OWN = [
    { id: 'linkedin-square', width: 1200, height: 1200, use: 'LinkedIn square post', aliases: ['li-square'] },
    { id: 'tile', width: 600, height: 600, use: 'A logo on an approved background', aliases: [] },
    { id: 'primary', width: 1920, height: 1080, use: 'The logo on its primary background', aliases: [] },
];
/** Names older versions took, beside the shared ones. */
const OLD = { landscape: ['card'], linkedin: ['li-link', 'li'], 'linkedin-banner': ['li-profile'], youtube: ['yt'], 'x-banner': ['banner-x'] };
export const SIZES = [...PLATFORMS.map((p) => ({ id: p.id, width: p.width, height: p.height, use: p.label, aliases: [...p.aliases, ...(OLD[p.id] ?? [])] })), ...OWN];
export const CUSTOM_RANGE = { min: 200, max: 4000 };
const key = (s) => s.trim().toLowerCase().replace(/[\s_]+/g, '-');
export function sizeSpec(typed) {
    const k = key(typed);
    return SIZES.find((s) => s.id === k) ?? SIZES.find((s) => s.aliases.includes(k));
}
/** What a layout needs to know about a size: the part the platform shows, what it covers, and the smallest readable text. */
export function zonesOf(id, width, height) {
    const p = platformOf(id, width, height);
    return { safe: p.safe && id !== 'avatar' ? zonePx(p.safe, width, height) : undefined, avoid: p.avoid.map((z) => zonePx(z, width, height)), floor: Math.ceil(((SMALL_FLOOR * width) / p.shown) * 10) / 10, platform: p };
}
