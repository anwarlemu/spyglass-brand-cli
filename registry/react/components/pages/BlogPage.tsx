import { Button } from '@/react/components/ui/Button'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { blogContent, type BlogContent } from '@/lib/pages/blog'
import { cn } from '@/react/lib/cn'

// The blog index from library items: the title, the newest post large (its image beside the title, the excerpt and a
// button), then every other post in a grid of three, each an image, the date and category in capitals, the title in
// Funnel Display and the excerpt. Titles change color on hover; nothing moves. `content` replaces the copy and the
// posts (lib/pages/blog.ts).
export interface BlogPageProps {
  content?: BlogContent
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'
const TITLE = 'rounded-control transition-[color] duration-150 ease-standard hover:text-fg-soft'

export function BlogPage({ content: c = blogContent, className }: BlogPageProps) {
  const [first, ...rest] = c.posts
  return (
    <div data-ds="blog-page" className={cn('bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main>
        <div className={cn(WRAP, 'grid gap-4 pt-16 pb-12 max-sm:pt-10 max-sm:pb-8')}>
          <h1 className="type-display max-md:type-hero max-sm:type-heading-1">{c.title}</h1>
          <p className="max-w-140 type-body-lg text-fg-soft">{c.body}</p>
        </div>
        {first && (
          <article className={cn(WRAP, 'grid grid-cols-2 items-center gap-12 pb-16 max-md:grid-cols-1 max-sm:gap-6 max-sm:pb-12')}>
            <CreativeCard {...first.image} alt={first.title} ratio="7/5" />
            <div className="flex flex-col items-start gap-4">
              <p className="type-label text-fg-muted">{`${first.date} · ${first.category}`}</p>
              <h2 className="type-heading-1 text-balance max-sm:type-heading-2"><a href={first.href} className={TITLE}>{first.title}</a></h2>
              <p className="type-body-lg text-fg-soft">{first.excerpt}</p>
              <Button href={first.href} variant="secondary" className="mt-2">{c.read}</Button>
            </div>
          </article>
        )}
        <section aria-label="More posts" className={cn(WRAP, 'grid grid-cols-3 gap-x-6 gap-y-12 pt-12 pb-24 max-md:grid-cols-2 max-sm:grid-cols-1 max-sm:pb-16')}>
          {rest.map((p) => (
            <article key={p.href} className="grid content-start gap-4">
              <CreativeCard {...p.image} alt={p.title} ratio="7/5" />
              <p className="type-label text-fg-muted">{`${p.date} · ${p.category}`}</p>
              <h3 className="type-heading-3 text-balance"><a href={p.href} className={TITLE}>{p.title}</a></h3>
              <p className="type-ui text-fg-soft">{p.excerpt}</p>
            </article>
          ))}
        </section>
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default BlogPage
