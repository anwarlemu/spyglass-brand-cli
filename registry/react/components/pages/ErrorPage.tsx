import { Button } from '@/react/components/ui/Button'
import { HeroBlock } from '@/react/components/blocks/HeroBlock'
import { Logo } from '@/react/components/visuals/Logo'
import { errorContent, type ErrorContent } from '@/lib/pages/error'
import { cn } from '@/react/lib/cn'

// The 500 page from library items: the lockup, a centered hero with the light in from the corners, what happened in a
// plain sentence, the White button to try again (`onRetry`, or a link to the page itself) and the way home, and a
// line to write to the team. It fills the window.
export interface ErrorPageProps {
  content?: ErrorContent
  onRetry?: () => void
  className?: string
}

export function ErrorPage({ content: c = errorContent, onRetry, className }: ErrorPageProps) {
  return (
    <div data-ds="error-page" className={cn('flex min-h-dvh flex-col bg-surface text-fg', className)}>
      <div className="mx-auto flex h-16 w-full max-w-page-wide items-center px-12 max-sm:px-4 lg:h-header">
        <a href={c.home.href} aria-label="Home" className="rounded-control"><Logo height={20} /></a>
      </div>
      <main className="flex flex-1 flex-col">
        <HeroBlock eyebrow={c.eyebrow} headline={c.headline} body={c.body} placement="center" light="corner" className="flex-1" actions={<><Button href={c.retry.href || undefined} onClick={onRetry}>{c.retry.label}</Button><Button href={c.home.href} variant="secondary">{c.home.label}</Button></>}>
          <p className="text-center type-ui text-fg-muted"><a href={c.contact.href} className="rounded-ds-sm underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-160 ease-out hover:decoration-fg">{c.contact.label}</a></p>
        </HeroBlock>
      </main>
    </div>
  )
}

export default ErrorPage
