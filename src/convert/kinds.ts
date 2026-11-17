import { type Change, type Group, colorOf, groupOf, parseClass, textPx } from './classes.js';
import { type Color, type Kind, type Recipe, elements } from './color.js';

// The kinds of element apply knows (button, input, card, dialog...): which elements and app components are of each
// kind, and how a class list takes the library item's look (brand/elements.json) while keeping its layout classes.

export type KindName = string;
export type Hit = { kind: KindName; part?: 'th' | 'td' | 'tab' | 'backdrop' | 'heading' };

export const kinds = () => elements().kinds;
export const kindNames = () => Object.keys(kinds());

/** `PrimaryButton`, `primary_button` and `primary-button` all as `primary-button`. */
export const kebab = (name: string) =>
	name
		.replace(/\.(component\.(ts|html)|blade\.php|html\.erb|vue|tsx|jsx|ts|js|svelte|astro|html|erb|php|hbs|ejs|liquid|twig|njk|jinja2?)$/, '')
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.replace(/[_\s]+/g, '-')
		.toLowerCase();

/** The kind an app component is by its file name (`BaseButton.vue`, `ui/button/Button.vue`), if any. */
export function kindOfComponent(fileName: string): KindName | undefined {
	const name = kebab(fileName.split('/').pop() ?? fileName);
	for (const [k, def] of Object.entries(kinds())) if (new RegExp(def.names).test(name)) return k;
	return undefined;
}

const unprefixed = (tokens: string[]) => tokens.map(parseClass).filter((p) => p.variants.every((v) => /^(sm|md|lg|xl|2xl)$/.test(v)));

export type Look = { bg?: Color; text?: Color; border: boolean; padding: boolean; radius: boolean; shadow: boolean; display: boolean; size?: string; fixedInset: boolean };

/** What a class list looks like at rest: its fill, text color, edge, padding. */
export function lookOf(tokens: string[]): Look {
	const look: Look = { border: false, padding: false, radius: false, shadow: false, display: false, fixedInset: false };
	const flat = unprefixed(tokens);
	for (const p of flat) {
		const raw = p.utility;
		const g = groupOf(raw);
		const value = raw.replace(/^[a-z]+(-[xytrblse])?-/, '');
		if (g === 'bg' && !look.bg) {
			const c = colorOf(raw.replace(/^(bg|from)-/, ''));
			if (c && c !== 'none' && c.alpha > 0.05) look.bg = c;
		} else if (g === 'text-color' && !look.text) {
			const c = colorOf(raw.replace(/^text-/, ''));
			if (c && c !== 'none') look.text = c;
		} else if (g === 'border-width') look.border = !/-0$/.test(raw) && !flat.some((x) => /^border-transparent$/.test(x.utility));
		else if (g === 'border-color' && colorOf(value) !== 'none') look.border = true;
		else if (g === 'padding') look.padding = true;
		else if (g === 'radius' && !/-none$/.test(raw)) look.radius = true;
		else if (g === 'shadow' && !/-none$/.test(raw)) look.shadow = true;
		else if (g === 'type' && /^text-/.test(raw)) look.size = raw.slice(5);
		if (/^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden|contents|table)$/.test(raw)) look.display = true;
		if (raw === 'fixed' && tokens.some((t) => /^inset-0$/.test(t))) look.fixedInset = true;
	}
	return look;
}

/** Does a class list set its own colors at rest (a fill, a text color, an edge), not only for states or children? */
const hasColor = (tokens: string[]) =>
	tokens.some((t) => {
		const p = parseClass(t);
		if (!p.variants.every((v) => /^(sm|md|lg|xl|2xl|dark)$/.test(v)) || !['bg', 'text-color', 'border-color'].includes(groupOf(t))) return false;
		return colorOf(p.utility.replace(/^(bg|text|border(?:-[xytrblse])?|from)-/, '')) !== 'none';
	});

