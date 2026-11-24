import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { Check } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import '@/elements/components/ui/badge'
import '@/elements/components/ui/button'
import '@/elements/components/visuals/brand-light'
import styles from 'virtual:tw'

// PricingTable.tsx as <spyglass-pricing-table>: the site's plan grid from `plans` ({ name, description, price, unit,
// badge, featured, cta, href, ladder, features }), the featured plan lit with the ice fill and the light at its edge.
export interface PricingPlan { name: string; description?: string; price: string; unit?: string; badge?: string; featured?: boolean; cta?: string; href?: string; ladder?: string; features?: string[] }

/**
 * @summary The site's plan grid: up to four plans, one lit.
 */
export class PricingTable extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="pricing-table"]'))
	static properties = { plans: { type: Array }, seed: { type: Number } }
	plans: PricingPlan[] = []
	/** The light's seed for the featured plan. */
	seed = 0

	render() {
		return html`<ul data-ds="pricing-table" role="list" class="m-0 grid list-none grid-cols-1 gap-px border border-edge bg-edge p-0 text-fg md:grid-cols-2 xl:grid-cols-4">${(this.plans ?? []).map((p) => html`<li class="flex flex-col gap-6 bg-surface p-4 xl:p-6"><div class=${p.featured ? 'relative isolate flex min-h-52 flex-col gap-2 overflow-hidden rounded-panel p-6 bg-plan-ice text-(--ds-color-black)' : 'relative isolate flex min-h-52 flex-col gap-2 overflow-hidden rounded-panel p-6 bg-surface-raised'}>${p.featured ? html`<spyglass-brand-light variant="strip-right" seed=${this.seed} cover class="absolute inset-y-0 right-0 -z-10 w-2/5 mask-l-from-40%"></spyglass-brand-light>` : nothing}<div class="flex items-center justify-between gap-3"><h3 class="type-heading-2">${p.name}</h3>${p.badge ? html`<spyglass-badge>${p.badge}</spyglass-badge>` : nothing}</div>${p.description ? html`<p class=${p.featured ? 'max-w-[55%] type-ui text-(--ds-color-neutral-4)' : 'max-w-[55%] type-ui text-fg-soft'}>${p.description}</p>` : nothing}<p class="mt-auto flex flex-wrap items-baseline gap-x-2 pt-8"><span class="type-figure">${p.price}</span>${p.unit ? html`<span class=${p.featured ? 'type-ui text-(--ds-color-neutral-6)' : 'type-ui text-fg-muted'}>${p.unit}</span>` : nothing}</p></div>${p.cta ? html`<spyglass-button href=${ifDefined(p.href)} variant=${p.featured ? 'primary' : 'secondary'} class="w-full">${p.cta}</spyglass-button>` : nothing}${p.ladder || p.features?.length ? html`<div class="flex flex-col gap-3 border-t border-edge pt-6">${p.ladder ? html`<p class="type-ui-strong text-fg">${p.ladder}</p>` : nothing}${p.features?.length ? html`<ul role="list" class="m-0 flex list-none flex-col gap-2 p-0 type-ui text-fg-soft">${p.features.map((f) => html`<li class="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-x-2">${icon(Check, 'check', { size: 16, strokeWidth: 1.5, class: 'mt-0.5 text-fg-muted', attrs: { 'aria-hidden': 'true' } })}${f}</li>`)}</ul>` : nothing}</div>` : nothing}</li>`)}</ul>`
	}
}

define('pricing-table', PricingTable)
