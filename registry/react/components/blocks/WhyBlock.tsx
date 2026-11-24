'use client'
import { useEffect, useRef } from 'react'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { startScene } from '@/lib/home/scene'
import { startDemo } from '@/lib/home/demo'
import { along, barCells, buildArchive, buildMeter, CUSTOM_CELLS, customTimeline, daysLive, endOf, fmt, meterCells, pct, REST_VISIT, runRange, runStatus, SERVER_COLS, TICKS, VISITS, whyContent, whyCreatives, YEARS, type WhyContent, type WhyCreative } from '@/lib/home/why'
import { cn } from '@/react/lib/cn'

// The home's "Why" section (site v2/V2Why): a centered head and three reasons, each a picture over its title and
// line, in one column up to 1280 and three after, hairlines between them. The pictures are instruments that play
// while half of them is on screen (still with reduced motion, on their resting frame): the archive axis (a frame
// visiting four of an advertiser's twelve runs on a timeline, the span and the readout following), the pricing meter
// (a month's calls arriving and charging one credit per record, then turning over) and the ten tools giving way to
// one (their lit cells going dark in turn, then the last row filling). `creatives` fill the archive's frame (Acme
// placeholders by default); `logo` is the advertiser's mark (its initial by default).
export interface WhyBlockProps {
  content?: WhyContent
  /** The four creatives the archive's frame visits. */
  creatives?: WhyCreative[]
  /** The advertiser's mark, 20px in a White circle. */
  logo?: string
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

function ArchiveAxis({ c, creatives, logo }: { c: WhyContent['archive']; creatives: WhyCreative[]; logo?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? startScene(ref.current, buildArchive(c.runs)) : undefined), [c.runs])
  const rest = c.runs[VISITS[REST_VISIT]]
  return (
    <div ref={ref} className="ds-ax">
      <div className="ds-ax-canvas" aria-hidden="true" inert>
        <div className="ds-ax-top">
          <div className="ds-ax-frame">
            {VISITS.map((v, i) => (
              <div key={v} className="ds-ax-pic" style={{ opacity: i === REST_VISIT ? 1 : 0, zIndex: i === REST_VISIT ? 1 : 0 }} data-pic="">
                <CreativeCard ratio="fill" src={creatives[i]?.src} tone={creatives[i]?.tone ?? 2} />
              </div>
            ))}
          </div>
          <div className="ds-ax-readout">
            <p className="ds-ax-brand">
              <span className="ds-ax-logo">{logo ? <img src={logo} alt="" /> : c.brand.slice(0, 1)}</span>
              <span>{c.brand}</span>
              <span className="ds-ax-channel">{c.channel}</span>
            </p>
            <p className="ds-ax-figure" data-fade="">
              <span className="ds-why-num ds-ax-days" data-days="">{daysLive(rest)}</span>
              <span className="ds-why-label">{c.daysLive}</span>
            </p>
            <p className="ds-ax-when" data-fade="">
              <span className="ds-ax-status" data-status="" data-running={rest.stop ? undefined : ''}>{runStatus(rest)}</span>
              <span className="ds-ax-range" data-range="">{runRange(rest)}</span>
            </p>
          </div>
        </div>
        <div className="ds-ax-ledger">
          <div className="ds-ax-lanes" data-lanes="">
            {c.runs.map((run, i) => {
              const { a, b } = barCells(run)
              return <span key={i} className="ds-ax-bar" style={{ left: `${(a / 44) * 100}%`, top: `calc(${i} * var(--lane) - 4px)` }} data-bar="" data-on={i === VISITS[REST_VISIT] ? '' : undefined}>{'='.repeat(b - a)}</span>
            })}
          </div>
          <div className="ds-ax-axis">
            {TICKS.map((t) => <span key={t.at} className={t.major ? 'ds-ax-major' : 'ds-ax-tick'} style={{ left: t.at >= 1 ? 'calc(100% - 1px)' : pct(t.at) }} data-tick="" />)}
            <span className="ds-ax-span" style={{ left: pct(along(rest.start)), width: pct(endOf(rest) - along(rest.start)) }} data-span="" />
          </div>
          <div className="ds-ax-labels">
            {YEARS.map((y) => <span key={y.label} className="ds-ax-year" style={{ left: pct(y.at) }} data-year="">{y.label}</span>)}
            <span className="ds-ax-today">{c.today}</span>
          </div>
        </div>
      </div>
      <p className="sr-only">{c.summary}</p>
    </div>
  )
}

