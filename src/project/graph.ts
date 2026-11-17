import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative } from 'node:path';
import { STYLED_FILE } from '../convert/dispatch.js';
import { parseScript } from '../convert/jsx.js';
import { brand } from '../lib/brand.js';
import type { Project } from '../library/project.js';

// The app as apply sees it, in any stack: its source files, what each pulls in (imports, auto-imported Vue
// components, Angular templates and selectors, partials and layouts of server templates, the stylesheets a page
// links), its pages with their routes (file routes, router configs it can read statically, server routes), and the
// shell (layouts, root components) every page renders inside.

export type Page = { route: string; file: string };
export type Graph = { files: string[]; imports: Map<string, Set<string>>; pages: Page[]; shell: string[]; components: Map<string, string>; routerNote?: string };

const SKIP = /(^|\/)(node_modules|\.git|\.nuxt|\.output|\.next|\.svelte-kit|\.astro|\.angular|\.data|\.vercel|dist|build|coverage|\.ds|\.turbo|\.cache|vendor|tmp|log|storage|bootstrap\/cache|\.venv|venv|env|__pycache__|staticfiles|migrations|tests?|spec|e2e|cypress|playwright)(\/|$)/;
const TOOLING = /\.d\.ts$|\.(config|test|spec|stories|min)\.|^(vite|vitest|nuxt|tailwind|postcss|eslint|prettier|svelte|astro|next|react-router|angular|karma|jest|playwright|webpack|rollup|babel)\b/;
export const SOURCE = STYLED_FILE;

const read = (root: string, rel: string) => {
	try {
		return readFileSync(join(root, rel), 'utf8');
	} catch {
		return '';
	}
};

function walk(root: string, dir: string, out: string[], skip: (rel: string) => boolean) {
	if (!existsSync(join(root, dir))) return;
	for (const name of readdirSync(join(root, dir))) {
		const rel = dir === '.' ? name : posix.join(dir, name);
		if (SKIP.test(rel) || skip(rel)) continue;
		let st;
		try {
			st = statSync(join(root, rel));
		} catch {
			continue;
		}
		if (st.isDirectory()) walk(root, rel, out, skip);
		else if (SOURCE.test(name) && !TOOLING.test(name)) out.push(rel);
	}
}

/** The folders that hold an app's own source, by stack. */
function sourceRoots(project: Project): string[] {
	switch (project.framework) {
		case 'rails':
			return ['app/views', 'app/assets/stylesheets', 'app/assets/tailwind', 'app/components', 'app/javascript'];
		case 'laravel':
			return ['resources'];
		case 'angular':
		case 'sveltekit':
		case 'astro':
		case 'solid':
		case 'vite-react':
		case 'vite-svelte':
			return [existsSync(join(project.root, 'src')) ? 'src' : '.'];
		default:
			return [project.srcDir];
	}
}

/** The app's own source files (the brand's installed files and the static folder left out). */
export function sourceFiles(project: Project): string[] {
	const out: string[] = [];
	const own = `/${brand().bin}/`;
	// A build's static folder holds assets; a server-rendered site's (Express, PHP, Django) holds its own stylesheets.
	const served = ['django', 'templates', 'php', 'html'].includes(project.framework);
	const isPublic = (rel: string) => !served && project.publicDir !== '.' && (rel === project.publicDir || rel.startsWith(`${project.publicDir}/`));
	const skip = (rel: string) => `/${rel}/`.includes(own) || isPublic(rel) || (project.framework === 'nuxt' && rel === 'server') || (rel === 'public' && project.node && !served);
	for (const dir of sourceRoots(project)) {
		if (dir === '.') {
			for (const name of readdirSync(project.root)) {
				if (SKIP.test(name) || skip(name)) continue;
				const st = statSync(join(project.root, name));
				if (st.isDirectory()) walk(project.root, name, out, skip);
				else if (SOURCE.test(name) && !TOOLING.test(name)) out.push(name);
			}
		} else walk(project.root, dir, out, skip);
	}
	for (const f of ['index.html', 'src/index.html', 'src/app.html']) if (existsSync(join(project.root, f)) && !out.includes(f)) out.push(f);
	// Django serves its stylesheets from static folders: those are the app's styles too (the brand's copy aside).
	return [...new Set(out)].filter((f) => !`/${f}`.includes(own)).sort();
}

const pascal = (s: string) => s.replace(/(^|[-_.\s]+)(\w)/g, (_, __, c: string) => c.toUpperCase());

/** Nuxt's component names: components/base/Button.vue is BaseButton, components/BaseButton.vue stays BaseButton. */
function nuxtName(rel: string, componentsDir: string) {
	const parts = relative(componentsDir, rel).replace(/\.vue$/, '').split('/').map(pascal);
	const file = parts.pop()!;
	const prefix: string[] = [];
	for (const p of parts) if (!prefix.length || !prefix.join('').endsWith(p)) prefix.push(p);
	const joined = prefix.join('');
	return file === 'Index' && joined ? joined : file.startsWith(joined) ? file : joined + file;
}

