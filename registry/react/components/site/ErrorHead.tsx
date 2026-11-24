import { PageHead, type PageAction } from '@/react/components/site/PageHead'
import { Button } from '@/react/components/ui/Button'

// The site's error head (pages/PageHead/ErrorHead): the page head with no drift, the title in one line, the lead, and
// a White "Try again" button (`onRetry`) beside the quiet way home.
export interface ErrorHeadContent {
  lines: string[]
  lead: string
  retry: string
  home: PageAction
}

export const errorHeadContent: ErrorHeadContent = {
  lines: ['Something went wrong'],
  lead: 'This page did not load. Try again, or start from the homepage.',
  retry: 'Try again',
  home: { label: 'Go to the homepage', href: '/' },
}

export interface ErrorHeadProps {
  content?: ErrorHeadContent
  /** Called when the White button is pressed. */
  onRetry?: () => void
  className?: string
}

export function ErrorHead({ content: c = errorHeadContent, onRetry, className }: ErrorHeadProps) {
  return (
    <div data-ds="error-head" className="contents">
      <PageHead
        id="error"
        lines={[c.lines.join(' ')]}
        lead={c.lead}
        drift={false}
        pair={false}
        control={<Button onClick={onRetry}>{c.retry}</Button>}
        secondary={c.home}
        className={className}
      />
    </div>
  )
}

export default ErrorHead