function PricingMeter({ c }: { c: WhyContent['meter'] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? startScene(ref.current, buildMeter(c.calls)) : undefined), [c.calls])
  const cells = meterCells(c.calls, SERVER_COLS)
  const total = c.calls.reduce((sum, call) => sum + call.credits, 0)
  const last = c.calls.length - 1
  return (
    <div ref={ref} className="ds-mt">
      <div className="ds-mt-canvas" aria-hidden="true" inert>
        <div className="ds-mt-readout">
          <p className="ds-mt-period"><span>{c.period}</span><span className="ds-mt-pool">{c.pool}</span></p>
          <div className="ds-mt-figures">
            <p className="ds-mt-figure"><span className="ds-why-num ds-mt-total" data-total="">{fmt(total)}</span><span className="ds-why-label">{c.used}</span></p>
            <p className="ds-mt-figure"><span className="ds-why-num ds-mt-seat-price">{c.seatPrice}</span><span className="ds-why-label">{c.seat}</span></p>
          </div>
        </div>
        <div className="ds-mt-ledger">
          <ol role="list" className="ds-mt-rows">
            {c.calls.map((call, i) => (
              <li key={i} className="ds-mt-row" data-row="" data-on={i === last ? '' : undefined}>
                <span className="ds-mt-tool">{call.tool}</span>
                <span className="ds-mt-returned">{call.returned ?? c.failed}</span>
                <span className="ds-mt-lane" data-lane=""><span className="ds-why-glyphs ds-mt-bar" style={{ left: `${(cells[i].a / SERVER_COLS) * 100}%` }} data-bar="">{'='.repeat(cells[i].b - cells[i].a)}</span></span>
                <span className="ds-mt-credits" data-credits="">{call.credits}</span>
              </li>
            ))}
          </ol>
          <p className="ds-mt-rule">{c.rule}</p>
        </div>
      </div>
      <p className="sr-only">{`A month of usage on one credit pool: ${c.calls.length} calls, each charged one credit per record returned, ${total} credits in all, and ${c.seatPrice} per seat.`}</p>
    </div>
  )
}

function Cells({ at, all }: { at?: number; all?: boolean }) {
  return (
    <span className="ds-why-glyphs ds-cu-bar" data-one={all ? '' : undefined}>
      {Array.from({ length: CUSTOM_CELLS }, (_, i) => (all || i === at
        ? <span key={i} className="ds-cu-cell" data-cell=""><span className="ds-cu-dash" data-dash="">-</span><span className="ds-cu-hash" data-hash="">#</span></span>
        : <span key={i} className="ds-cu-cell">-</span>))}
    </span>
  )
}

function WhyCustom({ c }: { c: WhyContent['custom'] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? startDemo(ref.current, customTimeline, 400) : undefined), [c.stack])
  return (
    <div ref={ref} className="ds-why-fill">
      <div className="ds-cu-canvas" aria-hidden="true" inert>
        <div className="ds-cu">
          <div className="ds-cu-tools">
            <ul className="ds-cu-list" role="list">
              {c.stack.map((name, i) => (
                <li key={name} className="ds-cu-row" data-tool="">
                  <span className="ds-cu-name">{name}</span>
                  <Cells at={i} />
                  <span className="ds-cu-used">{c.used}</span>
                </li>
              ))}
            </ul>
            <div className="ds-cu-row ds-cu-one">
              <span className="ds-cu-name">{c.one}</span>
              <Cells all />
              <span className="ds-cu-used">{c.all}</span>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only">{c.summary}</p>
    </div>
  )
}

