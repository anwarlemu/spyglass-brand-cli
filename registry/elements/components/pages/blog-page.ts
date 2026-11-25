import { html, nothing } from 'lit'
import { DsElement, define, HostLayoutController } from '@/elements/lib/element'
import { blogContent, type BlogContent, blogSections, type BlogSection } from '@/lib/pages/blog'
import '@/elements/components/ui/button'
import '@/elements/components/site/creative-card'
import '@/elements/components/site/footer-row'
import '@/elements/components/site/site-header'
import styles from 'virtual:tw'
import { pageSections } from '@/lib/image'
import { ifDefined } from 'lit/directives/if-defined.js'

// BlogPage.tsx as <spyglass-blog-page>: the title, the newest post large and the others in a grid of three. Titles
// change color on hover; nothing moves. `content` replaces the copy and the posts.
const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const TITLE = 'rounded-control transition-[color] duration-160 ease-standard hover:text-fg-soft'

/**
 * @summary The blog index template.
 */
export class BlogPage extends DsElement {
	static styles = [DsElement.styles, styles]
	protected readonly layout = new HostLayoutController(this, () => this.renderRoot.querySelector<HTMLElement>('[data-ds="blog-page"]'))
	static properties = { content: { type: Object }, sections: { type: Array } }
	/** The page's copy and posts (lib/pages/blog.ts by default). */
	content: BlogContent = blogContent
	/** The sections to show, in order (a list of names); all of them in the page order by default. */
	sections?: BlogSection[]

	render() {
		const c = this.content ?? blogContent
		const [first, ...rest] = c.posts
		const parts: Record<BlogSection, unknown> = {
			head: html`<div class=${`${WRAP} grid gap-4 pt-16 pb-12 max-sm:pt-10 max-sm:pb-8`}><h1 class="type-section">${c.title}</h1><p class="max-w-140 type-body-lg text-fg-soft">${c.body}</p></div>`,
			featured: html`${first ? html`<article class=${`${WRAP} grid grid-cols-2 items-center gap-12 pb-16 max-md:grid-cols-1 max-sm:gap-6 max-sm:pb-12`}><spyglass-creative-card src=${ifDefined(first.image.src)} fit=${ifDefined(first.image.fit)} position=${ifDefined(first.image.position)} brand=${ifDefined(first.image.brand)} caption=${ifDefined(first.image.caption)} tone=${ifDefined(first.image.tone)} alt=${first.image.alt ?? first.title} ratio="7/5"></spyglass-creative-card><div class="flex flex-col items-start gap-4"><p class="type-label text-fg-muted">${`${first.date} · ${first.category}`}</p><h2 class="type-section"><a href=${first.href} class=${TITLE}>${first.title}</a></h2><p class="type-body-lg text-fg-soft">${first.excerpt}</p><spyglass-button href=${first.href} variant="secondary" class="mt-2">${c.read}</spyglass-button></div></article>` : nothing}`,
			posts: html`<section aria-label="More posts" class=${`${WRAP} grid grid-cols-3 gap-x-6 gap-y-12 pt-12 pb-24 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:pb-16`}>${rest.map((p) => html`<article class="grid content-start gap-4"><spyglass-creative-card src=${ifDefined(p.image.src)} fit=${ifDefined(p.image.fit)} position=${ifDefined(p.image.position)} brand=${ifDefined(p.image.brand)} caption=${ifDefined(p.image.caption)} tone=${ifDefined(p.image.tone)} alt=${p.image.alt ?? p.title} ratio="7/5"></spyglass-creative-card><p class="type-label text-fg-muted">${`${p.date} · ${p.category}`}</p><h3 class="type-heading-3 text-balance"><a href=${p.href} class=${TITLE}>${p.title}</a></h3><p class="type-ui text-fg-soft">${p.excerpt}</p></article>`)}</section>`,
		}
		return html`<div data-ds="blog-page" class="bg-surface text-fg">
<spyglass-site-header .links=${c.header.nav} .secondary=${c.header.secondary} .cta=${c.header.cta}></spyglass-site-header>
<main>${pageSections(blogSections, this.sections).map((k) => parts[k])}</main>
<footer class="border-t border-edge"><div class=${`${WRAP} py-10`}><spyglass-footer-row domain=${c.footer.domain} home-href="/" .links=${c.footer.links}></spyglass-footer-row></div></footer>
</div>`
	}
}

define('blog-page', BlogPage)
