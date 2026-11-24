'use client'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { ASCII_TEXTURE } from '@/lib/textures'
import { startDemo } from '@/lib/home/demo'
import { startScene } from '@/lib/home/scene'
import { addedLabel, allLabels, burstContent, castTone, LAST, LIVE_CELLS, ringOffset, SHOTS, startAccountsBurst, STILL, unitMove, visibleAt, WELL_FROM, type BurstContent } from '@/lib/home/accounts-burst'
import { buildTally, featuresContent, MEDIA_HOLD, mediaAds, mediaCarry, mediaContent, mediaLayout, mediaRest, mediaShown, mediaTimeline, RING_HOLD, ringContent, ringIconStyle, ringLabelStyle, ringSide, ringTimeline, TALLY_SLOTS, tallyContent, tallyRowAt, type FeaturesContent, type MediaAd, type MediaContent, type RingContent, type TallyContent } from '@/lib/home/features'
import { cn } from '@/react/lib/cn'

// The home's features (site v2/V2Features): a centered head and four cards in two columns from 768, each a #262626
// stage with the ASCII texture at its edges over its title and line. The stages play while on screen (still with
// reduced motion): the media strip (a search across the ad libraries, a row of matching ads gliding past with how
// long each ran), the accounts burst (a search chip types to a query, creatives burst around it and gather into the
// brand's row as a live bar fills), the graph ring (a brand's mark opening into its ads, posts, creator and landing
// page) and the patterns tally (a reel bringing each hook's creative into brackets, a leader typed to its row). The
// brands, creatives and platforms are Acme placeholders and plain names; pass your own through the content props.
export interface FeaturesBlockProps {
  content?: FeaturesContent
  media?: MediaContent
  ads?: MediaAd[]
  burst?: BurstContent
  ring?: RingContent
  tally?: TallyContent
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const Search = ({ className }: { className: string }) => <svg className={className} viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.5" /><path d="m10.5 10.5 3 3" /></svg>
const Send = () => <svg className="ds-ft-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12.5v-9M4 7.5l4-4 4 4" /></svg>

function Card({ title, body, at, children }: { title: string; body: string; at: string; children: ReactNode }) {
  return (
    <li className="ds-ft-card">
      <div className="ds-ft-text"><h3 className="ds-ft-title">{title}</h3><p className="ds-ft-body">{body}</p></div>
      <div className="ds-ft-stage">
        <span className="ds-ft-ascii" aria-hidden="true" style={{ '--ascii-at': at, backgroundImage: `url("${ASCII_TEXTURE}")` } as CSSProperties} />
        {children}
      </div>
    </li>
  )
}

function MediaStrip({ m, ads }: { m: MediaContent; ads: MediaAd[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const widths = ads.map((a) => a.h * a.ratio)
  const { lefts, slots } = mediaLayout(widths)
  const cam = mediaCarry(slots)
  useEffect(() => (ref.current ? startDemo(ref.current, mediaTimeline(mediaCarry(mediaLayout(ads.map((a) => a.h * a.ratio)).slots))) : undefined), [ads])
  return (
    <div ref={ref} className="ds-ft-demo">
      <div className="ds-ft-canvas" aria-hidden="true" inert>
        <div className="ds-ms">
          <div className="ds-ms-field">
            <div className="ds-ms-row" data-row="" style={{ '--at': `${mediaRest(cam)}cqw` } as CSSProperties}>
              {ads.map((ad, i) => (
                <div key={i} className="ds-ms-ad" data-ad="" style={{ '--x': lefts[i].toFixed(2), '--w': widths[i].toFixed(2), '--h': ad.h, opacity: mediaShown(i, MEDIA_HOLD) ? undefined : 0 } as CSSProperties}>
                  <CreativeCard ratio="fill" src={ad.src} tone={ad.tone} />
                  <span className="ds-ms-tags">{(ad.views ? [m.views.replace('{n}', ad.views), m.ago.replace('{n}', String(ad.ago ?? 0))] : [m.days.replace('{n}', String(ad.days ?? 0))]).map((l) => <span key={l} className="ds-ms-days">{l}</span>)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="ds-ms-dock">
            <div className="ds-ms-prompt">
              <Search className="ds-ft-icon" />
              <span className="ds-ms-query">{m.query}</span>
              <span className="ds-ms-sources">
                <span className="ds-ms-scope"><span className="ds-ms-across">{m.across}</span>{m.live.join(', ')}</span>
                <span className="ds-ms-scope ds-ms-soon">{m.soon} +{m.later.length}</span>
              </span>
              <span className="ds-ms-send"><Send /></span>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only">{m.summary}</p>
    </div>
  )
}

function Chip({ label, labels, aiLabel, live }: { label: string; labels: string[]; aiLabel: string; live?: boolean }) {
  return (
    <>
      <span className="ds-ab-well" data-ab-well={live ? '' : undefined} style={{ transform: `scale(${WELL_FROM.toFixed(4)})` }}><Search className="ds-ab-icon" /></span>
      <span className="ds-ab-labels">{labels.map((l) => <span key={l} className="ds-ab-sizer">{l}</span>)}<span className="ds-ab-label" data-ab-label={live ? '' : undefined}>{label}</span></span>
      <span className="ds-ab-ai">{aiLabel}</span>
    </>
  )
}

function AccountsBurst({ c }: { c: BurstContent }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? startAccountsBurst(ref.current, c.searches) : undefined), [c])
  const still = new Set(visibleAt(STILL))
  const labels = allLabels(c.searches)
  return (
    <div ref={ref} className="ds-ab">
      <div className="ds-ab-canvas" aria-hidden="true">
        {c.searches.map((s, q) => SHOTS.map(([slot, , , w, h], i) => {
          const on = q === 0 && still.has(i)
          const [dx, dy] = ringOffset(i, STILL)
          return (
            <span key={`${q}-${i}`} className="ds-ab-shot" data-shot={`${q}-${i}`} data-still={on ? '' : undefined} style={{ '--w': w, '--h': h, zIndex: slot + 1, transform: on ? unitMove(dx, dy) : undefined } as CSSProperties}>
              <CreativeCard ratio="fill" tone={castTone(s, i)} />
            </span>
          )
        }))}
        <div className="ds-ab-anchor"><div className="ds-ab-chip ds-ab-ground" data-ab-chip=""><Chip label={c.searches[0].scrub[0]} labels={labels} aiLabel={c.aiLabel} live /></div></div>
        {c.searches.map((s, q) => (
          <div key={s.query} className="ds-ab-anchor">
            <div className="ds-ab-box" data-box={q} data-still={q === 0 ? '' : undefined}>
              <span data-k="pic" className="ds-ab-pic" style={{ opacity: 0 }}><CreativeCard ratio="fill" tone={castTone(s, LAST)} /></span>
              <span data-k="row" className="ds-ab-row-face">
                <span className="ds-ab-row">
                  <span className="ds-ab-head">
                    <span className="ds-ab-logo">{s.row.logo ? <img src={s.row.logo} alt="" /> : s.row.name.replace(/^Acme /, '').slice(0, 1)}</span>
                    <span className="ds-ab-who"><span className="ds-ab-strong">{s.row.name}</span><span className="ds-ab-sub">{s.row.category}</span></span>
                  </span>
                  <span className="ds-ab-stats">
                    <span className="ds-ab-stat"><span className="ds-ab-strong">{s.row.instagram}</span><span className="ds-ab-sub">{c.columns.instagram}</span></span>
                    <span className="ds-ab-stat"><span className="ds-ab-strong">{s.row.tiktok ?? <span className="ds-ab-dash" />}</span><span className="ds-ab-sub">{c.columns.tiktok}</span></span>
                    <span className="ds-ab-stat"><span className="ds-ab-strong">{s.row.activeAds.toLocaleString('en-US')}</span><span className="ds-ab-sub">{c.columns.meta}</span></span>
                  </span>
                </span>
                <span className="ds-ab-live" data-k="live" data-state="added">
                  <span className="ds-ab-status"><span className="ds-ab-searching">{c.searching}</span><span className="ds-ab-added">{addedLabel(c, s.added)}</span></span>
                  <span className="ds-ab-bar"><span data-k="lit" className="ds-ab-lit">{'#'.repeat(LIVE_CELLS)}</span><span data-k="unlit" className="ds-ab-unlit" /></span>
                </span>
              </span>
              <span data-k="chip" className="ds-ab-chip ds-ab-chip-face" style={{ opacity: 0 }}><Chip label={c.searches[(q + 1) % c.searches.length].scrub[0]} labels={labels} aiLabel={c.aiLabel} /></span>
            </div>
          </div>
        ))}
      </div>
      <div className="sr-only">{c.searches.map((s) => <p key={s.query}>{`Searching brands for "${s.query}" returns ${s.row.name}, ${s.row.category}: ${s.row.instagram} Instagram followers, ${s.row.activeAds.toLocaleString('en-US')} active ads. The live search adds ${s.added} new accounts to the archive.`}</p>)}</div>
    </div>
  )
}

function GraphRing({ c }: { c: RingContent }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? startDemo(ref.current, ringTimeline(c.nodes)) : undefined), [c])
  return (
    <div ref={ref} className="ds-ft-demo">
      <div className="ds-ft-canvas" aria-hidden="true" inert>
        <div className="ds-gr">
          <div className="ds-gr-ring">
            {[...c.nodes].reverse().map((n) => (
              <span key={n.key} className="ds-gr-node" data-node={n.key} style={{ transform: ringIconStyle(n, RING_HOLD).transform as string }}>
                {n.look === 'mark' ? <span className="ds-gr-mark">{c.brand.slice(0, 1)}</span>
                  : n.look === 'page' ? <span className="ds-gr-page"><span className="ds-gr-bar"><span className="ds-gr-dot" data-dot="close" /><span className="ds-gr-dot" data-dot="min" /><span className="ds-gr-dot" data-dot="full" /></span><span className="ds-gr-shot"><CreativeCard ratio="fill" src={n.src} tone={n.tone ?? 2} /></span></span>
                  : <span className={n.look === 'face' ? 'ds-gr-face' : 'ds-gr-post'}><CreativeCard ratio="fill" src={n.src} tone={n.tone ?? 2} /></span>}
              </span>
            ))}
            {c.nodes.map((n) => {
              const rest = ringLabelStyle(n, RING_HOLD)
              const side = ringSide(n.angle)
              return (
                <span key={n.key} className="ds-gr-label" data-label={n.key} style={{ transform: rest.transform as string, opacity: rest.opacity as number }}>
                  <span className="ds-gr-text" data-v={side.v} data-h={side.h}><span className="ds-gr-kind">{n.kind}</span><span className="ds-gr-source">{n.source}</span></span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
      <p className="sr-only">{c.summary}</p>
    </div>
  )
}

function PatternsTally({ c }: { c: TallyContent }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => (ref.current ? startScene(ref.current, buildTally(c)) : undefined), [c])
  return (
    <div ref={ref} className="ds-ft-tally">
      <div className="ds-tl" aria-hidden="true" inert>
        <div className="ds-tl-reel" data-reel="">
          <div className="ds-tl-strip" data-strip="">
            {TALLY_SLOTS.map((k) => {
              const row = c.rows[tallyRowAt(k, c.rows.length)]
              return <div key={k} className="ds-tl-card" data-card=""><CreativeCard ratio="fill" src={row.src} tone={row.tone} /></div>
            })}
          </div>
          <div className="ds-tl-frame" data-frame="">
            <span className="ds-tl-brackets" data-brackets=""><i /><i /><i /><i /></span>
            <span className="ds-tl-facts" data-facts="">
              {c.facts.map((f, i) => <span key={f.full} className="ds-tl-fact" style={i ? { opacity: 0 } : undefined} data-fact=""><span className="ds-tl-full">{f.full}</span><span className="ds-tl-short">{f.short}</span></span>)}
            </span>
          </div>
        </div>
        <div className="ds-tl-side">
          <p className="ds-tl-head"><span className="ds-tl-logo">{c.brand.slice(0, 1)}</span><span className="ds-tl-brand">{c.brand}</span><span className="ds-tl-meta">{c.meta}</span></p>
          <ol className="ds-tl-rows">
            {c.rows.map((row) => (
              <li key={row.name} className="ds-tl-row" data-row="">
                <span className="ds-tl-name">{row.name}</span>
                <span className="ds-tl-count">{row.total}</span>
                <span className="ds-tl-ruler" data-ruler=""><span className="ds-tl-fill" data-fill="" /><span className="ds-tl-hot" data-hot="" /><span className="ds-tl-rest" data-rest="" /></span>
              </li>
            ))}
          </ol>
          <p className="ds-tl-scale"><span data-per="">{c.per.replace('{n}', '2')}</span><span>{c.ads.replace('{n}', String(c.of))}</span></p>
        </div>
        {c.rows.map((row) => <span key={row.name} className="ds-tl-leader" data-leader="" />)}
      </div>
      <p className="sr-only">{c.summary}</p>
    </div>
  )
}

export function FeaturesBlock({ content: c = featuresContent, media = mediaContent, ads = mediaAds, burst = burstContent, ring = ringContent, tally = tallyContent, className }: FeaturesBlockProps) {
  return (
    <section data-ds="features-block" className={cn('py-(--ds-layout-section) text-fg', className)}>
      <style href="ds-features-block" precedence="ds">{css}</style>
      <div className={CONTAINER}>
        <header className="ds-ft-head mb-16 flex flex-col items-center text-center lg:mb-20">
          <h2 className="type-section">{c.headline}</h2>
          <p className="mt-6 max-w-(--ds-layout-measure) type-body-lg text-pretty text-fg-soft">{c.lead}</p>
        </header>
        <ul className="ds-ft-grid" role="list">
          <Card title={c.media.title} body={c.media.body} at="40% 24%"><MediaStrip m={media} ads={ads} /></Card>
          <Card title={c.accounts.title} body={c.accounts.body} at="0 0"><AccountsBurst c={burst} /></Card>
          <Card title={c.entity.title} body={c.entity.body} at="20% 80%"><GraphRing c={ring} /></Card>
          <Card title={c.patterns.title} body={c.patterns.body} at="64% 56%"><PatternsTally c={tally} /></Card>
        </ul>
      </div>
    </section>
  )
}

export default FeaturesBlock

const css = `
.ds-ft-head > :first-child { text-box: trim-start cap alphabetic; }
.ds-ft-grid { display: grid; grid-template-columns: minmax(0, 1fr); column-gap: 32px; margin-bottom: -88px; }
.ds-ft-card { display: grid; grid-row: span 2; grid-template-rows: subgrid; grid-template-columns: minmax(0, 1fr); min-width: 0; }
.ds-ft-text { grid-row: 2; padding: 20px 40px 88px 8px; }
.ds-ft-title { font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-4); line-height: var(--ds-text-heading-4-leading); font-weight: var(--ds-font-weight-regular); }
.ds-ft-body { max-width: var(--ds-layout-measure); margin-top: 12px; color: var(--ds-color-fg-soft); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); text-wrap: pretty; }
.ds-ft-ascii { position: absolute; inset: 0; z-index: -1; pointer-events: none; background-position: var(--ascii-at); background-size: var(--ds-ascii-tile) var(--ds-ascii-tile); opacity: var(--ds-ascii-quiet); mix-blend-mode: screen; mask-image: radial-gradient(ellipse 46% 50% at 50% 50%, transparent 40%, var(--ds-color-black) 100%); }
.ds-ft-stage { grid-row: 1; position: relative; isolation: isolate; min-width: 0; aspect-ratio: 4 / 3; overflow: clip; container: stage / inline-size; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-raised); }
@media (width < 768px) { .ds-ft-text { padding-right: 8px; padding-bottom: 48px; } .ds-ft-grid { margin-bottom: -52px; } }
@media (min-width: 768px) { .ds-ft-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.ds-ft-demo, .ds-ft-canvas { position: absolute; inset: 0; }
.ds-ft-canvas { overflow: clip; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-ft-icon { flex: none; width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }

/* The media strip */
.ds-ms { position: absolute; inset: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto; }
.ds-ms-field { position: relative; }
.ds-ms-row { position: absolute; top: 50%; left: 0; transform: translateX(var(--at)); }
.ds-ms-ad { position: absolute; top: calc(var(--h) * -0.5cqw); left: calc(var(--x) * 1cqw); width: calc(var(--w) * 1cqw); height: calc(var(--h) * 1cqw); overflow: hidden; border-radius: var(--ds-radius-sm); }
.ds-ms-tags { position: absolute; right: 0; bottom: 8px; left: 8px; display: flex; flex-wrap: wrap; gap: 4px; }
.ds-ms-days { height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-control); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); background: var(--ds-color-black); color: var(--ds-color-fg); line-height: 24px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.ds-ms-dock { display: flex; justify-content: center; padding: 0 16px 24px; }
.ds-ms-prompt { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "icon query send" ". sources send"; align-items: center; column-gap: 8px; row-gap: 4px; width: min(100%, 440px); padding: 12px 16px; border-radius: var(--ds-radius-control); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); background: var(--ds-color-black); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-ms-prompt > .ds-ft-icon { grid-area: icon; color: var(--ds-color-fg-muted); }
.ds-ms-query { grid-area: query; min-width: 0; }
.ds-ms-sources { grid-area: sources; display: flex; align-items: center; gap: 4px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; min-width: 0; overflow: hidden; }
.ds-ms-scope { display: flex; align-items: center; gap: 8px; height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); color: var(--ds-color-fg-soft); }
.ds-ms-across { color: var(--ds-color-fg-muted); }
.ds-ms-soon { color: var(--ds-color-fg-faint); }
.ds-ms-send { grid-area: send; display: grid; place-items: center; width: 32px; height: 32px; border-radius: var(--ds-radius-control); background: var(--ds-color-white); color: var(--ds-color-black); }
@container stage (width < 440px) {
  .ds-ms-prompt { row-gap: 0; padding: 8px 8px 8px 16px; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
  .ds-ms-query { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ds-ms-across { display: none; }
  .ds-ms-dock { padding-bottom: 16px; }
  .ds-ms-tags { display: none; }
}

/* The accounts burst */
.ds-ab, .ds-ab-canvas { position: absolute; inset: 0; }
.ds-ab { container: burst / size; }
.ds-ab-canvas { --u: calc(min(100cqw, 100cqh) / 1080); overflow: clip; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-ab-shot { position: absolute; left: calc(50% - var(--u) * var(--w) / 2); top: calc(50% - var(--u) * var(--h) / 2); width: calc(var(--u) * var(--w)); height: calc(var(--u) * var(--h)); overflow: clip; border-radius: var(--ds-radius-sm); visibility: hidden; }
.ds-ab-anchor { position: absolute; left: 50%; top: calc(50% - var(--u) * 5); z-index: 10; width: max-content; translate: -50% -50%; }
.ds-ab-chip { display: flex; align-items: center; gap: 8px; height: var(--ds-size-control-md); padding-inline: 8px; border-radius: var(--ds-radius-control); color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); font-weight: var(--ds-font-weight-medium); white-space: nowrap; }
.ds-ab-ground { background: var(--ds-color-black); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); will-change: transform; }
.ds-ab-well { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: var(--ds-radius-control); background: var(--ds-color-white); color: var(--ds-color-black); }
.ds-ab-icon { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; }
.ds-ab-labels { display: grid; }
.ds-ab-labels > * { grid-area: 1 / 1; }
.ds-ab-sizer { visibility: hidden; }
.ds-ab-ai { height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-control); background: var(--ds-color-surface-inset); color: var(--ds-color-fg-soft); font-size: var(--ds-text-caption); line-height: 24px; }
.ds-ab-box { position: relative; visibility: hidden; overflow: clip; border-radius: var(--ds-radius-control); background: var(--ds-color-black); outline: var(--ds-border-hairline) solid var(--ds-color-edge-surface); outline-offset: calc(-1 * var(--ds-border-hairline)); will-change: transform; }
.ds-ab-box[data-still] { visibility: visible; }
.ds-ab-pic, .ds-ab-chip-face { position: absolute; left: 50%; top: 50%; }
.ds-ab-pic { overflow: clip; border-radius: var(--ds-radius-sm); }
.ds-ab-row-face { display: block; }
.ds-ab-row { display: flex; flex-direction: column; gap: 12px; padding: 12px; white-space: nowrap; }
.ds-ab-head, .ds-ab-stats { display: flex; align-items: center; gap: 16px; }
.ds-ab-head { gap: 8px; }
.ds-ab-logo { display: grid; flex: none; place-items: center; width: 24px; height: 24px; overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-white); color: var(--ds-color-black); font-family: var(--ds-font-heading); font-size: var(--ds-text-caption); line-height: 1; }
.ds-ab-logo img { width: 100%; height: 100%; object-fit: cover; }
.ds-ab-who, .ds-ab-stat { display: grid; }
.ds-ab-strong { color: var(--ds-color-fg); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); font-weight: var(--ds-font-weight-medium); }
.ds-ab-sub { color: var(--ds-color-fg-muted); }
.ds-ab-dash { display: inline-block; width: 8px; height: var(--ds-border-hairline); vertical-align: middle; background: var(--ds-color-fg-muted); }
.ds-ab-live { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 12px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge-surface); white-space: nowrap; }
.ds-ab-status { display: grid; }
.ds-ab-status > * { grid-area: 1 / 1; }
.ds-ab-searching { color: var(--ds-color-fg-muted); }
.ds-ab-added { color: var(--ds-color-fg-soft); }
.ds-ab-live[data-state="added"] .ds-ab-searching, .ds-ab-live[data-state="searching"] .ds-ab-added { visibility: hidden; }
.ds-ab-bar { display: flex; height: 16px; font-family: var(--ds-font-ascii); font-size: calc(var(--ds-text-figure) / 3); line-height: 16px; letter-spacing: 0; white-space: pre; }
.ds-ab-lit { color: var(--ds-color-fg-soft); }
.ds-ab-unlit { color: var(--ds-color-fg-muted); }
@media (prefers-reduced-motion: reduce) { .ds-ab-shot[data-still] { visibility: visible; } .ds-ab-ground { visibility: hidden; } }
@container burst (width >= 480px) {
  .ds-ab-chip { gap: 12px; height: var(--ds-size-control-lg); padding-inline: 12px; font-size: var(--ds-text-body-lg); line-height: var(--ds-text-body-lg-leading); }
  .ds-ab-well { width: 32px; height: 32px; }
  .ds-ab-icon { width: 16px; height: 16px; }
  .ds-ab-ai { height: 32px; padding-inline: 12px; font-size: var(--ds-text-ui); line-height: 32px; }
  .ds-ab-row { flex-direction: row; align-items: center; gap: 24px; padding: 12px 16px 12px 12px; }
  .ds-ab-head { gap: 12px; }
  .ds-ab-live { gap: 16px; padding-inline: 12px 16px; }
}

/* The graph ring */
.ds-gr { position: absolute; inset: 0; container: graph / size; }
.ds-gr-ring { --grow: 1.3; position: absolute; top: 50%; left: 50%; width: calc(100cqw * var(--grow)); height: calc(100cqh * var(--grow)); translate: -50% -50%; container: ring / size; }
@container graph (width < 480px) { .ds-gr-ring { --grow: 1.08; translate: calc(-50% - 16px) -50%; } }
.ds-gr-node, .ds-gr-label { --node: 15.6cqmin; position: absolute; top: 50%; left: 50%; }
.ds-gr-node { width: var(--node); height: var(--node); translate: -50% -50%; will-change: transform; }
.ds-gr-mark { display: grid; width: 100%; height: 100%; place-items: center; border-radius: var(--ds-radius-full); background: var(--ds-color-white); color: var(--ds-color-black); font-family: var(--ds-font-heading); font-size: var(--ds-text-heading-3); line-height: 1; }
.ds-gr-post, .ds-gr-face, .ds-gr-shot { position: relative; display: block; overflow: hidden; border-radius: var(--ds-radius-sm); }
.ds-gr-post, .ds-gr-face { width: 100%; height: 100%; }
.ds-gr-face { border-radius: var(--ds-radius-full); }
.ds-gr-page { display: grid; grid-template-rows: 22% 1fr; width: 100%; height: 100%; overflow: hidden; border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-control); background: var(--ds-color-black); }
.ds-gr-bar { display: flex; align-items: center; gap: 4px; padding-inline: 8px; border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge-surface); }
.ds-gr-dot { flex: none; width: 8px; height: 8px; border-radius: var(--ds-radius-full); }
.ds-gr-dot[data-dot="close"] { background: var(--ds-color-window-close); }
.ds-gr-dot[data-dot="min"] { background: var(--ds-color-window-min); }
.ds-gr-dot[data-dot="full"] { background: var(--ds-color-window-full); }
.ds-gr-label { width: 0; height: 0; }
.ds-gr-text { position: absolute; display: flex; gap: 4px; white-space: nowrap; }
.ds-gr-text[data-v="above"] { bottom: calc(var(--node) / 2 + 8px); }
.ds-gr-text[data-v="below"] { top: calc(var(--node) / 2 + 8px); }
.ds-gr-text[data-h="centre"] { left: 0; translate: -50% 0; }
.ds-gr-text[data-h="start"] { left: calc(var(--node) / -2); }
.ds-gr-text[data-h="end"] { right: calc(var(--node) / -2); }
.ds-gr-kind, .ds-gr-source { height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-inset); font-size: var(--ds-text-caption); line-height: 24px; }
.ds-gr-kind { font-weight: var(--ds-font-weight-medium); color: var(--ds-color-fg); }
.ds-gr-source { color: var(--ds-color-fg-muted); }

/* The patterns tally */
.ds-ft-tally { position: absolute; inset: 0; container: tally / inline-size; }
.ds-tl { --pad: 16px; --gap: 24px; --reel-w: 112px; position: absolute; inset: 0; display: grid; grid-template-columns: var(--reel-w) minmax(0, 1fr); column-gap: var(--gap); padding: var(--pad); }
.ds-tl-reel { --peek: 0px; position: relative; margin-block: calc(-1 * var(--pad)); }
.ds-tl-reel::before, .ds-tl-reel::after { content: ""; position: absolute; right: -8px; left: calc(-1 * var(--pad)); z-index: 1; height: var(--peek); pointer-events: none; }
.ds-tl-reel::before { top: 0; background: linear-gradient(to top, transparent, var(--ds-color-surface-raised)); }
.ds-tl-reel::after { bottom: 0; background: linear-gradient(to bottom, transparent, var(--ds-color-surface-raised)); }
.ds-tl-strip { position: absolute; top: 0; right: 0; left: 0; display: flex; flex-direction: column; gap: 16px; will-change: transform; }
.ds-tl-card { position: relative; flex: none; aspect-ratio: 4 / 5; overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-subtle); }
.ds-tl-frame { --b-arm: 8px; --b-off: 4px; position: absolute; right: 0; left: 0; pointer-events: none; }
.ds-tl-brackets { position: absolute; inset: calc(-1 * var(--b-off)); z-index: 2; pointer-events: none; transform-origin: 50% 50%; opacity: 0; }
.ds-tl-brackets > i { position: absolute; width: var(--b-arm); height: var(--b-arm); border: 0 solid var(--ds-color-fg); }
.ds-tl-brackets > i:nth-child(1) { top: 0; left: 0; border-top-width: var(--ds-border-hairline); border-left-width: var(--ds-border-hairline); }
.ds-tl-brackets > i:nth-child(2) { top: 0; right: 0; border-top-width: var(--ds-border-hairline); border-right-width: var(--ds-border-hairline); }
.ds-tl-brackets > i:nth-child(3) { bottom: 0; left: 0; border-bottom-width: var(--ds-border-hairline); border-left-width: var(--ds-border-hairline); }
.ds-tl-brackets > i:nth-child(4) { right: 0; bottom: 0; border-right-width: var(--ds-border-hairline); border-bottom-width: var(--ds-border-hairline); }
.ds-tl-side { display: flex; flex-direction: column; justify-content: center; gap: 16px; min-width: 0; }
.ds-tl-head { display: flex; align-items: center; gap: 8px; min-width: 0; margin: 0; font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-tl-logo { display: grid; flex: none; place-items: center; width: 20px; height: 20px; overflow: hidden; border-radius: var(--ds-radius-full); background: var(--ds-color-white); color: var(--ds-color-black); font-family: var(--ds-font-heading); font-size: var(--ds-text-caption); line-height: 1; }
.ds-tl-logo img { width: 100%; height: 100%; object-fit: cover; }
.ds-tl-brand { color: var(--ds-color-fg); }
.ds-tl-meta { overflow: hidden; color: var(--ds-color-fg-muted); white-space: nowrap; text-overflow: ellipsis; }
.ds-tl-rows { display: grid; gap: 16px; margin: 0; padding: 0; list-style: none; }
.ds-tl-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: baseline; column-gap: 8px; row-gap: 4px; }
.ds-tl-name { overflow: hidden; color: var(--ds-color-fg-soft); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); white-space: nowrap; text-overflow: ellipsis; transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-tl-count { color: var(--ds-color-fg-soft); font-family: var(--ds-font-heading); font-weight: var(--ds-font-weight-regular); font-variant-numeric: tabular-nums; font-size: var(--ds-text-heading-4); line-height: var(--ds-text-heading-4-leading); transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-tl-ruler { display: flex; grid-column: 1 / -1; height: 16px; overflow: hidden; font-family: var(--ds-font-ascii); font-size: calc(var(--ds-text-figure) / 3); line-height: 16px; letter-spacing: 0; white-space: pre; }
.ds-tl-fill { color: var(--ds-color-fg-muted); transition: color var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-tl-hot { color: var(--ds-color-fg-muted); }
.ds-tl-rest { color: var(--ds-color-edge-strong); }
.ds-tl-row[data-lit] .ds-tl-fill { color: var(--ds-color-fg-soft); }
.ds-tl-row[data-lit] .ds-tl-hot, .ds-tl-row[data-lit] .ds-tl-name, .ds-tl-row[data-lit] .ds-tl-count { color: var(--ds-color-fg); }
.ds-tl-leader { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.ds-ft-glyph { position: absolute; top: 0; left: 0; width: 8px; height: 16px; color: var(--ds-color-fg-muted); font-family: var(--ds-font-ascii); font-size: calc(var(--ds-text-figure) / 3); line-height: 16px; text-align: center; }
.ds-tl-scale { display: flex; justify-content: space-between; gap: 8px; margin: 0; color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); }
.ds-tl-facts { position: absolute; bottom: 8px; left: 50%; z-index: 1; display: grid; height: 20px; padding-inline: 8px; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); color: var(--ds-color-fg-soft); font-size: var(--ds-text-caption); line-height: 20px; white-space: nowrap; text-align: center; opacity: 0; transform: translate(-50%, 0); }
.ds-tl-fact { grid-area: 1 / 1; }
.ds-tl-full { display: none; }
@container tally (min-width: 480px) {
  .ds-tl { --pad: 24px; --gap: 40px; --reel-w: 176px; }
  .ds-tl-side { gap: 24px; }
  .ds-tl-rows { gap: 20px; }
  .ds-tl-name { font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
  .ds-tl-count { font-size: var(--ds-text-heading-3); line-height: var(--ds-text-heading-3-leading); }
  .ds-tl-frame { --b-arm: 12px; --b-off: 8px; }
}
@container tally (min-width: 600px) {
  .ds-tl { --pad: 32px; --gap: 48px; --reel-w: 216px; }
  .ds-tl-facts { height: 24px; line-height: 24px; }
  .ds-tl-full { display: inline; }
  .ds-tl-short { display: none; }
}
`