const EXTS = ['', '.vue', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.svelte', '.astro', '/index.ts', '/index.tsx', '/index.js', '/index.jsx', '/index.vue', '/index.svelte', '/index.astro'];

function resolveImport(project: Project, from: string, spec: string, files: Set<string>): string | undefined {
	let base: string | undefined;
	const src = project.srcDir === '.' ? '' : project.srcDir;
	const clean = spec.split(/[?#]/)[0];
	if (clean.startsWith('.')) base = posix.join(posix.dirname(from), clean);
	else if (/^(~~|@@)\//.test(clean)) base = clean.slice(3);
	else if (/^[~@]\//.test(clean)) base = posix.join(project.framework === 'sveltekit' || project.framework === 'astro' || project.framework === 'angular' ? 'src' : src, clean.slice(2));
	else if (clean.startsWith('$lib/')) base = posix.join('src/lib', clean.slice(5));
	else if (clean.startsWith('/')) base = clean.slice(1);
	if (base === undefined) return undefined;
	base = posix.normalize(base);
	for (const e of EXTS) if (files.has(base + e)) return base + e;
	return undefined;
}

const IMPORTS = /(?:\bimport\s+(?:[\s\S]*?\s+from\s+)?|\bimport\s*\(\s*|\bexport\s+[\s\S]*?\s+from\s+)['"]([^'"\n]+)['"]/g;
const TAGS = /<([A-Z][\w]*|[a-z][\w]*(?:-[\w]+)+)[\s/>]/g;

/** Template files a server template pulls in: partials, layouts it extends, components. */
function templateEdges(project: Project, file: string, text: string, files: string[]): string[] {
	const out: string[] = [];
	const set = new Set(files);
	const find = (candidates: string[]) => candidates.map((c) => posix.normalize(c)).find((c) => set.has(c));
	const dirs = files.map((f) => f.match(/^(.*?\/)?(templates|views|_includes|_layouts|partials|includes)\//)?.[0]).filter((d): d is string => !!d);
	const templateDirs = [...new Set(dirs)];
	const named = (name: string, exts: string[]) => {
		const n = name.replace(/^['"]|['"]$/g, '');
		const forms = [n, ...exts.map((e) => `${n}${e}`)];
		return find([...forms.map((x) => posix.join(posix.dirname(file), x)), ...templateDirs.flatMap((d) => forms.map((x) => `${d}${x}`)), ...forms]);
	};
	if (file.endsWith('.erb')) {
		for (const m of text.matchAll(/render\s*\(?\s*(?:partial:\s*)?["']([\w/]+)["']/g)) {
			const parts = m[1].split('/');
			const leaf = `_${parts.pop()}`;
			const dir = parts.length ? `app/views/${parts.join('/')}` : posix.dirname(file);
			const hit = find([`${dir}/${leaf}.html.erb`, `${dir}/${leaf}.erb`]);
			if (hit) out.push(hit);
		}
	} else if (file.endsWith('.blade.php')) {
		for (const m of text.matchAll(/@(?:extends|include|includeIf|includeWhen\([^,]*,|component|livewire)\s*\(\s*['"]([\w.-]+)['"]/g)) {
			const hit = find([`resources/views/${m[1].replace(/\./g, '/')}.blade.php`]);
			if (hit) out.push(hit);
		}
		for (const m of text.matchAll(/<x-([\w.-]+)/g)) {
			const name = m[1].replace(/\./g, '/');
			const layout = name.match(/^(.+)-layout$/)?.[1];
			const hit = find([`resources/views/components/${name}.blade.php`, `resources/views/components/${name}/index.blade.php`, ...(layout ? [`resources/views/layouts/${layout}.blade.php`, `resources/views/components/layouts/${layout}.blade.php`] : [])]);
			if (hit) out.push(hit);
		}
	} else if (file.endsWith('.php')) {
		for (const m of text.matchAll(/\b(?:include|require)(?:_once)?\s*\(?\s*(?:__DIR__\s*\.\s*)?['"]\/?([^'"]+\.php)['"]/g)) {
			const hit = find([posix.join(posix.dirname(file), m[1]), m[1]]);
			if (hit) out.push(hit);
		}
	} else if (file.endsWith('.ejs')) {
		for (const m of text.matchAll(/include\s*\(\s*['"]([^'"]+)['"]/g)) {
			const hit = named(m[1], ['.ejs']);
			if (hit) out.push(hit);
		}
	} else if (/\.(hbs|handlebars|mustache)$/.test(file)) {
		for (const m of text.matchAll(/\{\{>\s*([\w/.-]+)/g)) {
			const hit = named(m[1], ['.hbs', '.handlebars', '.mustache']) ?? files.find((f) => f.endsWith(`/${m[1]}.hbs`) || f.endsWith(`/${m[1]}.handlebars`));
			if (hit) out.push(hit);
		}
	}
	// Django, Jinja, Twig, Nunjucks, Liquid.
	for (const m of text.matchAll(/\{%-?\s*(?:extends|include|import|from|embed|render|layout)\s+["']([^"']+)["']/g)) {
		const hit = named(m[1], ['.html', '.liquid', '.twig', '.njk', '.jinja', '.jinja2']);
		if (hit) out.push(hit);
	}
	// A page's own stylesheets and scripts (href="style.css", src="app.js").
	for (const m of text.matchAll(/<(?:link|script)\b[^>]*(?:href|src)=["']([^"'{}<>]+\.(?:css|js|mjs))["']/gi)) {
		const href = m[1];
		if (/^(https?:)?\/\//.test(href)) continue;
		const hit = href.startsWith('/') ? find([href.slice(1), posix.join(project.publicDir === '.' ? '' : project.publicDir, href.slice(1))]) : find([posix.join(posix.dirname(file), href)]);
		if (hit) out.push(hit);
	}
	return out;
}

/** Angular components: selectors and their templates and styles. */
function angularParts(project: Project, files: string[]) {
	const selectors = new Map<string, string>();
	const parts = new Map<string, string[]>();
	for (const f of files.filter((x) => x.endsWith('.ts'))) {
		const text = read(project.root, f);
		if (!/@Component\s*\(/.test(text)) continue;
		const sel = text.match(/selector\s*:\s*['"`]([\w-]+)['"`]/)?.[1];
		if (sel) selectors.set(sel, f);
		const own: string[] = [];
		const t = text.match(/templateUrl\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
		if (t) own.push(posix.normalize(posix.join(posix.dirname(f), t)));
		const one = text.match(/styleUrl\s*:\s*['"`]([^'"`]+)['"`]/)?.[1];
		if (one) own.push(posix.normalize(posix.join(posix.dirname(f), one)));
		const many = text.match(/styleUrls\s*:\s*\[([^\]]*)\]/)?.[1];
		if (many) for (const m of many.matchAll(/['"`]([^'"`]+)['"`]/g)) own.push(posix.normalize(posix.join(posix.dirname(f), m[1])));
		parts.set(f, own.filter((x) => files.includes(x)));
	}
	return { selectors, parts };
}

export function buildGraph(project: Project): Graph {
	const files = sourceFiles(project);
	const set = new Set(files);
	const src = project.srcDir === '.' ? '' : `${project.srcDir}/`;
	const components = new Map<string, string>();
	const componentsDir = `${src}components`;
	const deps = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
	const auto = project.framework === 'nuxt' || !!deps['unplugin-vue-components'];
	for (const f of files) {
		const m = f.match(/([^/]+?)(\.component)?\.(vue|tsx|jsx|svelte|astro|ts|html\.erb|blade\.php|erb|php|hbs|ejs|liquid|twig|njk|html)$/);
		if (!m) continue;
		if (project.framework === 'nuxt' && f.endsWith('.vue') && f.startsWith(`${componentsDir}/`)) components.set(nuxtName(f, componentsDir), f);
		const base = pascal(m[1].replace(/^_/, ''));
		if (!components.has(base) && !/\.(ts|js)$/.test(f.replace(/\.component\.ts$/, '.vue'))) components.set(base, f);
		if (f.endsWith('.component.ts') && !components.has(base)) components.set(base, f);
	}
	const ng = project.framework === 'angular' ? angularParts(project, files) : undefined;
	const imports = new Map<string, Set<string>>();
	for (const f of files) {
		const text = read(project.root, f);
		const out = new Set<string>();
		if (/\.(vue|ts|js|mjs|tsx|jsx|svelte|astro)$/.test(f)) {
			for (const m of text.matchAll(IMPORTS)) {
				const r = resolveImport(project, f, m[1], set);
				if (r && r !== f) out.add(r);
			}
		}
		if (auto && f.endsWith('.vue')) {
			const template = text.match(/<template[\s\S]*<\/template>/)?.[0] ?? '';
			for (const m of template.matchAll(TAGS)) {
				const name = pascal(m[1]).replace(/^Lazy(?=[A-Z])/, '');
				const hit = components.get(name);
				if (hit && hit !== f && (project.framework === 'nuxt' ? hit.startsWith(`${componentsDir}/`) : true)) out.add(hit);
			}
		}
		if (ng) {
			for (const p of ng.parts.get(f) ?? []) out.add(p);
			// A template (its own file, or inline) uses child components by selector.
			const template = f.endsWith('.html') ? text : f.endsWith('.ts') ? (text.match(/template\s*:\s*`([\s\S]*?)`/)?.[1] ?? '') : '';
			for (const m of template.matchAll(/<([a-z][\w]*-[\w-]+)/g)) {
				const hit = ng.selectors.get(m[1]);
				if (hit && hit !== f) out.add(hit);
			}
		}
		if (/\.(html?|erb|php|hbs|handlebars|mustache|ejs|liquid|twig|njk|jinja2?|j2|astro|svelte)$/.test(f)) for (const e of templateEdges(project, f, text, files)) if (e !== f) out.add(e);
		imports.set(f, out);
	}
	// An Angular template's components reach their own files through the component class.
	if (ng) for (const [ts, own] of ng.parts) for (const p of own) for (const e of imports.get(p) ?? []) imports.get(ts)?.add(e);
	const { pages, note } = routesOf(project, files, set);
	const shell = shellOf(project, files, pages, imports);
	return { files, imports, pages, shell, components, routerNote: note };
}

// ---- Routes, by stack ----

const segment = (s: string) => s.replace(/^\[\.\.\.(\w+)\]$/, ':$1(.*)*').replace(/\[\[(\w+)\]\]/g, ':$1?').replace(/\[(\w+)\]/g, ':$1');
const fileRoute = (segs: string[]) => `/${segs.filter((s) => s && !/^\(.*\)$/.test(s) && !s.startsWith('@')).map(segment).join('/')}`;

function routesOf(project: Project, files: string[], set: Set<string>): { pages: Page[]; note?: string } {
	const src = project.srcDir === '.' ? '' : `${project.srcDir}/`;
	const pick = (re: RegExp, route: (m: RegExpMatchArray) => string) =>
		files.flatMap((file) => {
			const m = file.match(re);
			return m ? [{ route: route(m).replace(/\/+$/, '') || '/', file }] : [];
		});
	switch (project.framework) {
		case 'nuxt':
			return { pages: pick(new RegExp(`^${src}pages/(.+)\\.vue$`), (m) => fileRoute(m[1].split('/').filter((s, i, a) => !(i === a.length - 1 && s === 'index')))) };
		case 'vite-vue':
			return routerPages(project, files, set);
		case 'next': {
			const app = pick(new RegExp(`^${src}app/(?:(.*)/)?page\\.(tsx|jsx|js|mdx)$`), (m) => fileRoute((m[1] ?? '').split('/')));
			const pages = pick(new RegExp(`^${src}pages/(?!_|api/)(.+)\\.(tsx|jsx|js)$`), (m) => fileRoute(m[1].split('/').filter((s, i, a) => !(i === a.length - 1 && s === 'index'))));
			return { pages: [...app, ...pages] };
		}
		case 'sveltekit':
			return { pages: pick(/^src\/routes\/(?:(.*)\/)?\+page\.svelte$/, (m) => fileRoute((m[1] ?? '').split('/'))) };
		case 'astro':
			return { pages: pick(/^src\/pages\/(.+)\.(astro|md|mdx|html)$/, (m) => fileRoute(m[1].split('/').filter((s, i, a) => !(i === a.length - 1 && s === 'index')))) };
		case 'react-router':
			return reactRouterPages(project, files, set);
		case 'vite-react':
		case 'solid':
			return { pages: codeRoutes(project, files, set) };
		case 'angular':
			return angularRoutes(project, files, set);
		case 'rails':
			return railsRoutes(project, files);
		case 'laravel':
			return laravelRoutes(project, files);
		case 'django':
			return djangoRoutes(project, files);
		default: {
			// A plain site, PHP or templates: each page file (not a partial) is a route.
			const included = new Set<string>();
			for (const f of files) for (const e of templateEdges(project, f, read(project.root, f), files)) included.add(e);
			const pages = files
				.filter((f) => /\.(html?|php|hbs|ejs|liquid|twig|njk)$/.test(f) && !included.has(f) && !/(^|\/)(_[^/]*|partials?\/.*|includes?\/.*|layouts?\/.*|_includes\/.*|_layouts\/.*)$/.test(f) && !/(^|\/)(header|footer|nav|navbar|sidebar|layout|base)\.\w+$/.test(f))
				.map((file) => {
					const stem = file.replace(/^(views|pages|public|src)\//, '').replace(/\.\w+$/, '');
					return { route: stem === 'index' ? '/' : `/${stem.replace(/\/index$/, '')}`, file };
				});
			return { pages };
		}
	}
}

/** A Vue Router routes array, read where it is written statically: path, component (imported or lazy), children. */
function routerPages(project: Project, files: string[], set: Set<string>): { pages: Page[]; note?: string } {
	const routerFile = files.find((f) => /\.(ts|js)$/.test(f) && /\bcreateRouter\s*\(/.test(read(project.root, f)));
	if (!routerFile) return { pages: [], note: 'No Vue Router routes found: name pages by file.' };
	const text = read(project.root, routerFile);
	const idents = new Map<string, string>();
	for (const m of text.matchAll(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g)) {
		const r = resolveImport(project, routerFile, m[2], set);
		if (r) idents.set(m[1], r);
	}
	const opens: number[] = [];
	const objects: { start: number; end: number }[] = [];
	for (let i = 0; i < text.length; i++) {
		if (text[i] === '{') opens.push(i);
		else if (text[i] === '}' && opens.length) objects.push({ start: opens.pop()!, end: i });
	}
	type R = { start: number; end: number; path: string; file?: string };
	const routes: R[] = [];
	for (const m of text.matchAll(/\bpath\s*:\s*['"`]([^'"`]*)['"`]/g)) {
		const at = m.index ?? 0;
		const obj = objects.filter((o) => o.start < at && o.end > at).sort((a, b) => b.start - a.start)[0];
		if (!obj) continue;
		const body = text.slice(obj.start, obj.end);
		const own = body.replace(/children\s*:\s*\[[\s\S]*$/, '');
		const lazy = own.match(/component\s*:\s*\(\)\s*=>\s*import\(\s*['"]([^'"]+)['"]\s*\)/);
		const ident = own.match(/component\s*:\s*(\w+)/);
		const file = lazy ? resolveImport(project, routerFile, lazy[1], set) : ident ? idents.get(ident[1]) : undefined;
		routes.push({ start: obj.start, end: obj.end, path: m[1], file });
	}
	const pages: Page[] = [];
	for (const r of routes) {
		const parents = routes.filter((p) => p !== r && p.start < r.start && p.end > r.end).sort((a, b) => a.start - b.start);
		const full = posix.join('/', ...parents.map((p) => p.path), r.path).replace(/\/$/, '') || '/';
		if (r.file) pages.push({ route: full, file: r.file });
	}
	return { pages, note: routes.some((r) => !r.file) ? `Some routes in ${routerFile} have no statically readable component.` : undefined };
}

/** React Router 7 (framework mode): app/routes.ts (index, route, layout, prefix), or flat file routes. */
function reactRouterPages(project: Project, files: string[], set: Set<string>): { pages: Page[]; note?: string } {
	const appDir = project.srcDir === '.' ? 'app' : project.srcDir;
	const config = [`${appDir}/routes.ts`, `${appDir}/routes.js`].find((f) => set.has(f) || existsSync(join(project.root, f)));
	const pages: Page[] = [];
	const text = config ? read(project.root, config) : '';
	const ast = config ? parseScript(text, config) : undefined;
	const fileOf = (s: string) => {
		const rel = posix.normalize(posix.join(appDir, s));
		return set.has(rel) ? rel : undefined;
	};
	const str = (n: any) => (n?.type === 'StringLiteral' ? (n.value as string) : undefined);
	const visit = (node: any, prefix: string) => {
		if (!node) return;
		if (node.type === 'ArrayExpression') return node.elements.forEach((e: any) => visit(e, prefix));
		if (node.type === 'SpreadElement') return visit(node.argument, prefix);
		if (node.type !== 'CallExpression') return;
		const name = node.callee?.name;
		const a = node.arguments;
		if (name === 'index') {
			const f = fileOf(str(a[0]) ?? '');
			if (f) pages.push({ route: prefix || '/', file: f });
		} else if (name === 'route') {
			const path = posix.join(prefix || '/', str(a[0]) ?? '');
			const f = fileOf(str(a[1]) ?? '');
			if (f) pages.push({ route: path.replace(/\/$/, '') || '/', file: f });
			for (const x of a.slice(2)) visit(x, path);
		} else if (name === 'layout') for (const x of a.slice(1)) visit(x, prefix);
		else if (name === 'prefix') visit(a[1], posix.join(prefix || '/', str(a[0]) ?? ''));
		else if (name === 'flatRoutes') {
			for (const f of files.filter((x) => x.startsWith(`${appDir}/routes/`) && /\.(tsx|jsx|ts|js)$/.test(x))) {
				const rel = f.slice(`${appDir}/routes/`.length).replace(/\/route\.(tsx|jsx|ts|js)$/, '').replace(/\.(tsx|jsx|ts|js)$/, '');
				if (rel.includes('/')) continue;
				const segs = rel.split('.').filter((s) => !s.startsWith('_') || s === '_index').map((s) => (s === '_index' ? '' : s.replace(/^\$(\w+)$/, ':$1').replace(/_$/, '')));
				pages.push({ route: `/${segs.filter(Boolean).join('/')}`, file: f });
			}
		} else for (const x of a) visit(x, prefix);
	};
	if (ast) {
		const body = (ast as any).program?.body ?? [];
		for (const st of body) {
			const decl = st.type === 'ExportDefaultDeclaration' ? st.declaration : undefined;
			if (decl) visit(decl.type === 'TSSatisfiesExpression' || decl.type === 'TSAsExpression' ? decl.expression : decl, '');
		}
	}
	if (!pages.length) return { pages: codeRoutes(project, files, set), note: config ? undefined : 'No app/routes.ts found: name pages by file.' };
	return { pages };
}

/** Routes declared in code: <Route path element|component> and route objects (react-router, @solidjs/router). */
function codeRoutes(project: Project, files: string[], set: Set<string>): Page[] {
	const out: Page[] = [];
	for (const rel of files.filter((f) => /\.(tsx|jsx|ts|js)$/.test(f))) {
		const text = read(project.root, rel);
		if (!/\b(Route|createBrowserRouter|createHashRouter|createMemoryRouter|useRoutes|RouteObject|RouteDefinition)\b/.test(text) || !/\bpath\b/.test(text)) continue;
		const from = new Map<string, string>();
		for (const m of text.matchAll(/import\s+(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*["']([^"']+)["']/g)) {
			if (m[1]) from.set(m[1], m[3]);
			for (const part of (m[2] ?? '').split(',')) {
				const [orig, alias] = part.trim().split(/\s+as\s+/);
				if (orig) from.set((alias ?? orig).trim(), m[3]);
			}
		}
		for (const m of text.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:React\.)?lazy\(\s*\(\)\s*=>\s*import\(\s*["']([^"']+)["']/g)) from.set(m[1], m[2]);
		const fileOf = (name?: string) => (name && from.has(name) ? resolveImport(project, rel, from.get(name)!, set) : undefined);
		const add = (path: string, component?: string) => {
			const file = fileOf(component);
			const route = `/${path.replace(/^\/+/, '')}`.replace(/\/+$/, '') || '/';
			if (file && !out.some((r) => r.route === route)) out.push({ route, file });
		};
		const stack: { depth: number; path: string }[] = [];
		let depth = 0;
		for (const t of text.matchAll(/<(\/?)Route\b((?:[^>"'{]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})*?)(\/?)>/g)) {
			if (t[1]) {
				depth--;
				while (stack.length && stack[stack.length - 1].depth >= depth) stack.pop();
				continue;
			}
			const attrs = t[2];
			const own = attrs.match(/\bpath\s*=\s*(?:\{\s*)?["']([^"']*)["']/)?.[1];
			const index = /\bindex\b(?!\s*=\s*\{\s*false)/.test(attrs);
			const parent = stack.length ? stack[stack.length - 1].path : '';
			const path = own === undefined ? parent : own.startsWith('/') ? own : `${parent}/${own}`;
			const element = attrs.match(/\belement\s*=\s*\{\s*<\s*([A-Z]\w*)/)?.[1] ?? attrs.match(/\b[Cc]omponent\s*=\s*\{\s*([A-Z]\w*)/)?.[1];
			if (own !== undefined || index) add(path || '/', element);
			if (!t[3]) {
				stack.push({ depth, path: own === undefined ? parent : path });
				depth++;
			}
		}
		for (const m of text.matchAll(/\{\s*path\s*:\s*["']([^"']*)["']\s*,\s*(?:element\s*:\s*<\s*([A-Z]\w*)|[Cc]omponent\s*:\s*([A-Z]\w*))/g)) add(m[1], m[2] ?? m[3]);
	}
	return out;
}

/** Angular: the routes array (path with component, or loadComponent), children joined to their parents. */
function angularRoutes(project: Project, files: string[], set: Set<string>): { pages: Page[]; note?: string } {
	const routeFile = files.find((f) => /(^|\/)app\.routes\.ts$|routing\.module\.ts$/.test(f));
	if (!routeFile) return { pages: [], note: 'No Angular routes found: name pages by file.' };
	const text = read(project.root, routeFile);
	const ast = parseScript(text, routeFile);
	const from = new Map<string, string>();
	for (const m of text.matchAll(/import\s+\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) for (const n of m[1].split(',')) if (n.trim()) from.set(n.trim().split(/\s+as\s+/).pop()!, m[2]);
	const pages: Page[] = [];
	const visit = (node: any, prefix: string) => {
		if (!node) return;
		if (node.type === 'ArrayExpression') return node.elements.forEach((e: any) => visit(e, prefix));
		if (node.type !== 'ObjectExpression') return;
		const prop = (k: string) => node.properties.find((p: any) => p.key?.name === k)?.value;
		const path = prop('path')?.value as string | undefined;
		const full = posix.join(prefix || '/', path ?? '');
		const comp = prop('component');
		let file: string | undefined;
		if (comp?.type === 'Identifier' && from.has(comp.name)) file = resolveImport(project, routeFile, from.get(comp.name)!, set);
		const lazy = prop('loadComponent');
		if (lazy) {
			const spec = text.slice(lazy.start, lazy.end).match(/import\(\s*['"]([^'"]+)['"]/)?.[1];
			if (spec) file = resolveImport(project, routeFile, spec, set);
		}
		if (file && path !== undefined && path !== '**') pages.push({ route: full.replace(/\/$/, '') || '/', file });
		visit(prop('children'), full);
	};
	const walkAll = (n: any) => {
		if (!n || typeof n !== 'object') return;
		if (Array.isArray(n)) return n.forEach(walkAll);
		if (n.type === 'VariableDeclarator' && n.init?.type === 'ArrayExpression') visit(n.init, '');
		for (const k of Object.keys(n)) if (k !== 'loc' && n[k] && typeof n[k] === 'object') walkAll(n[k]);
	};
	walkAll(ast);
	return { pages };
}

/** Rails: views by controller and action, and the routes config's root and named paths. */
function railsRoutes(project: Project, files: string[]): { pages: Page[] } {
	const pages: Page[] = [];
	const routes = read(project.root, 'config/routes.rb');
	const view = (action: string) => files.find((f) => f === `app/views/${action.replace('#', '/')}.html.erb`);
	const root = routes.match(/^\s*root\s+(?:to:\s*)?["']([\w/]+#\w+)["']/m)?.[1];
	if (root && view(root)) pages.push({ route: '/', file: view(root)! });
	for (const m of routes.matchAll(/^\s*get\s+["']\/?([^"']*)["']\s*(?:,\s*to:\s*|=>\s*)["']([\w/]+#\w+)["']/gm)) if (view(m[2])) pages.push({ route: `/${m[1]}`.replace(/\/$/, '') || '/', file: view(m[2])! });
	for (const f of files.filter((x) => /^app\/views\/(?!layouts\/)(.+)\/([^_/][^/]*)\.html\.erb$/.test(x))) {
		if (pages.some((p) => p.file === f)) continue;
		const [, ctrl, action] = f.match(/^app\/views\/(.+)\/([^/]+)\.html\.erb$/)!;
		const route = action === 'index' ? `/${ctrl}` : action === 'show' ? `/${ctrl}/:id` : action === 'edit' ? `/${ctrl}/:id/edit` : `/${ctrl}/${action}`;
		pages.push({ route, file: f });
	}
	return { pages };
}

/** Laravel: routes/web.php (Route::view, Route::get returning view()), then views by name. */
function laravelRoutes(project: Project, files: string[]): { pages: Page[] } {
	const pages: Page[] = [];
	const web = read(project.root, 'routes/web.php');
	const view = (name: string) => files.find((f) => f === `resources/views/${name.replace(/\./g, '/')}.blade.php`);
	for (const m of web.matchAll(/Route::view\(\s*['"]([^'"]*)['"]\s*,\s*['"]([\w.-]+)['"]/g)) if (view(m[2])) pages.push({ route: `/${m[1].replace(/^\//, '')}`, file: view(m[2])! });
	for (const m of web.matchAll(/Route::get\(\s*['"]([^'"]*)['"][\s\S]*?view\(\s*['"]([\w.-]+)['"]/g)) if (view(m[2]) && !pages.some((p) => p.file === view(m[2]))) pages.push({ route: `/${m[1].replace(/^\//, '')}`, file: view(m[2])! });
	return { pages: pages.map((p) => ({ ...p, route: p.route.replace(/\{(\w+)\??\}/g, ':$1') })) };
}

/** Django: urls.py paths to views or TemplateView, and the template each view renders. */
function djangoRoutes(project: Project, files: string[]): { pages: Page[] } {
	const pages: Page[] = [];
	const py = (rel: string) => read(project.root, rel);
	const pyFiles: string[] = [];
	const collect = (dir: string) => {
		for (const name of readdirSync(join(project.root, dir))) {
			const rel = dir === '.' ? name : `${dir}/${name}`;
			if (SKIP.test(rel)) continue;
			if (statSync(join(project.root, rel)).isDirectory()) collect(rel);
			else if (name.endsWith('.py')) pyFiles.push(rel);
		}
	};
	collect('.');
	const template = (name: string) => files.find((f) => f.endsWith(`templates/${name}`)) ?? files.find((f) => f.endsWith(`/${name}`));
	const viewTemplates = new Map<string, string>();
	for (const f of pyFiles.filter((x) => /views\.py$/.test(x))) {
		const text = py(f);
		for (const m of text.matchAll(/def\s+(\w+)\s*\([^)]*\)\s*:([\s\S]*?)(?=\ndef\s|\nclass\s|$)/g)) {
			const t = m[2].match(/render\(\s*\w+\s*,\s*["']([^"']+)["']/)?.[1];
			if (t) viewTemplates.set(m[1], t);
		}
		for (const m of text.matchAll(/class\s+(\w+)\s*\([^)]*\)\s*:([\s\S]*?)(?=\nclass\s|\ndef\s|$)/g)) {
			const t = m[2].match(/template_name\s*=\s*["']([^"']+)["']/)?.[1];
			if (t) viewTemplates.set(m[1], t);
		}
	}
	for (const f of pyFiles.filter((x) => /urls\.py$/.test(x))) {
		for (const m of py(f).matchAll(/(?:re_)?path\(\s*r?["']([^"']*)["']\s*,\s*([^,)]+(?:\([^)]*\))?)/g)) {
			const [, path, target] = m;
			const t = target.match(/template_name\s*=\s*["']([^"']+)["']/)?.[1] ?? viewTemplates.get(target.trim().split('.').pop()!.replace(/\.as_view\(.*$/, '').replace(/\(.*$/, ''));
			const file = t ? template(t) : undefined;
			if (file) pages.push({ route: `/${path}`.replace(/<(?:\w+:)?(\w+)>/g, ':$1').replace(/\/$/, '') || '/', file });
		}
	}
	return { pages };
}

/** The shell: layouts and root components every page renders inside. */
function shellOf(project: Project, files: string[], pages: Page[], imports: Map<string, Set<string>>): string[] {
	const src = project.srcDir === '.' ? '' : `${project.srcDir}/`;
	const res: RegExp[] = [/^index\.html$/];
	switch (project.framework) {
		case 'nuxt':
		case 'vite-vue':
			res.push(new RegExp(`^${src}(app\\.vue|App\\.vue|layouts/.+\\.vue|error\\.vue)$`));
			break;
		case 'next':
			res.push(new RegExp(`^${src}(app/(.*/)?(layout|template)\\.(tsx|jsx|js)|pages/_(app|document)\\.(tsx|jsx|js))$`));
			break;
		case 'react-router':
			res.push(new RegExp(`^${src}root\\.(tsx|jsx)$`), new RegExp(`^${src}routes/.*layout\\.(tsx|jsx)$`));
			break;
		case 'vite-react':
		case 'solid':
		case 'vite-svelte':
			res.push(/^src\/(App|app|main|index)\.(tsx|jsx|ts|js|svelte)$/);
			break;
		case 'sveltekit':
			res.push(/^src\/routes\/(.*\/)?\+layout\.svelte$/, /^src\/app\.html$/);
			break;
		case 'astro':
			res.push(/^src\/layouts\//);
			break;
		case 'angular':
			res.push(/^src\/app\/app(\.component)?\.(ts|html|css|scss)$/, /^src\/index\.html$/);
			break;
		case 'rails':
			res.push(/^app\/views\/layouts\//);
			break;
		case 'laravel':
			res.push(/^resources\/views\/(layouts|components\/layouts)\//);
			break;
		default:
			break;
	}
	const pageFiles = new Set(pages.map((p) => p.file));
	const named = files.filter((f) => res.some((r) => r.test(f)) && !pageFiles.has(f));
	// Server templates: what pages extend (base.html, layout.twig) is the shell.
	if (['django', 'php', 'templates', 'html'].includes(project.framework)) {
		for (const f of files) {
			if (pageFiles.has(f)) continue;
			const users = [...imports].filter(([from, to]) => pageFiles.has(from) && to.has(f)).length;
			if (users && /<\/head>|<html\b/i.test(read(project.root, f))) named.push(f);
		}
	}
	return [...new Set(named)];
}

/**
 * Files reachable from a file through imports and auto-imported components. With `stop`, the walk does not enter
 * those files (other pages: a router file that imports every page does not make them its own).
 */
export function closure(graph: Graph, start: string, stop?: Set<string>): Set<string> {
	const seen = new Set<string>();
	const queue = [start];
	while (queue.length) {
		const f = queue.pop()!;
		if (seen.has(f)) continue;
		seen.add(f);
		for (const n of graph.imports.get(f) ?? []) if (!stop?.has(n) || n === start) queue.push(n);
	}
	return seen;
}

/** Does a page route match what a person typed (`/users/42`, `/users/:id`, `/users/[id]`, `/about.html`)? */
export function routeMatches(route: string, typed: string) {
	const norm = (r: string) => `/${r.replace(/^\/+|\/+$/g, '')}`.replace(/\[(\w+)\]/g, ':$1').replace(/\.(html?|php)$/, '').replace(/\/index$/, '') || '/';
	const a = norm(route).split('/');
	const b = norm(typed).split('/');
	if (a.join('/') === b.join('/')) return true;
	if (a.some((s) => s.includes('(.*)'))) return b.length >= a.length - 1 && a.slice(0, -1).every((s, i) => s.startsWith(':') || s === b[i]);
	return a.length === b.length && a.every((s, i) => s.startsWith(':') || s === b[i]);
}
