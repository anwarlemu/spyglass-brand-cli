import { type ParserPlugin, parse } from '@babel/parser';
import type { Change } from './classes.js';
import { type Edit, type ElementInfo, type FileOptions, type FileResult, type Literal, StructureChanged, applyEdits, convertElementInfo, convertScript, literals } from './shared.js';

// Scripts read with a parser (Babel): JSX and TSX components (className and class, cn()/clsx/cva/tv strings, style
// objects), plain TypeScript and JavaScript, and the script blocks of other files. Only string contents change; the
// structure check compares the file before and after with every string blanked and the class and style attributes
// left out.

type Node = { type: string; start: number; end: number; [key: string]: any };

const pluginsFor = (file: string): ParserPlugin[] => {
	const ts = /\.(tsx?|mts|cts)$/.test(file) || file.endsWith('.component.ts');
	const jsx = /\.(tsx|jsx|js|mjs|cjs)$/.test(file);
	return [...(ts ? (['typescript'] as ParserPlugin[]) : []), ...(jsx || !ts ? (['jsx'] as ParserPlugin[]) : []), ['decorators', { decoratorsBeforeExport: true }], 'importAttributes', 'explicitResourceManagement'] as ParserPlugin[];
};

export function parseScript(code: string, file: string): Node | undefined {
	for (const plugins of [pluginsFor(file), pluginsFor(file.replace(/\.ts$/, '.tsx')), pluginsFor('x.ts')]) {
		try {
			return parse(code, { sourceType: 'unambiguous', plugins, errorRecovery: false, allowReturnOutsideFunction: true, allowImportExportEverywhere: true }) as unknown as Node;
		} catch {}
	}
	return undefined;
}

function walk(node: any, visit: (n: Node, parent: Node | undefined) => void, parent?: Node) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const n of node) walk(n, visit, parent);
		return;
	}
	if (typeof node.type !== 'string') return;
	visit(node, parent);
	for (const key of Object.keys(node)) {
		if (key === 'loc' || key === 'start' || key === 'end' || key === 'extra' || key === 'leadingComments' || key === 'trailingComments' || key === 'innerComments') continue;
		const v = node[key];
		if (v && typeof v === 'object') walk(v, visit, node);
	}
}

/** The safe parts of a template literal's static text: the whole tokens, not the ones glued to a `${}`. */
function quasiLiterals(tpl: Node, code: string, base: number): Literal[] {
	const out: Literal[] = [];
	const quasis = tpl.quasis as Node[];
	quasis.forEach((q, i) => {
		let start = q.start;
		let end = q.end;
		const raw = code.slice(start, end);
		if (i > 0 && !/^\s/.test(raw)) start += raw.match(/^\S*/)?.[0].length ?? 0;
		if (i < quasis.length - 1 && !/\s$/.test(raw)) end -= raw.match(/\S*$/)?.[0].length ?? 0;
		if (end > start && code.slice(start, end).trim()) out.push({ start: base + start, end: base + end, value: code.slice(start, end), quote: '`' });
	});
	return out;
}

/** Every string in a script, with offsets: string literals, template text (whole tokens only), JSX attribute strings. */
export function scriptLiterals(code: string, file: string, base = 0, ast = parseScript(code, file)): Literal[] {
	if (!ast) return literals(code, base);
	const out: Literal[] = [];
	walk(ast, (n) => {
		if (n.type === 'StringLiteral') out.push({ start: base + n.start + 1, end: base + n.end - 1, value: code.slice(n.start + 1, n.end - 1), quote: code[n.start] });
		else if (n.type === 'TemplateLiteral') {
			if (!n.expressions.length) out.push({ start: base + n.start + 1, end: base + n.end - 1, value: code.slice(n.start + 1, n.end - 1), quote: '`' });
			else out.push(...quasiLiterals(n, code, base));
		}
	});
	return out.sort((a, b) => a.start - b.start);
}

const nameOf = (n: Node | undefined): string => (!n ? '' : n.type === 'JSXIdentifier' ? n.name : n.type === 'JSXMemberExpression' ? `${nameOf(n.object)}.${nameOf(n.property)}` : n.type === 'JSXNamespacedName' ? `${n.namespace.name}:${n.name.name}` : '');
const CLASS_ATTR = /^(class|className)$/;
const EXTRA_CLASS = /(^|-)class$|Class(Name)?$/;

type Jsx = { el: Node; parent?: Jsx; root: boolean };
/** A component (Layout, Card.Root, a Fragment), not an element: its class is a prop. */
const isComponent = (tag: string) => !/^[a-z][\w-]*$/.test(tag);

function jsxElements(ast: Node): Jsx[] {
	const out: Jsx[] = [];
	const byNode = new Map<Node, Jsx>();
	const visit = (node: any, owner: Jsx | undefined) => {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) {
			for (const n of node) visit(n, owner);
			return;
		}
		if (typeof node.type !== 'string') return;
		let next = owner;
		if (node.type === 'JSXElement') {
			// The roots: elements with no element above them (components above them do not count: a page's <Layout>).
			let root = true;
			for (let p = owner; p; p = p.parent) if (!isComponent(nameOf(p.el.openingElement.name))) root = false;
			const j: Jsx = { el: node, parent: owner, root };
			out.push(j);
			byNode.set(node, j);
			next = j;
		}
		for (const key of Object.keys(node)) {
			if (key === 'loc' || key === 'extra' || /Comments$/.test(key)) continue;
			const v = node[key];
			if (v && typeof v === 'object') visit(v, next);
		}
	};
	visit(ast, undefined);
	return out;
}

