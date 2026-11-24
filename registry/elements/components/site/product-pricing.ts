import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/ui/button'
import styles from 'virtual:tw'

// ProductPricing.tsx as <spyglass-product-pricing>: the product pricing section. `receipt` (the site's): the head and
// two buttons beside a receipt of three records, the free row and the total; `open`: the rate large beside what is
// free; `plans`: what each plan buys at the rate; `rate`: the rate alone in a ruled card. Lists as JSON.

export type ProductPricingVariant = 'receipt' | 'open' | 'plans' | 'rate'
export interface ReceiptRow { name: string; meta: string; picture?: string }
export interface PricingPlanLine { name: string; price: string; unit?: string; credits?: string; after?: string }
export interface ProductPricingAction { label: string; href: string }

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const fmt = (n: number) => n.toLocaleString('en-US')
const credits = (n: number) => `${fmt(n)} ${n === 1 ? 'credit' : 'credits'}`
const each = (value: string) => { const n = Number.parseInt(value, 10); return Number.isFinite(n) && n > 0 ? n : 1 }
const leading = (line?: string) => { const m = line?.match(/^[\d,]+/); return m ? Number(m[0].replace(/,/g, '')) : null }

/**
 * @summary The product pricing section: a receipt of what a search costs, or the rate, what is free or what each plan buys.
 */
