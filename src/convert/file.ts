import { parse as parseSfc } from '@vue/compiler-sfc';
import { type Change } from './classes.js';
import { convertCss } from './css.js';
import { scriptLiterals } from './jsx.js';
import { convertMarkup, markupSignature } from './markup.js';
import { type Edit, type ElementInfo, type FileOptions, type FileResult, MARK, StructureChanged, applyEdits, blankLiterals, convertElementInfo, convertScript, cssSignature, literals, plain } from './shared.js';

export { MARK, StructureChanged, literals };
export type { FileOptions, FileResult };

// One file restyled: Vue single-file components (template classes and styles, bound class literals, <style> blocks,
// script class strings), HTML, stylesheets and scripts. Only style values change; a structure check compares the file
// before and after with every style value blanked and refuses any other difference (copy, elements, attributes, code).

type Node = { type: number; tag?: string; props?: any[]; children?: Node[]; loc: { start: { offset: number }; end: { offset: number } }; content?: any };

/** A Vue single-file component restyled. */
export function convertVue(text: string, opts: FileOptions): FileResult {
	const changes: Change[] = [];
	const edits: Edit[] = [];
	const { descriptor } = parseSfc(text, { sourceMap: false, ignoreEmpty: false });
	const template = descriptor.template;
	if (template?.ast && (!template.lang || template.lang === 'html')) {
		const roots = (template.ast.children as Node[]).filter((n) => n.type === 1);
		const visit = (node: Node, isRoot: boolean, onDark: boolean | undefined) => {
			if (node.type !== 1) return;
			const dark = convertElement(text, node, isRoot, opts, edits, changes, onDark);
			for (const child of node.children ?? []) visit(child, false, dark ?? onDark);
		};
		for (const n of template.ast.children as Node[]) visit(n, roots.includes(n), undefined);
	}
	for (const block of [descriptor.script, descriptor.scriptSetup]) if (block) convertScript(block.content, block.loc.start.offset, text, opts, edits, changes, { lits: scriptLiterals(block.content, `x.${block.lang === 'tsx' || block.lang === 'jsx' ? block.lang : 'ts'}`, block.loc.start.offset) });
	if (opts.general) {
		for (const style of descriptor.styles) {
			if (style.lang && !/^(css|postcss|pcss|scss|less)$/.test(style.lang)) continue;
			const next = convertCss(style.content, { changes, merge: opts.merge, plain: plain(opts) });
			if (next !== style.content) edits.push({ start: style.loc.start.offset, end: style.loc.end.offset, text: next });
		}
	}
	const out = applyEdits(text, edits);
	if (out !== text) guard(text, out, 'vue');
	return { text: out, changes };
}

function convertElement(text: string, node: Node, isRoot: boolean, opts: FileOptions, edits: Edit[], changes: Change[], onDark?: boolean): boolean | undefined {
	const tag = node.tag ?? '';
	const el: ElementInfo = { tag, isRoot, attrs: {}, bindings: [], directives: [], styleBindings: [], extraClasses: [], insert: { at: node.loc.start.offset + 1 + tag.length, attr: 'class' } };
	for (const p of node.props ?? []) {
		if (p.type === 6) {
			el.attrs[p.name] = p.value?.content ?? true;
			if (!p.value) continue;
			const start = p.value.loc.start.offset + 1;
			const end = p.value.loc.end.offset - 1;
			if (p.name === 'class') el.staticClass = { start, end, value: text.slice(start, end) };
			else if (p.name === 'style') el.staticStyle = { start, end, value: text.slice(start, end) };
			else if (/(^|-)class$/i.test(p.name) || /Class$/.test(p.name)) el.extraClasses.push({ start, end, value: text.slice(start, end) });
		} else if (p.type === 7 && p.name === 'bind' && p.arg?.content && p.exp) {
			const arg = p.arg.content as string;
			const start = p.exp.loc.start.offset;
			const end = p.exp.loc.end.offset;
			if (arg === 'class' || /(^|-)class$/i.test(arg) || /Class$/.test(arg)) el.bindings.push({ start, end, code: text.slice(start, end), name: arg });
			else if (arg === 'style') el.styleBindings.push({ start, end, code: text.slice(start, end) });
			else el.attrs[arg] = '';
		}
	}
	return convertElementInfo(text, el, opts, edits, changes, onDark);
}

/** A plain HTML page. */
export function convertHtml(text: string, opts: FileOptions): FileResult {
	return convertMarkup(text, opts, 'html');
}

export function convertStylesheet(text: string, opts: FileOptions): FileResult {
	const changes: Change[] = [];
	if (!opts.general) return { text, changes };
	const out = convertCss(text, { changes, merge: opts.merge && !plain(opts), plain: plain(opts) });
	if (out !== text) guard(text, out, 'css');
	return { text: out, changes };
}

/** A script (ts, js): class strings and colors in its literals, read with a parser when it parses. */
export function convertCode(text: string, opts: FileOptions, file = 'x.ts'): FileResult {
	const changes: Change[] = [];
	const edits: Edit[] = [];
	convertScript(text, 0, text, opts, edits, changes, { lits: scriptLiterals(text, file) });
	const out = applyEdits(text, edits);
	if (out !== text) guard(text, out, 'code', file);
	return { text: out, changes };
}

// ---- The structure check: everything but style values must be byte-identical. ----

function templateSignature(nodes: Node[], text: string): string {
	return nodes
		.map((n) => {
			if (n.type === 1) {
				const props = (n.props ?? [])
					.filter((p: any) => !(p.type === 6 && (p.name === 'class' || p.name === 'style' || /(^|-)class$/i.test(p.name) || /Class$/.test(p.name))))
					.map((p: any) => (p.type === 6 ? `${p.name}=${p.value?.content ?? ''}` : `${p.rawName ?? p.name}=${blankLiterals(p.exp ? text.slice(p.exp.loc.start.offset, p.exp.loc.end.offset) : '')}`))
					.join(' ');
				return `<${n.tag} ${props}>${templateSignature(n.children ?? [], text)}</${n.tag}>`;
			}
			if (n.type === 2 || n.type === 3) return `${n.type}:${typeof n.content === 'string' ? n.content : ''}`;
			if (n.type === 5) return `{{${blankLiterals(n.content?.loc ? text.slice(n.content.loc.start.offset, n.content.loc.end.offset) : '')}}}`;
			return '';
		})
		.join('');
}

export function signature(text: string, kind: 'vue' | 'html' | 'css' | 'code', file = 'x.ts'): string {
	if (kind === 'code') return blankLiterals(text, scriptLiterals(text, file));
	if (kind === 'css') return cssSignature(text);
	if (kind === 'html') return markupSignature(text, 'html');
	const { descriptor } = parseSfc(text, { sourceMap: false, ignoreEmpty: false });
	const t = descriptor.template?.ast ? templateSignature(descriptor.template.ast.children as Node[], text) : '';
	const scripts = [descriptor.script, descriptor.scriptSetup].map((b) => (b ? blankLiterals(b.content) : '')).join('\n');
	const styles = descriptor.styles.map((s) => `${s.attrs.scoped ? 'scoped' : ''}${s.lang ?? ''}${cssSignature(s.content)}`).join('\n');
	return `${t}\n${scripts}\n${styles}`;
}

export function guard(before: string, after: string, kind: 'vue' | 'html' | 'css' | 'code', file?: string) {
	if (signature(before, kind, file) !== signature(after, kind, file)) throw new StructureChanged('the restyle would change more than style values');
}
