import { describe, expect, it } from 'vitest';
import { convertClassList, groupOf } from '../src/convert/classes.js';
import { convertCss } from '../src/convert/css.js';
import { StructureChanged, convertCode, convertVue, signature } from '../src/convert/file.js';

const all = { general: true, kinds: 'all' as const };
const twice = (text: string, opts: Parameters<typeof convertVue>[1]) => {
	const first = convertVue(text, opts).text;
	expect(convertVue(first, opts).text, 'a second run changes nothing').toBe(first);
	return first;
};
const vue = (template: string, script = '') => `<script setup lang="ts">\n${script}\n</script>\n\n<template>\n${template}\n</template>\n`;

describe('classes', () => {
	it('reads the brand type steps as sizes, not colors (text-ui, text-label, text-heading-1)', () => {
		expect(groupOf('text-ui')).toBe('type');
		expect(groupOf('text-label')).toBe('type');
		expect(groupOf('text-heading-1')).toBe('type');
		expect(groupOf('text-[length:var(--ds-text-ui)]')).toBe('type');
		expect(groupOf('text-fg-muted')).toBe('text-color');
	});
	it('maps palette colors by role and lightness', () => {
		expect(convertClassList('bg-white text-gray-900 border-gray-200', {})).toBe('bg-surface text-fg border-edge');
		expect(convertClassList('bg-gray-900 text-slate-300 hover:text-white', {})).toBe('bg-surface-inverse text-fg-inverse/70 hover:text-fg-inverse');
		expect(convertClassList('bg-indigo-600 hover:bg-indigo-700', {})).toBe('bg-action-primary hover:bg-action-primary-hover');
		expect(convertClassList('text-neutral-700', {})).toBe('text-fg-soft');
	});
	it('leaves children and relations alone ([&_svg]:size-4, has-[>svg]:px-3)', () => {
		expect(groupOf('[&_svg:not([class*=size-])]:size-4')).toBe('other');
		expect(groupOf('has-data-[icon=inline-end]:pr-2')).toBe('other');
	});
	it('replaces a shadow with a hairline ring, dark on a dark fill', () => {
		expect(convertClassList('rounded-lg bg-white p-4 shadow-md', {})).toBe('rounded-container bg-surface p-4 ring-1 ring-edge');
		expect(convertClassList('bg-slate-900 shadow-lg', {})).toBe('bg-surface-inverse ring-1 ring-fg-soft');
	});
	it('writes sizes a class merger keeps when the app merges classes (cn, tailwind-merge)', () => {
		expect(convertClassList('text-sm text-gray-500', { merge: true })).toBe('text-[length:var(--ds-text-ui)] text-fg-muted');
	});
	it('names the transition properties and snaps durations to the steps', () => {
		expect(convertClassList('transition-all duration-300 ease-in', {})).toBe('transition-colors duration-300 ease-out');
		expect(convertClassList('transition hover:scale-105 duration-[250ms]', {})).toBe('transition-[color,background-color,border-color,transform,translate,scale,rotate] hover:scale-105 duration-250');
	});
});

