'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import { Button } from '@/react/components/ui/Button'
import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { asciiDriftStyleObject, type AsciiDriftCrop, type AsciiDriftFrom } from '@/lib/ascii-drift'
import type { ConnectContent } from '@/lib/connect'
import { closeContent, closeCreatives, closeTags, phoneRunSpots, phoneSpots, runSpots, spots, startCloseLight, startCloseTags, type CloseContent, type CloseCreative, type Spot } from '@/lib/home/close'
import { cn } from '@/react/lib/cn'

// The home's close (site v3/V3Close): a screen-tall section, the headline and the connect menu beside the quiet
// button in its middle, square creatives scattered around them (grey and dim at rest, a run of four rising along the
// diagonal the light takes) and three crops of the ASCII texture at the edges. When half of it is on screen the light
// sweeps across once, waking each creative to its colors as it passes; under a mouse the creatives near the pointer
// light up and lean toward it a few pixels, and a tag names the one under it (it fades and unblurs in beside it, clear
// of the words). Reduced motion shows every creative in color and still. On phones the field and drifts give way to a
// plain centered close. `creatives` are cycled through the field (Acme placeholders by default) with `tags`.
export interface CloseBlockProps {
  content?: CloseContent
  creatives?: CloseCreative[]
  /** What the tag says over each creative, cycled with them. */
  tags?: string[]
  connect?: ConnectContent
  className?: string
}

const DRIFTS: [string, AsciiDriftCrop, AsciiDriftFrom][] = [['mass', 'mass', 'left'], ['high', 'scatter', 'right'], ['low', 'cluster', 'bottom']]

function Field({ list, name, layer, creatives, tags }: { list: Spot[]; name: 'wide' | 'phone'; layer: 'scatter' | 'run'; creatives: CloseCreative[]; tags: string[] }) {
  return (
    <div className="ds-close-field" data-field={name} data-layer={layer} aria-hidden="true">
      {list.map((spot) => {
        const item = creatives[spot.creative % creatives.length] ?? {}
        return (
          <span key={spot.key} className="ds-close-spot" data-spot="" data-off={spot.off.length ? spot.off.join(' ') : undefined} data-tag={tags[spot.creative % tags.length]} style={{ '--x': spot.x, '--y': spot.y, '--s': spot.size } as CSSProperties}>
            <span className="ds-close-picture"><CreativeCard ratio="fill" src={item.src} tone={item.tone ?? 2} /></span>
          </span>
        )
      })}
    </div>
  )
}

export function CloseBlock({ content: c = closeContent, creatives = closeCreatives, tags = closeTags, connect, className }: CloseBlockProps) {
  const section = useRef<HTMLElement>(null)
  const band = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const s = section.current
    if (!s || !band.current || !tag.current) return
    const stops = [startCloseLight(s, band.current), startCloseTags(s, tag.current)]
    return () => stops.forEach((stop) => stop())
  }, [creatives, tags])
  return (
    <section ref={section} data-ds="close-block" className={cn('ds-close text-fg', className)}>
      <style href="ds-close-block" precedence="ds">{css}</style>
      {DRIFTS.map(([at, crop, from]) => <span key={at} aria-hidden="true" className="ds-close-ascii" data-at={at} style={{ ...asciiDriftStyleObject(crop, from), opacity: 'var(--ds-close-ascii)' }} />)}
      <div ref={band} className="ds-close-sweep" aria-hidden="true" />
      <span ref={tag} className="ds-close-tag" aria-hidden="true" />
      <Field list={spots} name="wide" layer="scatter" creatives={creatives} tags={tags} />
      <Field list={runSpots} name="wide" layer="run" creatives={creatives} tags={tags} />
      <Field list={phoneSpots} name="phone" layer="scatter" creatives={creatives} tags={tags} />
      <Field list={phoneRunSpots} name="phone" layer="run" creatives={creatives} tags={tags} />
      <div className="ds-close-content">
        <h2 className="ds-close-line type-section">{c.headline}</h2>
        <div className="ds-close-actions">
          <ConnectMenu content={connect} up />
          <Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button>
        </div>
      </div>
    </section>
  )
}

export default CloseBlock

