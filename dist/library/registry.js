import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot, registryHost } from '../lib/brand.js';
export function registryDir() {
    const env = process.env.DS_REGISTRY_DIR;
    if (env && existsSync(join(env, 'index.json')))
        return env;
    for (const dir of [join(packageRoot, 'r'), join(packageRoot, 'apps', 'www', 'public', 'r')])
        if (existsSync(join(dir, 'index.json')))
            return dir;
    return undefined;
}
export async function readIndex() {
    const dir = registryDir();
    if (dir)
        return JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')).items;
    const res = await fetch(`${registryHost()}/r/index.json`);
    if (!res.ok)
        throw new Error(`No bundled registry and ${registryHost()}/r/index.json answered ${res.status}`);
    return (await res.json()).items;
}
export async function readItem(name) {
    const dir = registryDir();
    if (dir && existsSync(join(dir, `${name}.json`)))
        return JSON.parse(readFileSync(join(dir, `${name}.json`), 'utf8'));
    const res = await fetch(`${registryHost()}/r/${name}.json`);
    if (!res.ok)
        throw new Error(`Unknown item \`${name}\` (run \`${brand().bin} list\`)`);
    return (await res.json());
}
/** A registry dependency as an item name (`button`, `https://host/r/react/button.json` and `@ds/button` all as `button`). */
export const depName = (d) => d.replace(/^.*\//, '').replace(/\.json$/, '');
/** What an item needs from the library, in a flavor. */
export const requiresOf = (item, flavor) => (item.flavors?.[flavor]?.registryDependencies ?? item.requires).map(depName);
/** Items with everything they require, required items first. */
export async function resolveItems(names, flavor = 'react') {
    const seen = new Map();
    const visit = async (name, trail) => {
        if (seen.has(name) || trail.includes(name))
            return;
        const item = await readItem(name);
        for (const dep of requiresOf(item, flavor))
            await visit(dep, [...trail, name]);
        seen.set(name, item);
    };
    for (const n of names)
        await visit(n, []);
    return [...seen.values()];
}
/** The flavors an item ships (from its JSON, or its index entry). */
export function flavorsOf(item) {
    const f = item.flavors;
    const keys = Array.isArray(f) ? f : f && typeof f === 'object' ? Object.keys(f) : [];
    return ['react', 'elements'].filter((k) => keys.includes(k));
}
/** A prebuilt web component module (`elements/button.js`): bundled with the package, or from the registry host. */
export async function readModule(path) {
    const rel = path.replace(/^\/+/, '');
    const env = process.env.DS_REGISTRY_DIR;
    for (const dir of [...(env ? [join(env, '..')] : []), packageRoot, join(packageRoot, 'apps', 'www', 'public')])
        if (existsSync(join(dir, rel)))
            return readFileSync(join(dir, rel), 'utf8');
    const res = await fetch(`${registryHost()}/${rel}`);
    if (!res.ok)
        throw new Error(`${registryHost()}/${rel} answered ${res.status}`);
    return res.text();
}
