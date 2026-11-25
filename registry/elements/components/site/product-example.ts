import type { ImageFit } from '@/lib/image'
import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import '@/elements/components/site/code-block'
import '@/elements/components/site/code'
import '@/elements/components/site/creative-card'
import type { CodeTab } from '@/lib/code'
import styles from 'virtual:tw'

// ProductExample.tsx as <spyglass-product-example>: one request and what comes back. The specs row, the request as the
// code block beside the response panel from 1024 (the request staying in view), and optionally the creatives it
// returned. `tabs`, `specs` and `media` ({ label, items: [{ brand, tone, caption, src, meta }] }) as JSON.

export interface ProductExampleSpec { label: string; value: string }
export interface ProductExampleMedia { label: string; items: { brand?: string; tone?: number; caption?: string; src?: string; alt?: string; fit?: ImageFit; position?: string; meta: string }[] }

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The product example: the request in tabs beside the response, with the creatives it returned.
 */
export class ProductExample extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="product-example"]'))
	static properties = { question: {}, tabs: { type: Array }, response: {}, specs: { type: Array }, media: { type: Object }, heading: {}, codeLabel: { attribute: 'code-label' }, responseLabel: { attribute: 'response-label' }, status: {}, copy: { type: Object }, prefix: {} }
	question = ''
	tabs: CodeTab[] = []
	/** The JSON that comes back. */
	response = ''
	specs: ProductExampleSpec[] = []
	media?: ProductExampleMedia
	heading = 'Request and response'
	codeLabel = 'Request'
	responseLabel = 'Response'
	status = '200'
	copy = { label: 'Copy', copiedLabel: 'Copied', name: 'Copy the request' }
	/** Prefix for ids (React's `id`). */
	prefix = 'product'

	render() {
		const specs = this.specs ?? []
		const media = this.media
		return html`<section data-ds="product-example" id=${`${this.prefix}-example`} aria-labelledby=${`${this.prefix}-example-heading`} class="pb-(--ds-layout-section) text-fg"><div class=${WRAP}><h2 id=${`${this.prefix}-example-heading`} class="sr-only">${this.heading}: ${this.question}</h2>${specs.length > 0 ? html`<dl class="mb-4 flex flex-wrap gap-x-6 gap-y-2">${specs.map((s) => html`<div class="flex min-w-0 items-baseline gap-2 type-ui"><dt class="flex-none type-label text-fg-muted">${s.label}</dt><dd class="min-w-0 type-code wrap-anywhere">${s.value}</dd></div>`)}</dl>` : nothing}<div class="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2"><div class="min-w-0 lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]"><spyglass-code-block .tabs=${this.tabs ?? []} label=${this.codeLabel} .copy=${this.copy}></spyglass-code-block></div><div class="flex min-w-0 flex-col gap-8"><div class="flex min-w-0 flex-col rounded-panel bg-surface-raised"><div class="relative flex h-control-lg flex-none items-center justify-between border-b border-edge-surface px-4 type-ui-strong md:px-6"><span>${this.responseLabel}</span><span class="type-code font-normal text-fg-muted">${this.status}</span></div><div tabindex="0" role="region" aria-label=${this.responseLabel} class="fade-x min-w-0 overflow-x-auto rounded-b-panel p-4 outline-offset-[-2px] md:p-6"><div class="w-max pr-12"><spyglass-code .source=${this.response} language="json"></spyglass-code></div></div></div>${media ? html`<figure class="m-0 flex flex-col gap-3"><figcaption class="type-label text-fg-muted">${media.label}</figcaption><ul role="list" class="m-0 grid list-none grid-cols-3 gap-4 p-0">${(media.items ?? []).map((c) => html`<li class="flex min-w-0 flex-col gap-2"><spyglass-creative-card brand=${c.brand ?? ''} tone=${c.tone ?? 2} caption=${c.caption ?? ''} src=${c.src ?? ''} alt=${c.alt ?? ''} fit=${ifDefined(c.fit)} position=${ifDefined(c.position)} ratio="3/4" class="w-full"></spyglass-creative-card><span class="type-ui text-pretty text-fg-soft">${c.meta}</span></li>`)}</ul></figure>` : nothing}</div></div></div></section>`
	}
}

define('product-example', ProductExample)