const css = `
.ds-close {
  --h: max(var(--ds-close-min-h), 100svh);
  --u: calc(var(--h) / var(--ds-close-phone-field));
  --lift: max(0px, var(--ds-close-lift-phone-a) - var(--ds-close-lift-phone-b) * var(--u));
  --top-clear: 0px;
  --clear: 24;
  --foot-clear: calc(32 * var(--u));
  margin-top: calc(var(--ds-layout-section) - var(--clear) * var(--u) - var(--top-clear));
  margin-bottom: calc(var(--ds-layout-section) - var(--foot-clear));
  position: relative; isolation: isolate; display: grid; place-items: center; height: var(--h); padding-inline: var(--ds-layout-gutter); overflow: clip;
}
.ds-close-field { position: absolute; z-index: 0; inset: 0; pointer-events: none; }
.ds-close-ascii { display: none; position: absolute; z-index: -1; pointer-events: none; user-select: none; }
.ds-close-ascii[data-at="mass"] { display: block; inset: 0 0 auto; height: 36%; }
.ds-close-field[data-field="wide"] { display: none; }
.ds-close-spot { position: absolute; left: round(nearest, calc(50% + var(--x) * var(--u)), 1px); top: round(nearest, calc(50% + var(--y) * var(--u)), 1px); width: round(nearest, calc(var(--s) * var(--u)), 4px); aspect-ratio: 1; }
.ds-close-picture { position: absolute; inset: 0; filter: grayscale(calc(var(--ds-close-rest-grey) * (1 - var(--lit, 0)))) brightness(calc(var(--ds-close-rest-bright) + (1 - var(--ds-close-rest-bright)) * var(--lit, 0))); translate: var(--lx, 0px) var(--ly, 0px); }
.ds-close[data-on] .ds-close-picture { will-change: filter, translate; }
.ds-close-sweep {
  position: absolute; z-index: 0; top: 0; left: 0; display: none; width: var(--ds-close-sweep-w); height: 100%; pointer-events: none; opacity: var(--ds-close-sweep-alpha);
  mask-image: linear-gradient(to bottom, transparent, var(--ds-color-black) var(--ds-close-light-fade), var(--ds-color-black) calc(100% - var(--ds-close-light-fade)), transparent);
  background: linear-gradient(to right, transparent, color-mix(in srgb, var(--ds-color-light-overlap) 8%, transparent) 20%, color-mix(in srgb, var(--ds-color-light-overlap) 40%, transparent) 36%, var(--ds-color-light-overlap) 50%, color-mix(in srgb, var(--ds-color-light-overlap) 40%, transparent) 64%, color-mix(in srgb, var(--ds-color-light-overlap) 8%, transparent) 80%, transparent);
  will-change: transform;
}
.ds-close-sweep[data-live] { display: block; }
@media (prefers-reduced-motion: reduce), (scripting: none) {
  .ds-close-picture { filter: none; translate: none; }
  .ds-close-sweep[data-live] { display: none; }
}
.ds-close-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; max-width: 100%; text-align: center; translate: 0 round(nearest, calc(-1 * var(--lift)), 4px); }
.ds-close-line { max-width: 12em; color: var(--ds-color-white); }
.ds-close-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 32px; }
@media (width < 768px) {
  .ds-close-content { width: 100%; }
  .ds-close-actions { flex-direction: column; align-self: stretch; }
}
@media (min-width: 768px) {
  .ds-close { --u: calc(var(--h) / var(--ds-close-field)); --lift: max(0px, var(--ds-close-lift-tablet-a) - var(--ds-close-lift-tablet-b) * var(--u)); --clear: 0; --top-clear: 56px; --foot-clear: 0px; }
  .ds-close-field[data-field="wide"] { display: block; }
  .ds-close-field[data-field="phone"] { display: none; }
  .ds-close-ascii[data-at="mass"] { inset: auto auto 0 0; width: 30%; height: 72%; }
  .ds-close-ascii[data-at="high"] { display: block; top: 0; right: 0; width: 36%; height: 44%; }
  .ds-close-ascii[data-at="low"] { display: block; right: 0; bottom: 0; width: 32%; height: 32%; }
}
@media (min-width: 768px) and (width < 1024px) { .ds-close-spot[data-off~="tablet"] { display: none; } }
@media (min-width: 1024px) { .ds-close { --lift: max(0px, var(--ds-close-lift-laptop-a) - var(--ds-close-lift-laptop-b) * var(--u)); } }
@media (min-width: 1440px) { .ds-close { --lift: max(0px, var(--ds-close-lift-desktop-a) - var(--ds-close-lift-desktop-b) * var(--u)); } }
@media (min-width: 768px) and (height < 880px) { .ds-close-spot[data-off~="short"] { display: none; } }
.ds-close-tag {
  position: absolute; z-index: 1; top: 0; left: 0; display: none; height: 24px; padding-inline: 8px; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); color: var(--ds-color-fg);
  font-size: var(--ds-text-caption); line-height: 24px; white-space: nowrap; pointer-events: none; opacity: 0; filter: blur(var(--ds-close-tag-blur)); translate: var(--tag-from-x, 0px) var(--tag-from-y, 0px);
  transition: opacity var(--ds-duration-exit) var(--ds-easing-out), filter var(--ds-duration-exit) var(--ds-easing-out);
}
.ds-close-tag[data-shown] { opacity: 1; filter: blur(0); translate: 0 0; transition: opacity var(--ds-duration-micro) var(--ds-easing-out), filter var(--ds-duration-micro) var(--ds-easing-out), translate var(--ds-duration-micro) var(--ds-easing-out); }
@media (hover: hover) and (pointer: fine) { .ds-close-tag { display: block; } }
@media (prefers-reduced-motion: reduce) { .ds-close-tag, .ds-close-tag[data-shown] { filter: none; translate: none; } }
@media (width < 768px) {
  .ds-close { --lift: 0px; height: auto; margin-block: 0; padding-block: var(--ds-layout-section); }
  .ds-close-field[data-field], .ds-close-ascii, .ds-close-sweep[data-live] { display: none; }
}
`
