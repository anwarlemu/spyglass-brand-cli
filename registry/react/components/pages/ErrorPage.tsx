import { ErrorHead } from '@/react/components/site/ErrorHead'
import { errorContent, type ErrorContent } from '@/lib/pages/error'
import { cn } from '@/react/lib/cn'

// The site's error page (app/error.tsx and global-error.tsx): what shows when a page fails to render, so neither the
// header nor the footer is there, only the error head on Black: the title in one line, the plain sentence, the White
// "Try again" (`onRetry`) and the quiet way home. As the page's last section it keeps the site's section padding under
// it (56px, 76 at 768, 84 at 1024), in a box that takes back what the page head keeps below. `content` replaces the
// copy (lib/pages/error.ts).
export interface ErrorPageProps {
  content?: ErrorContent
  onRetry?: () => void
  className?: string
}

export function ErrorPage({ content: c = errorContent, onRetry, className }: ErrorPageProps) {
  return (
    <div data-ds="error-page" className={cn('min-h-svh bg-surface text-fg', className)}>
      <main id="main">
        <div className="-mb-6 md:-mb-5 lg:-mb-3">
          <ErrorHead content={c} onRetry={onRetry} />
        </div>
      </main>
    </div>
  )
}

export default ErrorPage
