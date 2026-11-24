import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { changelogContent, type ChangelogContent } from '@/lib/pages/changelog'
import '@/elements/components/site/creative-card'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'

// ChangelogPage.tsx as <spyglass-changelog-page>: every release newest first, its date on the left, the change, its
// details and a picture when there is one. `content` replaces the entries.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

/**
 * @summary The changelog template.
 */
export class ChangelogPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="changelog-page"]'))
	static properties = { content: { type: Object } }
	/** The entries (lib/pages/changelog.ts by default). */
	content: ChangelogContent = changelogContent

	render() {
		const c = this.content ?? changelogContent
		return html`<div data-ds="changelog-page" class="bg-surface text-fg">
<spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header>
<main>
<div class=${`${WRAP} grid gap-4 pt-16 pb-12 max-sm:pt-10 max-sm:pb-8`}><h1 class="type-section">${c.title}</h1><p class="max-w-140 type-body-lg text-fg-soft">${c.body}</p></div>
<ol class=${`${WRAP} grid pb-24 max-sm:pb-16`}>${c.entries.map((e) => html`<li class="grid grid-cols-4 gap-12 border-t border-edge py-12 max-md:grid-cols-1 max-md:gap-4 max-sm:py-8"><p class="self-start type-label text-fg-muted md:sticky md:top-8"><time>${e.date}</time></p><div class="col-span-3 grid max-w-180 gap-4 max-md:col-span-1"><h2 class="type-heading-2 text-balance">${e.title}</h2><p class="type-body text-fg-soft">${e.body}</p>${e.items.length ? html`<ul class="grid list-disc gap-2 pl-5 type-body text-fg-soft marker:text-fg-faint">${e.items.map((i) => html`<li>${i}</li>`)}</ul>` : nothing}${e.image ? html`<spyglass-creative-card brand=${e.image.brand} tone=${e.image.tone} alt=${e.title} ratio="16/9" class="mt-2"></spyglass-creative-card>` : nothing}</div></li>`)}</ol>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('changelog-page', ChangelogPage)
