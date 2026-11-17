import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, posix, relative, resolve } from 'node:path';
import { type Change } from '../convert/classes.js';
import { elements, setGround } from '../convert/color.js';
import { detectGround } from '../convert/ground.js';
import { StructureChanged } from '../convert/shared.js';
import type { FileOptions } from '../convert/shared.js';
import { STYLE_FILE, convertFile, fileType } from '../convert/dispatch.js';
import { buildStyleIndex } from '../convert/look.js';
import { kebab, kindNames, kindOfComponent, kinds } from '../convert/kinds.js';
import { brand, cli } from '../lib/brand.js';
import { type Project, readProject, unsupported } from '../library/project.js';
import { flavorsOf, readIndex, readItem } from '../library/registry.js';
import { placedFiles } from '../library/flavors.js';
import { type Graph, buildGraph, closure, routeMatches } from '../project/graph.js';
import { globToRegex, normalizeName, suggest } from '../lib/names.js';
import { init } from './init.js';
import { type Part, type State, readState, statePath } from '../lib/state.js';

export { readState, statePath };
export type { Part, State };

// apply: restyles an existing app (any stack) to the brand, the whole app or a named selection (library kinds, pages by
// route or file). It converts style values by role, gives the named kinds the library's look, installs the theme, and
// records the scope in .ds/state.json for --redo, a later wider apply and the check.

export type ApplyOptions = { targets: string[]; components?: string[]; pages?: string[]; withShared?: boolean; dryRun?: boolean; redo?: boolean };
export type FilePlan = { file: string; reason: string; general: boolean; kinds: Set<string> | 'all'; componentKind?: string };
export type ApplyResult = {
	scope: { whole: boolean; kinds: string[] | 'all'; pages: string[]; files: number };
	files: { file: string; reason: string; changes: Change[] }[];
	skipped: { file: string; reason: string }[];
	sharedLeftOut: string[];
	setup: string[];
	warnings: string[];
	dryRun: boolean;
	state?: State;
};

/**
 * Files the library put in the app (add), as it wrote them: already on the brand, never restyled. An app's own file at
 * the same path (its own components/ui/Button.vue) is the app's, and is restyled like any other.
 */
async function libraryFiles(project: Project): Promise<Set<string>> {
	const out = new Set<string>();
	try {
		for (const entry of await readIndex()) {
			for (const flavor of flavorsOf(entry)) {
				if (flavor === 'elements') continue;
				const item = await readItem(entry.name);
				for (const p of await placedFiles(project, [item], flavor)) if (existsSync(join(project.root, p.path)) && readFileSync(join(project.root, p.path), 'utf8') === p.content) out.add(p.path);
			}
		}
	} catch {}
	return out;
}

type Resolved = { kinds: Set<string>; pageFiles: { target: string; file: string }[]; files: { target: string; file: string }[] };

/** The kind a library item or kind name stands for: `button`, `Button`, `alert-dialog`, `badge` (an alias of tag). */
export function kindForName(name: string): string | undefined {
	const n = normalizeName(name);
	for (const k of kindNames()) if (normalizeName(k) === n) return k;
	const alias = elements().aliases[kebab(name)] ?? Object.entries(elements().aliases).find(([a]) => normalizeName(a) === n)?.[1];
	for (const [k, def] of Object.entries(kinds())) if (normalizeName(def.item) === n || (alias && def.item === alias)) return k;
	return undefined;
}

