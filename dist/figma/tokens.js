import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { brand, packageRoot } from '../lib/brand.js';
/** The token file as tables, one per theme: the :root block first, then each [data-theme] block over it. */
export function themeTables() {
    const css = readFileSync(join(packageRoot, 'brand', 'tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const block = (start) => css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
    const decls = (body) => Object.fromEntries([...body.matchAll(/(--ds-[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
    const root = decls(block(css.indexOf(':root')));
    const modes = ['Default'];
    const tables = [root];
    for (const m of css.matchAll(/\[data-theme="([\w-]+)"\]\s*\{/g)) {
        const over = decls(block(m.index));
        // A theme block that repeats the default changes nothing: it is the same mode, and names it.
        if (Object.entries(over).every(([k, v]) => root[k] === v)) {
            modes[0] = m[1][0].toUpperCase() + m[1].slice(1);
            continue;
        }
        modes.push(m[1][0].toUpperCase() + m[1].slice(1));
        tables.push({ ...root, ...over });
    }
    return { modes, tables };
}
export function parseColor(v) {
    const s = v.trim();
    if (s === 'transparent')
        return [0, 0, 0, 0];
    // A color faded toward transparent (the scrim): the color at that share of its alpha.
    const mix = /^color-mix\(in srgb,\s*(#[0-9a-f]{3,8})\s+([\d.]+)%,\s*transparent\)$/i.exec(s);
    if (mix) {
        const c = parseColor(mix[1]);
        return c ? [c[0], c[1], c[2], round(c[3] * (Number(mix[2]) / 100))] : null;
    }
    const hex = /^#([0-9a-f]{3,8})$/i.exec(s);
    if (hex) {
        let h = hex[1];
        if (h.length <= 4)
            h = [...h].map((c) => c + c).join('');
        const n = (i) => Number.parseInt(h.slice(i, i + 2), 16) / 255;
        return [n(0), n(2), n(4), h.length === 8 ? n(6) : 1];
    }
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[/,]\s*([\d.]+%?))?\s*\)$/.exec(s);
    if (rgb) {
        const a = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? Number.parseFloat(rgb[4]) / 100 : Number(rgb[4]);
        return [Number(rgb[1]) / 255, Number(rgb[2]) / 255, Number(rgb[3]) / 255, a];
    }
    return null;
}
const round = (n, d = 4) => Math.round(n * 10 ** d) / 10 ** d;
export function resolveVar(v, table, depth = 0) {
    if (depth > 8)
        return v;
    return v.replace(/var\((--[\w-]+)(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (_, name, fallback) => {
        const hit = table[name];
        return hit !== undefined ? resolveVar(hit, table, depth + 1) : (fallback ?? '').trim();
    });
}
function colorScopes(name) {
    if (/^color-(surface|bg|card|ground)/.test(name))
        return ['FRAME_FILL', 'SHAPE_FILL'];
    if (/^color-(fg|text)/.test(name))
        return ['TEXT_FILL'];
    if (/^color-(edge|border|ring|focus)/.test(name))
        return ['STROKE_COLOR', 'EFFECT_COLOR'];
    return ['ALL_FILLS', 'STROKE_COLOR'];
}
function lengthScopes(name) {
    if (/^(space|asset-margin|asset-card-padding|asset-search-inset)/.test(name))
        return ['GAP', 'WIDTH_HEIGHT'];
    if (/radius/.test(name))
        return ['CORNER_RADIUS'];
    if (/^(layout|page|asset-(button|search)-height|asset-lockup)/.test(name))
        return ['WIDTH_HEIGHT'];
    if (/^(text|asset-text|asset-ascii-size)/.test(name) && !/leading$/.test(name))
        return ['FONT_SIZE'];
    return [];
}
/** The token file as Figma variables. */
export function figmaTokens() {
    const { modes, tables } = themeTables();
    const names = Object.keys(tables[0]);
    const variables = [];
    const skipped = [];
    for (const css of names) {
        const name = css.replace(/^--ds-/, '');
        const group = name.split('-')[0];
        const raw = tables.map((tb) => resolveVar(tb[css] ?? '', tb).trim());
        const figmaName = `${group}/${name.slice(group.length + 1) || group}`;
        const colors = raw.map(parseColor);
        if (colors.every(Boolean)) {
            variables.push({ name: figmaName, css, type: 'COLOR', scopes: colorScopes(name), values: colors.map((c) => c.map((n) => round(n))) });
            continue;
        }
        const lengths = raw.map((v) => { const m = /^(-?[\d.]+)px$/.exec(v); return m ? round(Number(m[1])) : null; });
        if (lengths.every((n) => n !== null)) {
            variables.push({ name: figmaName, css, type: 'FLOAT', scopes: lengthScopes(name), unit: 'px', values: lengths });
            continue;
        }
        const unit = /^-?[\d.]+(ms|s|em|%)?$/;
        if (raw.every((v) => unit.test(v))) {
            const u = unit.exec(raw[0])[1] ?? '';
            // Unitless line heights, shares and durations have no Figma unit to bind to: kept, hidden from pickers.
            variables.push({ name: figmaName, css, type: 'FLOAT', scopes: !u && name.startsWith('font-weight') ? ['FONT_WEIGHT'] : [], unit: u || 'number', values: raw.map((v) => Number.parseFloat(v)) });
            continue;
        }
        if (group === 'font') {
            const fam = raw.map((v) => /"([^"]+)"/.exec(v)?.[1] ?? v.split(',')[0].trim());
            variables.push({ name: figmaName, css, type: 'STRING', scopes: ['FONT_FAMILY'], values: fam });
            continue;
        }
        if (group === 'ease' || group === 'easing') {
            variables.push({ name: figmaName, css, type: 'STRING', scopes: [], values: raw });
            continue;
        }
        skipped.push({ css, value: raw[0], reason: 'no Figma variable type (a relative, computed or compound value)' });
    }
    return { collection: `${brand().name} tokens`, modes, variables, skipped };
}
const SCRIPT_LIMIT = 45000;
/**
 * use_figma scripts that apply the variables. Each is complete and safe to rerun: it finds or creates the collection
 * and modes, then creates or updates its share of the variables by name. Split so each stays under the tool's limit.
 */
export function figmaTokenScripts(doc) {
    // Rows are compact, since an agent sends every character as the script: [name, type, scope set, value or one value
    // per mode when the modes differ, CSS name when it is not --ds- plus the name]. Colors are hex.
    const scopeSets = [...new Set(doc.variables.map((v) => JSON.stringify(v.scopes)))];
    const head = (rows) => `// Applies ${rows.length} brand variables to this file. Generated by figma tokens; safe to rerun.
const NAME = ${JSON.stringify(doc.collection)};
const MODES = ${JSON.stringify(doc.modes)};
const SCOPES = [${scopeSets.join(',')}];
const TYPES = ['COLOR', 'FLOAT', 'STRING'];
const ROWS = ${JSON.stringify(rows)};
const all = await figma.variables.getLocalVariableCollectionsAsync();
let layout = 'modes';
const targets = [];
let main = all.find((c) => c.name === NAME);
if (!main) { main = figma.variables.createVariableCollection(NAME); main.renameMode(main.modes[0].modeId, MODES[0]); }
const modeIds = [main.modes[0].modeId];
for (const m of MODES.slice(1)) {
  const have = main.modes.find((x) => x.name === m);
  if (have) { modeIds.push(have.modeId); continue; }
  try { modeIds.push(main.addMode(m)); } catch (e) { layout = 'collections'; break; }
}
if (layout === 'modes') targets.push(...MODES.map((m, i) => ({ c: main, mode: modeIds[i], i })));
else {
  // One mode per collection on this plan: the default values stay in the main collection, each theme gets its own.
  targets.push({ c: main, mode: main.modes[0].modeId, i: 0 });
  for (const [i, m] of MODES.entries()) {
    if (!i) continue;
    let c = all.find((x) => x.name === NAME + ' / ' + m);
    if (!c) { c = figma.variables.createVariableCollection(NAME + ' / ' + m); c.renameMode(c.modes[0].modeId, m); }
    targets.push({ c, mode: c.modes[0].modeId, i });
  }
}
const existing = await figma.variables.getLocalVariablesAsync();
const byKey = new Map(existing.map((v) => [v.variableCollectionId + '|' + v.name, v]));
const hex = (h) => { const n = (i) => parseInt(h.slice(i, i + 2), 16) / 255; return { r: n(1), g: n(3), b: n(5), a: h.length > 7 ? n(7) : 1 }; };
const value = (type, v) => type === 'COLOR' ? hex(v) : v;
let created = 0, updated = 0;
const ids = [];
for (const [name, t, s, val, cssName] of ROWS) {
  const type = TYPES[t];
  const vals = Array.isArray(val) ? val : MODES.map(() => val);
  const css = cssName || '--ds-' + name.replace('/', '-');
  for (const tg of targets) {
    if (layout === 'modes' && tg.i > 0) continue;
    let v = byKey.get(tg.c.id + '|' + name);
    if (v && v.resolvedType !== type) { v.remove(); v = undefined; }
    if (!v) { v = figma.variables.createVariable(name, tg.c, type); byKey.set(tg.c.id + '|' + name, v); created++; } else updated++;
    v.scopes = SCOPES[s];
    v.setVariableCodeSyntax('WEB', 'var(' + css + ')');
    if (layout === 'modes') targets.forEach((m) => v.setValueForMode(m.mode, value(type, vals[m.i])));
    else v.setValueForMode(tg.mode, value(type, vals[tg.i]));
    ids.push(v.id);
  }
}
return { layout, collections: targets.map((t) => ({ id: t.c.id, name: t.c.name })).filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i), created, updated, variables: ids.length, createdNodeIds: [], mutatedNodeIds: [] };
`;
    const hexOf = (c) => `#${c.slice(0, 3).map((n) => Math.round(n * 255).toString(16).padStart(2, '0')).join('')}${c[3] < 1 ? Math.round(c[3] * 255).toString(16).padStart(2, '0') : ''}`;
    const rows = doc.variables.map((v) => {
        const vals = v.type === 'COLOR' ? v.values.map((c) => hexOf(c)) : v.values;
        const one = vals.every((x) => JSON.stringify(x) === JSON.stringify(vals[0]));
        const derived = `--ds-${v.name.replace('/', '-')}`;
        const row = [v.name, ['COLOR', 'FLOAT', 'STRING'].indexOf(v.type), scopeSets.indexOf(JSON.stringify(v.scopes)), one ? vals[0] : vals];
        if (derived !== v.css)
            row.push(v.css);
        return row;
    });
    const scripts = [];
    let batch = [];
    for (const row of rows) {
        batch.push(row);
        if (head(batch).length > SCRIPT_LIMIT - 4000) {
            scripts.push(head(batch));
            batch = [];
        }
    }
    if (batch.length || !scripts.length)
        scripts.push(head(batch));
    return scripts;
}
