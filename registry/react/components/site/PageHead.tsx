import type { ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import { cn } from '@/react/lib/cn'

// The site's page head (pages/PageHead, PageHead.module.css): the page title as the section head (32/36, 44/48 at 768,
// 56/60 at 1024), each of `lines` on its own line from 768, a lead under it in the soft gray (20/28, 640px at most) and
// the actions 40px below: a White button and a quiet one, or a `control` (a connect menu, a form) in the White
// button's place. 64px above (96 at 768, 128 at 1024) and 80 below (96 at 768). `align="margin"` (the default) puts the
// copy in the left 7 of 12 columns from 768 and an ASCII drift (the texture's cluster crop fading out from the middle)
// in the other 5, or your own `visual` there (shown on phones too); `align="centre"` centers it all and, from 1024,
// fades the texture's mass crop in from the right edge. An `eyebrow` sits 16px over the title in the label style.
// Nothing moves. On phones the buttons take the full width, one under the other; beside a control, the control steps
// aside there and the quiet button turns White (the site's MCP pair).
export interface PageAction {
  label: string
  href: string
}

export interface PageHeadProps {
  /** Names the heading (`<id>-heading`) the section is labeled by. */
  id?: string
  /** The title, one string per line (lines break from 768). */
  lines: string[]
  /** The capital label over the title. */
  eyebrow?: string
  /** The lead paragraph. */
  lead?: string
  /** The White button. Left out when there is a `control`. */
  primary?: PageAction
  /** The quiet button after it. */
  secondary?: PageAction
  /** A control in the White button's place (a connect menu, a sign-up form). */
  control?: ReactNode
  /** On phones, hide the control and turn the quiet button White (the site's MCP pair). False keeps both. */
  pair?: boolean
  /** margin (copy left, drift right) or centre. */
  align?: 'margin' | 'centre'
  /** Your own picture in the right columns instead of the drift (margin only). */
  visual?: ReactNode
  /** The ASCII drift in the right columns when there is no `visual` (margin only). */
  drift?: boolean
  className?: string
}

export function PageHead({ id = 'page', lines, eyebrow, lead, primary, secondary, control, align = 'margin', visual, drift = true, pair = true, className }: PageHeadProps) {
  const centre = align === 'centre'
  const actions = control || primary || secondary
  const paired = Boolean(control) && pair
  return (
    <section data-ds="page-head" aria-labelledby={`${id}-heading`} data-align={align} className={cn('relative isolate overflow-x-clip pt-16 pb-20 text-fg md:pt-24 md:pb-24 lg:pt-32', className)}>
      {centre ? <span aria-hidden="true" className="pointer-events-none absolute top-0 right-0 -z-1 hidden h-full w-[calc(50%-var(--ds-page-head-drift-clear))] select-none lg:block" style={asciiDriftStyleObject('mass', 'right')} /> : null}
      <div className={cn('mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-col gap-6 px-(--ds-layout-gutter)', centre && 'items-center text-center')}>
        {eyebrow ? <p className="-mb-2 type-label text-fg-muted">{eyebrow}</p> : null}
        <h1 id={`${id}-heading`} className="max-w-full type-section">
          {lines.map((line, i) => <span key={`${i}-${line}`} className="inline md:block">{line}{i < lines.length - 1 ? ' ' : null}</span>)}
        </h1>
        <div className={cn('grid w-full grid-cols-[minmax(0,1fr)] gap-12', !centre && 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-start lg:gap-16')}>
          <div className={cn(centre && 'flex flex-col items-center text-center')}>
            {lead ? <p className="max-w-measure type-body-lg text-pretty text-fg-soft">{lead}</p> : null}
            {actions ? (
              <div className={cn('mt-10 flex flex-col gap-3 md:flex-row md:flex-wrap', centre && 'self-stretch md:self-auto md:justify-center')}>
                {control ? <div className={paired ? 'contents max-md:hidden' : 'contents'}>{control}</div> : null}
                {!control && primary ? <Button href={primary.href}>{primary.label}</Button> : null}
                {secondary && !paired ? <Button href={secondary.href} variant="secondary">{secondary.label}</Button> : null}
                {secondary && paired ? (
                  <>
                    <div className="contents max-md:hidden"><Button href={secondary.href} variant="secondary">{secondary.label}</Button></div>
                    <div className="contents md:hidden"><Button href={secondary.href}>{secondary.label}</Button></div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
          {!centre && (visual || drift) ? (
            <div className={cn('relative isolate min-w-0', visual ? 'block' : 'hidden md:block md:min-h-40 md:self-stretch')}>
              {visual ?? <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-16 -z-1 select-none" style={asciiDriftStyleObject('cluster')} />}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default PageHead