/** A JSX or TSX file (or a plain script) restyled. */
export function convertJsx(text: string, opts: FileOptions, file: string): FileResult {
	const changes: Change[] = [];
	const edits: Edit[] = [];
	const ast = parseScript(text, file);
	if (!ast) throw new Error('it does not parse as a script');
	const lits = scriptLiterals(text, file, 0, ast);
	const inside = (s: number, e: number) => lits.filter((l) => l.start >= s && l.end <= e);
	const owned: { start: number; end: number }[] = [];
	const solid = /from\s+['"]solid-js/.test(text) || (!/\bclassName\s*=/.test(text) && /\sclass\s*=\s*["{]/.test(text));
	const dark = new Map<Node, boolean | undefined>();
	for (const j of jsxElements(ast)) {
		const open = j.el.openingElement as Node;
		const tag = nameOf(open.name);
		const el: ElementInfo = { tag, isRoot: j.root && !isComponent(tag), attrs: {}, bindings: [], directives: [], styleBindings: [], extraClasses: [], insert: /^[a-z][\w]*$/.test(tag) ? { at: open.name.end, attr: solid ? 'class' : 'className' } : undefined };
		for (const a of open.attributes as Node[]) {
			if (a.type !== 'JSXAttribute') {
				// A spread ({...props}) may carry a className: a bare element with one gets no second class attribute.
				if (a.type === 'JSXSpreadAttribute') el.insert = undefined;
				continue;
			}
			const name = nameOf(a.name);
			const v = a.value as Node | null;
			if (!v) {
				el.attrs[name] = true;
				continue;
			}
			if (v.type === 'StringLiteral') {
				const value = text.slice(v.start + 1, v.end - 1);
				el.attrs[name] = value;
				if (CLASS_ATTR.test(name)) el.staticClass = { start: v.start + 1, end: v.end - 1, value };
				else if (name === 'style') el.staticStyle = { start: v.start + 1, end: v.end - 1, value };
				else if (EXTRA_CLASS.test(name)) el.extraClasses.push({ start: v.start + 1, end: v.end - 1, value });
				if (CLASS_ATTR.test(name) || name === 'style' || EXTRA_CLASS.test(name)) owned.push({ start: v.start, end: v.end });
				continue;
			}
			if (v.type === 'JSXExpressionContainer') {
				const e = v.expression as Node;
				el.attrs[name] = '';
				if (CLASS_ATTR.test(name) || EXTRA_CLASS.test(name)) {
					el.bindings.push({ start: e.start, end: e.end, code: text.slice(e.start, e.end), name: CLASS_ATTR.test(name) ? 'class' : name, lits: inside(e.start, e.end) });
					owned.push({ start: e.start, end: e.end });
				} else if (name === 'style') {
					el.styleBindings.push({ start: e.start, end: e.end, code: text.slice(e.start, e.end), lits: inside(e.start, e.end) });
					owned.push({ start: e.start, end: e.end });
				}
			}
		}
		const onDark = j.parent ? dark.get(j.parent.el) : undefined;
		const d = convertElementInfo(text, el, opts, edits, changes, onDark);
		dark.set(j.el, d ?? onDark);
	}
	convertScript(text, 0, text, opts, edits, changes, { lits, skip: (l) => owned.some((o) => l.start >= o.start && l.end <= o.end) });
	const out = applyEdits(text, edits);
	if (out !== text && jsxSignature(text, file) !== jsxSignature(out, file)) throw new StructureChanged('the restyle would change more than style values');
	return { text: out, changes };
}

/** A script with every string blanked and its JSX class and style attributes left out (they may be added). */
export function jsxSignature(text: string, file: string): string {
	const ast = parseScript(text, file);
	if (!ast) return `unparsed:${text}`;
	const removed: { start: number; end: number }[] = [];
	walk(ast, (n) => {
		if (n.type !== 'JSXAttribute') return;
		const name = nameOf(n.name);
		if (!(CLASS_ATTR.test(name) || name === 'style' || EXTRA_CLASS.test(name))) return;
		const v = n.value as Node | null;
		// A string value goes whole (an attribute the restyle may add); an expression keeps its code with strings blanked.
		if (v?.type === 'StringLiteral') {
			let s = n.start;
			while (s > 0 && /\s/.test(text[s - 1])) s--;
			removed.push({ start: s, end: n.end });
		}
	});
	const lits = scriptLiterals(text, file, 0, ast);
	let out = '';
	let last = 0;
	const spans = [...removed.map((r) => ({ ...r, drop: true })), ...lits.map((l) => ({ start: l.start, end: l.end, drop: false }))].sort((a, b) => a.start - b.start);
	for (const s of spans) {
		if (s.start < last) continue;
		out += text.slice(last, s.start);
		last = s.end;
	}
	return out + text.slice(last);
}
