import type { CSSProperties } from 'react'
import { Button } from '@/react/components/ui/Button'
import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import { McpSession } from '@/react/components/site/McpSession'
import { SideDrifts } from '@/react/components/visuals/SideDrifts'
import type { ConnectContent } from '@/lib/connect'
import type { SessionContent } from '@/lib/home/session'
import { howItWorksContent, howMarks, type HowItWorksContent, type HowMark } from '@/lib/home/how-it-works'
import { cn } from '@/react/lib/cn'

// The home's set-up section (site v2/V2HowItWorks): on the left the headline, the lead, three numbered steps between
// hairlines, the connect menu beside the quiet button and the clients' marks (under a mouse the others dim and the
// mark's name appears under it; color and opacity only); on the right the MCP session playing (mcp-session). Five to
// seven columns from 1024, stacked below, centered head and full-width buttons on phones; a column drift at the left
// edge from 1440. `connect` and `session` go to the menu and the session; `marks` are the clients' marks.
export interface HowItWorksBlockProps {
  content?: HowItWorksContent
  marks?: HowMark[]
  connect?: ConnectContent
  session?: SessionContent
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function HowItWorksBlock({ content: c = howItWorksContent, marks = howMarks, connect, session, className }: HowItWorksBlockProps) {
  return (
    <section data-ds="how-it-works-block" className={cn('relative isolate py-(--ds-layout-section) text-fg', className)}>
      <style href="ds-how-it-works-block" precedence="ds">{css}</style>
      <SideDrifts left="middle" right={false} />
      <div className={cn(CONTAINER, 'ds-hw-layout')}>
        <div className="ds-hw-copy">
          <h2 className="type-section">{c.headline}</h2>
          <p className="ds-hw-lead mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{c.lead}</p>
          <ol className="ds-hw-steps">
            {c.steps.map((step, i) => (
              <li key={step.title} className="ds-hw-step">
                <span className="ds-hw-number" aria-hidden="true">{i + 1}</span>
                <p className="ds-hw-step-text"><span className="ds-hw-step-title">{step.title}</span> {step.body}</p>
              </li>
            ))}
          </ol>
          <div className="ds-hw-actions">
            <ConnectMenu content={connect} />
            <Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button>
          </div>
          {marks.length ? (
            <ul className="ds-hw-marks" aria-label={c.marksLabel}>
              {marks.map((m) => (
                <li key={m.name}>
                  <a className="ds-hw-mark-link" href={m.href}>
                    {m.src ? <span className="ds-hw-mark" style={{ '--mark': `url("${m.src}")` } as CSSProperties} aria-hidden="true" /> : <span className="ds-hw-letter" aria-hidden="true">{m.name.replace(/^Acme /, '').slice(0, 1)}</span>}
                    <span className="ds-hw-mark-name">{m.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <McpSession content={session} />
      </div>
    </section>
  )
}

export default HowItWorksBlock

const css = `
.ds-hw-layout { display: grid; gap: 48px; }
.ds-hw-copy { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; }
@media (width < 1024px) { .ds-hw-copy > :first-child { text-box: trim-start cap alphabetic; } }
.ds-hw-steps { width: 100%; margin-top: 40px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-hw-step { display: grid; grid-template-columns: 32px minmax(0, 1fr); padding-block: 16px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); }
.ds-hw-number { font-family: var(--ds-font-heading); font-variant-numeric: tabular-nums; color: var(--ds-color-fg-muted); }
.ds-hw-step-text { color: var(--ds-color-fg-soft); text-wrap: pretty; }
.ds-hw-step-title { font-weight: var(--ds-font-weight-medium); color: var(--ds-color-fg); }
.ds-hw-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 40px; }
.ds-hw-marks { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 32px; margin-left: -8px; }
.ds-hw-mark-link { position: relative; display: grid; place-items: center; width: 40px; height: 40px; color: var(--ds-color-fg); transition: color var(--ds-duration-micro) var(--ds-easing-out); }
@media (pointer: coarse) { .ds-hw-mark-link::after { content: ""; position: absolute; inset: -4px; } }
.ds-hw-mark { width: 24px; height: 24px; background-color: currentColor; mask: var(--mark) center / contain no-repeat; }
.ds-hw-letter { display: grid; place-items: center; width: 24px; height: 24px; font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-4); line-height: 1; }
.ds-hw-mark-name { position: absolute; top: 100%; left: 50%; color: var(--ds-color-fg); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; opacity: 0; translate: -50% 0; pointer-events: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-out); }
@media (hover: hover) and (pointer: fine) {
  .ds-hw-marks:has(.ds-hw-mark-link:hover) .ds-hw-mark-link:not(:hover) { color: var(--ds-color-fg-muted); }
  .ds-hw-mark-link:hover .ds-hw-mark-name { opacity: 1; }
}
.ds-hw-marks:has(.ds-hw-mark-link:focus-visible) .ds-hw-mark-link:not(:focus-visible) { color: var(--ds-color-fg-muted); }
.ds-hw-mark-link:focus-visible .ds-hw-mark-name { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .ds-hw-mark-link, .ds-hw-mark-name { transition: none; } }
@media (width < 768px) {
  .ds-hw-copy { align-items: stretch; }
  .ds-hw-actions { display: grid; }
  .ds-hw-actions > * { width: 100%; }
  .ds-hw-copy > h2, .ds-hw-lead { align-self: center; text-align: center; }
}
@media (min-width: 1024px) { .ds-hw-layout { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); align-items: stretch; gap: 64px; } }
`
