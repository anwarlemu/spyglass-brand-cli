import { brand } from '../lib/brand.js';
import type { Project } from './project.js';

// Types for the web components an app has added, so `<prefix-button variant="dark">` type-checks in React (TSX),
// Svelte and Astro, and `document.querySelector('prefix-button')` knows its properties. Each module's .d.ts (built
// with the registry, standing alone: every type it names is declared in it) goes into one file in the app's source
// folder, each in its own namespace (two modules may declare the same type), with the tag map and the JSX hooks of the
// frameworks the app uses.

export type ModuleTypes = { name: string; dts: string };

/** One module's declaration as a namespace body (its tag map taken out, to be merged into one), and its tags. */
function wrap(m: ModuleTypes) {
	const tags: [string, string][] = [];
	for (const t of m.dts.matchAll(/'([a-z][\w-]*-[\w-]*)'\s*:\s*(\w+)\s*;/g)) tags.push([t[1], t[2]]);
	const body = m.dts.replace(/declare global\s*\{[\s\S]*$/, '').replace(/^export declare class/gm, 'export class');
	return { body, tags };
}

const space = (name: string) => `${name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())}Element`;

/** The types file for these modules, with the JSX hooks for the app's frameworks. */
export function elementTypes(project: Pick<Project, 'pkg' | 'framework'>, modules: ModuleTypes[]): string {
	const deps: Record<string, string> = { ...project.pkg.dependencies, ...project.pkg.devDependencies };
	const parts = modules.map((m) => ({ space: space(m.name), ...wrap(m) }));
	const tags = parts.flatMap((p) => p.tags.map(([tag, cls]) => ({ tag, type: `${p.space}.${cls}` })));
	const lines = [
		`// Types for the ${brand().name} web components in this app, written by \`${brand().bin} add\` (it rewrites this file on every add).`,
		'// The element classes, the tag map for querySelector and createElement, and the JSX hooks for the frameworks the app uses.',
	];
	const react = !!deps.react || !!deps['@types/react'];
	const svelte = !!deps.svelte;
	if (react) lines.push("import type { DetailedHTMLProps, HTMLAttributes as ReactAttributes } from 'react'");
	if (svelte) lines.push("import type { HTMLAttributes as SvelteAttributes } from 'svelte/elements'");
	lines.push('');
	for (const p of parts) lines.push(`export declare namespace ${p.space} {`, ...p.body.trim().split('\n').map((l) => `  ${l}`), '}');
	lines.push(
		'',
		'/** An element\'s properties as JSX props: its own fields, each optional (methods and HTMLElement\'s members left out). */',
		'type ElementProps<E> = { [K in keyof E as K extends keyof HTMLElement ? never : E[K] extends (...args: never[]) => unknown ? never : K]?: E[K] }',
		'/** As markup attributes (Svelte, Astro): a list, an object or a date may also be written as its attribute, JSON or an',
		' * ISO date. React sets every prop as a property, so it takes the values themselves. */',
		'type ElementAttrs<E> = { [K in keyof ElementProps<E>]?: ElementProps<E>[K] | (NonNullable<ElementProps<E>[K]> extends string | number | boolean ? never : string) }',
		'',
		'declare global {',
		'  interface HTMLElementTagNameMap {',
		...tags.map((t) => `    '${t.tag}': ${t.type}`),
		'  }',
	);
	if (project.framework === 'astro') {
		lines.push('  namespace astroHTML.JSX {', '    interface IntrinsicElements {', ...tags.map((t) => `      '${t.tag}': HTMLAttributes & ElementAttrs<${t.type}>`), '    }', '  }');
	}
	lines.push('}');
	if (react) lines.push('', "declare module 'react' {", '  namespace JSX {', '    interface IntrinsicElements {', ...tags.map((t) => `      '${t.tag}': DetailedHTMLProps<ReactAttributes<${t.type}>, ${t.type}> & ElementProps<${t.type}> & { class?: string }`), '    }', '  }', '}');
	if (svelte) lines.push('', "declare module 'svelte/elements' {", '  interface SvelteHTMLElements {', ...tags.map((t) => `    '${t.tag}': SvelteAttributes<${t.type}> & ElementAttrs<${t.type}>`), '  }', '}');
	return `${lines.join('\n')}\n`;
}

/** The custom elements manifest narrowed to these modules (editors and analyzers read it next to the modules). */
export function narrowManifest(manifest: string, modules: string[]): string {
	const m = JSON.parse(manifest) as { modules?: { path: string }[] };
	const keep = new Set(modules.map((x) => `elements/${x.replace(/^elements\//, '')}`));
	return `${JSON.stringify({ ...m, modules: (m.modules ?? []).filter((x) => keep.has(x.path)) }, null, 2)}\n`;
}
