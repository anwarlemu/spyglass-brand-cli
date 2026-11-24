import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { ASCII_TEXTURE } from '@/lib/textures'
import { ASCII_TEXTURE_ALPHA, PLAN_LIGHTS, type PlanLight } from '@/lib/plan-lights'
import '@/elements/components/ui/button'
import '@/elements/components/site/segmented'
import styles from 'virtual:tw'

// PricingTable.tsx as <spyglass-pricing-table>: the site's plan cards: the billing switch (when a plan has a `yearly`
// price) over the `note`, then the plans ({ name, description, price, unit, yearly, tag, badge, featured, light, rim,
// cta, href, ladder, features }) in a hairline grid, one lit with its tier light (a fine pointer resting on another
// lights that one), the `rim` plan with the light running around its edge. `value` is monthly or yearly, with
// `billing-change`.
export interface PricingPlan { name: string; description?: string; price: string; unit?: string; yearly?: { price: string; unit?: string }; tag?: string; badge?: string; featured?: boolean; light?: PlanLight; rim?: boolean; cta?: string; href?: string; ladder?: string; features?: string[] }
export type Billing = 'monthly' | 'yearly'

const LIGHTS: PlanLight[] = ['free', 'creator', 'pro', 'enterprise']
const check = html`<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" class="mt-0.5 size-4 text-fg-muted"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" stroke-width="1.5"></path></svg>`

/**
 * @summary The site's plan cards, with the billing switch.
 * @fires billing-change - The switch moved ({ value }).
 */
