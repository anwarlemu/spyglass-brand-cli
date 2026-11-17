import { Button } from '@/react/components/ui/Button'
import { SearchBar } from '@/react/components/product/SearchBar'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { notFoundContent, type NotFoundContent } from '@/lib/pages/not-found'
import { cn } from '@/react/lib/cn'

// The 404 page from library items: a centered hero with the light flowing in from the corners, the headline as a
// plain sentence, the search bar and the way home. The page fills the window, the footer at the foot. `content`
// replaces the copy (lib/pages/not-found.ts); `onSearch` receives the query.
export interface NotFoundPageProps {
  content?: NotFoundContent
  onSearch?: (query: string) => void
  className?: string
}

const WRAP = 'mx-auto w-full max-w-page-wide px-12 max-sm:px-4'

export function NotFoundPage({ content: c = notFoundContent, onSearch, className }: NotFoundPageProps) {
  return (
    <div data-ds="not-found-page" className={cn('flex min-h-dvh flex-col bg-surface text-fg', className)}>
      <div className={WRAP}>
        <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      </div>
      <main className="flex flex-1 flex-col">
        <HeroBlock eyebrow={c.eyebrow} headline={c.headline} body={c.body} actions={<Button href={c.home.href} variant="secondary">{c.home.label}</Button>} placement="center" light="corner" className="flex-1">
          <SearchBar placeholder={c.search} label="Search" onSearch={onSearch} className="mx-auto max-w-160" />
        </HeroBlock>
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default NotFoundPage
