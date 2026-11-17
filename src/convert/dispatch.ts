import type { Change } from './classes.js';
import { convertCss } from './css.js';
import { convertCode, convertStylesheet, convertVue } from './file.js';
import { convertJsx, jsxSignature, parseScript, scriptLiterals } from './jsx.js';
import { type Dialect, convertMarkup, convertMarkupInto, markupSignature } from './markup.js';
import { type Edit, type FileOptions, type FileResult, StructureChanged, applyEdits, convertScript, cssSignature, plain } from './shared.js';

// Which restyle a file takes, by its type: Vue, JSX and scripts, stylesheets, Svelte, Astro, Angular templates and
// components, plain HTML and server templates.

export type FileType = 'vue' | 'script' | 'css' | 'svelte' | 'astro' | 'angular' | 'angular-ts' | 'html' | 'template';

export const STYLE_FILE = /\.(css|pcss|postcss|scss|less)$/;
export const SCRIPT_FILE = /\.(tsx|jsx|ts|js|mjs|cjs|mts)$/;
export const TEMPLATE_FILE = /\.(erb|php|hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2)$/;
/** Every file type apply and check read. */
export const STYLED_FILE = /\.(vue|svelte|astro|html?|erb|php|hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2|tsx|jsx|ts|js|mjs|cjs|mts|css|pcss|postcss|scss|less)$/;

export function fileType(rel: string, angular = false): FileType | undefined {
	if (rel.endsWith('.vue')) return 'vue';
	if (rel.endsWith('.svelte')) return 'svelte';
	if (rel.endsWith('.astro')) return 'astro';
	if (STYLE_FILE.test(rel)) return 'css';
	if (/\.html?$/.test(rel)) return angular && !/(^|\/)index\.html$/.test(rel) ? 'angular' : 'html';
	if (TEMPLATE_FILE.test(rel)) return 'template';
	if (angular && /\.ts$/.test(rel)) return 'angular-ts';
	if (SCRIPT_FILE.test(rel)) return 'script';
	return undefined;
}

export function convertFile(rel: string, text: string, opts: FileOptions, angular = false): FileResult {
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
				if (/\.(tsx|jsx)$/.test(rel)) throw new Error('it does not parse');
				return convertCode(text, opts, rel);
			}
			return convertJsx(text, opts, rel);
		default:
			return { text, changes: [] };
	}
}

type Span = { start: number; end: number; kind: 'template' | 'style' };

/** An Angular component's inline template and styles (template: `...`, styles: [`...`]). */
function inlineParts(text: string, rel: string): Span[] {
	const ast = parseScript(text, rel);
	if (!ast) return [];
	const out: Span[] = [];
	const visit = (n: any) => {
		if (!n || typeof n !== 'object') return;
		if (Array.isArray(n)) return n.forEach(visit);
		if (n.type === 'ObjectProperty' && (n.key?.name === 'template' || n.key?.name === 'styles')) {
			const values = n.value?.type === 'ArrayExpression' ? n.value.elements : [n.value];
			for (const v of values) {
				if (v?.type === 'TemplateLiteral' && !v.expressions.length) out.push({ start: v.start + 1, end: v.end - 1, kind: n.key.name === 'template' ? 'template' : 'style' });
				else if (v?.type === 'StringLiteral' && n.key.name === 'styles') out.push({ start: v.start + 1, end: v.end - 1, kind: 'style' });
			}
		}
		for (const k of Object.keys(n)) if (k !== 'loc' && n[k] && typeof n[k] === 'object') visit(n[k]);
	};
	visit(ast);
	return out;
}

function convertAngularTs(text: string, opts: FileOptions, rel: string): FileResult {
	const parts = inlineParts(text, rel);
	if (!parts.length) return parseScript(text, rel) ? convertJsx(text, opts, rel) : convertCode(text, opts, rel);
	const changes: Change[] = [];
	const edits: Edit[] = [];
	for (const p of parts) {
		const content = text.slice(p.start, p.end);
		if (p.kind === 'template') convertMarkupInto(content, opts, 'angular', edits, changes, p.start);
		else if (opts.general) {
			const next = convertCss(content, { changes, merge: opts.merge && !plain(opts) });
			if (next !== content) edits.push({ start: p.start, end: p.end, text: next });
		}
	}
	convertScript(text, 0, text, opts, edits, changes, { lits: scriptLiterals(text, rel), skip: (l) => parts.some((p) => l.start >= p.start && l.end <= p.end) });
	const out = applyEdits(text, edits);
	if (out !== text && angularSignature(text, rel) !== angularSignature(out, rel)) throw new StructureChanged('the restyle would change more than style values');
	return { text: out, changes };
}

function angularSignature(text: string, rel: string) {
	const parts = inlineParts(text, rel);
	const inner = parts.map((p) => (p.kind === 'template' ? markupSignature(text.slice(p.start, p.end), 'angular') : cssSignature(text.slice(p.start, p.end))));
	return `${jsxSignature(text, rel)}\n${inner.join('\n')}`;
}

export type { Dialect };