export function WhyBlock({ content: c = whyContent, creatives = whyCreatives, logo, className }: WhyBlockProps) {
  return (
    <section data-ds="why-block" className={cn('py-(--ds-layout-section) text-fg', className)}>
      <style href="ds-why-block" precedence="ds">{css}</style>
      <div className={CONTAINER}>
        <header className="ds-why-head mb-16 flex flex-col items-center text-center lg:mb-20">
          <h2 className="type-section">{c.headline}</h2>
          <p className="mx-auto mt-6 max-w-(--ds-layout-measure) type-body-lg text-balance text-fg-soft">{c.lead}</p>
        </header>
        <ul role="list" className="ds-why-cards">
          {c.reasons.map((reason) => (
            <li key={reason.key} className="ds-why-card">
              <h3 className="row-start-2 mt-6 type-heading-4">{reason.title}</h3>
              <p className="row-start-3 mt-3 type-body text-pretty text-fg-soft">{reason.line}</p>
              <div className="ds-why-panel">
                {reason.key === 'memory' ? <ArchiveAxis c={c.archive} creatives={creatives} logo={logo} /> : reason.key === 'pricing' ? <PricingMeter c={c.meter} /> : <WhyCustom c={c.custom} />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default WhyBlock

const css = `
.ds-why-head > :first-child { text-box: trim-start cap alphabetic; }
.ds-why-cards { display: grid; grid-template-columns: minmax(0, 1fr); row-gap: 48px; max-width: var(--ds-layout-measure); margin-inline: auto; margin-bottom: -4px; }
.ds-why-card { position: relative; display: grid; grid-row: span 3; grid-template-rows: subgrid; grid-template-columns: minmax(0, 1fr); row-gap: 0; min-width: 0; }
.ds-why-card + .ds-why-card::before { content: ""; position: absolute; top: -24px; inset-inline: 0; height: var(--ds-border-hairline); background: var(--ds-color-edge); }
.ds-why-panel { --pad: 16px; grid-row: 1; position: relative; overflow: hidden; aspect-ratio: 14 / 13; container: why / size; user-select: none; isolation: isolate; }
@media (min-width: 768px) { .ds-why-panel { --pad: 24px; } }
@media (min-width: 1280px) {
  .ds-why-cards { grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 40px; max-width: none; }
  .ds-why-card + .ds-why-card::before { top: 0; bottom: 0; left: -20px; width: var(--ds-border-hairline); height: auto; }
}
.ds-why-label { color: var(--ds-color-fg-muted); font-size: var(--ds-text-label); line-height: var(--ds-text-label-leading); font-weight: var(--ds-font-weight-medium); letter-spacing: var(--ds-tracking-label); text-transform: uppercase; }
.ds-why-num { font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-regular); font-variant-numeric: tabular-nums; letter-spacing: 0; }
.ds-why-glyphs { font-family: var(--ds-font-ascii); font-size: calc(var(--ds-text-figure) / 3); font-variant-ligatures: none; line-height: 16px; letter-spacing: 0; white-space: pre; }
.ds-why-fill { position: absolute; inset: 0; }

/* The archive axis */
.ds-ax { position: absolute; inset: 0; container: archive / inline-size; }
.ds-ax-canvas { --lane: 8px; position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto; row-gap: 24px; padding: var(--pad); }
.ds-ax-top { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 16px; min-height: 0; }
.ds-ax-frame { position: relative; height: 100%; aspect-ratio: 4 / 5; overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); }
.ds-ax-pic { position: absolute; inset: 0; }
.ds-ax-readout { display: flex; flex-direction: column; justify-content: space-between; min-width: 0; }
.ds-ax-brand { display: flex; align-items: center; gap: 8px; min-width: 0; height: 20px; color: var(--ds-color-fg); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-ax-logo { display: grid; flex: none; place-items: center; overflow: hidden; width: 20px; height: 20px; border-radius: var(--ds-radius-full); background: var(--ds-color-white); color: var(--ds-color-black); font-family: var(--ds-font-heading); font-size: var(--ds-text-caption); line-height: 1; }
.ds-ax-logo img { width: 100%; height: 100%; object-fit: cover; }
.ds-ax-channel { overflow: hidden; color: var(--ds-color-fg-muted); white-space: nowrap; text-overflow: ellipsis; }
.ds-ax-figure, .ds-ax-when { display: grid; gap: 4px; min-width: 0; }
.ds-ax-days { color: var(--ds-color-fg); font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); }
.ds-ax-status, .ds-ax-range { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.ds-ax-status { display: flex; align-items: center; gap: 8px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-ax-status[data-running] { color: var(--ds-color-fg); }
.ds-ax-status[data-running]::before { content: ""; flex: none; width: 4px; height: 4px; background: var(--ds-color-fg); }
.ds-ax-range { color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-ax-ledger { display: grid; row-gap: 8px; }
.ds-ax-lanes { position: relative; height: calc(12 * var(--lane) - 4px); }
.ds-ax-bar { position: absolute; height: 16px; color: var(--ds-color-edge-strong); font-family: var(--ds-font-ascii); font-size: calc(var(--ds-text-figure) / 3); line-height: 16px; letter-spacing: 0; white-space: pre; transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-ax-bar[data-on] { color: var(--ds-color-fg); }
.ds-ax-axis { position: relative; height: 8px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge-strong); }
.ds-ax-tick, .ds-ax-major { position: absolute; top: 0; width: var(--ds-border-hairline); background: var(--ds-color-edge-strong); }
.ds-ax-tick { height: 4px; }
.ds-ax-major { height: 8px; }
.ds-ax-span { position: absolute; top: calc(-1 * var(--ds-border-hairline)); height: var(--ds-border-hairline); background: var(--ds-color-fg); pointer-events: none; }
.ds-ax-span::after { content: ""; position: absolute; top: 0; right: 0; width: var(--ds-border-hairline); height: calc(8px + var(--ds-border-hairline)); background: var(--ds-color-fg); }
.ds-ax-labels { position: relative; height: 16px; margin-top: -4px; color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-ax-year, .ds-ax-today { position: absolute; top: 0; white-space: nowrap; }
.ds-ax-today { right: 0; }
@container archive (min-width: 380px) {
  .ds-ax-top { column-gap: 24px; }
  .ds-ax-days { font-size: var(--ds-text-figure); line-height: var(--ds-text-figure-leading); }
}

/* The pricing meter */
.ds-mt { position: absolute; inset: 0; container: meter / inline-size; }
.ds-mt-canvas { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto; row-gap: 24px; padding: var(--pad); }
.ds-mt-readout { display: flex; flex-direction: column; justify-content: space-between; min-height: 0; }
.ds-mt-period { display: flex; align-items: center; gap: 8px; height: 20px; color: var(--ds-color-fg); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-mt-pool { color: var(--ds-color-fg-muted); }
.ds-mt-figures { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 16px; }
.ds-mt-figure { display: grid; gap: 4px; justify-items: start; }
.ds-mt-total, .ds-mt-seat-price { font-size: var(--ds-text-heading-2); line-height: var(--ds-text-heading-2-leading); }
.ds-mt-total { color: var(--ds-color-fg); }
.ds-mt-seat-price { color: var(--ds-color-fg-muted); }
.ds-mt-ledger { display: grid; row-gap: 8px; }
.ds-mt-rows { display: grid; grid-template-columns: max-content max-content minmax(0, 1fr) max-content; column-gap: 12px; row-gap: 8px; padding-bottom: 8px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge-strong); }
.ds-mt-row { display: grid; grid-column: 1 / -1; grid-template-columns: subgrid; align-items: center; height: 16px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-mt-tool { color: var(--ds-color-fg-soft); font-family: var(--ds-font-code); }
.ds-mt-returned { color: var(--ds-color-fg-muted); }
.ds-mt-lane { position: relative; align-self: stretch; min-width: 0; }
.ds-mt-bar { position: absolute; top: 0; color: var(--ds-color-edge-strong); transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-mt-credits { min-width: 16px; color: var(--ds-color-fg-muted); text-align: right; font-variant-numeric: tabular-nums; transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-mt-row[data-on] .ds-mt-bar, .ds-mt-row[data-on] .ds-mt-credits { color: var(--ds-color-fg); }
.ds-mt-rule { color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
@container why (min-height: 480px) {
  .ds-mt-canvas { grid-template-rows: auto auto; align-content: center; }
  .ds-mt-readout { gap: 24px; }
}
@container meter (min-width: 380px) {
  .ds-mt-figures { column-gap: 24px; }
  .ds-mt-total, .ds-mt-seat-price { font-size: var(--ds-text-figure); line-height: var(--ds-text-figure-leading); }
}

/* Built to be customized */
.ds-cu-canvas { position: absolute; inset: 0; overflow: clip; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-cu { position: absolute; inset: 0; display: grid; place-items: center; padding: var(--pad); container: custom / inline-size; }
.ds-cu-tools { display: flex; width: 100%; flex-direction: column; gap: 8px; }
.ds-cu-list { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ds-cu-row { display: grid; grid-template-columns: minmax(0, 1fr) 80px 32px; align-items: center; column-gap: 12px; height: 16px; }
.ds-cu-name { overflow: hidden; color: var(--ds-color-fg-soft); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; text-overflow: ellipsis; }
.ds-cu-bar { display: flex; color: var(--ds-color-fg-muted); }
.ds-cu-cell { position: relative; display: inline-block; width: 8px; height: 16px; text-align: center; }
.ds-cu-dash, .ds-cu-hash { position: absolute; inset: 0; }
.ds-cu-dash { opacity: 0; }
.ds-cu-hash { color: var(--ds-color-fg); }
.ds-cu-used { color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); text-align: right; font-variant-numeric: tabular-nums; }
.ds-cu-one { box-sizing: content-box; padding-top: 8px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge-strong); }
.ds-cu-one .ds-cu-name, .ds-cu-one .ds-cu-used { color: var(--ds-color-fg); }
@container custom (min-width: 380px) {
  .ds-cu-list, .ds-cu-tools { gap: 12px; }
  .ds-cu-one { padding-top: 12px; }
  .ds-cu-row { column-gap: 16px; }
}
@container custom (min-width: 560px) {
  .ds-cu-list, .ds-cu-tools { gap: 16px; }
  .ds-cu-one { padding-top: 16px; }
}
`
