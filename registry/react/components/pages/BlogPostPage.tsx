import { ChevronLeft } from 'lucide-react'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { CreativeGrid } from '@/react/components/site/CreativeGrid'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { OfferBlock } from '@/react/components/blocks/OfferBlock'
import { blogPostContent, type BlogPostBlock, type BlogPostContent } from '@/lib/pages/blog-post'
import { cn } from '@/react/lib/cn'

// A blog post from library items: the way back, the date and category in capitals, the title in Funnel Display, the
// byline, a wide image, then the body in a 720px column (DM Sans paragraphs, Funnel Display subheads, a list, a quote
// set off by a hairline, a figure of creatives), more posts and the offer. `content` replaces the post
// (lib/pages/blog-post.ts); its `body` is a list of blocks.
export interface BlogPostPageProps {
  content?: BlogPostContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'
const COLUMN = 'mx-auto w-full max-w-180 px-12 max-sm:px-4'
const TITLE = 'rounded-control transition-[color] duration-150 ease-standard hover:text-fg-soft'

function Block({ block: b }: { block: BlogPostBlock }) {
  if (b.kind === 'h2') return <h2 className="mt-6 type-heading-2 text-fg">{b.text}</h2>
  if (b.kind === 'quote') return <blockquote className="m-0 border-l-2 border-edge-strong pl-6 type-heading-3 text-fg">{b.text}</blockquote>
  if (b.kind === 'list') return <ul className="grid list-disc gap-2 pl-5 type-body-lg text-fg-soft marker:text-fg-faint">{b.items.map((i) => <li key={i}>{i}</li>)}</ul>
  if (b.kind === 'figure') return (
    <figure className="m-0 my-4 grid gap-3">
      <CreativeGrid items={b.images} ratio="3/4" />
      <figcaption className="type-caption text-fg-muted">{b.caption}</figcaption>
    </figure>
  )
  return <p className="type-body-lg text-fg-soft">{b.text}</p>
}

export function BlogPostPage({ content: c = blogPostContent, className }: BlogPostPageProps) {
  return (
    <div data-ds="blog-post-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <article>
          <header className={cn(COLUMN, 'flex flex-col items-start pt-16 max-sm:pt-10')}>
            <a href={c.back.href} className="inline-flex items-center gap-1.5 rounded-control type-ui text-fg-muted transition-[color] duration-150 ease-standard hover:text-fg">
              <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
              {c.back.label}
            </a>
            <p className="mt-8 type-label text-fg-muted">{`${c.date} · ${c.category}`}</p>
            <h1 className="mt-4 type-hero text-balance max-sm:type-heading-1">{c.title}</h1>
            <p className="mt-6 type-ui text-fg-muted">{c.byline}</p>
          </header>
          <div className={cn(WRAP, 'mt-12 max-sm:mt-8')}>
            <CreativeCard {...c.image} alt={c.title} ratio="16/9" className="mx-auto max-w-page" />
          </div>
          <div className={cn(COLUMN, 'grid gap-6 py-12 max-sm:py-8')}>
            {c.body.map((b, i) => <Block key={i} block={b} />)}
          </div>
        </article>
        <section className={cn(WRAP, 'grid gap-10 py-24 max-sm:gap-8 max-sm:py-16')}>
          <h2 className="type-heading-1 max-sm:type-heading-2">{c.related.title}</h2>
          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-1">
            {c.related.posts.map((p) => (
              <article key={p.href} className="grid content-start gap-4">
                <CreativeCard {...p.image} alt={p.title} ratio="7/5" />
                <p className="type-label text-fg-muted">{p.date}</p>
                <h3 className="type-heading-3 text-balance"><a href={p.href} className={TITLE}>{p.title}</a></h3>
              </article>
            ))}
          </div>
        </section>
        <OfferBlock headline={c.offer.headline} note={c.offer.note} cta={c.offer.cta} seed={2} />
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default BlogPostPage
