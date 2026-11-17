import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot, registryHost } from '../lib/brand.js';
import type { Flavor } from './project.js';

// The registry as built by scripts/build-registry.ts: r/ in the release tree, apps/www/public/r in a checkout (or
// DS_REGISTRY_DIR). Falls back to the published registry (registryHost/r) when an item is not bundled. Each item
// carries its Vue files at the top level and, when built, its React and web component flavors under `flavors`.

export type RegistryFile = { path: string; content: string; target?: string };
export type FlavorApi = Record<string, unknown>;
export type ReactFlavor = { files: RegistryFile[]; dependencies: string[]; registryDependencies: string[]; api?: FlavorApi; examples?: { name: string; path: string; content: string; label?: string }[] };
export type ElementsFlavor = { files: RegistryFile[]; modules: string[]; tag: string; tags?: string[]; dependencies: string[]; registryDependencies?: string[]; api?: FlavorApi; examples?: { name: string; path: string; content: string; label?: string }[] };
export type RegistryItem = {
	name: string;
	title: string;
	group: string;
	description: string;
	use_for: string;
	never: string[];
	source: string;
	files: RegistryFile[];
	requires: string[];
	dependencies: string[];
	examples: { name: string; path: string; content: string; label?: string }[];
	flavors?: { react?: ReactFlavor; elements?: ElementsFlavor };
	body?: string;
};
export type IndexEntry = Omit<RegistryItem, 'files' | 'examples' | 'flavors'> & { files: string[]; examples: string[]; flavors?: string[] | Record<string, unknown> };

export function registryDir(): string | undefined {
	const env = process.env.DS_REGISTRY_DIR;
	if (env && existsSync(join(env, 'index.json'))) return env;
	for (const dir of [join(packageRoot, 'r'), join(packageRoot, 'apps', 'www', 'public', 'r')]) if (existsSync(join(dir, 'index.json'))) return dir;
	return undefined;
}

export async function readIndex(): Promise<IndexEntry[]> {
	const dir = registryDir();
	if (dir) return JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')).items;
	const res = await fetch(`${registryHost()}/r/index.json`);
	if (!res.ok) throw new Error(`No bundled registry and ${registryHost()}/r/index.json answered ${res.status}`);
	return ((await res.json()) as { items: IndexEntry[] }).items;
}

export async function readItem(name: string): Promise<RegistryItem> {
	const dir = registryDir();
	if (dir && existsSync(join(dir, `${name}.json`))) return JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
	const res = await fetch(`${registryHost()}/r/${name}.json`);
	if (!res.ok) throw new Error(`Unknown item \`${name}\` (run \`${brand().bin} list\`)`);
	return (await res.json()) as RegistryItem;
}

/** A registry dependency as an item name (`button`, `https://host/r/react/button.json` and `@ds/button` all as `button`). */
export const depName = (d: string) => d.replace(/^.*\//, '').replace(/\.json$/, '');

/** What an item needs from the library, in a flavor. */
export const requiresOf = (item: RegistryItem, flavor: Flavor) => (flavor === 'vue' ? item.requires : (item.flavors?.[flavor]?.registryDependencies ?? item.requires).map(depName));

/** Items with everything they require, required items first. */
export async function resolveItems(names: string[], flavor: Flavor = 'vue'): Promise<RegistryItem[]> {
	const seen = new Map<string, RegistryItem>();
	const visit = async (name: string, trail: string[]) => {
		if (seen.has(name) || trail.includes(name)) return;
		const item = await readItem(name);
		for (const dep of requiresOf(item, flavor)) await visit(dep, [...trail, name]);
		seen.set(name, item);
	};
	for (const n of names) await visit(n, []);
	return [...seen.values()];
}

/** The flavors an item ships (from its JSON, or its index entry). */
export function flavorsOf(item: Pick<RegistryItem, 'flavors'> | IndexEntry): Flavor[] {
	const f = (item as { flavors?: unknown }).flavors;
	const keys = Array.isArray(f) ? (f as string[]) : f && typeof f === 'object' ? Object.keys(f) : [];
	return ['vue', ...(['react', 'elements'] as Flavor[]).filter((k) => keys.includes(k))] as Flavor[];
}

/** A prebuilt web component module (`elements/button.js`): bundled with the package, or from the registry host. */
export async function readModule(path: string): Promise<string> {
	const rel = path.replace(/^\/+/, '');
	const env = process.env.DS_REGISTRY_DIR;
	for (const dir of [...(env ? [join(env, '..')] : []), packageRoot, join(packageRoot, 'apps', 'www', 'public')]) if (existsSync(join(dir, rel))) return readFileSync(join(dir, rel), 'utf8');
	const res = await fetch(`${registryHost()}/${rel}`);
	if (!res.ok) throw new Error(`${registryHost()}/${rel} answered ${res.status}`);
	return res.text();
}
