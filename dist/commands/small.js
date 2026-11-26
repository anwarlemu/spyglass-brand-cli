import { brand, tokens } from '../lib/brand.js';
import { suggest } from '../lib/names.js';
import { flavorsOf, readIndex } from '../library/registry.js';
export async function list() {
    const items = await readIndex();
    return items.map((i) => ({ name: i.name, title: i.title, group: brand().groups[i.group] ?? i.group, groupId: i.group, description: i.description, flavors: flavorsOf(i), requires: i.requires, dependencies: i.dependencies }));
}
/** Tokens whose name or value matches every term. No match is an error, not an empty success. */
export function findTokens(terms) {
    const t = tokens();
    const found = Object.entries(t)
        .filter(([n, v]) => terms.every((term) => n.includes(term) || v.light.toLowerCase().includes(term.toLowerCase()) || v.dark.toLowerCase().includes(term.toLowerCase())))
        .map(([name, v]) => ({ name, value: v.value, light: v.light, dark: v.dark }));
    if (terms.length && !found.length) {
        const near = suggest(terms.join('-'), Object.keys(t));
        throw new Error(`No token matches ${terms.map((term) => `\`${term}\``).join(' ')}.${near.length ? ` Closest: ${near.map((n) => `\`${n}\``).join(', ')}.` : ''} \`${brand().bin} brand --section color\` lists a section; \`${brand().bin} brand --token --ds-color-fg\` reads one token by its full name.`);
    }
    return found;
}
