import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packageRoot, tokens } from '../lib/brand.js';
let cached;
export function elements() {
    cached ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'elements.json'), 'utf8'));
    return cached;
}
const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };
export function parseColor(raw) {
    const v = raw.trim().toLowerCase();
    if (NAMED[v])
        return NAMED[v];
    const hex = v.match(/^#([0-9a-f]{3,8})$/)?.[1];
    if (hex) {
        if (![3, 4, 6, 8].includes(hex.length))
            return undefined;
        const full = hex.length <= 4 ? [...hex].map((c) => c + c).join('') : hex;
        const n = (i) => Number.parseInt(full.slice(i, i + 2), 16);
        return [n(0), n(2), n(4), full.length === 8 ? n(6) / 255 : 1];
    }
    const alpha = (s) => (s === undefined ? 1 : s.endsWith('%') ? Number.parseFloat(s) / 100 : Number(s));
    const fn = v.match(/^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:[\s,/]+([\d.]+%?))?\s*\)$/);
    if (fn) {
        const ch = (s) => (s.endsWith('%') ? (Number.parseFloat(s) * 255) / 100 : Number(s));
        return [ch(fn[1]), ch(fn[2]), ch(fn[3]), alpha(fn[4])];
    }
    const h = v.match(/^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%(?:[\s,/]+([\d.]+%?))?\s*\)$/);
    if (h)
        return fromHsl(Number(h[1]), Number(h[2]) / 100, Number(h[3]) / 100, alpha(h[4]));
    // oklch(L C H): lightness is close enough to read the role; chroma and hue give the family.
    const ok = v.match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/);
    if (ok) {
        const L = Number(ok[1]) / (ok[2] ? 100 : 1);
        const C = Number(ok[3]);
        return fromHsl(oklchHueToHsl(Number(ok[4])), C < 0.03 ? 0 : Math.min(1, C * 4), L, alpha(ok[5]));
    }
    return undefined;
}
/** oklch hues sit a little off hsl's: red 25 is hsl 0 to 10, green 145 is hsl 120 to 140, blue 260 is hsl 220. */
const oklchHueToHsl = (h) => (h < 40 ? h * 0.3 : h < 110 ? 15 + (h - 40) * 0.6 : h < 200 ? 57 + (h - 110) * 0.9 : h < 300 ? 140 + (h - 200) * 0.9 : 230 + (h - 300) * 1.8) % 360;
export function fromHsl(hue, s, l, a = 1) {
    const h = hue / 360;
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t) => {
        const x = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
        return 255 * (x < 1 / 6 ? p + (q - p) * 6 * x : x < 1 / 2 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p);
    };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3), a];
}
export function hsl([r, g, b]) {
    const [R, G, B] = [r / 255, g / 255, b / 255];
    const max = Math.max(R, G, B);
    const min = Math.min(R, G, B);
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d)
        h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
    return { h: (h * 60 + 360) % 360, s, l };
}
export function classify(rgba) {
    const { h, s, l } = hsl(rgba);
    const alpha = rgba[3];
    // A gray with a tint (Tailwind's slate and gray) is still a gray: little chroma and little saturation.
    const chroma = (Math.max(rgba[0], rgba[1], rgba[2]) - Math.min(rgba[0], rgba[1], rgba[2])) / 255;
    if ((chroma < 0.16 && s < 0.45) || l < 0.04 || l > 0.985)
        return { family: 'neutral', l, alpha };
    if (h < 15 || h >= 340)
        return { family: 'danger', l, alpha };
    if (h < 65)
        return { family: 'warning', l, alpha };
    if (h < 170)
        return { family: 'success', l, alpha };
    return { family: 'accent', l, alpha };
}
// Tailwind's default palette by family and step: lightness is what decides the role.
const STEP_L = { 50: 0.98, 100: 0.96, 200: 0.91, 300: 0.84, 400: 0.65, 500: 0.46, 600: 0.34, 700: 0.27, 800: 0.17, 900: 0.11, 950: 0.05 };
export const TW_FAMILIES = {
    slate: 'neutral', gray: 'neutral', zinc: 'neutral', neutral: 'neutral', stone: 'neutral',
    red: 'danger', rose: 'danger',
    orange: 'warning', amber: 'warning', yellow: 'warning',
    lime: 'success', green: 'success', emerald: 'success', teal: 'success',
    cyan: 'accent', sky: 'accent', blue: 'accent', indigo: 'accent', violet: 'accent', purple: 'accent', fuchsia: 'accent', pink: 'accent',
};
export const TW_PALETTE_NAMES = Object.keys(TW_FAMILIES).join('|');
export function paletteColor(family, step, alpha = 1) {
    const f = TW_FAMILIES[family];
    const l = STEP_L[step];
    if (!f || l === undefined)
        return undefined;
    return { family: f, l, alpha };
}
/** shadcn's theme names, read as the roles they play on a light page. */
const SHADCN = {
    background: { family: 'neutral', l: 1, alpha: 1 }, card: { family: 'neutral', l: 1, alpha: 1 }, popover: { family: 'neutral', l: 1, alpha: 1 },
    foreground: { family: 'neutral', l: 0.04, alpha: 1 }, 'card-foreground': { family: 'neutral', l: 0.04, alpha: 1 }, 'popover-foreground': { family: 'neutral', l: 0.04, alpha: 1 },
    primary: { family: 'neutral', l: 0.09, alpha: 1 }, 'primary-foreground': { family: 'neutral', l: 0.98, alpha: 1 },
    secondary: { family: 'neutral', l: 0.96, alpha: 1 }, 'secondary-foreground': { family: 'neutral', l: 0.09, alpha: 1 },
    muted: { family: 'neutral', l: 0.96, alpha: 1 }, 'muted-foreground': { family: 'neutral', l: 0.45, alpha: 1 },
    accent: { family: 'neutral', l: 0.96, alpha: 1 }, 'accent-foreground': { family: 'neutral', l: 0.09, alpha: 1 },
    destructive: { family: 'danger', l: 0.5, alpha: 1 }, border: { family: 'neutral', l: 0.9, alpha: 1 }, input: { family: 'neutral', l: 0.9, alpha: 1 }, ring: { family: 'neutral', l: 0.6, alpha: 1 },
};
let brandColors;
/** A brand color utility's name (surface, fg-muted, action-primary) to its light value, read as a color. */
export function brandColor(name) {
    if (!brandColors) {
        brandColors = new Map();
        for (const [n, v] of Object.entries(tokens())) {
            if (!n.startsWith('--ds-color-'))
                continue;
            const mix = v.light.match(/color-mix\(in srgb,\s*(#[0-9a-fA-F]{6})\s+(\d+)%,\s*transparent\)/);
            const rgba = parseColor(v.light) ?? (mix ? [...parseColor(mix[1]).slice(0, 3), Number(mix[2]) / 100] : undefined);
            if (rgba)
                brandColors.set(n.slice('--ds-color-'.length), classify(rgba));
        }
    }
    return brandColors.get(name) ?? brandColors.get(name.replace(/^ds-/, '')) ?? SHADCN[name];
}
// The app's ground (convert/ground.ts), set by apply before it converts. The role tables read lightness as a light
// page does; on a dark app a neutral's lightness is read mirrored, and its page color (within 0.03 of the ground) is
// the brand's surface, so the app's ground becomes the brand's.
let ground;
export function setGround(g) {
    ground = g;
}
function asOnLight(c, use) {
    if (!ground?.dark || c.family !== 'neutral')
        return c;
    return { ...c, l: use === 'bg' && Math.abs(c.l - ground.l) < 0.03 ? 1 : 1 - c.l };
}
/** The brand role for a color by what it colors. */
export function roleFor(color, use) {
    const c = asOnLight(color, use);
    const table = elements().roles[use][c.family];
    for (const [min, role] of table)
        if (c.l >= min)
            return role;
    return table[table.length - 1][1];
}
export const hoverRole = (color) => {
    const c = asOnLight(color, 'bg');
    return c.l < 0.86 ? elements().roles.hover[c.family] : undefined;
};
/** CSS for a role, keeping the color's alpha. */
export function cssRole(roleWithAlpha, alphaIn = 1) {
    const [role, own] = roleWithAlpha.split('/');
    const alpha = own && alphaIn >= 0.995 ? Number(own) / 100 : alphaIn;
    return alpha >= 0.995 ? `var(--ds-color-${role})` : `color-mix(in srgb, var(--ds-color-${role}) ${Math.round(alpha * 1000) / 10}%, transparent)`;
}
/** A role's literal light value, for code that needs a value rather than a variable (charts, canvas). */
export function roleHex(role) {
    return tokens()[`--ds-color-${role}`]?.light;
}
