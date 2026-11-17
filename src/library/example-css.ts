import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { packageRoot } from '../lib/brand.js';

// The CSS an element example's layout classes need on a page without Tailwind. The examples lay their elements out
// with the theme's utilities (flex, gap-4, type-meta, md:grid-cols-[...]), as the Vue and React examples do; a page with
// no Tailwind has none of them, so `view` prints each example with this stylesheet after it: exactly those utilities,
// compiled against the brand theme (so values are var(--ds-*) tokens), in a layer the page's own styles win over.

const require = createRequire(import.meta.url);

/** The class names written in an example's markup (its class attributes). */
export function exampleClasses(html: string): string[] {
	const out = new Set<string>();
	for (const m of html.matchAll(/\bclass="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) out.add(c);
	return [...out];
}

/** The utilities those classes are, compiled with the brand theme; empty when none of them is a utility. */
export async function exampleCss(html: string): Promise<string> {
	const classes = exampleClasses(html);
	if (!classes.length) return '';
	const { compile } = await import('tailwindcss');
	const twDir = dirname(require.resolve('tailwindcss/package.json'));
	const theme = readFileSync(join(packageRoot, 'build', 'theme.css'), 'utf8');
	const compiler = await compile(`@import "tailwindcss/theme.css" theme(inline);\n${theme}\n@tailwind utilities;\n`, {
		base: packageRoot,
		loadStylesheet: async (id: string) => {
			const path = id === 'tailwindcss/theme.css' || id === 'tailwindcss/theme' ? join(twDir, 'theme.css') : id;
			return { path, base: dirname(path), content: readFileSync(path, 'utf8') };
		},
	} as any);
	// Only the rules: the theme's variables are the brand's (var(--ds-*)), which brand.css defines. Tailwind's @property
	// registrations stay at the top level (they cannot sit in a layer) and its fallback block for old browsers goes.
	let css = dropBlock(dropBlock(compiler.build(classes).replace(/^\/\*! tailwindcss[^\n]*\n/, ''), '@layer theme'), '@layer properties').replace(/@layer properties;\s*/g, '');
	const props = css.match(/@property[^{]*\{[^}]*\}/g) ?? [];
	for (const p of props) css = css.replace(p, '');
	css = css.trim();
	if (!css) return '';
	// Tailwind's preflight, for the example's own elements only: no UA margins on its text and lists, and its controls
	// in the page's type, as they are on a page with Tailwind.
	const own = `:where(${classes.map((c) => `.${cssEscape(c)}`).join(', ')})`;
	const reset = `:where(p, h1, h2, h3, h4, h5, h6, ul, ol, dl, dd, pre, figure, blockquote)${own} { margin: 0; }\n:where(ul, ol)${own} { padding: 0; list-style: none; }\n:where(button, input, select, textarea)${own} { font: inherit; color: inherit; }`;
	return `@layer ds-example {\n${reset}\n${css}\n}${props.length ? `\n${props.join('\n')}` : ''}`;
}

/** The CSS without the block that opens with `head` (nested braces counted). */
function dropBlock(css: string, head: string): string {
	for (;;) {
		const at = css.search(new RegExp(`${head.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`));
		if (at < 0) return css;
		let depth = 0;
		let i = css.indexOf('{', at);
		for (; i < css.length; i++) {
			if (css[i] === '{') depth++;
			else if (css[i] === '}' && --depth === 0) break;
		}
		css = css.slice(0, at) + css.slice(i + 1);
	}
}

/** A class name as a CSS selector part (md:grid-cols-[112px_minmax(0,1fr)] has characters to escape). */
const cssEscape = (c: string) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
