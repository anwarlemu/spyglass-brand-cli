import { html } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import styles from 'virtual:tw'

// ProofStrip.tsx as <spyglass-proof-strip>: the site's proof marquee, marks in the muted gray moving left at a constant
// slow speed and fading at both ends; under a mouse it stops and the mark under the pointer turns White; still with
// reduced motion. `logos` as JSON: { name, src?, ratio?, height? }; with no `src` the name is set as a wordmark.

export interface ProofLogo { name: string; src?: string; ratio?: number; height?: number }
export const proofPlaceholders: ProofLogo[] = [{ name: 'Acme' }, { name: 'Acme Labs' }, { name: 'Acme Studio' }, { name: 'Acme Goods' }, { name: 'Acme Air' }, { name: 'Acme & Co' }]

/** @summary The proof marquee: marks moving slowly in a row that fades at its ends. */
export class ProofStrip extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="proof-strip"]'))
	static properties = { logos: { type: Array }, tight: { type: Boolean } }
	/** The marks: { name, src?, ratio?, height? }. */
	logos: ProofLogo[] = proofPlaceholders
	/** 48px between marks instead of 64 (the sign-in page's row). */
	tight = false

	render() {
		const logos = this.logos ?? proofPlaceholders
		return html`<div data-ds="proof-strip" class="w-full max-w-288"><ul class="sr-only">${logos.map((l) => html`<li>${l.name}</li>`)}</ul><div aria-hidden="true" class="ds-proof-strip group/strip overflow-hidden"><ul role="list" class="ds-proof-track flex w-max items-center">${[0, 1, 2].flatMap(() => logos.map((l) => html`<li class=${`group/mark grid h-8 flex-none place-items-center ${this.tight ? 'px-6' : 'px-8'}`}>${l.src ? html`<span class="block bg-fg-muted transition-[background-color] duration-160 ease-out pointer-fine:group-hover/mark:bg-fg" style=${`height: ${l.height ?? 24}px; width: ${(l.height ?? 24) * (l.ratio ?? 4)}px; mask: url("${l.src}") center / contain no-repeat`}></span>` : html`<span class="type-heading-4 whitespace-nowrap text-fg-muted transition-[color] duration-160 ease-out pointer-fine:group-hover/mark:text-fg">${l.name}</span>`}</li>`))}</ul></div></div>`
	}
}

define('proof-strip', ProofStrip)
