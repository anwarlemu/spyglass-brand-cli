import { html, nothing } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ChevronLeft } from 'lucide'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { icon } from '@/elements/lib/icon'
import { blogPostContent, type BlogPostBlock, type BlogPostContent } from '@/lib/pages/blog-post'
import '@/elements/components/site/creative-card'
import '@/elements/components/site/creative-grid'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import '@/elements/components/blocks/offer-block'
import styles from 'virtual:tw'

// BlogPostPage.tsx as <spyglass-blog-post-page>: the way back, the title, a wide image, the body in a 720px column,
// more posts and the offer. `content` replaces the post; its `body` is a list of blocks.
const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'
const COLUMN = 'mx-auto w-full max-w-180 px-12 max-sm:px-4'
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
	static properties = { content: { type: Object } }
	/** The post (lib/pages/blog-post.ts by default). */
	content: BlogPostContent = blogPostContent

	render() {
		const c = this.content ?? blogPostContent
		return html`<div data-ds="blog-post-page" class="bg-surface text-fg">
<div class=${WRAP}><spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header></div>
<main>
<article><header class=${`${COLUMN} flex flex-col items-start pt-16 max-sm:pt-10`}><a href=${c.back.href} class="inline-flex items-center gap-1.5 rounded-control type-ui text-fg-muted transition-[color] duration-160 ease-standard hover:text-fg">${icon(ChevronLeft, 'chevron-left', { size: 16, strokeWidth: 1.5, attrs: { 'aria-hidden': 'true' } })}${c.back.label}</a><p class="mt-8 type-label text-fg-muted">${`${c.date} · ${c.category}`}</p><h1 class="mt-4 type-hero text-balance max-sm:type-heading-1">${c.title}</h1><p class="mt-6 type-ui text-fg-muted">${c.byline}</p></header>
<div class=${`${WRAP} mt-12 max-sm:mt-8`}><spyglass-creative-card brand=${c.image.brand} tone=${c.image.tone} caption=${ifDefined('caption' in c.image ? (c.image as { caption?: string }).caption : undefined)} alt=${c.title} ratio="16/9" class="mx-auto max-w-page"></spyglass-creative-card></div>
<div class=${`${COLUMN} grid gap-6 py-12 max-sm:py-8`}>${c.body.map(block)}</div></article>
<section class=${`${WRAP} grid gap-10 py-24 max-sm:gap-8 max-sm:py-16`}><h2 class="type-section">${c.related.title}</h2><div class="grid grid-cols-3 gap-6 max-md:grid-cols-1">${c.related.posts.map((p) => html`<article class="grid content-start gap-4"><spyglass-creative-card brand=${p.image.brand} tone=${p.image.tone} alt=${p.title} ratio="7/5"></spyglass-creative-card><p class="type-label text-fg-muted">${p.date}</p><h3 class="type-heading-3 text-balance"><a href=${p.href} class=${TITLE}>${p.title}</a></h3></article>`)}</div></section>
<spyglass-offer-block headline=${c.offer.headline} note=${c.offer.note} .cta=${c.offer.cta} seed="2"></spyglass-offer-block>
</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('blog-post-page', BlogPostPage)
