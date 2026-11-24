import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Everything brand-specific is read from brand/ and build/: no brand strings live in src/.

/** The package root: the folder that holds brand/ (dist/lib/brand.js and src/lib/brand.ts are two levels down). */
export const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

export type Brand = {
	name: string;
	bin: string;
	source: string;
	registryUrl: string;
	/** Where the registry files (/r/) are served when the library site is private; defaults to registryUrl. */
	registryHost?: string;
	site: string;
	assetBase: string;
	/** Web components are named `<elementPrefix>-<item>`. */
	elementPrefix?: string;
	fonts: { files: { family: string; weight: number; range?: string; file: string; role: string; use?: 'web' | 'render' }[]; css: string };
	icons: { name: string; packages: string[]; stroke?: number };
	type: { caps: boolean; bold: boolean };
	groups: Record<string, string>;
	/** Logo rules from the guidelines: clear space as a share of the logomark's height, the logomark's share of each
	 * lockup's height, and minimum heights in pixels per lockup. */
	logo?: { source: string; clearSpace: number; clearSpaceText: string; markHeight: Record<string, number>; minHeight: Record<string, number> };
};

let cached: Brand | undefined;
export function brand(): Brand {
	cached ??= JSON.parse(readFileSync(join(packageRoot, 'brand', 'brand.json'), 'utf8')) as Brand;
	return cached;
}
export const cli = () => brand().bin;
/** The web components' tag prefix: brand.json's elementPrefix, else the CLI's name without its `-ds`. */
export const elementPrefix = () => brand().elementPrefix ?? brand().bin.replace(/-ds$/, '');

export type TokenTable = Record<string, { value: string; light: string; dark: string }>;
let tokenCache: TokenTable | undefined;

/** Every token with its value and resolved light and dark values: build/tokens.json, or parsed from brand/tokens.css. */
export function tokens(): TokenTable {
	if (tokenCache) return tokenCache;
	const built = join(packageRoot, 'build', 'tokens.json');
	if (existsSync(built)) tokenCache = JSON.parse(readFileSync(built, 'utf8')).tokens as TokenTable;
	else {
		const css = readFileSync(join(packageRoot, 'brand', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
		const root = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));
		const table: TokenTable = {};
		const raw: Record<string, string> = {};
		for (const m of root.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)) raw[m[1]] = m[2].trim();
		const resolve = (v: string, depth = 0): string => (depth > 10 ? v : v.replace(/var\((--ds-[\w-]+)\)/g, (_, n) => (raw[n] ? resolve(raw[n], depth + 1) : `var(${n})`)));
		for (const [n, v] of Object.entries(raw)) table[n] = { value: v, light: resolve(v), dark: resolve(v) };
		tokenCache = table;
	}
	return tokenCache;
}

export const isToken = (name: string) => name in tokens();

const px = (v: string) => {
	const m = v.trim().match(/^(-?\d*\.?\d+)px$/);
	return m ? Number(m[1]) : undefined;
};

/** The brand's scales by pixel value: radius, text sizes, durations (ms). */
export function scales() {
	const t = tokens();
	const of = (prefix: string, skip?: RegExp) =>
		Object.entries(t)
			.filter(([n]) => n.startsWith(prefix) && !skip?.test(n))
			.map(([n, v]) => [n, px(v.light)] as const)
			.filter((e): e is readonly [string, number] => e[1] !== undefined);
	const durations = Object.entries(t)
		.filter(([n]) => n.startsWith('--ds-duration-'))
		.map(([n, v]) => [n, Number.parseFloat(v.light)] as const);
	return { radius: of('--ds-radius-'), text: of('--ds-text-', /-leading$/), durations };
}

/** Brand color hexes (light and dark), by hex, to their token name. */
export function brandHexes() {
	const map = new Map<string, string>();
	for (const [name, v] of Object.entries(tokens())) {
		if (!name.startsWith('--ds-color-')) continue;
		for (const value of [v.light, v.dark]) if (/^#[0-9a-f]{6}$/i.test(value) && !map.has(value.toUpperCase())) map.set(value.toUpperCase(), name);
	}
	return map;
}

/** The public address of the registry files (/r/...): registryHost when the library site is private, else registryUrl. */
export const registryHost = () => (brand().registryHost ?? brand().registryUrl).replace(/\/$/, '');
