import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define } from '@/elements/lib/element'
import { navIcon, navIconStyles } from '@/elements/components/site/nav-icon'
import { headerMenus, type OfferRow, type ResourcesMenu, type SoonRow, type UseCasesMenu } from '@/lib/site-header'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'
import { imageFit, toSlot } from '@/lib/image'
import { styleMap } from 'lit/directives/style-map.js'

// MenuPanels.tsx as template functions (the header's nav renders them in its own shadow root, with these styles) and
// as <spyglass-menu-panels panel="use-cases|resources" menu='{...}'> on its own: the use cases panel (rows and the card
// crossfading to the active row) and the resources panel (rows, the coming-soon row, the docs card with the light).
export const ROW = 'group/row flex gap-3 rounded-ds-sm p-3 transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:bg-surface-raised data-active:bg-surface-raised'
export const GLYPH = 'grid flex-none place-items-center border border-edge bg-surface transition-[border-color] duration-160 ease-out group-hover/row:border-edge-strong group-hover/row:[--glyph-body:var(--ds-color-neutral-7)] group-hover/row:[--glyph-lit:var(--ds-color-fg)] group-focus-visible/row:border-edge-strong group-focus-visible/row:[--glyph-body:var(--ds-color-neutral-7)] group-focus-visible/row:[--glyph-lit:var(--ds-color-fg)] group-data-active/row:border-edge-strong group-data-active/row:[--glyph-body:var(--ds-color-neutral-7)] group-data-active/row:[--glyph-lit:var(--ds-color-fg)] [&_path]:transition-[fill,stroke] [&_path]:duration-160 [&_path]:ease-out'
export const STRIP = 'flex items-center gap-2 border-t border-edge py-1 pr-1 pl-4'
export const STRIP_LINK = 'flex h-8 items-center rounded-ds-sm px-2 type-ui-strong text-fg transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:bg-surface-raised'
export const menuPanelsStyles = styles

export const offerRowBody = (item: OfferRow | SoonRow) => html`<span class=${`${GLYPH} size-10 rounded-control`}>${navIcon(item.icon, 24)}</span><span class="flex min-w-0 flex-col"><span class="type-ui-strong text-fg">${item.name}</span><span class="type-ui text-fg-muted">${item.line}</span></span>`

export const useCasesPanel = (menu: UseCasesMenu, active: number, onActive: (i: number) => void) => {
	const rows = menu.rows
	const current = rows[active] ?? rows[0]
	return html`<div data-ds="menu-panels" class="contents"><div class="flex gap-1 p-1"><ul class="grid min-w-0 flex-1 grid-flow-col grid-cols-2 grid-rows-3 content-start gap-1">${rows.map((item, i) => html`<li><a class=${ROW} href=${item.href} data-active=${ifDefined(i === active ? '' : undefined)} @pointerenter=${() => onActive(i)} @focus=${() => onActive(i)}><span class=${`${GLYPH} size-10 rounded-control`}>${navIcon(item.icon, 24)}</span><span class="flex min-w-0 flex-col"><span class="type-ui-strong text-fg">${item.name}</span><span class="type-ui text-fg-muted">${item.line}</span></span></a></li>`)}</ul>${current ? html`<a href=${current.href} tabindex="-1" aria-hidden="true" class="relative grid w-72 flex-none overflow-hidden rounded-ds-sm bg-surface-raised p-2 [contain:size]">${rows.map((item, i) => html`<span data-on=${ifDefined(i === active ? '' : undefined)} class="flex min-h-0 flex-col opacity-0 transition-opacity duration-160 ease-out [grid-area:1/1] data-on:opacity-100"><span class="grid min-h-0 flex-none grid-cols-3 gap-1">${[0, 1, 2].map((n) => { const shot = toSlot(item.shots?.[n]); return html`<span data-ds-placeholder=${ifDefined(shot.src ? undefined : '')} class="relative aspect-4/5 overflow-hidden rounded-ds-sm bg-surface-subtle">${shot.src ? html`<img src=${shot.src} alt=${shot.alt ?? ''} loading="eager" class="absolute inset-0 size-full object-cover" style=${styleMap(imageFit(shot) ?? {})}>` : nothing}</span>` })}</span><span class="flex min-w-0 flex-none flex-col px-1 pt-2 pb-1"><span class="type-ui-strong text-fg">${item.name}</span><span class="line-clamp-2 type-ui text-fg-muted">${item.card ?? item.line}</span></span></span>`)}</a>` : nothing}</div><div class=${STRIP}><a class=${STRIP_LINK} href=${menu.all.href}>${menu.all.label}</a><ul class="flex gap-1">${menu.more.map((link) => html`<li><a class=${`${STRIP_LINK} font-regular text-fg-muted`} href=${link.href}>${link.label}</a></li>`)}</ul></div></div>`
}