/** The library variant a class list plays, by its object key (`destructive:`) or else by its colors. */
export function variantOf(kind: KindName, tokens: string[], key?: string): string | undefined {
	const def = kinds()[kind];
	if (!def.variants) return undefined;
	if (key) for (const [v, keys] of Object.entries(def.keys ?? {})) if (keys.includes(key.toLowerCase())) return v;
	if (!tokens.length) return def.default;
	// Already in a variant's look (a second run): its own fill says which, so the result does not depend on values the
	// first run converted.
	for (const [v, recipe] of Object.entries(def.variants)) {
		const fill = recipe.split(/\s+/).find((c) => /^bg-/.test(c) && c !== 'bg-transparent');
		if (fill && tokens.includes(fill) && Object.entries(def.variants).filter(([, r]) => r.split(/\s+/).includes(fill)).length === 1) return v;
	}
	const look = lookOf(tokens);
	// A role the brand has no variant for falls back along brand.json's elements `fallbacks` (danger -> secondary).
	const pick = (role: string) => [role, ...(def.fallbacks?.[role] ?? [])].find((v) => def.variants![v]) ?? def.default;
	if (kind === 'button') {
		if (tokens.some((t) => /^bg-edge-accent$/.test(t))) return pick('primary');
		if (look.bg && look.bg.l < 0.6) return pick(look.bg.family === 'danger' ? 'danger' : 'dark');
		if (look.text?.family === 'danger') return pick('danger');
		if (look.bg || look.border) return pick('secondary');
		return pick('ghost');
	}
	if (kind === 'badge') {
		if (look.bg?.family === 'danger' || look.text?.family === 'danger') return 'failed';
		if (look.bg && look.bg.l < 0.5) return 'working';
		if ((!look.bg || look.bg.family === 'neutral') && look.text && look.text.family === 'neutral' && look.text.l > 0.3) return 'quiet';
		return 'default';
	}
	if (kind === 'alert') return [look.bg, look.text].some((c) => c?.family === 'danger') || look.border && tokens.some((t) => /red|rose|danger|destructive/.test(t)) ? 'danger' : 'default';
	return def.default;
}

/** Which kind a raw element is, from its tag, attributes and classes. */
export function kindOfElement(tag: string, attrs: Record<string, string | true>, tokens: string[]): Hit | undefined {
	const t = tag.toLowerCase();
	const role = typeof attrs.role === 'string' ? attrs.role : '';
	const type = typeof attrs.type === 'string' ? attrs.type.toLowerCase() : '';
	const look = lookOf(tokens);
	if (role === 'tablist') return { kind: 'tabs' };
	if (role === 'tab') return { kind: 'tabs', part: 'tab' };
	if (role === 'dialog' || role === 'alertdialog' || t === 'dialog') return { kind: 'dialog' };
	if (role === 'alert') return { kind: 'alert' };
	if (role === 'switch') return undefined;
	if (t === 'button' || (t === 'input' && /^(submit|button|reset)$/.test(type))) return { kind: 'button' };
	if (t === 'input') return /^(checkbox|radio)$/.test(type) ? { kind: 'checkbox' } : /^(file|range|color|hidden|image)$/.test(type) ? undefined : { kind: 'input' };
	if (t === 'textarea') return { kind: 'textarea' };
	if (t === 'select') return { kind: 'select' };
	if (t === 'table') return { kind: 'table' };
	if (t === 'th') return { kind: 'table', part: 'th' };
	if (t === 'td') return { kind: 'table', part: 'td' };
	if (t === 'label') return { kind: 'label' };
	if (/^h[1-6]$/.test(t)) return { kind: 'typography', part: 'heading' };
	if (/^(a|router-link|routerlink|nuxt-link|nuxtlink)$/.test(t) && tokens.some((x) => /^(btn|button)$/.test(x))) return { kind: 'button' };
	if (/^(a|router-link|routerlink|nuxt-link|nuxtlink)$/.test(t)) {
		if (look.padding && ((look.bg && look.bg.alpha > 0.5) || look.border)) return { kind: 'button' };
		if ((look.text && look.text.family === 'accent') || tokens.some((x) => /(^|:)underline$/.test(x))) return { kind: 'link' };
		return undefined;
	}
	// Component libraries' own tags and class names: Angular Material, Shoelace, Bootstrap and plain CSS naming.
	if (/^(mat-card|sl-card|ion-card)$/.test(t)) return { kind: 'card' };
	if (/^(mat-chip|mat-chip-option|sl-badge|sl-tag|ion-badge|ion-chip)$/.test(t)) return { kind: 'badge' };
	if (/^(mat-tab-group|sl-tab-group)$/.test(t)) return { kind: 'tabs' };
	if (/^(sl-button|ion-button)$/.test(t)) return { kind: 'button' };
	const named = (re: RegExp) => tokens.some((x) => re.test(x));
	if (/^(a|router-link|routerlink|nuxt-link|nuxtlink)$/.test(t) && named(/^(btn|button)$/)) return { kind: 'button' };
	if (/^(div|section|article|li|aside)$/.test(t) && named(/^(card|panel|tile)$/)) return { kind: 'card' };
	if (/^(span|small|div)$/.test(t) && named(/^(badge|tag|chip|pill)$/)) return { kind: 'badge' };
	if (/^(div|section|p)$/.test(t) && named(/^(alert|callout|notice)$/)) return { kind: 'alert' };
	if (look.fixedInset && look.bg && look.bg.family === 'neutral' && look.bg.l < 0.3 && look.bg.alpha < 1) return { kind: 'dialog', part: 'backdrop' };
	if (/^(div|section|article|li|aside|form|fieldset)$/.test(t) && look.padding && (look.shadow || (look.border && look.radius)) && (!look.bg || (look.bg.l > 0.85 && look.bg.family === 'neutral'))) return { kind: 'card' };
	if (/^(span|small|div|p)$/.test(t) && look.padding && look.radius && (look.bg || look.border) && /^(xs|\[1[01]px\]|\[12px\])$/.test(look.size ?? '') && tokens.some((x) => /^p[xy]?-(0\.5|1|1\.5|2|2\.5|3)$/.test(x))) return { kind: 'badge' };
	return undefined;
}

