import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { brand, elementPrefix, packageRoot, registryHost } from '../lib/brand.js';
import { readProject, stackLabel, unsupported } from '../library/project.js';
import { appFlavor } from '../library/flavors.js';
import type { Project } from '../library/project.js';
import { readState } from '../lib/state.js';
import { scopeTheme, tailwindDefaults, themeDeclarations } from '../install/theme.js';
import { brandCss, insertImports, insertLinks, kindsCss, linkLines, tailwind3Preset, wirePreset } from '../install/stylesheets.js';

// init: the brand stylesheet where the app loads its styles (imported by its main stylesheet when a build processes
// it, linked from its base layouts when not), the theme for its Tailwind (4: theme.css; 3: a preset), kinds.css when
// it has no Tailwind, the fonts and textures in its static folder, and the agent contract. It changes no component
// and no copy.

export type InitResult = { project: Project; writes: string[]; warnings: string[]; base: 'whole app' | 'scoped'; styling: 'tailwind 4' | 'tailwind 3' | 'plain css'; links: string[] };

const START = '<!-- ds:contract:start -->';
const END = '<!-- ds:contract:end -->';

// An app with no package.json has no installed CLI: its agent runs the package straight from its source with npx.
const fill = (text: string, project?: Project) => text.replaceAll('{{brand}}', brand().name).replaceAll('{{cli}}', project && !project.node ? `npx -y ${brand().source}` : `npx ${brand().bin}`).replaceAll('{{bin}}', brand().bin).replaceAll('{{registryHost}}', registryHost()).replaceAll('{{registry}}', brand().registryUrl).replaceAll('{{source}}', brand().source).replaceAll('{{elementPrefix}}', elementPrefix());

/** A path from one file's folder to another file, as an import spec (`./<bin>/brand.css`, `../styles/x.css`). */
const spec = (fromFile: string, to: string) => {
	const rel = posix.relative(posix.dirname(fromFile), to);
	return rel.startsWith('.') ? rel : `./${rel}`;
};

/**
 * `whole`: the base layer for every page (a whole-app apply). Otherwise (a selection, a plain add or init) the brand
 * installs its tokens, theme and fonts, and its base reaches only the library's components and what a selection
 * restyled; an app that applied the whole app keeps the base (.ds/state.json).
 */
