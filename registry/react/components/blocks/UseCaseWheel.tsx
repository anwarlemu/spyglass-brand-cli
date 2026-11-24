'use client'
import { useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from 'react'
import { CreativeCard } from '@/react/components/site/CreativeCard'
import { createWheel, createWheelRipple, useCaseWheelContent, useCaseWheelCss, wheelFit, wheelLongest, wheelRest, type WheelEngine, type WheelItem, type WheelPicture, type WheelRipple } from '@/lib/use-case-wheel'
import { cn } from '@/react/lib/cn'

// The site's use cases wheel (v2/V2UseCases, UseCaseWheel): the headline in the middle of an ellipse of creatives, two
// arcs opening from a pill at its foot. The pill holds the current audience beside a White arrow link, the next below
// and the one before above at half strength, all turning like a drum. Every 2.4s while it is on screen it turns: a new
// pair of creatives scales up at the bottom, the others climb one slot (each 50ms after the last, turning away and
// sinking back as they rise) and the top pair leaves into the distance. The pointer or keyboard focus in the drum holds
// it; a click, or the pointer resting on another label, turns to that audience. With reduced motion the creatives stand
// at their slots and crossfade, and it never turns by itself. Under 768 only the headline and the drum show.
// Creatives are Acme placeholders unless `items` passes images; `light` puts a light layer behind it (the dispersion
// field in its ring composition: pass a function to receive the ripple that bends the light with each turn).
export interface UseCaseWheelProps {
  /** The section's id (its heading is `<id>-heading`). */
  id?: string
  headline?: string
  /** The audiences: { key, label, line, href, linkLabel, pairs: three pairs of creatives }. */
  items?: WheelItem[]
  /** h2 in a page, h1 when the wheel opens one. */
  as?: 'h1' | 'h2'
  /** A light layer behind the ring, or a function that receives the ring's ripple and returns it. */
  light?: ReactNode | ((ripple: WheelRipple) => ReactNode)
  /** Turn by itself while on screen. */
  autoplay?: boolean
  /** Called with the audience's index after each turn. */
  onChange?: (index: number) => void
  className?: string
}

function Picture({ picture }: { picture: WheelPicture }) {
  const fit = wheelFit(picture)
  return (
    <span className="ds-wheel-frame" data-fit={fit === 'fill' ? undefined : fit} style={picture.ratio ? { aspectRatio: String(picture.ratio) } : undefined}>
      <CreativeCard src={picture.src} alt={picture.alt} brand={picture.brand} caption={picture.caption} tone={picture.tone} ratio="fill" />
    </span>
  )
}

export function UseCaseWheel({ id = 'use-cases', headline = useCaseWheelContent.headline, items = useCaseWheelContent.items, as: Heading = 'h2', light, autoplay = true, onChange, className }: UseCaseWheelProps) {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLHeadingElement>(null)
  const queue = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLDivElement>(null)
  const pillText = useRef<HTMLSpanElement>(null)
  const focusBox = useRef<HTMLSpanElement>(null)
  const parts = useRef({ labels: [] as HTMLElement[], twins: [] as HTMLElement[], pictures: items.map((item) => item.pairs.map(() => [] as HTMLElement[])) })
  const engine = useRef<WheelEngine | null>(null)
  const [ripple] = useState(() => createWheelRipple(engine, stage))
  const holds = useRef({ pointer: false, focus: false })
  const lastRow = useRef<number | null>(null)
  const changed = useRef(onChange)
  changed.current = onChange

  useEffect(() => {
    if (!sectionRef.current || !stage.current || !head.current || !queue.current || !pill.current || !pillText.current || !focusBox.current) return
    const e = createWheel(
      { section: sectionRef.current, stage: stage.current, head: head.current, queue: queue.current, pill: pill.current, pillText: pillText.current, focusBox: focusBox.current, ...parts.current },
      { autoplay, onChange: (i) => { setActive(i); changed.current?.(i) } },
    )
    engine.current = e
    return () => {
      e.destroy()
      engine.current = null
    }
  }, [items, autoplay])

  const hold = () => engine.current?.hold(holds.current.pointer || holds.current.focus)
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const target = (event.target as Element).closest<HTMLElement>('[data-item]')
    const index = target ? Number(target.dataset.item) : null
    engine.current?.mark('hover', index)
    const row = index === null ? (pill.current?.contains(event.target as Node) ? 0 : null) : engine.current?.row(index)
    if (row === undefined || row === lastRow.current) return
    lastRow.current = row
    if (index !== null && row !== 0 && row !== null) engine.current?.hover(index)
  }
  const onPointerEnter = () => { holds.current.pointer = true; hold() }
  const onPointerLeave = () => { holds.current.pointer = false; lastRow.current = null; engine.current?.mark('hover', null); hold() }
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const keyboard = target.matches(':focus-visible')
    engine.current?.mark('focus', keyboard && target.dataset.item ? Number(target.dataset.item) : null)
    if (!keyboard) return
    holds.current.focus = true
    hold()
  }
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    engine.current?.mark('focus', null)
    holds.current.focus = false
    hold()
  }

  const current = items[active] ?? items[0]
  const lightLayer = typeof light === 'function' ? light(ripple) : light

  return (
    <section ref={sectionRef} data-ds="use-case-wheel" id={id} aria-labelledby={`${id}-heading`} data-light={lightLayer ? '' : undefined} className={cn('ds-wheel-section text-fg', className)}>
      <style href="ds-use-case-wheel" precedence="ds">{useCaseWheelCss}</style>
      <div ref={stage} className="ds-wheel">
        {lightLayer ? <div className="ds-wheel-light">{lightLayer}</div> : null}
        <Heading ref={head} id={`${id}-heading`} className="ds-wheel-head type-section">{headline}</Heading>
        <div className="ds-wheel-ring" aria-hidden="true">
          {items.map((item, g) => item.pairs.map((pair, p) => pair.map((picture, side) => (
            <div key={`${item.key}-${p}-${side}`} ref={(el) => { if (el) parts.current.pictures[g][p][side] = el }} className="ds-wheel-picture">
              <Picture picture={picture} />
            </div>
          ))))}
        </div>
        <div className="ds-wheel-queue" onPointerEnter={onPointerEnter} onPointerLeave={onPointerLeave} onPointerMove={onPointerMove} onFocus={onFocus} onBlur={onBlur}>
          <div ref={queue} className="ds-wheel-mask">
            <ul className="m-0 list-none p-0" role="list">
              {items.map((item, i) => (
                <li key={item.key}>
                  <button type="button" ref={(el) => { if (el) parts.current.labels[i] = el }} className="ds-wheel-label" data-item={i} data-rest={wheelRest(i, active, items.length)} aria-pressed={i === active} aria-describedby={`${id}-line-${item.key}`} onClick={() => engine.current?.choose(i)}>
                    {item.label}
                  </button>
                  <span id={`${id}-line-${item.key}`} className="sr-only">{item.line}</span>
                </li>
              ))}
            </ul>
            {items.map((item, i) => (
              <span key={item.key} ref={(el) => { if (el) parts.current.twins[i] = el }} className="ds-wheel-label ds-wheel-twin" aria-hidden="true">{item.label}</span>
            ))}
          </div>
          <span ref={focusBox} className="ds-wheel-focus" aria-hidden="true" />
          <div ref={pill} className="ds-wheel-pill">
            <span ref={pillText} className="ds-wheel-pill-text" aria-hidden="true">{wheelLongest(items)}</span>
            <a className="ds-wheel-send" href={current.href} aria-label={current.linkLabel}>
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" /></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UseCaseWheel
