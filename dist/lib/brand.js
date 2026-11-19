import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
// Everything brand-specific is read from brand/ and build/: no brand strings live in src/.
/** The package root: the folder that holds brand/ (dist/lib/brand.js and src/lib/brand.ts are two levels down). */
export const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let cached;
export function brand() {
    cached ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'brand.json'), 'utf8'));
    return cached;
}
export const cli = () => brand().bin;
/** The web components' tag prefix: brand.json's elementPrefix, else the CLI's name without its `-ds`. */
export const elementPrefix = () => brand().elementPrefix ?? brand().bin.replace(/-ds$/, '');
let tokenCache;
/** Every token with its value and resolved light and dark values: build/tokens.json, or parsed from brand/tokens.css. */
export function tokens() {
    if (tokenCache)
        return tokenCache;
    const built = join(packageRoot, 'build', 'tokens.json');
    if (existsSync(built))
        tokenCache = JSON.parse(readFileSync(built, 'utf8')).tokens;
    else {
        const css = readFileSync(join(packageRoot, 'brand', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
        const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
        const table = {};
        const raw = {};
        for (const m of root.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g))
            raw[m[1]] = m[2].trim();
        const resolve = (v, depth = 0) => (depth > 10 ? v : v.replace(/var\((--ds-[\w-]+)\)/g, (_, n) => (raw[n] ? resolve(raw[n], depth + 1) : `var(${n})`)));
        for (const [n, v] of Object.entries(raw))
            table[n] = { value: v, light: resolve(v), dark: resolve(v) };
        tokenCache = table;
    }
    return tokenCache;
}
export const isToken = (name) => name in tokens();
const px = (v) => {
    const m = v.trim().match(/^(-?\d*\.?\d+)px$/);
    return m ? Number(m[1]) : undefined;
};
/** The brand's scales by pixel value: radius, text sizes, durations (ms). */
export function scales() {
    const t = tokens();
    const of = (prefix, skip) => Object.entries(t)
        .filter(([n]) => n.startsWith(prefix) && !skip?.test(n))
        .map(([n, v]) => [n, px(v.light)])
        .filter((e) => e[1] !== undefined);
    const durations = Object.entries(t)
        .filter(([n]) => n.startsWith('--ds-duration-'))
        .map(([n, v]) => [n, Number.parseFloat(v.light)]);
    return { radius: of('--ds-radius-'), text: of('--ds-text-', /-leading$/), durations };
}
/** Brand color hexes (light and dark), by hex, to their token name. */
export function brandHexes() {
    const map = new Map();
    for (const [name, v] of Object.entries(tokens())) {
        if (!name.startsWith('--ds-color-'))
            continue;
        for (const value of [v.light, v.dark])
            if (/^#[0-9a-f]{6}$/i.test(value) && !map.has(value.toUpperCase()))
                map.set(value.toUpperCase(), name);
    }
    return map;
}
/** The public address of the registry files (/r/...): registryHost when the library site is private, else registryUrl. */
export const registryHost = () => (brand().registryHost ?? brand().registryUrl).replace(/\/$/, '');
