import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { elements } from '../convert/color.js';
import { brand, cli, registryHost } from '../lib/brand.js';
import { normalizeName, suggest } from '../lib/names.js';
import { readProject, stackLabel, unsupported } from '../library/project.js';
import { flavorsOf, readIndex, readItem, requiresOf } from '../library/registry.js';
import { exampleCss } from '../library/example-css.js';
import { aliasOf, appFlavor, elementsDir, placedFiles, reactPath, scriptLines, tagModules } from '../library/flavors.js';
import { readState } from '../lib/state.js';
// The library by name, for people and agents: resolve a name however it is typed, show how to use an item (rules,
// props, slots, events, examples, the exact source), search, describe the app's setup, and diff local copies.
/** An item's name from what was typed: `Button`, `alert-dialog`, `AlertDialog`, `badge` (shadcn's name for tag), `Input` (a file of field). */
export async function resolveName(typed, index) {
    const items = index ?? (await readIndex());
    const n = normalizeName(typed);
    const exact = items.find((i) => i.name === typed) ?? items.find((i) => normalizeName(i.name) === n);
    if (exact)
        return { name: exact.name };
    const alias = Object.entries(elements().aliases).find(([a]) => normalizeName(a) === n)?.[1];
    if (alias && items.some((i) => i.name === alias))
        return { name: alias, via: `${typed} is ${alias} here` };
    const owner = items.find((i) => i.files.some((f) => normalizeName(f.split('/').pop()) === n));
    if (owner)
        return { name: owner.name, via: `${typed} is part of ${owner.name}` };
    const options = suggest(typed, [...items.map((i) => i.name), ...Object.keys(elements().aliases)]);
    throw new Error(`Unknown item \`${typed}\`.${options.length ? ` Did you mean ${options.map((o) => `\`${o}\``).join(', ')}?` : ''} \`${cli()} search <words>\` finds items by what they do; \`${cli()} list\` lists all ${items.length}.`);
}
export async function resolveNames(names) {
    const index = await readIndex();
    const out = [];
    for (const n of names)
        out.push(await resolveName(n, index));
    return out;
}
// ---- Reading a component's API from its source. ----
/** The text between a balanced pair starting at `open` (an index of `<`, `{`, `(` or `[`). */
function balanced(text, open) {
    const pairs = { '<': '>', '{': '}', '(': ')', '[': ']' };
    const stack = [];
    for (let i = open; i < text.length; i++) {
        const c = text[i];
        if (c === "'" || c === '"' || c === '`') {
            const close = text.indexOf(c, i + 1);
            i = close < 0 ? text.length : close;
            continue;
        }
        if (pairs[c] && !(c === '<' && text[i - 1] === '='))
            stack.push(pairs[c]);
        else if (c === stack[stack.length - 1]) {
            stack.pop();
            if (!stack.length)
                return text.slice(open + 1, i);
        }
        else if (c === '>' && text[i - 1] === '=')
            continue;
    }
    return '';
}
/** Members of a type literal body, split at the top level. */
function members(body) {
    const out = [];
    let depth = 0;
    let cur = '';
    for (let i = 0; i < body.length; i++) {
        const c = body[i];
        if ('<{(['.includes(c))
            depth++;
        else if ('>})]'.includes(c) && !(c === '>' && body[i - 1] === '='))
            depth--;
        if (depth === 0 && (c === ',' || c === ';' || c === '\n')) {
            if (cur.trim())
                out.push(cur.trim());
            cur = '';
        }
        else
            cur += c;
    }
    if (cur.trim())
        out.push(cur.trim());
    return out.map((m) => m.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '').trim()).filter((m) => /^[\w$'"]+\??\s*:/.test(m));
}
/** A React component's API from its source: its props type (interface or type alias), children as its slot. */
export function reactApiOf(path, source) {
    const out = [];
    const exported = [...source.matchAll(/export\s+(?:default\s+)?(?:function|const)\s+([A-Z]\w*)/g)].map((m) => m[1]);
    for (const component of exported) {
        const api = { file: path, component, props: [], models: [], emits: [], slots: [] };
        const sig = source.match(new RegExp(`(?:function\\s+${component}\\s*(?:<[^>]*>)?\\s*\\(|const\\s+${component}\\s*=\\s*(?:React\\.)?(?:forwardRef\\s*(?:<[^>]*>)?\\s*\\()?\\s*\\()\\s*(\\{[\\s\\S]*?\\})?\\s*:\\s*([\\w.<>\\s,&|'"]+?)\\s*\\)`));
        const typeName = sig?.[2]?.trim();
        const defaults = {};
        if (sig?.[1])
            for (const m of members(balanced(sig[1], 0)).concat(sig[1].slice(1, -1).split(',').map((x) => x.trim()).filter((x) => /=/.test(x)))) {
                const d = m.match(/^\.{0,3}([\w$]+)\s*=\s*([\s\S]+)$/);
                if (d)
                    defaults[d[1]] = d[2].trim();
            }
        const own = typeName?.match(/^\w+/)?.[0];
        const declAt = own ? source.search(new RegExp(`(?:interface\\s+${own}\\b[^{]*|type\\s+${own}\\s*=[^{]*)\\{`)) : -1;
        if (declAt >= 0) {
            const body = balanced(source, source.indexOf('{', declAt));
            for (const m of members(body)) {
                const [, name, optional, type] = m.match(/^['"]?([\w$-]+)['"]?(\?)?\s*:\s*([\s\S]+)$/) ?? [];
                if (!name)
                    continue;
                if (name === 'children')
                    api.slots.push('children');
                else if (/^on[A-Z]/.test(name))
                    api.emits.push(`${name} (${type.replace(/\s+/g, ' ')})`);
                else
                    api.props.push({ name, type: type.replace(/\s+/g, ' '), required: !optional && !(name in defaults), default: defaults[name] });
            }
            const ext = source.slice(declAt, source.indexOf('{', declAt)).match(/extends\s+([^{]+)|=\s*([^{]+?)&\s*$/);
            if (ext)
                api.props.push({ name: '...', type: (ext[1] ?? ext[2]).trim(), required: false });
        }
        if (/\bchildren\b/.test(source) && !api.slots.includes('children'))
            api.slots.push('children');
        out.push(api);
    }
    return out;
}
/** A web component's API from its source (Lit): properties, the events it dispatches, its slots. */
export function elementApiOf(path, source, tag) {
    const api = { file: path, component: tag, props: [], models: [], emits: [], slots: [] };
    for (const m of source.matchAll(/@property\(\s*(\{[^)]*\})?\s*\)\s*(?:declare\s+|accessor\s+)?([\w$]+)(?:\??\s*:\s*([^=;\n]+))?(?:\s*=\s*([^;\n]+))?/g)) {
        const attr = m[1]?.match(/attribute\s*:\s*['"]([\w-]+)['"]/)?.[1];
        api.props.push({ name: attr && attr !== m[2] ? `${m[2]} (attribute ${attr})` : m[2], type: (m[3] ?? m[1]?.match(/type\s*:\s*(\w+)/)?.[1] ?? 'unknown').trim(), required: false, default: m[4]?.trim() });
    }
    const statics = source.match(/static\s+(?:override\s+)?properties\s*=\s*\{/);
    if (statics?.index !== undefined)
        for (const mm of members(balanced(source, source.indexOf('{', statics.index)))) {
            const [, name, conf] = mm.match(/^['"]?([\w$]+)['"]?\s*:\s*([\s\S]+)$/) ?? [];
            if (name && !api.props.some((p) => p.name === name))
                api.props.push({ name, type: conf?.match(/type\s*:\s*(\w+)/)?.[1] ?? 'unknown', required: false });
        }
    for (const m of source.matchAll(/new\s+(?:Custom)?Event\(\s*['"]([\w:-]+)['"]/g))
        if (!api.emits.includes(m[1]))
            api.emits.push(m[1]);
    for (const m of source.matchAll(/<slot\b([^>]*)>/g)) {
        const name = m[1].match(/\sname=["']([\w-]+)["']/)?.[1] ?? 'default';
        if (!api.slots.includes(name))
            api.slots.push(name);
    }
    return api;
}
/** A flavor's API as the registry gives it (props, events, slots), when it does. */
function givenApi(raw, file, component) {
    if (!raw || typeof raw !== 'object')
        return undefined;
    // The registry writes { components: [...] } (React) and { elements: [...] } (web components); older shapes are one entry or a list.
    const wrapped = raw;
    const list = Array.isArray(raw) ? raw : Array.isArray(wrapped.components) ? wrapped.components : Array.isArray(wrapped.elements) ? wrapped.elements : [raw];
    const names = (x) => (Array.isArray(x) ? x.map((e) => (typeof e === 'string' ? e : (e.name ?? '') || 'default')).filter(Boolean) : x && typeof x === 'object' ? Object.keys(x) : []);
    const entries = (x) => (Array.isArray(x) ? x : Object.entries(x ?? {}).map(([name, v]) => ({ name, ...(typeof v === 'object' ? v : { type: v }) })));
    return list.map((a) => ({
        file: a.file ?? a.module ?? file,
        component: a.tag ?? a.component ?? a.name ?? component,
        props: entries(a.props ?? a.properties ?? a.attributes).map((p) => ({ name: p.attribute && p.attribute !== p.name ? `${p.name} (attribute ${p.attribute})` : String(p.name), type: String(p.type ?? 'unknown'), required: !!p.required, default: p.default === undefined ? undefined : String(p.default) })),
        models: [],
        emits: names(a.events ?? a.emits),
        slots: names(a.slots ?? (a.children ? ['children'] : [])),
    }));
}
export async function view(root, names, opts = {}) {
    const project = (() => {
        try {
            const p = readProject(root);
            return p.framework === 'unknown' ? undefined : p;
        }
        catch {
            return undefined;
        }
    })();
    const flavor = appFlavor(project, opts.framework);
    const out = [];
    const seen = new Set();
    for (const r of await resolveNames(names)) {
        if (seen.has(r.name))
            continue;
        seen.add(r.name);
        const item = await readItem(r.name);
        const flavors = flavorsOf(item);
        // An item without the app's flavor yet shows its React source (every item has it), and says so.
        const shown = flavors.includes(flavor) ? flavor : 'react';
        const base = { name: item.name, title: item.title, group: brand().groups[item.group] ?? item.group, description: item.description, use_for: item.use_for, never: item.never, notes: item.body ?? '', flavors, requires: requiresOf(item, shown), via: r.via };
        const install = `npx ${cli()} add ${item.name}${shown !== (project ? appFlavor(project) : 'react') ? ` --framework ${shown}` : ''}`;
        if (shown === 'react') {
            const f = item.flavors?.react ?? { files: item.files, dependencies: item.dependencies, registryDependencies: item.requires, examples: item.examples };
            const comps = f.files.filter((x) => /\.(tsx|jsx)$/.test(x.path) && /components\//.test(x.path));
            const alias = project ? aliasOf(project) : '@/';
            // Callbacks are the component's events and children its slot, as reactApiOf reads them; className is everyone's.
            const api = (givenApi(f.api, comps[0]?.path ?? '', item.title.replace(/\s+/g, '')) ?? comps.flatMap((c) => reactApiOf(c.path, c.content))).map((a) => ({
                ...a,
                props: a.props.filter((p) => !/^on[A-Z]/.test(p.name) && p.name !== 'children' && p.name !== 'className'),
                emits: [...new Set([...a.emits, ...a.props.filter((p) => /^on[A-Z]/.test(p.name)).map((p) => `${p.name} (${p.type})`)])],
                slots: [...new Set([...a.slots, ...(a.props.some((p) => p.name === 'children') || /\bchildren\b/.test(comps.find((c) => c.path === a.file)?.content ?? '') ? ['children'] : [])])],
            }));
            const imports = comps.map((c) => {
                const named = [...c.content.matchAll(/export\s+(?:function|const)\s+([A-Z]\w*)/g)].map((m) => m[1]);
                const def = c.content.match(/export\s+default\s+(?:function\s+)?([A-Z]\w*)/)?.[1];
                const target = project ? reactPath(project, c) : c.path.replace(/^(registry\/)?react\//, 'src/');
                const spec = alias && project ? `${alias}${target.replace(project.srcDir === '.' ? '' : `${project.srcDir}/`, '')}` : `./${target}`;
                return `import ${def ?? `{ ${named.join(', ')} }`} from '${spec.replace(/\.(tsx|jsx)$/, '')}'`;
            });
            // Examples as they read in this app: the library's `@/react/...` imports through the app's alias.
            const examples = (f.examples ?? []).map((e) => ({ ...e, content: alias && project ? e.content.replace(/(['"])@\/react\//g, `$1${alias}`) : e.content }));
            out.push({ ...base, flavor: shown, install, imports, packages: f.dependencies, api, examples, files: f.files });
            continue;
        }
        if (shown === 'elements') {
            const f = item.flavors.elements;
            const src = f.files.find((x) => /\.(ts|js)$/.test(x.path) && !x.path.endsWith('.d.ts')) ?? f.files[0];
            const api = givenApi(f.api, src?.path ?? '', f.tag) ?? (src ? [elementApiOf(src.path, src.content, f.tag)] : []);
            const url = project ? elementsDir(project).url : `${brand().assetBase}/elements`;
            const loads = project ? scriptLines(project, [item]) : tagModules(item).map((m) => `<script type="module" src="${url}/${m.replace(/^\/?elements\//, '')}"></script>`);
            // On a page without Tailwind, the examples' layout classes would do nothing: each comes with the CSS they need.
            const plain = !!project && !project.tailwind;
            const examples = await Promise.all((f.examples ?? []).map(async (e) => {
                const css = plain ? await exampleCss(e.content) : '';
                return css ? { ...e, content: `${e.content.trimEnd()}\n<!-- The layout classes above are Tailwind's, which this app does not have: this is the CSS they need (brand tokens only; your own styles win over it). -->\n<style>\n${css}\n</style>\n` } : e;
            }));
            out.push({ ...base, flavor: shown, install, tag: f.tag, imports: [...loads, `<${f.tag}>...</${f.tag}>`], packages: [], api, examples, files: f.files });
            continue;
        }
    }
    return out;
}
const flavorName = (f) => (f === 'elements' ? 'web component' : 'React');
export function formatView(v, full) {
    const lines = [`${v.title} (${v.name}, ${v.group}, ${flavorName(v.flavor)})${v.via ? `  [${v.via}]` : ''}`, '', v.description, '', `Use for: ${v.use_for}`];
    if (v.never.length)
        lines.push('Never:', ...v.never.map((n) => `  - ${n}`));
    if (v.notes)
        lines.push('', v.notes);
    lines.push('', `Install: ${v.install}${v.requires.length ? `  (also adds ${v.requires.join(', ')})` : ''}${v.packages.length ? `; packages: ${v.packages.join(', ')}` : ''}`);
    lines.push(`Flavors: ${v.flavors.map(flavorName).join(', ')}`);
    if (v.flavor === 'elements')
        lines.push(`Load: ${v.imports.join('\n      ')}`);
    else
        lines.push(`Import: ${v.imports.join('\n        ')}`);
    for (const a of v.api) {
        lines.push('', `<${a.component}>  ${a.file}`);
        if (a.props.length)
            lines.push(`  ${v.flavor === 'elements' ? 'Properties' : 'Props'}:`, ...a.props.map((p) => `    ${p.name}${p.required ? '' : '?'}: ${p.type}${p.default ? `  (default ${p.default})` : ''}`));
        if (a.emits.length)
            lines.push(`  ${v.flavor === 'react' ? 'Callbacks' : 'Events'}: ${a.emits.join(', ')}`);
        if (a.slots.length)
            lines.push(`  ${v.flavor === 'react' ? 'Children' : 'Slots'}: ${a.slots.join(', ')}`);
    }
    lines.push('', `Examples (${v.examples.length}): ${v.examples.map((e) => e.name).join(', ')}`);
    const shown = full ? v.examples : v.examples.slice(0, 1);
    for (const e of shown)
        lines.push('', `--- example ${e.name} (${e.path})`, e.content.trimEnd());
    if (full)
        for (const f of v.files)
            lines.push('', `--- source ${f.path}`, f.content.trimEnd());
    else
        lines.push('', `Exact source and every example: ${cli()} view ${v.name} --source (or --json).`);
    return lines.join('\n');
}
export async function search(query) {
    const items = await readIndex();
    const words = query.join(' ').toLowerCase().split(/\s+/).filter(Boolean);
    const aliases = elements().aliases;
    const scored = items.map((i) => {
        const names = [i.name, i.title, ...Object.entries(aliases).filter(([, v]) => v === i.name).map(([a]) => a), ...i.files.map((f) => f.split('/').pop().replace(/\.(tsx|ts)$/, ''))].join(' ').toLowerCase();
        const text = `${i.description} ${i.use_for}`.toLowerCase();
        let score = 0;
        for (const w of words) {
            const n = normalizeName(w);
            if (normalizeName(i.name) === n)
                score += 10;
            else if (names.split(/\s+/).some((x) => normalizeName(x) === n))
                score += 6;
            else if (names.includes(w))
                score += 3;
            if (text.includes(w))
                score += 1 + (text.match(new RegExp(`\\b${w.replace(/[^\w]/g, '')}`, 'g'))?.length ?? 0) * 0.2;
        }
        return { name: i.name, title: i.title, group: brand().groups[i.group] ?? i.group, description: i.description, flavors: flavorsOf(i), score };
    });
    return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 12);
}
/** The library items this app has, in the flavor each came in, with the source files it changed. */
export async function installedItems(project, index) {
    index ??= await readIndex();
    const root = project.root;
    const installed = [];
    for (const entry of index) {
        for (const f of ['react', 'elements']) {
            if (!flavorsOf(entry).includes(f))
                continue;
            let item;
            try {
                item = await readItem(entry.name);
            }
            catch {
                continue;
            }
            let placed;
            try {
                placed = f === 'elements' ? [] : await placedFiles(project, [item], f);
            }
            catch {
                continue;
            }
            if (f === 'elements') {
                const mods = item.flavors?.elements?.modules ?? [];
                if (mods.length && mods.every((m) => existsSync(join(root, elementsDir(project).dir, m.replace(/^\/?elements\//, '')))))
                    installed.push({ name: entry.name, flavor: f, modified: [] });
                continue;
            }
            if (!placed.length || !placed.every((p) => existsSync(join(root, p.path))))
                continue;
            installed.push({ name: entry.name, flavor: f, modified: placed.filter((p) => readFileSync(join(root, p.path), 'utf8') !== p.content).map((p) => p.path) });
        }
    }
    return installed;
}
export async function info(root) {
    const project = readProject(root);
    const problem = unsupported(project);
    const index = await readIndex();
    const flavor = appFlavor(project);
    const installed = await installedItems(project, index);
    const stylesheet = project.css && existsSync(join(root, project.css)) ? readFileSync(join(root, project.css), 'utf8') : '';
    const linked = project.layouts.some((l) => readFileSync(join(root, l), 'utf8').includes(`${brand().assetBase}/brand.css`));
    const entry = project.cssEntry && existsSync(join(root, project.cssEntry)) ? readFileSync(join(root, project.cssEntry), 'utf8') : '';
    const theme = stylesheet.includes(`./${brand().bin}/brand.css`) || linked || entry.includes(`/${brand().bin}/brand.css`);
    const state = readState(root);
    const next = [];
    if (problem)
        next.push(problem);
    else {
        if (!theme)
            next.push(`npx ${cli()} init   (stylesheet${project.tailwind ? ', theme' : ''}, fonts, agent contract)`);
        if (!state)
            next.push(`npx ${cli()} apply --dry-run   (see what restyling the whole app would change), then npx ${cli()} apply`);
        next.push(`npx ${cli()} add <item>   (${flavorName(flavor)}; for example: ${['button', 'card', 'search-bar'].filter((n) => index.some((i) => i.name === n)).join(', ')}; npx ${cli()} search <words> finds one)`);
        next.push(`npx ${cli()} view <item>   (${flavor === 'elements' ? 'properties, events, slots' : 'props, callbacks, children'}, examples, source)`);
        if (installed.length)
            next.push(`npx ${cli()} add --update   (every installed item to this version: prebuilt modules replaced, files you changed kept unless --overwrite)`);
        next.push(`npx ${cli()} check`);
    }
    return {
        root,
        framework: project.framework,
        stack: stackLabel(project.framework),
        flavor,
        srcDir: project.srcDir,
        publicDir: project.publicDir,
        alias: aliasOf(project) ?? null,
        packageManager: project.node ? project.packageManager : null,
        installRoot: project.installRoot,
        tailwind: project.tailwind ?? null,
        stylesheet: project.css ?? null,
        layouts: project.layouts,
        theme,
        supported: !problem,
        problem: problem ?? null,
        library: `${brand().name} (${index.length} items, registry ${registryHost()}/r)`,
        installed,
        scope: state ? (state.whole ? 'whole app' : state.parts.map((p) => p.targets.join(', ')).join('; ')) : null,
        next,
    };
}
export function formatInfo(i) {
    return [
        `${i.stack} app at ${i.root} (library flavor: ${flavorName(i.flavor)})`,
        `  Source: ${i.srcDir}/  Static: ${i.publicDir}/  Alias: ${i.alias ?? 'none (imports are made relative)'}  Packages: ${i.packageManager ?? 'none (no package.json)'}${i.installRoot !== i.root ? ` (workspace at ${i.installRoot})` : ''}  Tailwind: ${i.tailwind ?? 'none (plain CSS)'}`,
        `  Stylesheet: ${i.stylesheet ?? '(none found)'}${i.layouts.length ? `  Layouts: ${i.layouts.slice(0, 4).join(', ')}${i.layouts.length > 4 ? ', ...' : ''}` : ''}  Brand stylesheet: ${i.theme ? 'installed' : 'not installed'}`,
        `  Library: ${i.library}`,
        `  Installed: ${i.installed.length ? i.installed.map((x) => `${x.name}${x.flavor !== i.flavor ? ` (${flavorName(x.flavor)})` : ''}${x.modified.length ? ' (changed locally)' : ''}`).join(', ') : 'none'}`,
        `  Applied: ${i.scope ?? 'not yet'}`,
        '',
        'Next:',
        ...i.next.map((n) => `  ${n}`),
    ].join('\n');
}
/** A unified diff of two texts, with three lines of context. */
export function unifiedDiff(a, b, fromName, toName) {
    const x = a.split('\n');
    const y = b.split('\n');
    const n = x.length;
    const m = y.length;
    const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
    for (let i = n - 1; i >= 0; i--)
        for (let j = m - 1; j >= 0; j--)
            lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    const ops = [];
    let i = 0;
    let j = 0;
    while (i < n || j < m) {
        if (i < n && j < m && x[i] === y[j])
            ops.push({ t: ' ', line: x[i], i: i++, j: j++ });
        else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j]))
            ops.push({ t: '+', line: y[j], i, j: j++ });
        else
            ops.push({ t: '-', line: x[i], i: i++, j });
    }
    if (!ops.some((o) => o.t !== ' '))
        return '';
    const out = [`--- ${fromName}`, `+++ ${toName}`];
    for (let k = 0; k < ops.length;) {
        if (ops[k].t === ' ') {
            k++;
            continue;
        }
        const start = Math.max(0, k - 3);
        let end = k;
        while (end < ops.length) {
            if (ops[end].t !== ' ')
                end++;
            else {
                let run = end;
                while (run < ops.length && ops[run].t === ' ')
                    run++;
                if (run - end > 6 || run === ops.length)
                    break;
                end = run;
            }
        }
        const stop = Math.min(ops.length, end + 3);
        const hunk = ops.slice(start, stop);
        out.push(`@@ -${hunk[0].i + 1},${hunk.filter((o) => o.t !== '+').length} +${hunk[0].j + 1},${hunk.filter((o) => o.t !== '-').length} @@`, ...hunk.map((o) => `${o.t}${o.line}`));
        k = stop;
    }
    return out.join('\n');
}
export async function diff(root, names, opts = {}) {
    const project = readProject(root);
    const flavor = appFlavor(project, opts.framework);
    const out = [];
    for (const r of await resolveNames(names)) {
        const item = await readItem(r.name);
        const placed = flavorsOf(item).includes(flavor) ? await placedFiles(project, [item], flavor) : [];
        out.push({
            name: item.name,
            flavor,
            files: placed.map((p) => {
                if (!existsSync(join(root, p.path)))
                    return { path: p.path, status: 'missing', diff: '' };
                const have = readFileSync(join(root, p.path), 'utf8');
                return have === p.content ? { path: p.path, status: 'same', diff: '' } : { path: p.path, status: 'changed', diff: unifiedDiff(have, p.content, `${p.path} (yours)`, `${p.path} (library)`) };
            }),
        });
    }
    return out;
}
