import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ChevronLeft } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { blogPostContent, type BlogPostBlock, type BlogPostContent, blogPostSections, type BlogPostSection } from '@/lib/pages/blog-post'
import '@/elements/components/site/creative-card'
import '@/elements/components/site/creative-grid'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import '@/elements/components/blocks/offer-block'
import styles from 'virtual:tw'
import { pageSections, groupSections } from '@/lib/image'
import { headerMenus, type HeaderMenus } from '@/lib/site-header'

// BlogPostPage.tsx as <spyglass-blog-post-page>: the way back, the title, a wide image, the body in a 720px column,
// more posts and the offer. `content` replaces the post; its `body` is a list of blocks.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const COLUMN = 'mx-auto w-full max-w-180 px-12 max-sm:px-4'
const ARTICLE: readonly BlogPostSection[] = ['head', 'cover', 'body']
const TITLE = 'rounded-control transition-[color] duration-160 ease-standard hover:text-fg-soft'

const block = (b: BlogPostBlock) => {
	if (b.kind === 'h2') return html`<h2 class="mt-6 type-heading-2 text-fg">${b.text}</h2>`
	if (b.kind === 'quote') return html`<blockquote class="m-0 border-l-2 border-edge-strong pl-6 type-heading-3 text-fg">${b.text}</blockquote>`
	if (b.kind === 'list') return html`<ul class="grid list-disc gap-2 pl-5 type-body-lg text-fg-soft marker:text-fg-faint">${b.items.map((i) => html`<li>${i}</li>`)}</ul>`
	if (b.kind === 'figure') return html`<figure class="m-0 my-4 grid gap-3"><spyglass-creative-grid .items=${b.images} ratio="3/4"></spyglass-creative-grid><figcaption class="type-caption text-fg-muted">${b.caption}</figcaption></figure>`
	return html`<p class="type-body-lg text-fg-soft">${b.text}</p>`
}

/**
 * @summary The blog post template.
 */
export class BlogPostPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="blog-post-page"]'))
	static properties = { content: { type: Object }, menus: { type: Object }, sections: { type: Array } }
	/** The post (lib/pages/blog-post.ts by default). */
	content: BlogPostContent = blogPostContent
	/** The header menus' content, pictures included (the live card's `picture`, the use cases' `shots`); Acme by default. */
	menus?: HeaderMenus
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: BlogPostSection[]

	render() {
		const c = this.content ?? blogPostContent
		const parts: Record<BlogPostSection, unknown> = {
			head: html`<header class=${`${COLUMN} flex flex-col items-start pt-16 max-sm:pt-10`}><a href=${c.back.href} class="inline-flex items-center gap-1.5 rounded-control type-ui text-fg-muted transition-[color] duration-160 ease-standard hover:text-fg">${icon(ChevronLeft, 'chevron-left', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}${c.back.label}</a><p class="mt-8 type-label text-fg-muted">${`${c.date} · ${c.category}`}</p><h1 class="mt-4 type-hero text-balance max-sm:type-heading-1">${c.title}</h1><p class="mt-6 type-ui text-fg-muted">${c.byline}</p></header>`,
			cover: html`<div class=${`${WRAP} mt-12 max-sm:mt-8`}><spyglass-creative-card src=${ifDefined(c.image.src)} fit=${ifDefined(c.image.fit)} position=${ifDefined(c.image.position)} brand=${ifDefined(c.image.brand)} caption=${ifDefined(c.image.caption)} tone=${ifDefined(c.image.tone)} alt=${c.image.alt ?? c.title} ratio="16/9" class="mx-auto max-w-page"></spyglass-creative-card></div>`,
			body: html`<div class=${`${COLUMN} grid gap-6 py-12 max-sm:py-8`}>${c.body.map(block)}</div>`,
			related: html`<section class=${`${WRAP} grid gap-10 py-24 max-sm:gap-8 max-sm:py-16`}><h2 class="type-section">${c.related.title}</h2><div class="grid grid-cols-3 gap-6 max-md:grid-cols-1">${c.related.posts.map((p) => html`<article class="grid content-start gap-4"><spyglass-creative-card src=${ifDefined(p.image.src)} fit=${ifDefined(p.image.fit)} position=${ifDefined(p.image.position)} brand=${ifDefined(p.image.brand)} caption=${ifDefined(p.image.caption)} tone=${ifDefined(p.image.tone)} alt=${p.image.alt ?? p.title} ratio="7/5"></spyglass-creative-card><p class="type-label text-fg-muted">${p.date}</p><h3 class="type-heading-3 text-balance"><a href=${p.href} class=${TITLE}>${p.title}</a></h3></article>`)}</div></section>`,
			offer: html`<spyglass-offer-block headline=${c.offer.headline} note=${c.offer.note} .cta=${c.offer.cta} seed="2"></spyglass-offer-block>`,
		}
		return html`<div data-ds="blog-post-page" class="bg-surface text-fg">
<spyglass-site-header .menus=${this.menus ?? headerMenus} .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header>
<main>${groupSections(pageSections(blogPostSections, this.sections), ARTICLE).map((k) => (Array.isArray(k) ? html`<article>${k.map((a) => parts[a])}</article>` : parts[k]))}</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('blog-post-page', BlogPostPage)