const recipeOf = (kind: KindName, part?: Hit['part']): Recipe => {
	const def = kinds()[kind] as Kind;
	if (part === 'th' && def.th) return def.th;
	if (part === 'td' && def.td) return def.td;
	if (part === 'tab' && def.tab) return def.tab;
	if (part === 'backdrop') return { replace: ['bg'], base: def.backdrop ?? '' };
	return def;
};

/** The type utility a heading takes, from its size class or its level. */
function headingType(tag: string, tokens: string[]): string {
	const size = tokens.map(parseClass).find((p) => !p.prefix && /^text-/.test(p.utility) && groupOf(p.utility) === 'type')?.utility.slice(5);
	const px = size ? textPx(size) : undefined;
	if (px === undefined) {
		const level = Number(tag.slice(1));
		const existing = tokens.find((x) => /^type-/.test(x));
		if (existing) return existing;
		return `type-heading-${Math.min(level, 4)}`;
	}
	for (const [name, min] of Object.entries(elements().text.headings)) if (px >= min) return `type-${name}`;
	return 'type-heading-4';
}

/** A token holding template code (a placeholder for `{{ size }}`, `<%= x %>`, `{expr}`): kept exactly where it is. */
export const opaque = (t: string) => t.includes('\u0000');

/** Whether the band an element sits on calls for elements.json's onBand swap: a dark band, or a light one. */
const bandSwap = (def: Kind, onDark: boolean | undefined) => !!def.onBand && def.variants?.[def.onBand.to] !== undefined && (def.onBand.when === 'dark' ? onDark === true : onDark === false);

export type RestyleOptions = { tag?: string; key?: string; onDark?: boolean; merge?: boolean; variant?: 'base' | 'variant' | 'both' | 'size'; changes?: Change[]; tokensForVariant?: string[] };

/**
 * A class list in a kind's look: the classes of the groups the recipe replaces go, the recipe's come in; layout,
 * spacing between elements and anything else stays.
 */