describe('kinds', () => {
	it('gives a bare <button> the default look once (idempotent)', () => {
		const out = twice(vue('  <button>Save</button>'), all);
		// One primary per view: a button the app gave no look takes the secondary.
		expect(out).toContain('bg-action-secondary text-action-secondary-fg');
		expect(out).toContain('h-control-md px-4 type-ui-strong rounded-control');
	});
	it('keeps a tab state string the app toggles (and is idempotent)', () => {
		const out = twice(vue(`  <div role="tablist" class="flex rounded-lg bg-gray-100 p-1">\n    <button role="tab" class="rounded-md px-4 py-1.5 text-sm" :class="on ? 'bg-white text-gray-900 shadow' : 'text-gray-500'">A</button>\n  </div>`, 'const on = true'), all);
		expect(out).toContain(":class=\"on ? 'bg-surface text-fg ring-1 ring-edge' : 'text-fg-muted'\"");
	});
	it('does not add a static class to a root whose look is bound from script (BaseButton)', () => {
		const src = vue('  <button :class="[base, variants[variant]]"><slot /></button>', "const variant = 'primary'\nconst base = 'rounded-lg px-4 py-2 text-sm font-semibold transition-all'\nconst variants: Record<string, string> = { primary: 'bg-indigo-600 text-white', secondary: 'bg-white border border-gray-300 text-gray-700', danger: 'bg-red-600 text-white', ghost: 'text-indigo-600 hover:bg-indigo-50' }\nconst sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-sm' }");
		const out = twice(src, { ...all, componentKind: 'button' });
		expect(out).not.toMatch(/<button class=/);
		expect(out).toContain("primary: 'bg-action-primary text-action-primary-fg");
		expect(out).toContain("secondary: 'bg-action-secondary text-action-secondary-fg");
		// The brand has no danger button: a destructive one takes the secondary (elements.json fallbacks).
		expect(out).toContain("danger: 'bg-action-secondary text-action-secondary-fg");
		expect(out).toContain("ghost: 'bg-transparent text-fg");
		// A size string takes only the size part of the look.
		expect(out).toMatch(/sm: 'h-control-md px-4 type-ui-strong'/);
		expect(out).not.toMatch(/sm: '[^']*transition/);
	});
	it("takes a cva's variants by their keys (shadcn's ghost has no color at rest)", () => {
		const code = "import { cva } from 'class-variance-authority'\nexport const buttonVariants = cva('inline-flex rounded-md text-sm font-medium transition-all border border-transparent', { variants: { variant: { default: 'bg-primary text-primary-foreground', destructive: 'bg-destructive/10 text-destructive', outline: 'border-border bg-background', ghost: 'hover:bg-muted hover:text-foreground' }, size: { default: 'h-8 px-2.5', icon: 'size-8' } } })\n";
		const out = convertCode(code, { general: true, kinds: 'all', componentKind: 'button', merge: true }).text;
		expect(convertCode(out, { general: true, kinds: 'all', componentKind: 'button', merge: true }).text).toBe(out);
		expect(out).toContain("ghost: 'bg-transparent text-fg hover:enabled:bg-action-ghost-hover");
		expect(out).toContain("default: 'bg-action-primary text-action-primary-fg");
		expect(out).toContain("destructive: 'bg-action-secondary");
		expect(out).toMatch(/cva\('inline-flex items-center justify-center gap-2 cursor-pointer h-control-md/);
		expect(out).toMatch(/icon: '[^']*w-control-md px-0/);
	});
	it("gives a cn() root of a kind with no variants its whole look, once (shadcn's Input)", () => {
		const src = vue("  <input :class=\"cn('border-input h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base w-full min-w-0 placeholder:text-muted-foreground', props.class)\">", "const props = defineProps<{ class?: string }>()\nconst cn = (...a: unknown[]) => a.join(' ')");
		const out = twice(src, { ...all, componentKind: 'input', merge: true });
		expect(out).toContain('h-control-md w-full border border-edge-strong bg-surface px-3 type-ui text-fg rounded-control');
		expect(out).toContain('min-w-0');
	});
	it('sizes a heading from its own size class', () => {
		expect(twice(vue('  <h1 class="text-7xl font-extrabold">Acme</h1>'), all)).toContain('<h1 class="type-display">');
		expect(twice(vue('  <h1 class="text-5xl font-extrabold">Acme</h1>'), all)).toContain('<h1 class="type-hero">');
		expect(twice(vue('  <h2 class="text-2xl font-bold text-gray-900">Acme</h2>'), all)).toContain('<h2 class="text-fg type-heading-3">');
	});
	it('gives the main action on a dark band the variant that shows there, not a fill that vanishes', () => {
		// The band takes the inverse surface (White on this Black brand), where the White primary would vanish.
		const out = twice(vue('  <section class="bg-gray-900 text-white">\n    <button class="rounded-lg bg-indigo-500 px-6 py-3 text-white">Start</button>\n  </section>'), all);
		expect(out).toContain('bg-surface-inverse');
		expect(out).toContain('bg-action-secondary');
		expect(out).not.toContain('bg-action-primary ');
		// Off the band, the same button is the primary.
		expect(twice(vue('  <button class="rounded-lg bg-indigo-500 px-6 py-3 text-white">Start</button>'), all)).toContain('bg-action-primary text-action-primary-fg');
	});
	it('keeps a tinted panel tinted instead of making it a white card', () => {
		const out = twice(vue('  <div class="rounded-lg border border-red-200 bg-red-50 p-6">Danger zone</div>'), all);
		expect(out).toContain('bg-surface-danger');
	});
	it('restyles only the named kinds in a component scope', () => {
		const src = vue('  <div class="bg-blue-50 p-4">\n    <button class="rounded bg-blue-600 px-4 py-2 text-white">Go</button>\n    <input class="rounded border-gray-300">\n  </div>');
		const out = twice(src, { general: false, kinds: new Set(['button']) });
		expect(out).toContain('<div class="bg-blue-50 p-4">');
		expect(out).toContain('<input class="rounded border-gray-300">');
		// The band it sits on stays the app's light blue, where the White primary would vanish: it takes the secondary.
		expect(out).toContain('bg-action-secondary');
		const plain = twice(vue('  <button class="rounded bg-blue-600 px-4 py-2 text-white">Go</button>'), { general: false, kinds: new Set(['button']) });
		expect(plain).toContain('bg-action-primary');
	});
});

