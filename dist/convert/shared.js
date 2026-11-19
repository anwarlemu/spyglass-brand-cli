import { convertClassList, groupOf, parseClass } from './classes.js';
import { classify, parseColor, roleFor, roleHex } from './color.js';
import { convertCss } from './css.js';
import { hasColor, kindOfElement, kinds, paintsDark, restyle, restyleSemantic } from './kinds.js';
/** The class a selection puts on what it restyled (brand/base-scoped in build/brand-scoped.css). */
export const MARK = 'ds-scope';
export const allowed = (opts, kind) => !!kind && (opts.kinds === 'all' || opts.kinds.has(kind));
export const plain = (opts) => opts.css === 'plain';
const CLASS_LIST = /^\s*(?:[!-]?[\w:[\]()./%#,&>*=@'-]+)(?:\s+[!-]?[\w:[\]()./%#,&>*=@'-]+)*\s*$/;
export const looksLikeClasses = (value, single = false) => {
    if (!CLASS_LIST.test(value) || !value.trim())
        return false;
    const tokens = value.trim().split(/\s+/);
    if (!single && tokens.length < 2)
        return false;
    return tokens.some((t) => groupOf(t) !== 'other') && tokens.every((t) => /^[!-]?[a-z[@]/.test(parseClass(t).utility.replace(/^!/, '')) || /^[a-z-]+:/.test(t));
};
export const hasLook = (value) => value.trim().split(/\s+/).some((t) => groupOf(t) !== 'other');
/** String literals in code, with offsets: comments skipped, template literals with ${} left alone. */
export function literals(code, base = 0) {
    const out = [];
    for (let i = 0; i < code.length; i++) {
        const c = code[i];
        if (c === '/' && code[i + 1] === '/') {
            const nl = code.indexOf('\n', i);
            i = nl < 0 ? code.length : nl;
            continue;
        }
        if (c === '/' && code[i + 1] === '*') {
            const close = code.indexOf('*/', i + 2);
            i = close < 0 ? code.length : close + 1;
            continue;
        }
        if (c === "'" || c === '"' || c === '`') {
            let j = i + 1;
            let dynamic = false;
            while (j < code.length && code[j] !== c) {
                if (code[j] === '\\')
                    j++;
                else if (c === '`' && code[j] === '$' && code[j + 1] === '{')
                    dynamic = true;
                else if (c !== '`' && code[j] === '\n')
                    break;
                j++;
            }
            if (!dynamic && code[j] === c)
                out.push({ start: base + i + 1, end: base + j, value: code.slice(i + 1, j), quote: c });
            i = j;
        }
    }
    return out;
}
/** The object key or prop name right before a literal (`destructive: '...'`, `color: '#fff'`). */
export const keyBefore = (text, at) => text.slice(Math.max(0, at - 80), at - 1).match(/(?:^|[\s{,(])['"]?([\w$-]+)['"]?\s*:\s*$/)?.[1];
// A module specifier (import ... from '...', export ... from '...', import('...')), not a value.
const inImport = (text, at) => /(^|\n)\s*import\b[^;\n=]*$|\bfrom\s*$|\bimport\s*\(\s*$|\brequire\s*\(\s*$/.test(text.slice(Math.max(0, at - 300), at - 1));
function colorLiteral(value, key) {
    const rgba = parseColor(value);
    if (!rgba || rgba[3] < 0.995)
        return undefined;
    const use = key && /(^|-)(color|text|fg|foreground|fill|stroke|ink|label|font)/i.test(key) ? 'text' : key && /(border|line|grid|edge|rule|outline)/i.test(key) ? 'border' : 'bg';
    const hex = roleHex(roleFor(classify(rgba), use));
    if (!hex || hex.toLowerCase() === value.trim().toLowerCase())
        return undefined;
    return /^#[0-9a-f]+$/.test(value.trim()) ? hex.toLowerCase() : hex;
}
/** Class and color strings in a script: converted, and in an app component of a kind, given that kind's look. */
export function convertScript(code, base, full, opts, edits, changes, so = {}) {
    for (const lit of so.lits ?? literals(code, base)) {
        if (so.skip?.(lit) || inImport(full, lit.start))
            continue;
        const key = keyBefore(full, lit.start);
        let next = lit.value;
        // One class is a class list too where an object key names a variant or size (icon: 'size-8').
        const keyed = !!opts.componentKind && !!key && /^(xs|sm|md|lg|xl|2xl|small|medium|large|default|icon(-\w+)?)$/i.test(key);
        if (!plain(opts) && (looksLikeClasses(lit.value) || (keyed && looksLikeClasses(lit.value, true)))) {
            const ctx = { merge: opts.merge, changes };
            if (opts.general)
                next = convertClassList(next, ctx);
            if (opts.componentKind && allowed(opts, opts.componentKind) && hasLook(lit.value) && !(opts.componentKind === 'button' && key === 'link')) {
                const tokens = lit.value.split(/\s+/).filter(Boolean);
                // A size string (sm: 'px-3 py-1.5 text-sm') takes only the size part of the look.
                const sizeOnly = (!!key && /^(xs|sm|md|lg|xl|2xl|small|medium|large|icon(-\w+)?)$/i.test(key)) || tokens.every((t) => ['padding', 'height', 'type', 'radius', 'other'].includes(groupOf(t)));
                const variantKey = !!key && Object.values(kinds()[opts.componentKind]?.keys ?? {}).some((keys) => keys.includes(key.toLowerCase()));
                // A string with colors and a shape (padding, height, radius) is a whole look in one place: it takes base and variant.
                const complete = hasColor(tokens) && !variantKey && tokens.some((t) => ['padding', 'height', 'radius'].includes(groupOf(t)));
                next = restyle(next, { kind: opts.componentKind }, { merge: opts.merge, key, variant: complete ? 'both' : hasColor(tokens) ? 'variant' : sizeOnly ? 'size' : variantKey ? 'variant' : 'base', tokensForVariant: tokens, changes });
            }
        }
        else if (opts.general && !so.classesOnly && /^\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))\s*$/.test(lit.value)) {
            const c = colorLiteral(lit.value, key);
            if (c) {
                changes.push({ from: lit.value, to: c });
                next = c;
            }
        }
        if (next !== lit.value)
            edits.push({ start: lit.start, end: lit.end, text: next });
    }
}
export function applyEdits(text, edits) {
    let out = text;
    let last = Number.POSITIVE_INFINITY;
    for (const e of [...edits].sort((a, b) => b.start - a.start || b.end - a.end)) {
        if (e.end > last)
            continue;
        out = out.slice(0, e.start) + e.text + out.slice(e.end);
        last = e.start;
    }
    return out;
}
export const blankLiterals = (code, lits = literals(code)) => {
    let out = '';
    let last = 0;
    for (const l of lits) {
        if (l.start < last)
            continue;
        out += code.slice(last, l.start);
        last = l.end;
    }
    return out + code.slice(last);
};
export class StructureChanged extends Error {
}
export function mask(value, spans, offset = 0) {
    const codes = [];
    let out = '';
    let last = 0;
    for (const s of spans) {
        const a = s.start - offset;
        const b = s.end - offset;
        if (a < last)
            continue;
        out += value.slice(last, a);
        out += `\u0000${codes.length}\u0000`;
        codes.push(value.slice(a, b));
        last = b;
    }
    out += value.slice(last);
    const conditional = codes.some((c) => /^(<%-?\s*(if|unless|else|elsif|end|case|when|for|each)\b|\{%-?\s*(if|else|elif|endif|for|endfor|unless|endunless|case|when)\b|\{\{[#/^]|\{\{\s*else|\{[#:/]|@(if|else|elseif|endif|unless|isset|foreach|for|class)\b|<\?php\s+(if|else|endif|foreach))/.test(c)) || codes.some((c) => /\?.*:|&&|\|\|/.test(c) && /^\{[^{]/.test(c));
    return { value: out, codes, conditional, unmask: (s) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]) };
}
/** One element's classes and styles given the brand. Returns whether it paints a dark fill (its children sit on dark). */
export function convertElementInfo(text, el, opts, edits, changes, onDark) {
    const { tag, isRoot, attrs, staticClass, bindings } = el;
    const masked = staticClass?.masked;
    const staticValue = masked?.value ?? staticClass?.value ?? '';
    const staticTokens = staticValue.split(/\s+/).filter(Boolean).filter((t) => !t.includes('\u0000'));
    const classBinding = bindings.filter((b) => b.name === 'class');
    const dynLiterals = classBinding.flatMap((b) => b.lits ?? literals(b.code, b.start));
    const dynTokens = dynLiterals.flatMap((l) => l.value.split(/\s+/).filter(Boolean));
    const look = opts.look?.([...staticTokens, ...dynTokens], tag.toLowerCase()) ?? [];
    let hit = kindOfElement(tag, attrs, [...staticTokens, ...dynTokens, ...look]);
    if (isRoot && opts.componentKind && (!hit || hit.kind !== opts.componentKind) && /^[a-z]/.test(tag))
        hit = { kind: opts.componentKind };
    const restyled = hit && allowed(opts, hit.kind) ? hit : undefined;
    const ctx = { tag, merge: opts.merge, changes };
    const isPlain = plain(opts);
    const give = (value, variant, tokensForVariant) => isPlain ? restyleSemantic(value, restyled, { tag, changes, onDark, variant, look: [...tokensForVariant, ...look] }) : restyle(value, restyled, { tag, changes, onDark, merge: opts.merge, variant, tokensForVariant });
    // Bound class strings first: a string with colors takes the variant's look, one without takes the base.
    if (!isPlain) {
        for (const b of bindings) {
            for (const lit of b.lits ?? literals(b.code, b.start)) {
                if (!hasLook(lit.value) || !looksLikeClasses(lit.value, true))
                    continue;
                let next = opts.general ? convertClassList(lit.value, ctx) : lit.value;
                // Only a kind with variants splits its look across strings (base here, colors there); for the others a bound
                // string is a state the app toggles, and it keeps its own (converted) classes.
                // A component's root built with cn('...') has its whole look in that one string: it takes the base.
                const rootLook = isRoot && opts.componentKind === restyled?.kind && !staticClass;
                if (restyled && b.name === 'class' && !restyled.part && (rootLook || (kinds()[restyled.kind]?.variants && (hasColor(lit.value.split(/\s+/)) || !staticClass)))) {
                    const colored = hasColor(lit.value.split(/\s+/));
                    const mode = !kinds()[restyled.kind]?.variants ? 'both' : colored ? 'variant' : 'base';
                    next = restyle(next, restyled, { tag, changes, onDark, merge: opts.merge, variant: mode, tokensForVariant: lit.value.split(/\s+/).filter(Boolean) });
                }
                if (next !== lit.value)
                    edits.push({ start: lit.start, end: lit.end, text: next });
            }
        }
    }
    const dynColored = !isPlain && dynTokens.some((t) => ['bg', 'text-color', 'border-color'].includes(groupOf(t)));
    // In a selection, what it restyles carries ds-scope: the brand's type and defaults reach it and nothing around it.
    // Never a tag that draws nothing (a Svelte or Astro file's top-level <script> and <style> count as its roots).
    const mark = !!opts.mark && /^[a-zA-Z]/.test(tag) && !/^(template|slot|Teleport|Transition|TransitionGroup|KeepAlive|Suspense|Fragment|svelte:.*|ng-container|ng-template|script|style|link|meta|title|head|base|noscript)$/i.test(tag) && (restyled !== undefined || (isRoot && opts.general));
    // The mark always goes last, so a restyle that reorders the list leaves it where it was.
    const withMark = (list) => {
        if (!mark)
            return list;
        const tokens = list.split(/\s+/).filter(Boolean);
        if (tokens[tokens.length - 1] === MARK)
            return list;
        const rest = tokens.filter((t) => t !== MARK);
        return rest.length ? `${list.match(/^\s*/)?.[0] ?? ''}${[...rest, MARK].join(' ')}${list.match(/\s*$/)?.[0] ?? ''}` : MARK;
    };
    if (staticClass) {
        let next = opts.general && !isPlain ? convertClassList(staticValue, ctx) : staticValue;
        // Template code that decides which classes apply (`{% if active %}`): values convert one for one, nothing moves.
        if (restyled && !masked?.conditional)
            next = give(next, hasColor(staticTokens) || !dynColored ? 'both' : 'base', staticTokens);
        if (!masked?.conditional)
            next = withMark(next);
        if (masked)
            next = masked.unmask(next);
        if (next !== staticClass.value)
            edits.push({ start: staticClass.start, end: staticClass.end, text: next });
    }
    else if (el.insert) {
        // A bare element of a named kind gets the look as a class attribute; nothing else about it changes.
        const bare = restyled && /^[a-z]/.test(tag) && !tag.includes('-') && !classBinding.length;
        const lookText = withMark(bare ? give('', dynColored ? 'base' : 'both', []) : '');
        if (lookText.trim())
            edits.push({ start: el.insert.at, end: el.insert.at, text: ` ${el.insert.attr}="${lookText.trim()}"` });
    }
    // The band as it will look: its converted fill, so a second run reads the same band the first one wrote.
    const dark = paintsDark([...(opts.general && !isPlain && staticValue ? convertClassList(staticValue, { tag }).split(/\s+/).filter(Boolean) : staticTokens), ...look]);
    if (!opts.general)
        return dark;
    if (!isPlain) {
        for (const d of el.directives) {
            const next = convertClassList(d.value, ctx);
            if (next !== d.value && next.trim() && !/\s/.test(next.trim()))
                edits.push({ start: d.start, end: d.end, text: next.trim() });
        }
        for (const x of el.extraClasses) {
            if (!looksLikeClasses(x.value, true))
                continue;
            const next = convertClassList(x.value, ctx);
            if (next !== x.value)
                edits.push({ start: x.start, end: x.end, text: next });
        }
    }
    if (el.staticStyle) {
        const m = el.staticStyle.masked;
        let next = convertCss(m?.value ?? el.staticStyle.value, { changes, selector: tag }, true);
        if (m)
            next = m.unmask(next);
        if (next !== el.staticStyle.value)
            edits.push({ start: el.staticStyle.start, end: el.staticStyle.end, text: next });
    }
    for (const s of el.styleBindings) {
        for (const lit of s.lits ?? literals(s.code, s.start)) {
            if (!/^\s*(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()/.test(lit.value))
                continue;
            const key = keyBefore(text, lit.start);
            const rgba = parseColor(lit.value);
            if (!rgba)
                continue;
            const use = key && /background|bg/i.test(key) ? 'bg' : key && /border|outline/i.test(key) ? 'border' : 'text';
            const role = roleFor(classify(rgba), use);
            const to = `var(--ds-color-${role})`;
            changes.push({ from: lit.value, to });
            edits.push({ start: lit.start, end: lit.end, text: to });
        }
    }
    return dark;
}
/** A stylesheet's signature: its selectors and at-rules with every declaration blanked. */
export const cssSignature = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[^{};]*;/g, '').replace(/[^{}]*}/g, '}').replace(/\s+/g, ' ').trim();