export async function init(root: string, opts: { dryRun?: boolean; whole?: boolean; skipLayouts?: string[] } = {}): Promise<InitResult> {
	const project = readProject(root);
	const writes: string[] = [];
	const warnings: string[] = [];
	const links: string[] = [];
	const write = (rel: string, content: string) => {
		// Unchanged files are not rewritten (or reported), so a second run changes nothing.
		if (existsSync(join(root, rel)) && readFileSync(join(root, rel), 'utf8') === content) return;
		writes.push(rel);
		if (opts.dryRun) return;
		mkdirSync(dirname(join(root, rel)), { recursive: true });
		writeFileSync(join(root, rel), content);
	};
	const read = (rel: string) => (existsSync(join(root, rel)) ? readFileSync(join(root, rel), 'utf8') : '');
	const build = join(packageRoot, 'build');
	if (!existsSync(join(build, 'brand.css'))) throw new Error('build/ is missing: run the package build first');
	// Nothing is written where the theme cannot work: a clear message with the fix instead of a half-set-up app.
	const problem = unsupported(project);
	if (problem) throw new Error(problem);

	const b = brand();
	const whole = opts.whole ?? readState(root)?.whole === true;
	const styling: InitResult['styling'] = (project.tailwind ?? 0) >= 4 ? 'tailwind 4' : project.tailwind === 3 ? 'tailwind 3' : 'plain css';
	const brandFile = whole ? 'brand.css' : 'brand-scoped.css';
	const publicRoot = project.publicDir === '.' ? '' : `${project.publicDir}/`;
	const assets = `${publicRoot}${b.assetBase.replace(/^\//, '')}`;
	const tw3 = styling === 'tailwind 3' ? tailwind3Preset(whole) : undefined;
	const extra = styling === 'plain css' ? await kindsCss() : undefined;

	// Where the stylesheets go: beside the main stylesheet when a build processes it, else in the static folder.
	let css = project.css;
	if (!css && project.bundler && (project.framework === 'nuxt' || project.framework === 'vite-vue') && styling === 'tailwind 4') {
		css = `${project.srcDir === '.' ? '' : `${project.srcDir}/`}assets/css/main.css`;
		warnings.push(`No main stylesheet found: created ${css}. Nuxt: add it to \`css\` in nuxt.config; Vite: import it in main.ts.`);
	}
	if (css && project.bundler) {
		const dsDir = posix.join(posix.dirname(css), b.bin);
		const current = read(css);
		write(posix.join(dsDir, 'brand.css'), brandCss(brandFile, project.publicUrl) + (tw3?.scope ? `\n${tw3.scope}` : ''));
		const imports = [`@import "./${b.bin}/brand.css";`];
		if (styling === 'tailwind 4') {
			const theme = readFileSync(join(build, 'theme.css'), 'utf8');
			write(posix.join(dsDir, 'theme.css'), whole ? theme : scopeTheme(theme, themeDeclarations(current), tailwindDefaults(root)).theme);
			imports.push(`@import "./${b.bin}/theme.css";`);
		}
		if (extra) {
			write(posix.join(dsDir, 'kinds.css'), extra);
			imports.push(`@import "./${b.bin}/kinds.css";`);
		}
		if (!imports.every((l) => current.includes(l))) {
			let next = current.replace(/^\s*@import\s+["']\.\/[\w-]+\/(brand|theme|kinds)\.css["'];\s*\n?/gm, '');
			const tw = next.match(/@import\s+["']tailwindcss["'][^;]*;\n?/);
			if (tw) next = next.replace(tw[0], `${tw[0].trimEnd()}\n${imports.join('\n')}\n`);
			else if (styling === 'tailwind 4') next = `@import "tailwindcss";\n${imports.join('\n')}\n${next}`;
			else {
				// @import goes first: after @charset and the app's own @import lines.
				const lead = next.match(/^(?:\s*(?:@charset[^;]*;|@import[^;]*;|@use[^;]*;)[ \t]*\n?)*/)?.[0] ?? '';
				next = `${lead}${lead && !lead.endsWith('\n') ? '\n' : ''}${imports.join('\n')}\n${next.slice(lead.length)}`;
			}
			write(css, next);
		}
		if (tw3) {
			const presetFile = posix.join(dsDir, 'tailwind-preset.cjs');
			write(presetFile, tw3.preset);
			const config = project.tailwindConfig;
			const presetSpec = config ? spec(config, presetFile) : undefined;
			const wired = config && presetSpec ? wirePreset(read(config), presetSpec) : undefined;
			if (config && wired !== undefined) {
				if (wired !== read(config)) write(config, wired);
			} else warnings.push(`Add the preset to your Tailwind config: presets: [require('./${presetFile}')]${config ? ` (${config} could not be edited safely)` : ''}.`);
		}
	} else if (project.bundler && project.cssEntry && /\.(tsx|jsx|ts|js|astro)$/.test(project.cssEntry)) {
		// A build with no global stylesheet: the entry (app/layout.tsx, main.ts) imports the brand's.
		const dsDir = posix.join(posix.dirname(project.cssEntry), b.bin);
		write(posix.join(dsDir, 'brand.css'), brandCss(brandFile, project.publicUrl));
		const specs = [`./${b.bin}/brand.css`];
		if (extra) {
			write(posix.join(dsDir, 'kinds.css'), extra);
			specs.push(`./${b.bin}/kinds.css`);
		}
		const code = read(project.cssEntry);
		const next = project.cssEntry.endsWith('.astro') ? code.replace(/^(\s*---\s*\n)/, (m) => `${m}${specs.map((s) => `import '${s}';`).join('\n')}\n`) : insertImports(code, specs);
		if (next !== code) write(project.cssEntry, next);
		if (styling === 'tailwind 4') warnings.push(`No Tailwind stylesheet found: add @import "./${b.bin}/theme.css" (written beside brand.css) after @import "tailwindcss" in yours.`);
	} else {
		// No build for CSS: the stylesheets sit in the static folder beside the fonts, linked from every base layout.
		write(`${assets}/brand.css`, brandCss(brandFile, 'relative') + (tw3?.scope ? `\n${tw3.scope}` : ''));
		const files = ['brand.css'];
		if (extra) {
			write(`${assets}/kinds.css`, extra);
			files.push('kinds.css');
		}
		if (styling === 'tailwind 4') {
			write(`${assets}/theme.css`, readFileSync(join(build, 'theme.css'), 'utf8'));
			warnings.push(`Tailwind runs without a stylesheet this could find: add @import "${relative(root, join(root, assets, 'theme.css'))}" after @import "tailwindcss" in its input.`);
		}
		const lines = linkLines(project, files);
		links.push(...lines);
		let linked = 0;
		// A page outside a selection (a plain site's other pages each have their own <head>) stays byte for byte.
		for (const layout of project.layouts) {
			if (opts.skipLayouts?.includes(layout)) {
				linked++;
				continue;
			}
			const text = read(layout);
			const next = insertLinks(text, lines);
			if (next === undefined) continue;
			linked++;
			if (next !== text) write(layout, next);
		}
		if (!linked) warnings.push(`No layout with a <head> found: add these lines to the <head> of every page:\n  ${lines.join('\n  ')}`);
	}

	// Fonts and textures, served at the brand's asset base.
	for (const sub of ['fonts', 'textures']) {
		const fresh = readdirSync(join(build, sub)).some((f) => !existsSync(join(root, assets, sub, f)));
		if (!fresh) continue;
		writes.push(posix.join(assets, sub));
		if (!opts.dryRun) cpSync(join(build, sub), join(root, assets, sub), { recursive: true });
	}

	// Agent contract and guide.
	const guide = fill(readFileSync(join(packageRoot, 'brand', 'agent-guide.md'), 'utf8'), project);
	write('.ds/agent-guide.md', guide);
	const contract = fill(readFileSync(join(packageRoot, 'brand', 'contract.md'), 'utf8'), project).replace('{{appNote}}', appNote(project)).replace(/\n{3,}/g, '\n\n').trim();
	const agents = read('AGENTS.md');
	const blockText = `${START}\n${contract}\n${END}`;
	const nextAgents = agents.includes(START) ? agents.replace(new RegExp(`${START}[\\s\\S]*?${END}`), blockText) : `${agents ? `${agents.trimEnd()}\n\n` : ''}${blockText}\n`;
	if (nextAgents !== agents) write('AGENTS.md', nextAgents);
	return { project, writes, warnings, base: whole ? 'whole app' : 'scoped', styling, links };
}

/** The contract's line about this app: its flavor and what using the library takes here. */
export function appNote(project: Project): string {
	const b = brand();
	const p = elementPrefix();
	const where = `${stackLabel(project.framework)}`;
	const flavor = appFlavor(project);
	if (flavor === 'vue') return `- In this app (${where}): the Vue flavor, in ${project.srcDir === '.' ? '' : `${project.srcDir}/`}components/ (\`import Button from '@/components/ui/Button.vue'\`${project.framework === 'nuxt' ? ', or auto-imported as <UiButton>' : ''}).`;
	if (flavor === 'react') return `- In this app (${where}): the React flavor, in ${project.srcDir === '.' ? '' : `${project.srcDir}/`}components/ (\`import { Button } from '@/components/ui/Button'\`). ${project.framework === 'next' ? 'Server components can render them; callbacks and render props belong in client components.' : ''}`.trimEnd();
	const src = project.framework === 'django' ? `{% static '${b.assetBase.replace(/^\//, '')}/elements/<name>.js' %}` : `${project.publicUrl}${b.assetBase}/elements/<name>.js`;
	const extra = project.framework === 'angular' ? ' Add schemas: [CUSTOM_ELEMENTS_SCHEMA] to each component that uses them.' : project.framework === 'nuxt' || project.framework === 'vite-vue' ? ` Vue needs isCustomElement for the ${p}- prefix (add sets it where it can).` : '';
	return `- In this app (${where}): the web components (<${p}-button> and the rest). Load each on the pages that use it with <script type="module" src="${src}"> (add prints the lines); lists and objects are properties, events are DOM events.${extra}`;
}

export const describeProject = (p: Project) => `${stackLabel(p.framework)} app`;