describe('css', () => {
	it('points shadcn theme variables at the brand roles and keeps @theme indirections', () => {
		const css = '@theme inline {\n  --color-primary: var(--primary);\n  --font-heading: var(--font-sans);\n}\n:root {\n  --primary: oklch(0.205 0 0);\n  --radius: 0.625rem;\n}\n.dark {\n  --primary: oklch(0.922 0 0);\n}\n';
		const out = convertCss(css);
		expect(out).toContain('--color-primary: var(--primary);');
		expect(out).toContain('--font-heading: var(--ds-font-heading);');
		expect(out).toContain('--primary: var(--ds-color-action-primary);');
		expect(out).toContain('--radius: var(--ds-radius-control);');
		expect(out).toMatch(/\.dark \{\n {2}--primary: var\(--ds-color-white\);/);
	});
	it('converts a rule by role and adds a hairline where a shadow was', () => {
		const out = convertCss('.card { box-shadow: 0 1px 3px rgba(0,0,0,.1); border-radius: 12px; color: #374151; transition: all .2s ease-in; font-weight: 700; padding: 13px; }');
		expect(out).toContain('box-shadow: none');
		expect(out).toContain('border-radius: var(--ds-radius-container)');
		expect(out).toContain('color: var(--ds-color-fg-soft)');
		expect(out).toContain('opacity var(--ds-duration-enter) var(--ds-easing-out)');
		expect(out).toContain('padding: 14px');
		expect(out).toContain('border: var(--ds-border-hairline) solid var(--ds-color-edge);');
		expect(convertCss(out)).toBe(out);
	});
	it('converts @apply lists as classes', () => {
		expect(convertCss('.b { @apply bg-blue-600 text-white rounded-lg; }')).toBe('.b { @apply bg-action-primary text-fg-inverse rounded-container; }');
	});
});

describe('structure check', () => {
	it('ignores style values but sees copy, elements and code', () => {
		const a = vue('  <p class="text-sm">Hello</p>', "const x = 'bg-red-500 p-2'");
		expect(signature(a, 'vue')).toBe(signature(a.replace('text-sm', 'text-body').replace('bg-red-500', 'bg-surface'), 'vue'));
		expect(signature(a, 'vue')).not.toBe(signature(a.replace('Hello', 'Hi'), 'vue'));
		expect(signature(a, 'vue')).not.toBe(signature(a.replace('<p ', '<span ').replace('</p>', '</span>'), 'vue'));
		expect(signature(a, 'vue')).not.toBe(signature(a.replace('const x', 'let x'), 'vue'));
		expect(StructureChanged).toBeTypeOf('function');
	});
	it('never changes copy, attributes other than class and style, or code', () => {
		const src = vue('  <a href="/pricing" class="text-blue-600">Pricing, from $12</a>\n  <img src="/logo.png" alt="Acme" class="h-8 rounded-lg shadow">', "const href = '/pricing'");
		const out = convertVue(src, all).text;
		expect(signature(out, 'vue')).toBe(signature(src, 'vue'));
		expect(out).toContain('Pricing, from $12');
		expect(out).toContain("const href = '/pricing'");
	});
});
