import type { ReactNode } from 'react'
import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import type { PageAction } from '@/react/components/site/PageHead'
import { Button } from '@/react/components/ui/Button'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import { cn } from '@/react/lib/cn'

// The site's closing section (pages/PageClose): a centered section head (each of `lines` on its own line), a note in
// the soft gray and the actions 16px under it: the connect menu with a quiet button by default, or, with `control`
// set to null, a White and a quiet button. On phones the actions stack at full width, and beside a control the control
// steps aside and the quiet button turns White (the site's MCP pair). From 1024 two crops of the
// ASCII texture fade in, the mass from the lower left and the scatter from the upper right. Nothing moves.
export interface PageCloseProps {
  /** The section's id; names its heading (`<id>-heading`). */
  id?: string
  lines?: string[]
  note?: string
  /** The White button (quiet beside a control). */
  primary?: PageAction
  /** The quiet button when there is no control. */
  secondary?: PageAction
  /** The main control (the connect menu by default); null for two buttons. */
  control?: ReactNode
  /** The two ASCII drifts from 1024. */
  texture?: boolean
  className?: string
}

export function PageClose({
  id = 'close',
  lines = ['Give your agents', 'the social internet'],
  note = '500 free credits every month. No card required.',
  primary = { label: 'Get a free API key', href: '#' },
  secondary = { label: 'Talk to us', href: '#' },
  control = <ConnectMenu />,
  texture = true,
  className,
}: PageCloseProps) {
  return (
    <section data-ds="page-close" id={id} aria-labelledby={`${id}-heading`} className={cn('relative isolate overflow-x-clip py-(--ds-layout-section) text-fg', className)}>
      {texture ? (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute bottom-(--ds-layout-section) left-0 -z-1 hidden h-[64%] w-[min(calc(50%-var(--ds-page-head-drift-clear)),var(--ds-page-close-drift-w))] select-none lg:block" style={asciiDriftStyleObject('mass', 'left')} />
          <span aria-hidden="true" className="pointer-events-none absolute top-(--ds-layout-section) right-0 -z-1 hidden h-[48%] w-[min(20%,var(--ds-page-close-drift-high-w))] select-none lg:block" style={asciiDriftStyleObject('scatter', 'right')} />
        </>
      ) : null}
      <div className="mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col items-center gap-6 px-(--ds-layout-gutter) text-center">
        <h2 id={`${id}-heading`} className="type-section [text-box:trim-start_cap_alphabetic]">
          {lines.map((line, i) => <span key={`${i}-${line}`} className="block">{line}{i < lines.length - 1 ? ' ' : null}</span>)}
        </h2>
        {note ? <p className="type-body text-fg-soft">{note}</p> : null}
        <div className="mt-4 flex flex-wrap justify-center gap-3 max-md:flex-col max-md:self-stretch">
          {control ? (
            <>
              <div className="contents max-md:hidden">{control}</div>
              <div className="contents max-md:hidden"><Button href={primary.href} variant="secondary">{primary.label}</Button></div>
              <div className="contents md:hidden"><Button href={primary.href}>{primary.label}</Button></div>
            </>
          ) : (
            <>
              <Button href={primary.href}>{primary.label}</Button>
              <Button href={secondary.href} variant="secondary">{secondary.label}</Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default PageClose