export function restyle(text: string, hit: Hit, opts: RestyleOptions = {}): string {
	const recipe = recipeOf(hit.kind, hit.part);
	const tokens = text.split(/\s+/).filter(Boolean);
	const def = kinds()[hit.kind] as Kind;
	const anchor = !!opts.tag && !/^(button|input)$/i.test(opts.tag);
	const keep = tokens.filter((t) => opaque(t) || !recipe.replace.includes(groupOf(t) as Group));
	let add: string[] = [];
	const which = opts.variant ?? 'both';
	if (which === 'size') add.push(...recipe.base.split(/\s+/).filter((t) => t && ['padding', 'height', 'type'].includes(groupOf(t))));
	else if (which !== 'variant') add.push(...recipe.base.split(/\s+/).filter(Boolean));
	if (hit.part === 'heading') add.push(headingType(opts.tag ?? 'h2', opts.tokensForVariant?.length ? opts.tokensForVariant : tokens));
	if (def.variants && !hit.part && which !== 'base' && which !== 'size') {
		let v = variantOf(hit.kind, opts.tokensForVariant ?? tokens, opts.key) ?? def.default;
		// On a band where the main action would vanish (an ink button on a dark band, a White one on a light band), it
		// takes the variant elements.json names (onBand). onDark is undefined outside any band.
		if (v && bandSwap(def, opts.onDark) && v === def.onBand?.from) v = def.onBand.to;
		else if (v === 'dark' && !def.onBand && opts.onDark === true && def.variants.primary) v = 'primary';
		if (v && def.variants[v]) add.push(...def.variants[v].split(/\s+/));
	}
	if (hit.kind === 'button' && opts.key && /^icon/.test(opts.key) && def.icon) add.push(...def.icon.split(/\s+/));
	if (anchor && hit.kind === 'button') {
		add = add.filter((t) => !t.startsWith('disabled:')).map((t) => t.replace(/^(hover|active):enabled:/, '$1:'));
		if (!keep.some((t) => /^(block|inline|inline-block|flex|inline-flex|grid|inline-grid|hidden)$/.test(t))) add.unshift('inline-flex', 'items-center', 'justify-center');
	}
	// Class mergers (tailwind-merge, cn) read text-meta as a color and drop it beside text-fg: sizes go as lengths.
	if (opts.merge) add = add.map((t) => { const p = parseClass(t); const m = p.utility.match(/^text-([\w-]+)$/); return m && groupOf(t) === 'type' && !/^\[/.test(m[1]) ? `${p.prefix}text-[length:var(--ds-text-${m[1]})]` : t; });
	const addSet = new Set(add);
	const out = [...keep.filter((t) => !addSet.has(t)), ...[...new Set(add)]];
	if (out.join(' ') === tokens.join(' ')) return text;
	opts.changes?.push({ from: tokens.filter((t) => !out.includes(t)).join(' ') || '(none)', to: `${hit.kind}${hit.part ? ` ${hit.part}` : ''}: ${out.filter((t) => !tokens.includes(t)).join(' ')}` });
	const lead = text.match(/^\s*/)?.[0] ?? '';
	const trail = text.match(/\s*$/)?.[0] ?? '';
	return `${lead}${out.join(' ')}${trail}`;
}

export { hasColor };

/** The class a kind (or one of its parts, or one of its variants) takes in an app without Tailwind (kinds.css). */
export const semanticClass = (kind: string, suffix?: string) => `ds-${kind}${suffix ? `-${suffix}` : ''}`;

/**
 * A class list given a kind's look in an app without Tailwind: the kind's class from kinds.css (and its variant's),
 * added beside the app's own classes, which all stay. The variant comes from the app's class names (btn-danger) or
 * from what the app's stylesheets give those classes (`look`, as Tailwind-like tokens).
 */
export function restyleSemantic(text: string, hit: Hit, opts: RestyleOptions & { look?: string[] } = {}): string {
	const tokens = text.split(/\s+/).filter(Boolean);
	const def = kinds()[hit.kind] as Kind;
	const own = (t: string) => t === semanticClass(hit.kind) || t.startsWith(`${semanticClass(hit.kind)}-`) || (hit.part === 'heading' && /^ds-type-/.test(t));
	// Already given the look (a second run): what it was given stays, so the result does not depend on values the first
	// run converted.
	const has = (t: string) => tokens.includes(t);
	if (hit.part === 'heading' ? tokens.some((t) => /^ds-type-/.test(t)) : hit.part ? has(semanticClass(hit.kind, hit.part)) : has(semanticClass(hit.kind)) && (!def.variants || (opts.variant ?? 'both') === 'base' || Object.keys(def.variants).some((v) => has(semanticClass(hit.kind, v))))) return text;
	const keep = tokens.filter((t) => !own(t));
	const add: string[] = [];
	const which = opts.variant ?? 'both';
	if (hit.part === 'heading') add.push(`ds-${headingType(opts.tag ?? 'h2', opts.look ?? [])}`);
	else if (hit.part) add.push(semanticClass(hit.kind, hit.part));
	else if (which !== 'variant') add.push(semanticClass(hit.kind));
	if (def.variants && !hit.part && which !== 'base' && which !== 'size') {
		const named = keep.map((t) => t.toLowerCase().split(/[-_]+/)).flat();
		let v: string | undefined;
		for (const [variant, keys] of Object.entries(def.keys ?? {})) if (keys.some((k) => named.includes(k))) v ??= variant;
		v ??= variantOf(hit.kind, opts.look ?? [], opts.key) ?? def.default;
		if (v && bandSwap(def, opts.onDark) && v === def.onBand?.from) v = def.onBand.to;
		else if (v === 'dark' && !def.onBand && opts.onDark === true && def.variants.primary) v = 'primary';
		if (v && def.variants[v]) add.push(semanticClass(hit.kind, v));
	}
	if (hit.kind === 'button' && opts.key && /^icon/.test(opts.key) && def.icon) add.push(semanticClass('button', 'icon'));
	const out = [...keep, ...add];
	if (out.join(' ') === tokens.join(' ')) return text;
	opts.changes?.push({ from: tokens.filter((t) => !out.includes(t)).join(' ') || '(none)', to: `${hit.kind}${hit.part ? ` ${hit.part}` : ''}: ${add.join(' ')}` });
	const lead = text.match(/^\s*/)?.[0] ?? '';
	const trail = text.match(/\s*$/)?.[0] ?? '';
	return `${lead}${out.join(' ')}${trail}`;
}

/** Does this class list paint a dark fill (a dark band, a dark header)? Its children sit on dark. */
export function paintsDark(tokens: string[]): boolean | undefined {
	const bg = lookOf(tokens).bg;
	if (!bg || bg.alpha < 0.5) return undefined;
	return bg.l < 0.3;
}
