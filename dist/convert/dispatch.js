import { convertCss } from './css.js';
import { convertCode, convertStylesheet, convertVue } from './file.js';
import { convertJsx, jsxSignature, parseScript, scriptLiterals } from './jsx.js';
import { convertMarkup, convertMarkupInto, markupSignature } from './markup.js';
import { StructureChanged, applyEdits, convertScript, cssSignature, plain } from './shared.js';
export const STYLE_FILE = /\.(css|pcss|postcss|scss|less)$/;
export const SCRIPT_FILE = /\.(tsx|jsx|ts|js|mjs|cjs|mts)$/;
export const TEMPLATE_FILE = /\.(erb|php|hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2)$/;
/** Every file type apply and check read. */
export const STYLED_FILE = /\.(vue|svelte|astro|html?|erb|php|hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2|tsx|jsx|ts|js|mjs|cjs|mts|css|pcss|postcss|scss|less)$/;
export function fileType(rel, angular = false) {
    if (rel.endsWith('.vue'))
        return 'vue';
    if (rel.endsWith('.svelte'))
        return 'svelte';
    if (rel.endsWith('.astro'))
        return 'astro';
    if (STYLE_FILE.test(rel))
        return 'css';
    if (/\.html?$/.test(rel))
        return angular && !/(^|\/)index\.html$/.test(rel) ? 'angular' : 'html';
    if (TEMPLATE_FILE.test(rel))
        return 'template';
    if (angular && /\.ts$/.test(rel))
        return 'angular-ts';
    if (SCRIPT_FILE.test(rel))
        return 'script';
    return undefined;
}
export function convertFile(rel, text, opts, angular = false) {
    switch (fileType(rel, angular)) {
        case 'vue':
            return convertVue(text, opts);
        case 'css':
            return convertStylesheet(text, opts);
        case 'svelte':
            return convertMarkup(text, opts, 'svelte');
        case 'astro':
            return convertMarkup(text, opts, 'astro');
        case 'angular':
            return convertMarkup(text, opts, 'angular');
        case 'html':
            return convertMarkup(text, opts, 'html');
        case 'template':
            return convertMarkup(text, opts, 'template');
        case 'angular-ts':
            return convertAngularTs(text, opts, rel);
        case 'script':
            // JSX that does not parse is left alone (a scan could not tell markup from strings); plain scripts are scanned.
            if (!parseScript(text, rel)) {
                if (/\.(tsx|jsx)$/.test(rel))
                    throw new Error('it does not parse');
                return convertCode(text, opts, rel);
            }
            return convertJsx(text, opts, rel);
        default:
            return { text, changes: [] };
    }
}
/** An Angular component's inline template and styles (template: `...`, styles: [`...`]). */
function inlineParts(text, rel) {
    const ast = parseScript(text, rel);
    if (!ast)
        return [];
    const out = [];
    const visit = (n) => {
        if (!n || typeof n !== 'object')
            return;
        if (Array.isArray(n))
            return n.forEach(visit);
        if (n.type === 'ObjectProperty' && (n.key?.name === 'template' || n.key?.name === 'styles')) {
            const values = n.value?.type === 'ArrayExpression' ? n.value.elements : [n.value];
            for (const v of values) {
                if (v?.type === 'TemplateLiteral' && !v.expressions.length)
                    out.push({ start: v.start + 1, end: v.end - 1, kind: n.key.name === 'template' ? 'template' : 'style' });
                else if (v?.type === 'StringLiteral' && n.key.name === 'styles')
                    out.push({ start: v.start + 1, end: v.end - 1, kind: 'style' });
            }
        }
        for (const k of Object.keys(n))
            if (k !== 'loc' && n[k] && typeof n[k] === 'object')
                visit(n[k]);
    };
    visit(ast);
    return out;
}
function convertAngularTs(text, opts, rel) {
    const parts = inlineParts(text, rel);
    if (!parts.length)
        return parseScript(text, rel) ? convertJsx(text, opts, rel) : convertCode(text, opts, rel);
    const changes = [];
    const edits = [];
    for (const p of parts) {
        const content = text.slice(p.start, p.end);
        if (p.kind === 'template')
            convertMarkupInto(content, opts, 'angular', edits, changes, p.start);
        else if (opts.general) {
            const next = convertCss(content, { changes, merge: opts.merge && !plain(opts) });
            if (next !== content)
                edits.push({ start: p.start, end: p.end, text: next });
        }
    }
    convertScript(text, 0, text, opts, edits, changes, { lits: scriptLiterals(text, rel), skip: (l) => parts.some((p) => l.start >= p.start && l.end <= p.end) });
    const out = applyEdits(text, edits);
    if (out !== text && angularSignature(text, rel) !== angularSignature(out, rel))
        throw new StructureChanged('the restyle would change more than style values');
    return { text: out, changes };
}
function angularSignature(text, rel) {
    const parts = inlineParts(text, rel);
    const inner = parts.map((p) => (p.kind === 'template' ? markupSignature(text.slice(p.start, p.end), 'angular') : cssSignature(text.slice(p.start, p.end))));
    return `${jsxSignature(text, rel)}\n${inner.join('\n')}`;
}