export class ProductPricing extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-pricing"]'))
	static properties = {
		variant: {}, value: {}, unit: {}, headline: {}, lead: {}, note: {}, primary: { type: Object }, secondary: { type: Object }, product: {}, rows: { type: Array }, free: { type: Object }, tally: {},
		freeMonthly: { type: Number, attribute: 'free-monthly' }, freeRows: { type: Array, attribute: 'free-rows' }, example: {}, plans: { type: Array }, noun: {}, missing: {}, prefix: {},
	}
	variant: ProductPricingVariant = 'receipt'
	/** The rate: "1 credit". */
	value = ''
	/** "per creator found". */
	unit = ''
	headline?: string
	lead?: string
	note = '500 free credits every month. No card required.'
	primary?: ProductPricingAction = { label: 'Get a free API key', href: '#' }
	secondary?: ProductPricingAction = { label: 'See pricing', href: '/pricing' }
	/** receipt: the product's name at the top. */
	product = ''
	rows: ReceiptRow[] = []
	free: ReceiptRow = { name: 'Add a missing brand', meta: 'Indexed automatically' }
	tally = ''
	freeMonthly = 500
	freeRows: { label: string; value: string }[] = []
	example?: string
	plans: PricingPlanLine[] = []
	noun = 'records'
	missing = 'Missing a brand or creator? Add it for free. Spyglass indexes it automatically.'
	/** Prefix for the heading id (React's `id`). */
	prefix = 'product'

	private actions(cls: string) {
		const { primary, secondary } = this
		if (!primary && !secondary) return nothing
		return html`<div class=${`flex flex-wrap gap-3 ${cls}`}>${primary ? html`<spyglass-button href=${primary.href}>${primary.label}</spyglass-button>` : nothing}${secondary ? html`<spyglass-button href=${secondary.href} variant="secondary">${secondary.label}</spyglass-button>` : nothing}</div>`
	}

	private picture(src?: string) {
		return src ? html`<img src=${src} alt="" width="64" height="80" class="block aspect-4/5 h-auto w-12 rounded-ds-sm object-cover md:w-16">` : html`<span aria-hidden="true" class="block aspect-4/5 w-12 rounded-ds-sm bg-surface-inset md:w-16"></span>`
	}

	render() {
		const headingId = `${this.prefix}-pricing-heading`
		const per = each(this.value)
		const { value, unit } = this

		if (this.variant === 'open') {
			return html`<section data-ds="product-pricing" aria-labelledby=${headingId} class="border-t border-edge py-(--ds-layout-section) text-fg"><div class=${`${WRAP} ds-pp-open grid grid-cols-[minmax(0,1fr)] gap-y-12 lg:gap-x-16 xl:gap-x-24`}><div class="[grid-area:head]"><h2 id=${headingId} class="type-section">${this.headline ?? 'Pay for what you get back.'}</h2><p class="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${this.lead ?? 'No per-call fee. You are charged for the records a search returns, nothing else.'}</p></div><p class="flex flex-col items-start [grid-area:rate]"><span class="ds-pp-value whitespace-nowrap tabular-nums">${value}</span><span class="mt-1 whitespace-nowrap type-body-lg md:type-body-xl">${unit}</span>${this.example ? html`<span class="mt-4 whitespace-nowrap type-body text-fg-soft tabular-nums md:type-body-lg">${this.example}</span>` : nothing}</p><dl class="border-b border-edge [grid-area:free]">${(this.freeRows ?? []).map((r) => html`<div class="flex items-baseline justify-between gap-4 border-t border-edge py-4"><dt class="min-w-0 truncate type-body md:type-body-lg">${r.label}</dt><dd class="flex-none type-body text-fg-soft md:type-body-lg">${r.value}</dd></div>`)}</dl>${this.actions('self-start [grid-area:actions]')}</div></section>`
		}

		if (this.variant === 'plans') {
			const lines = (this.headline ?? 'Start free. Pay for what you use').split(/(?<=\.)\s+/)
			return html`<section data-ds="product-pricing" aria-labelledby=${headingId} class="border-t border-edge py-(--ds-layout-section) text-fg"><div class=${`${WRAP} ds-pp-plans grid grid-cols-[minmax(0,1fr)] gap-y-8 lg:items-end lg:gap-x-16 lg:gap-y-16 xl:gap-x-24`}><h2 id=${headingId} class="type-section [grid-area:headline]">${lines.map((l) => html`<span class="block">${l}</span>`)}</h2><div class="[grid-area:rate]"><p class="whitespace-nowrap type-body-lg tabular-nums md:type-body-xl">${value} ${unit}</p><p class="mt-1 max-w-(--ds-layout-measure) type-body text-fg-soft md:type-body-lg">${this.lead ?? 'Here is what each plan buys. The API and the MCP server share one pool of credits.'}</p></div><ul role="list" class="grid grid-cols-[minmax(0,1fr)] border-b border-edge [grid-area:plans] lg:grid-cols-4 lg:border-t lg:border-b-0">${(this.plans ?? []).map((p) => {
				const at = p.price.search(/[$\d]/)
				const prefix = at > 0 ? p.price.slice(0, at).trim() : ''
				const amount = at > 0 ? p.price.slice(at) : p.price
				const n = leading(p.credits)
				return html`<li class="ds-pp-plan grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-t border-edge py-4 lg:grid-cols-[minmax(0,1fr)] lg:gap-y-2 lg:border-t-0 lg:border-l lg:px-6 lg:pt-6 lg:pb-0 lg:first:border-l-0 lg:first:pl-0"><h3 class="type-heading-4 [grid-area:name]">${p.name}</h3><p class="whitespace-nowrap [grid-area:price] lg:mt-4">${prefix ? html`<span class="type-ui text-fg-muted">${prefix} </span>` : nothing}<span class="ds-pp-amount tabular-nums">${amount}</span> ${p.unit ? html`<span class="type-ui text-fg-muted">${p.unit}</span>` : nothing}</p><p class="min-w-0 truncate type-body tabular-nums [grid-area:gets] lg:type-body-lg">${n === null ? p.after : `${fmt(Math.floor(n / per))} ${this.noun} a month`}</p></li>`
			})}</ul>${this.actions('mt-4 [grid-area:actions] lg:mt-0')}</div></section>`
		}

		if (this.variant === 'rate') {
			return html`<section data-ds="product-pricing" aria-labelledby=${headingId} class="border-t border-edge py-(--ds-layout-section) text-fg"><div class=${WRAP}><div class="grid grid-cols-[minmax(0,1fr)] gap-y-8 rounded-panel border border-edge bg-surface p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-x-12 md:p-12 lg:p-16"><h2 id=${headingId} class="flex flex-col gap-2"><span class="ds-pp-value tabular-nums">${value}</span> <span class="max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${unit}</span></h2><div class="flex flex-col items-start"><p class="max-w-(--ds-layout-measure) type-body-lg">${this.note}</p>${this.missing ? html`<p class="mt-2 max-w-(--ds-layout-measure) type-body text-pretty text-fg-soft">${this.missing}</p>` : nothing}${this.actions('mt-8')}</div></div></div></section>`
		}

		const rows = this.rows ?? []
		const total = per * rows.length
		const lines = [...rows.map((r) => ({ ...r, cost: credits(per), zero: false })), { ...this.free, cost: 'Free', zero: true }]
		return html`<section data-ds="product-pricing" aria-labelledby=${headingId} class="py-(--ds-layout-section) text-fg"><div class=${`${WRAP} grid grid-cols-[minmax(0,1fr)] items-center gap-y-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-16 xl:gap-x-24`}><div class="flex flex-col items-center text-center md:items-start md:text-left"><h2 id=${headingId} class="type-section">${this.headline ?? 'You pay for what comes back'}</h2><p class="mt-4 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">${this.lead ?? 'No per-call fee. You pay per record returned, and the API and the MCP server share one pool.'}</p>${this.note ? html`<p class="mt-4 type-ui text-fg-muted">${this.note}</p>` : nothing}${this.actions('mt-8 flex-col justify-center self-stretch md:flex-row md:self-auto')}</div><figure class="min-w-0 rounded-panel bg-surface-subtle p-4 md:p-8"><figcaption class="flex justify-between gap-4 type-ui text-fg-muted"><span class="min-w-0 truncate">${this.product}<span class="hidden md:inline">, ${value} ${unit}</span></span><span aria-hidden="true" class="flex-none">Credits</span></figcaption><ul role="list" class="mt-3">${lines.map((r) => html`<li class="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-4 border-t border-edge py-3 md:grid-cols-[64px_minmax(0,1fr)_auto] md:py-4">${r.zero && !r.picture ? html`<span aria-hidden="true" class="relative grid aspect-4/5 w-12 place-items-center border border-edge-strong text-fg-soft md:w-16"><svg viewBox="0 0 16 16" width="16" height="16" fill="none"><path d="M8 0v16M0 8h16" stroke="currentColor" stroke-width="2"></path></svg></span>` : this.picture(r.picture)}<span class="flex min-w-0 flex-col"><span class="truncate type-body">${r.name}</span><span class="truncate type-ui text-fg-muted">${r.meta}</span></span><span class=${`whitespace-nowrap type-ui md:type-body ${r.zero ? 'text-fg' : 'text-fg-soft tabular-nums'}`}>${r.cost}</span></li>`)}</ul><p class="flex items-baseline justify-between gap-4 border-t border-edge-strong pt-4"><span class="min-w-0 truncate type-body md:type-body-lg">${this.tally}</span><span class="flex-none type-heading-3 tabular-nums md:type-heading-2">${credits(total)}</span></p><p class="mt-2 flex justify-between gap-4 type-ui text-fg-muted"><span>Free credits left this month</span><span class="tabular-nums">${fmt(this.freeMonthly - total)} of ${fmt(this.freeMonthly)}</span></p></figure></div></section>`
	}
}

define('product-pricing', ProductPricing)
