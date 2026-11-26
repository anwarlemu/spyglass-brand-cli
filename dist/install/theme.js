import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
// The theme for a selection or a plain add. Where the brand's theme sets a key Tailwind or the app already has
// (font-sans, font-mono, tracking-tight, ease-out), the key points at a scoped variable: the app's own value on its
// pages, the brand's inside the library's components ([data-ds]) and what a selection restyled (.ds-scope). The
// utilities are inline, so each element reads the variable where it sits.
export const SCOPE = ':where([data-ds], .ds-scope)';
/** The `--name: value` declarations of a stylesheet's @theme blocks. */
export function themeDeclarations(css) {
    const out = new Map();
    const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of text.matchAll(/@theme\b[^{;]*\{/g)) {
        let depth = 1;
        let body = '';
        for (let i = (m.index ?? 0) + m[0].length; i < text.length && depth; i++) {
            if (text[i] === '{')
                depth++;
            else if (text[i] === '}')
                depth--;
            else if (depth === 1)
                body += text[i];
        }
        for (const d of body.matchAll(/(--[\w.\\-]+)\s*:\s*([^;]+);/g))
            out.set(d[1], d[2].replace(/\s+/g, ' ').trim());
    }
    return out;
}
/** Tailwind's default theme, from the app's own copy of tailwindcss. */
export function tailwindDefaults(root) {
    try {
        return themeDeclarations(readFileSync(createRequire(join(root, 'package.json')).resolve('tailwindcss/theme.css'), 'utf8'));
    }
    catch {
        return new Map();
    }
}
/** Utilities Tailwind 4 builds without a theme key, which a brand key of the same name would take over. */
const BUILT_IN = { '--radius-full': 'calc(infinity * 1px)' };
export function scopeTheme(theme, appTheme, defaults) {
    const scoped = [];
    const app = [];
    const lib = [];
    const name = (key) => `--ds-scope-${key.slice(2).replace(/[^\w-]/g, '-')}`;
    const out = theme.replace(/@theme inline\s*\{([^{}]*)\}/, (block) => block.replace(/^(\s*)(--[\w.\\-]+)\s*:\s*([^;]+);/gm, (line, pad, key, value) => {
        const own = appTheme.get(key) ?? defaults.get(key) ?? BUILT_IN[key];
        if (own === undefined || own.trim() === value.trim())
            return line;
        scoped.push(key);
        app.push(`  ${name(key)}: ${own};`);
        lib.push(`  ${name(key)}: ${value.trim()};`);
        return `${pad}${key}: var(${name(key)});`;
    }));
    if (!scoped.length)
        return { theme: out, scoped };
    const css = `\n/* Theme keys Tailwind or the app has too: its own value on its pages, the brand's inside the library's components\n   and what a selection restyled. A whole-app apply gives every page the brand's. */\n:root {\n${app.join('\n')}\n}\n\n${SCOPE} {\n${lib.join('\n')}\n}\n`;
    return { theme: `${out.trimEnd()}\n${css}`, scoped };
}