export const resourcesPanel = (menu: ResourcesMenu) => {
	const docs = menu.feature
	return html`<div data-ds="menu-panels" class="flex gap-1 p-1"><ul class="relative isolate flex w-64 flex-none flex-col gap-1">${menu.rows.map((row) => html`<li>${row.soon ? html`<span aria-disabled="true" class="group/row flex h-12 cursor-default items-center gap-3 rounded-ds-sm px-3 type-ui text-fg-faint"><span class=${`${GLYPH} size-8 rounded-ds-sm [--glyph-body:var(--ds-color-neutral-4)] [--glyph-lit:var(--ds-color-fg-faint)]`}>${navIcon(row.icon)}</span>${row.title}<span class="ml-auto inline-flex h-6 items-center rounded-ds-sm bg-surface-inset px-2 type-caption font-medium text-fg-soft">${menu.soonLabel}</span></span>` : html`<a href=${row.href} target=${ifDefined(row.external ? '_blank' : undefined)} rel=${ifDefined(row.external ? 'noreferrer' : undefined)} class="group/row flex h-12 items-center gap-3 rounded-ds-sm px-3 type-ui-strong text-fg transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:bg-surface-raised"><span class=${`${GLYPH} size-8 rounded-ds-sm`}>${navIcon(row.icon)}</span>${row.title}</a>`}</li>`)}</ul><a href=${docs.href} target=${ifDefined(docs.external ? '_blank' : undefined)} rel=${ifDefined(docs.external ? 'noreferrer' : undefined)} class="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-ds-sm bg-surface-raised p-2 transition-[background-color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] [contain:size] hover:bg-surface-hover"><span aria-hidden="true" class="relative min-h-0 flex-1 overflow-hidden bg-surface"><span class="ds-docs-wave absolute inset-0"><span class="ds-docs-ribbon absolute -inset-6 translate-y-6"><spyglass-brand-light variant="curved-strip" ground="false" cover class="absolute inset-0"></spyglass-brand-light></span></span><code class="absolute top-3 left-3 font-code text-(length:--ds-text-caption) leading-(--ds-text-caption-leading) whitespace-nowrap text-fg-soft"><span class="text-fg-faint">$</span> ${docs.code}</code></span><span class="flex min-w-0 flex-none flex-col px-1 pt-3 pb-1"><span class="type-ui-strong text-fg">${docs.title}</span><span class="type-ui text-fg-muted">${docs.line}</span></span></a></div>`
}

/** @summary A header menu panel on its own: use cases or resources. */
export class MenuPanels extends DsElement {
	static styles = [DsElement.styles, navIconStyles, styles]
	static properties = { panel: {}, menu: { type: Object }, active: { state: true } }
	/** use-cases or resources. */
	panel: 'use-cases' | 'resources' = 'use-cases'
	/** The menu's content (lib/site-header.ts headerMenus.useCases or .resources by default). */
	menu?: UseCasesMenu | ResourcesMenu
	private active = 0

	render() {
		return this.panel === 'resources'
			? resourcesPanel((this.menu as ResourcesMenu) ?? headerMenus.resources)
			: useCasesPanel((this.menu as UseCasesMenu) ?? headerMenus.useCases, this.active, (i) => (this.active = i))
	}
}

define('menu-panels', MenuPanels)
