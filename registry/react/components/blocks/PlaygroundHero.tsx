'use client'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import { McpSession } from '@/react/components/site/McpSession'
import { LightImage } from '@/react/components/visuals/LightImage'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import type { ConnectContent } from '@/lib/connect'
import type { SessionContent } from '@/lib/home/session'
import { heroContent, writeInto, type HeroContent, type Typing } from '@/lib/home/hero'
import { sentences } from '@/lib/home/pricing'
import { cn } from '@/react/lib/cn'

// The home hero (site v3/V3Playground as the hero, with HeroPrompt): the headline, the lead, the connect menu beside the
// quiet button, and the prompt card, which types example questions into its field one after another (a mouse over it
// or focus in the field holds the whole question; Enter or the White send button goes to `prompt.action`), with the
// clients it works in under a hairline; then the note, and under it a 16/9 frame playing the MCP session with the
// site's light band crossing behind it, sliding and bobbing slowly (still with reduced motion). On phones the prompt
// and the menu step aside: the quiet button takes the full width, the band gives way to two ASCII drifts at the
// top. `children` replaces the frame's content (a product video).
export interface PlaygroundHeroProps {
  content?: HeroContent
  connect?: ConnectContent
  session?: SessionContent
  children?: ReactNode
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'
const CODE = 'M8 4.5c-1.7 0-2.5.8-2.5 2.5v2.2c0 1.2-.7 2-2 2.8 1.3.8 2 1.6 2 2.8V17c0 1.7.8 2.5 2.5 2.5M16 4.5c1.7 0 2.5.8 2.5 2.5v2.2c0 1.2.7 2 2 2.8-1.3.8-2 1.6-2 2.8V17c0 1.7-.8 2.5-2.5 2.5'

function HeroPrompt({ c }: { c: HeroContent['prompt'] }) {
  const [index, setIndex] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const ghost = useRef<HTMLSpanElement>(null)
  const holds = useRef({ pointer: false, focus: false })
  const cycle = useRef<Typing | null>(null)
  const current = c.questions[index % c.questions.length]
  const held = () => holds.current.pointer || holds.current.focus || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const sync = () => (held() ? cycle.current?.hold() : cycle.current?.release())
  useEffect(() => {
    if (!ghost.current) return
    const t = writeInto(ghost.current, held(), () => setIndex((i) => (i + 1) % c.questions.length))
    cycle.current = t
    return () => {
      t.cleanup()
      cycle.current = null
    }
  }, [index, c.questions.length])
  return (
    <form className="ds-hp" action={c.action} onPointerEnter={(e) => { if (e.pointerType !== 'mouse') return; holds.current.pointer = true; sync() }} onPointerLeave={(e) => { if (e.pointerType !== 'mouse') return; holds.current.pointer = false; sync() }}>
      <div className="ds-hp-row">
        <div className="ds-hp-field">
          <label className="sr-only" htmlFor="ds-hero-ask">{c.label}</label>
          <textarea id="ds-hero-ask" className="ds-hp-input" rows={1} placeholder={current} autoComplete="off" enterKeyHint="go"
            onFocus={() => { holds.current.focus = true; sync() }}
            onBlur={() => { holds.current.focus = false; sync() }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); e.currentTarget.form?.requestSubmit() } }} />
          <span ref={ghost} className="ds-hp-ghost" data-typing="" aria-hidden="true">
            {Array.from(current).map((ch, i) => <span key={`${index}-${i}`} className="ds-hp-ch" data-ch="">{ch}</span>)}
          </span>
        </div>
        <button type="submit" className="ds-hp-send" aria-label={c.send} title={c.send}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19.5v-15M6 10.5l6-6 6 6" /></svg></button>
      </div>
      <div className="ds-hp-works">
        <p className="ds-hp-works-label">{c.worksLabel}</p>
        <ul className="ds-hp-clients" role="list">
          {c.clients.map((client) => {
            const icon = client.src ? <span className="ds-hp-mark" style={{ '--mark': `url("${client.src}")` } as CSSProperties} aria-hidden="true" /> : <svg className="ds-hp-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d={CODE} /></svg>
            return (
              <li key={client.name}>
                {client.href ? <a className="ds-hp-client" href={client.href}>{icon}{client.name}</a> : (
                  <button type="button" className="ds-hp-client" onClick={async () => {
                    if (!client.copy) return
                    try {
                      await navigator.clipboard.writeText(client.copy)
                      setCopied(client.name)
                      setStatus(client.copied ?? c.copied)
                      window.setTimeout(() => setCopied((n) => (n === client.name ? null : n)), 2000)
                    } catch {
                      // The clipboard is not available here.
                    }
                  }}>{icon}{copied === client.name ? c.copied : client.name}</button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <p className="sr-only" role="status">{status}</p>
    </form>
  )
}

export function PlaygroundHero({ content: c = heroContent, connect, session, children, className }: PlaygroundHeroProps) {
  return (
    <section data-ds="playground-hero" className={cn('ds-ph text-fg', className)}>
      <style href="ds-playground-hero" precedence="ds">{css}</style>
      <span className="ds-ph-light" aria-hidden="true"><span className="ds-ph-slide"><span className="ds-ph-bob"><LightImage art="hero-band" grain={false} still priority className="absolute inset-0 size-full" /></span></span></span>
      <span className="ds-ph-drift" data-side="left" aria-hidden="true" style={asciiDriftStyleObject('column', 'left', 'hero')} />
      <span className="ds-ph-drift" data-side="right" aria-hidden="true" style={asciiDriftStyleObject('scatter', 'right', 'hero')} />
      <div className={cn(CONTAINER, 'ds-ph-inner')}>
        <div className="ds-ph-head">
          <h1 className="type-section">{c.headline}</h1>
          <p className="max-w-(--ds-layout-measure) type-body-lg text-fg-soft">{c.lead}</p>
          <div className="ds-ph-actions">
            <div className="ds-ph-connect"><ConnectMenu content={connect} /></div>
            <Button href={c.secondary.href} variant="secondary">{c.secondary.label}</Button>
          </div>
          <div className="ds-ph-ask">
            <HeroPrompt c={c.prompt} />
            <p className="ds-ph-note type-body">{sentences(c.note).map((s, i) => <span key={s}>{i > 0 ? ' ' : null}<span className="max-md:inline-block">{s}</span></span>)}</p>
          </div>
        </div>
        <div className="ds-ph-frame" aria-hidden="true">{children ?? <McpSession content={session} />}</div>
      </div>
    </section>
  )
}

export default PlaygroundHero

const css = `
.ds-ph { position: relative; isolation: isolate; overflow: clip; container-type: inline-size; padding-bottom: 96px; }
.ds-ph-drift { position: absolute; z-index: -1; display: block; height: 160px; pointer-events: none; user-select: none; }
.ds-ph-drift[data-side="left"] { top: 24px; left: 0; width: 40%; }
.ds-ph-drift[data-side="right"] { top: 8px; right: 0; width: 56%; }
@media (min-width: 1024px) { .ds-ph-drift { display: none; } }
.ds-ph-inner { position: relative; z-index: 1; }
.ds-ph-head { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 24px; max-width: 800px; min-height: max(var(--ds-hero-min-h), 100svh - var(--ds-size-header)); margin-inline: auto; padding-block: 120px calc(128px + var(--ds-hero-light-lift)); text-align: center; }
@media (min-width: 768px) { .ds-ph-head { padding-bottom: calc(128px + var(--ds-hero-light-lift-md)); } }
.ds-ph-head > h1 { max-width: 720px; }
.ds-ph-head > p { text-wrap: balance; }
.ds-ph-actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.ds-ph-ask { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 24px; width: 100%; margin-top: 16px; }
.ds-ph-note { color: var(--ds-color-fg-muted); }
.ds-ph-frame { position: relative; width: 100%; max-width: 1152px; margin-inline: auto; aspect-ratio: 16 / 9; border: var(--ds-border-hairline) solid var(--ds-color-edge-surface); border-radius: var(--ds-radius-lg); overflow: hidden; background: var(--ds-color-surface-raised); }
.ds-ph-frame { --session-thumb: 80px; }
.ds-ph-frame > * { position: absolute; inset: 0; min-height: 0; border-radius: 0; }
.ds-ph-light {
  --k: max(min(100cqw / 1920, 1px), 100cqw / 2600);
  --frame-w: min(100cqw - 2 * var(--ds-layout-gutter), 1152px);
  --frame-h: calc(var(--frame-w) * 9 / 16);
  --frame-top: calc(96px + var(--frame-h));
  position: absolute; z-index: 0;
  bottom: calc(var(--frame-top) - (var(--ds-hero-band-h) - var(--ds-hero-band-y) - var(--ds-hero-band-cross)) * var(--k));
  left: calc(50% - (var(--ds-hero-band-centre) + var(--ds-hero-band-x)) * var(--k));
  display: block; width: calc(var(--ds-hero-band-w) * var(--k)); height: calc(var(--ds-hero-band-h) * var(--k));
  mix-blend-mode: plus-lighter; rotate: var(--ds-hero-band-tilt);
  transform-origin: calc((var(--ds-hero-band-centre) + var(--ds-hero-band-x)) * var(--k)) calc((var(--ds-hero-band-y) + var(--ds-hero-band-cross)) * var(--k));
  transform: translateY(var(--ds-hero-band-drop));
}
.ds-ph-slide { position: absolute; inset: 0; animation: ds-ph-slide 22s var(--ds-easing-drift) infinite alternate; }
.ds-ph-bob { position: absolute; inset: 0; animation: ds-ph-bob 14s var(--ds-easing-drift) infinite alternate; }
@keyframes ds-ph-slide { from { translate: calc(var(--ds-hero-band-slide) * var(--k) * -1) 0; } to { translate: calc(var(--ds-hero-band-slide) * var(--k)) 0; } }
@keyframes ds-ph-bob { from { translate: 0 calc(var(--ds-hero-band-bob) * var(--k) * -1); } to { translate: 0 calc(var(--ds-hero-band-bob) * var(--k)); } }
@media (prefers-reduced-motion: reduce) { .ds-ph-slide, .ds-ph-bob { animation: none; } }
@media (width < 768px) {
  .ds-ph-light { display: none; }
  .ds-ph-head { min-height: calc(100svh - var(--ds-size-header)); justify-content: center; padding-block: 32px; }
  .ds-ph-ask { margin-top: 0; }
  .ds-ph-actions { flex-direction: column; align-self: stretch; }
  .ds-ph-connect, .ds-ph-ask > form { display: none; }
  .ds-ph-frame { border-radius: var(--ds-radius-control); }
}

/* The prompt */
.ds-hp { display: grid; grid-template-columns: minmax(0, 1fr); width: 100%; max-width: 800px; padding: 12px 12px 0; border-radius: var(--ds-radius-lg); background: var(--ds-color-surface-subtle); outline: var(--ds-border-hairline) solid var(--ds-color-edge-strong); outline-offset: calc(-1 * var(--ds-border-hairline)); text-align: left; transition: outline-color var(--ds-duration-micro) var(--ds-easing-out); }
.ds-hp:has(.ds-hp-input:focus, :focus-visible) { outline-color: var(--ds-color-fg-muted); }
.ds-hp-row { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: flex-end; gap: 12px; padding-block: 0 12px; }
.ds-hp-field { position: relative; flex: 1 1 100%; min-width: 0; }
.ds-hp-input { display: block; width: 100%; height: calc(var(--ds-text-body) * var(--ds-text-body-leading) * 2 + 24px); padding: 12px 16px; border: 0; border-radius: var(--ds-radius-control); background: transparent; font-family: var(--ds-font-text); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); color: var(--ds-color-fg); resize: none; }
.ds-hp-input::placeholder { color: transparent; }
.ds-hp-input:focus { outline: none; }
.ds-hp-ghost { position: absolute; inset: 0; padding: 12px 16px; overflow: hidden; font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); color: var(--ds-color-fg-muted); pointer-events: none; }
.ds-hp-field:has(.ds-hp-input:not(:placeholder-shown)) .ds-hp-ghost { visibility: hidden; }
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  .ds-hp-ghost[data-typing] .ds-hp-ch:not([data-on]) { display: none; }
  .ds-hp-ghost[data-typing] .ds-hp-ch[data-on] { animation: ds-hp-key-in var(--ds-duration-press) linear; }
}
@keyframes ds-hp-key-in { from { opacity: 0; } }
.ds-hp-send { flex: none; display: grid; place-items: center; width: var(--ds-size-control-md); height: var(--ds-size-control-md); padding: 0; border: 0; border-radius: var(--ds-radius-control); background: var(--ds-color-action-primary); color: var(--ds-color-action-primary-fg); cursor: pointer; transition: background-color var(--ds-duration-micro) var(--ds-easing-out); }
@media (hover: hover) and (pointer: fine) { .ds-hp-send:hover { background: var(--ds-color-action-primary-hover); } }
.ds-hp-send:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-fg); outline-offset: var(--ds-border-focus); }
.ds-hp-send svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.ds-hp-works { display: grid; gap: 8px; padding: 12px 16px; border-top: var(--ds-border-hairline) solid var(--ds-color-edge); }
.ds-hp-works-label { flex: none; margin: 0; white-space: nowrap; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); color: var(--ds-color-fg-muted); }
.ds-hp-clients { display: flex; flex-wrap: wrap; gap: 8px 20px; margin: 0; padding: 0; list-style: none; }
.ds-hp-client { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 0; border: 0; border-radius: var(--ds-radius-sm); background: none; font: inherit; font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); color: var(--ds-color-fg-soft); white-space: nowrap; cursor: pointer; text-decoration: none; transition: color var(--ds-duration-micro) var(--ds-easing-out); }
.ds-hp-client::after { content: ""; position: absolute; inset: -12px -4px; }
.ds-hp-client:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-white); outline-offset: 4px; }
@media (hover: hover) and (pointer: fine) { .ds-hp-client:hover { color: var(--ds-color-fg); } }
.ds-hp-mark, .ds-hp-glyph { flex: none; width: 16px; height: 16px; }
.ds-hp-mark { background-color: currentColor; mask: var(--mark) center / contain no-repeat; }
.ds-hp-glyph { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
@media (min-width: 768px) {
  .ds-hp-input { height: var(--ds-size-control-md); padding-block: 8px; }
  .ds-hp-ghost { padding-block: 8px; }
  .ds-hp-row { flex-wrap: nowrap; align-items: center; }
  .ds-hp-field { flex: 1; }
  .ds-hp-works { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
}
@media (prefers-reduced-motion: reduce) { .ds-hp, .ds-hp-send, .ds-hp-client { transition: none; } }
`