async function resolveTargets(project: Project, graph: Graph, opts: ApplyOptions): Promise<Resolved> {
	const r: Resolved = { kinds: new Set(), pageFiles: [], files: [] };
	const unresolved: { target: string; options: string[] }[] = [];
	const items = await readIndex().catch(() => []);
	const componentNames = [...graph.components.keys()];
	const asPage = (t: string) => {
		if (t.startsWith('/') || t.startsWith('[')) {
			const pages = graph.pages.filter((p) => routeMatches(p.route, t));
			if (pages.length) {
				r.pageFiles.push(...pages.map((p) => ({ target: t, file: p.file })));
				return true;
			}
		}
		return false;
	};
	const asFile = (t: string) => {
		const rel = posix.normalize(relative(project.root, resolve(project.root, t)).split('\\').join('/'));
		if (graph.files.includes(rel)) {
			(graph.pages.some((p) => p.file === rel) ? r.pageFiles : r.files).push({ target: t, file: rel });
			return true;
		}
		if (/[*?{]/.test(t)) {
			const re = globToRegex(rel);
			const hits = graph.files.filter((f) => re.test(f));
			for (const f of hits) (graph.pages.some((p) => p.file === f) ? r.pageFiles : r.files).push({ target: t, file: f });
			if (hits.length) return true;
		}
		return false;
	};
	const asKind = (t: string) => {
		const k = kindForName(t);
		if (k) {
			r.kinds.add(k);
			return true;
		}
		return false;
	};
	const asComponent = (t: string) => {
		const n = normalizeName(t);
		const hit = componentNames.find((c) => normalizeName(c) === n);
		if (hit) {
			r.files.push({ target: t, file: graph.components.get(hit)! });
			return true;
		}
		return false;
	};
	const fail = (t: string, pool: string[]) => unresolved.push({ target: t, options: suggest(t, pool) });
	const routes = graph.pages.map((p) => p.route);
	const itemNames = items.map((i) => i.name);
	for (const t of opts.targets) {
		if (asPage(t) || asFile(t) || asKind(t) || asComponent(t)) continue;
		const item = items.find((i) => normalizeName(i.name) === normalizeName(t));
		if (item) throw new Error(`\`${item.name}\` is a library item with no restyle recipe: apply restyles ${kindNames().map((k) => kinds()[k].item === k ? k : `${k} (${kinds()[k].item})`).join(', ')}. To use ${item.name} itself: ${cli()} add ${item.name}.`);
		fail(t, [...routes, ...kindNames(), ...itemNames, ...componentNames, ...graph.files]);
	}
	for (const t of opts.components ?? []) if (!asKind(t) && !asComponent(t)) fail(t, [...kindNames(), ...componentNames]);
	for (const t of opts.pages ?? []) if (!asPage(t) && !asFile(t)) fail(t, [...routes, ...graph.pages.map((p) => p.file)]);
	if (unresolved.length) {
		throw new Error(
			[`Nothing was written: ${unresolved.length === 1 ? 'one target does' : `${unresolved.length} targets do`} not match a page, a file, a library kind or one of the app's components.`, ...unresolved.map((u) => `  ${u.target}${u.options.length ? `: did you mean ${u.options.map((o) => `\`${o}\``).join(', ')}?` : ''}`), `Pages: ${routes.join(', ') || '(none found)'}${graph.routerNote ? ` (${graph.routerNote})` : ''}`, `Kinds: ${kindNames().join(', ')}`].join('\n'),
		);
	}
	return r;
}

/** The files and what to do in each, for one part of the scope. */
function planPart(project: Project, graph: Graph, part: Part, library: Set<string>, out: Map<string, FilePlan>) {
	const kindsOf = (k?: string[]) => (k ? new Set(k) : ('all' as const));
	const css = project.css;
	const eligible = (f: string) => !library.has(f) && !f.includes(`/${brand().bin}/`);
	const add = (file: string, reason: string, general: boolean, k: Set<string> | 'all') => {
		if (!eligible(file)) return;
		const prev = out.get(file);
		const componentKind = componentKindOf(file);
		if (!prev) out.set(file, { file, reason, general, kinds: k, componentKind });
		else {
			prev.general ||= general;
			prev.kinds = prev.kinds === 'all' || k === 'all' ? 'all' : new Set([...prev.kinds, ...k]);
			if (!prev.reason.includes(reason)) prev.reason += `; ${reason}`;
		}
	};
	if (part.whole) {
		for (const f of graph.files) add(f, 'whole app', true, 'all');
		return;
	}
	const k = kindsOf(part.kinds);
	if (!part.files) {
		// Kinds across the whole app: their components and their elements, nothing else.
		for (const f of graph.files) {
			const ck = componentKindOf(f);
			if (ck && (k === 'all' || k.has(ck))) add(f, `${ck} component`, false, k);
			else if (markupFile(project, f)) add(f, `${[...(k === 'all' ? [] : k)].join(', ')} elements`, false, k);
		}
		return;
	}
	const general = !part.kinds;
	for (const f of part.files) add(f, part.targets.join(', '), general, k);
	if (part.withShared && general && css) add(css, 'shared (--with-shared)', true, 'all');
}

/** A file that holds elements (markup or JSX), where a kind's elements can be. */
const markupFile = (project: Project, f: string) => {
	const t = fileType(f, project.framework === 'angular');
	return !!t && t !== 'css' && (t !== 'script' || /\.(tsx|jsx)$/.test(f));
};

/** An app component's kind: by its file name, or a shadcn-style folder (components/ui/button/index.ts). */
export function componentKindOf(file: string): string | undefined {
	const name = file.split('/').pop()!;
	if (/^index\.(ts|js|tsx|jsx)$/.test(name)) {
		const dir = file.split('/').slice(-2, -1)[0];
		return dir ? kindOfComponent(dir) : undefined;
	}
	// Components: Vue, JSX, Svelte, Astro, Angular, Blade components, ERB and other template partials.
	if (/\.(vue|tsx|jsx|svelte|astro|component\.ts|component\.html)$/.test(name) || /(^|\/)components\/.*\.blade\.php$/.test(file) || /^_[\w-]+\.(html\.erb|erb|hbs|ejs|liquid|twig|njk|html)$/.test(name) || /(^|\/)(partials|components|includes|_includes)\/[^/]+\.\w+$/.test(file)) return kindOfComponent(name.replace(/^_/, ''));
	return undefined;
}

/** A page's own files, and the shared ones (used by other pages or the shell too) apply leaves out unless asked. */
function pageFiles(graph: Graph, pages: string[], withShared: boolean) {
	const users = new Map<string, Set<string>>();
	const roots = [...new Set([...graph.pages.map((p) => p.file), ...graph.shell])];
	const pageSet = new Set(graph.pages.map((p) => p.file));
	for (const root of roots) for (const f of closure(graph, root, pageSet)) (users.get(f) ?? users.set(f, new Set()).get(f)!).add(root);
	const files = new Set<string>();
	const shared = new Set<string>();
	for (const page of pages) {
		for (const f of closure(graph, page, pageSet)) {
			const by = users.get(f) ?? new Set([page]);
			const own = [...by].every((u) => u === page || pages.includes(u));
			if (own || withShared) files.add(f);
			else shared.add(f);
		}
	}
	if (withShared) for (const s of graph.shell) for (const f of closure(graph, s, pageSet)) files.add(f);
	else for (const s of graph.shell) shared.add(s);
	return { files: [...files], shared: [...shared].filter((f) => !files.has(f)) };
}

export async function apply(root: string, opts: ApplyOptions): Promise<ApplyResult> {
	const project = readProject(root);
	const problem = unsupported(project);
	if (problem) throw new Error(problem);
	const graph = buildGraph(project);
	const previous = readState(root);
	const warnings: string[] = [];
	let parts: Part[];
	let sharedLeftOut: string[] = [];
	const named = opts.targets.length || opts.components?.length || opts.pages?.length;
	if (opts.redo) {
		if (named) throw new Error('--redo repeats the recorded scope; leave out targets, or apply them without --redo.');
		parts = previous?.parts?.length ? previous.parts : [{ whole: true, targets: [] }];
	} else if (!named) parts = [{ whole: true, targets: [] }];
	else {
		const r = await resolveTargets(project, graph, opts);
		const kindsList = r.kinds.size ? [...r.kinds] : undefined;
		let files: string[] | undefined;
		if (r.pageFiles.length || r.files.length) {
			const pages = r.pageFiles.length ? pageFiles(graph, [...new Set(r.pageFiles.map((p) => p.file))], !!opts.withShared) : { files: [], shared: [] };
			sharedLeftOut = pages.shared;
			files = [...new Set([...pages.files, ...r.files.map((f) => f.file)])];
		}
		parts = [{ kinds: kindsList, files, targets: [...opts.targets, ...(opts.components ?? []), ...(opts.pages ?? [])], withShared: opts.withShared || undefined }];
	}
	const wholeApp = parts.some((p) => p.whole) || previous?.whole === true;
	const whole0 = wholeApp;
	const library = await libraryFiles(project);
	const plans = new Map<string, FilePlan>();
	for (const part of parts) planPart(project, graph, part, library, plans);

	// What the app's own stylesheets give its classes: read once, for kinds and variants of elements styled in CSS.
	const look = buildStyleIndex(graph.files.flatMap((f) => (STYLE_FILE.test(f) ? [readFileSync(join(root, f), 'utf8')] : /\.(vue|svelte|astro|html?|erb|php|hbs|ejs|liquid|twig|njk)$/.test(f) ? styleBlocks(readFileSync(join(root, f), 'utf8')) : [])));
	// The app's ground becomes the brand's: a dark app stays dark in a dark brand (convert/ground.ts).
	setGround(detectGround(graph.files.filter((f) => STYLE_FILE.test(f) || /\.(html?|vue|svelte|astro|[jt]sx|erb|php|hbs|ejs|liquid|twig|njk)$/.test(f)).map((f) => readFileSync(join(root, f), 'utf8'))));
	const results: ApplyResult['files'] = [];
	const skipped: ApplyResult['skipped'] = [];
	for (const plan of plans.values()) {
		const abs = join(root, plan.file);
		if (!existsSync(abs)) continue;
		const before = readFileSync(abs, 'utf8');
		const fo: FileOptions = { general: plan.general, kinds: plan.kinds, componentKind: plan.componentKind, merge: project.merge && !!project.tailwind, mark: !wholeApp, css: project.tailwind ? 'tailwind' : 'plain', look };
		try {
			const r = convertFile(plan.file, before, fo, project.framework === 'angular');
			if (r.text === before) continue;
			results.push({ file: plan.file, reason: plan.reason, changes: r.changes });
			if (!opts.dryRun) writeFileSync(abs, r.text);
		} catch (error) {
			const reason = error instanceof StructureChanged ? 'left as is: the restyle would have changed more than style values' : `left as is: ${(error as Error).message}`;
			skipped.push({ file: plan.file, reason });
		}
	}

	// The shared setup: stylesheet, theme, fonts, contract.
	// The base layer comes with the whole app only; a selection gets tokens, theme and fonts, its base scoped.
	// Pages that hold their own <head> and sit outside the selection are not linked: they stay byte for byte.
	const everywhere = whole0 || parts.some((p) => !p.files) || previous?.parts?.some((p) => !p.files);
	const inScope = new Set([...plans.keys(), ...(previous?.checked ?? [])]);
	const skipLayouts = everywhere ? [] : graph.pages.map((p) => p.file).filter((f) => !inScope.has(f) && !(previous && previous.parts.some((q) => q.files?.includes(f))));
	const setup = await init(root, { dryRun: opts.dryRun, whole: whole0, skipLayouts });
	warnings.push(...setup.warnings);

	// Once the whole app is applied it stays applied: a later selection only repeats part of it.
	const whole = parts.some((p) => p.whole) || previous?.whole === true;
	// A later apply widens the scope; the same apply again adds nothing.
	const prior = previous && !previous.whole ? previous.parts : [];
	const mergedParts = whole ? [{ whole: true, targets: [] }] : opts.redo ? parts : [...prior, ...parts.filter((p) => !prior.some((q) => JSON.stringify(q) === JSON.stringify(p)))];
	const checked = new Set<string>(whole ? [] : previous && !previous.whole ? previous.checked : []);
	// The check covers what was restyled whole: files in a page or file scope, and components of the named kinds.
	if (!whole) for (const p of plans.values()) if (p.general || (p.componentKind && (p.kinds === 'all' || p.kinds.has(p.componentKind)))) checked.add(p.file);
	const state: State = { version: 1, appliedAt: new Date().toISOString(), parts: mergedParts, checked: [...checked].sort(), whole };
	// The state changes only when the scope does, so running the same apply twice leaves every file as it was.
	const same = previous && JSON.stringify({ ...previous, appliedAt: '' }) === JSON.stringify({ ...state, appliedAt: '' });
	if (same) state.appliedAt = previous.appliedAt;
	if (!opts.dryRun && !same) {
		mkdirSync(join(root, '.ds'), { recursive: true });
		writeFileSync(statePath(root), `${JSON.stringify(state, null, 2)}\n`);
	}
	const allKinds = parts.flatMap((p) => p.kinds ?? []);
	return {
		scope: { whole, kinds: parts.some((p) => !p.kinds) ? 'all' : [...new Set(allKinds)], pages: parts.flatMap((p) => p.targets).filter((t) => t.startsWith('/')), files: plans.size },
		files: results,
		skipped,
		sharedLeftOut,
		setup: setup.writes,
		warnings,
		dryRun: !!opts.dryRun,
		state,
	};
}

const styleBlocks = (text: string) => [...text.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);

export function formatApply(r: ApplyResult): string {
	const b = brand();
	const lines: string[] = [];
	const named = r.state?.parts.at(-1)?.targets.filter((t) => !t.startsWith('-')) ?? [];
	const what = r.scope.whole ? 'the whole app' : r.scope.kinds === 'all' ? named.join(', ') || 'the named files' : `${r.scope.kinds.join(', ')}${r.scope.pages.length ? ` on ${r.scope.pages.join(', ')}` : ''}`;
	lines.push(`${b.name} design system ${r.dryRun ? 'dry run (nothing written)' : 'applied'}: ${what}.`);
	const values = r.files.reduce((n, f) => n + f.changes.length, 0);
	lines.push(`  ${r.dryRun ? 'Would restyle' : 'Restyled'} ${r.files.length} file${r.files.length === 1 ? '' : 's'} (${values} values) of ${r.scope.files} in scope:`);
	for (const f of r.files.slice(0, 40)) lines.push(`    ${f.file}  (${f.reason}; ${f.changes.length} change${f.changes.length === 1 ? '' : 's'})`);
	if (r.files.length > 40) lines.push(`    ... and ${r.files.length - 40} more (--json lists them all)`);
	if (r.sharedLeftOut.length) lines.push(`  Left out, shared with other pages or the shell (name them or pass --with-shared): ${r.sharedLeftOut.join(', ')}`);
	for (const s of r.skipped) lines.push(`  ${s.file}: ${s.reason}`);
	lines.push(`  Shared setup: ${r.setup.filter((s) => !/fonts$|logo$/.test(s)).join(', ') || 'already in place'} (theme, fonts, contract).`);
	for (const w of r.warnings) lines.push(`  warning: ${w}`);
	if (!r.dryRun) lines.push(`  Scope recorded in .ds/state.json: \`${b.bin} apply --redo\` repeats it, \`${b.bin} check\` checks ${r.state?.whole ? 'the whole app' : `the ${r.state?.checked.length ?? 0} files in it`}.`);
	return lines.join('\n');
}