export class PricingTable extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="pricing-table"]'))
	static properties = { plans: { type: Array }, billing: { type: Object }, note: { type: Object }, value: {} }
	plans: PricingPlan[] = []
	/** The switch's words: { label, monthly, yearly }. */
	billing?: { label?: string; monthly?: string; yearly?: string }
	/** The line under the switch: { lead, rest }. */
	note?: { lead: string; rest?: string }
	/** monthly or yearly. */
	value: Billing = 'monthly'
	private io?: IntersectionObserver
	private seen = false

	private sync = () => {
		const root = this.renderRoot.querySelector<HTMLElement>('.ds-plans')
		if (root) root.dataset.run = String(this.seen && document.visibilityState === 'visible')
	}
	protected firstUpdated() {
		const root = this.renderRoot.querySelector<HTMLElement>('.ds-plans')
		if (!root) return
		this.io = new IntersectionObserver(([e]) => { this.seen = e.isIntersecting; this.sync() })
		this.io.observe(root)
		document.addEventListener('visibilitychange', this.sync)
	}
	disconnectedCallback() {
		super.disconnectedCallback()
		this.io?.disconnect()
		document.removeEventListener('visibilitychange', this.sync)
	}
	private pick(e: Event) {
		e.stopPropagation()
		const v = (e.target as HTMLElement & { value: Billing }).value
		if (v === this.value) return
		this.value = v
		this.emit('billing-change', { value: v })
	}

	render() {
		const plans = this.plans ?? []
		const period = this.value ?? 'monthly'
		const b = this.billing ?? {}
		const opts = [{ key: 'monthly', label: b.monthly ?? 'Monthly' }, { key: 'yearly', label: b.yearly ?? 'Yearly' }]
		return html`<div data-ds="pricing-table" class="flex flex-col text-fg">${plans.some((p) => p.yearly) ? html`<div class="mb-8 flex justify-center"><spyglass-segmented label=${b.label ?? 'Billing'} .options=${opts} value=${period} @change=${this.pick} @input=${(e: Event) => e.stopPropagation()}></spyglass-segmented></div>` : nothing}${this.note ? html`<p class="-mt-4 mb-8 text-center type-ui text-fg-muted"><span class="font-medium text-fg">${this.note.lead}</span>${this.note.rest}</p>` : nothing}<ul role="list" data-run="false" class="ds-plans m-0 grid list-none grid-cols-1 gap-px border border-edge bg-edge p-0 md:-mx-[calc(var(--ds-space-lg)+var(--ds-border-hairline))] md:grid-cols-2 xl:-mx-[calc(var(--ds-space-xl)+var(--ds-border-hairline))] xl:grid-cols-4" style=${`--ascii: url("${ASCII_TEXTURE}"); --ascii-alpha: url("${ASCII_TEXTURE_ALPHA}")`}>${plans.map((p, i) => {
			const y = period === 'yearly' && p.yearly
			const price = y ? p.yearly!.price : p.price
			const unit = y ? p.yearly!.unit ?? p.unit : p.unit
			const lights = PLAN_LIGHTS[p.light ?? LIGHTS[i % 4]]
			const id = `plan-${i}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
			return html`<li ?data-featured=${!!p.featured} class="ds-plan row-span-3 grid grid-rows-subgrid content-start gap-y-6 bg-surface p-4 xl:p-6" style=${`--light: url("${lights.light}"); --light-black: url("${lights.black}")`}><div class="ds-tier relative isolate flex min-h-(--ds-plan-tier-min-h) flex-col gap-2 overflow-hidden rounded-panel p-6"><span class="ds-tier-ascii" aria-hidden="true"></span><span class="ds-plan-drift" aria-hidden="true"><span class="ds-plan-light"></span><span class="ds-plan-black"><span class="ds-plan-glyphs"></span><span class="ds-plan-glyphs ds-plan-shimmer"></span></span></span>${p.rim ? html`<span class="ds-plan-trail" aria-hidden="true"><span class="ds-plan-window"><span class="ds-plan-trail-glyphs"></span></span></span><span class="ds-plan-rim" aria-hidden="true"><span class="ds-plan-sweep"></span><span class="ds-plan-corners"><span class="ds-plan-sweep ds-plan-sweep-color"></span></span></span>` : nothing}<div class="flex items-center justify-between gap-3"><h2 id=${id} class="m-0 type-heading-2">${p.name}</h2>${p.badge ? html`<span class="ds-plan-badge rounded-ds-sm bg-(--ds-color-white) px-2 py-1 whitespace-nowrap text-(--ds-color-black)">${p.badge}</span>` : nothing}</div>${p.description ? html`<p class="ds-plan-for m-0 max-w-(--ds-plan-copy-w) type-ui text-pretty">${p.description}</p>` : nothing}<p class="m-0 mt-auto flex flex-wrap items-baseline gap-x-2 pt-8"><span class="type-figure tabular-nums">${price}</span>${unit || (p.tag && !y) ? html`<span class="ds-plan-unit type-ui whitespace-nowrap">${unit}${p.tag && !y ? html`<span class="ds-plan-badge ds-plan-save ms-2 inline-block rounded-ds-sm bg-(--ds-color-black) px-2 text-(--ds-color-white) shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge-surface)]">${p.tag}</span>` : nothing}</span>` : nothing}</p></div>${p.cta ? html`<spyglass-button href=${ifDefined(p.href)} variant=${p.featured ? 'primary' : 'secondary'} class="w-full" aria-describedby=${id}>${p.cta}</spyglass-button>` : html`<span></span>`}${p.ladder || p.features?.length ? html`<div class="flex flex-col gap-3 border-t border-edge pt-6">${p.ladder ? html`<p class="m-0 type-ui-strong">${p.ladder}</p>` : nothing}${p.features?.length ? html`<ul role="list" class="m-0 flex list-none flex-col gap-2 p-0 type-ui text-fg-soft">${p.features.map((f) => html`<li class="grid grid-cols-[var(--ds-space-lg)_minmax(0,1fr)] items-start gap-x-2">${check}${f}</li>`)}</ul>` : nothing}</div>` : html`<span></span>`}</li>`
		})}</ul></div>`
	}
}

define('pricing-table', PricingTable)
