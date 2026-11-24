'use client'
import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { CONNECT_ICONS, connectContent, type ConnectContent } from '@/lib/connect'
import { followGlow } from '@/lib/glow'
import { cn } from '@/react/lib/cn'

// The site's connect menu (v3/V3Playground ConnectMenu): a White 40px button (12px in, the clients' marks before the
// label when given, a chevron that turns over while open) that opens a #1A1A1A panel 8px under it (336px; the
// button's width on phones): a row per client (a 32px tile with its mark or first letter, the name over a muted line,
// "Open" and an arrow that turn White on the row under the pointer or focus), a hairline, and a row that copies a
// setup prompt (its icon and label cross over to a check and "Prompt copied" for 2s). A #262626 pill slides to the
// row under the pointer or focus. A click opens it with a quick fade and grow from the button's corner (160ms in,
// 120ms out); opened from the keyboard it appears at once and focus goes to the first row. Arrows move between rows,
// Escape closes it and gives focus back, a click or focus outside closes it. Reduced motion keeps the fade only.
export interface ConnectMenuProps {
  /** The copy, the rows and the prompt (lib/connect.ts). */
  content?: ConnectContent
  /** Marks shown before the label (SVG files, drawn White in 16px squares). */
  marks?: string[]
  /** Open the panel above the button (for a menu near the foot of a page). */
  up?: boolean
  /** Called after the prompt is copied. */
  onCopy?: (prompt: string) => void
  className?: string
}

const TRIGGER =
  'relative isolate inline-flex h-control-md shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-control bg-action-primary px-3 type-ui-strong whitespace-nowrap text-action-primary-fg select-none transition-[background-color,color] duration-160 ease-out before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(circle_var(--ds-glow-radius)_at_var(--glow-x,50%)_var(--glow-y,50%),var(--ds-color-action-glow),transparent)] before:opacity-0 before:transition-opacity before:duration-240 before:ease-out hover:before:opacity-100 max-md:w-full'

function Glyph({ name, className }: { name: keyof typeof CONNECT_ICONS; className?: string }) {
  return <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className={cn('flex-none fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]', className)} dangerouslySetInnerHTML={{ __html: CONNECT_ICONS[name] }} />
}

export function ConnectMenu({ content: c = connectContent, marks = [], up = false, onCopy, className }: ConnectMenuProps) {
  const [open, setOpen] = useState(false)
  const [instant, setInstant] = useState(false)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState(0)
  const [pill, setPill] = useState<{ y: number; h: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = `${useId()}-panel`
  const copyIndex = c.clients.length

  useEffect(() => {
    if (!open) return
    const onDown = (e: globalThis.PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus({ preventScroll: true })
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  // The pill follows the active row; it moves by transform only, its height set at once.
  useLayoutEffect(() => {
    const row = panelRef.current?.querySelectorAll<HTMLElement>('[data-row]')[active]
    if (row && row.offsetHeight) setPill({ y: row.offsetTop, h: row.offsetHeight })
  }, [active, open])

  const rows = () => [...(panelRef.current?.querySelectorAll<HTMLElement>('[data-row]') ?? [])]

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !open
    const keyboard = e.detail === 0
    setInstant(keyboard)
    setOpen(next)
    if (next) setActive(0)
    if (next && keyboard) requestAnimationFrame(() => rows()[0]?.focus({ preventScroll: true }))
  }

  const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const list = rows()
    const at = list.indexOf(document.activeElement as HTMLElement)
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : (at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
    list[next]?.focus()
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.prompt)
    } catch {}
    setCopied(true)
    onCopy?.(c.prompt)
  }

  return (
    <div
      ref={rootRef}
      data-ds="connect-menu"
      data-open={open || undefined}
      data-up={up || undefined}
      data-instant={instant || undefined}
      className={cn('ds-connect relative max-md:w-full', className)}
      onBlur={(e) => { if (open && e.relatedTarget && !rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false) }}
    >
      <style href="ds-connect-menu" precedence="ds">{css}</style>
      <button ref={buttonRef} type="button" className={TRIGGER} aria-expanded={open} aria-controls={panelId} onClick={toggle} onPointerMove={(e: PointerEvent<HTMLButtonElement>) => followGlow(e.currentTarget, e)}>
        {marks.length ? (
          <span aria-hidden="true" className="mr-1 flex items-center gap-1">
            {marks.map((src) => <span key={src} className="size-4 bg-current" style={{ mask: `url("${src}") center / contain no-repeat` } as CSSProperties} />)}
          </span>
        ) : null}
        {c.label}
        <Glyph name="chevron" className="ds-connect-chevron stroke-[1.75]" />
      </button>
      <div ref={panelRef} id={panelId} inert={!open} onKeyDown={onPanelKey} className={cn('ds-connect-panel absolute left-0 z-10 isolate grid w-84 rounded-control border border-edge bg-surface-subtle p-1 text-left max-md:w-full', up ? 'bottom-[calc(100%+var(--ds-space-sm))]' : 'top-[calc(100%+var(--ds-space-sm))]')}>
        {pill ? <span aria-hidden="true" className="ds-connect-pill pointer-events-none absolute top-0 left-1 -z-1 w-[calc(100%-2*var(--ds-space-xs))] rounded-ds-sm bg-surface-raised" style={{ height: pill.h, transform: `translateY(${pill.y}px)` }} /> : null}
        <ul className="grid" aria-label={c.menuLabel}>
          {c.clients.map((client, i) => (
            <li key={client.id}>
              <a
                data-row=""
                data-active={i === active || undefined}
                href={client.href}
                target={client.web ? '_blank' : undefined}
                rel={client.web ? 'noopener noreferrer' : undefined}
                className="group/row flex items-center gap-3 rounded-ds-sm p-2 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus"
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setOpen(false)}
              >
                <span aria-hidden="true" className="grid size-8 flex-none place-items-center rounded-ds-sm bg-surface-raised transition-[background-color] duration-160 ease-loop group-data-active/row:bg-surface-inset">
                  {client.mark ? <span className="size-4 bg-fg" style={{ mask: `url("${client.mark}") center / contain no-repeat` } as CSSProperties} /> : <span className="type-caption font-medium text-fg">{client.name.slice(0, 1)}</span>}
                </span>
                <span className="grid min-w-0 flex-1">
                  <span className="type-ui font-medium text-fg">{client.name}</span>
                  <span className="type-caption text-pretty text-fg-muted">{client.description}</span>
                </span>
                <span className="flex flex-none items-center gap-1 type-caption text-fg-muted transition-[color] duration-160 ease-loop group-data-active/row:text-fg">
                  <span className="max-md:hidden">{c.open}</span>
                  <Glyph name="arrow" />
                </span>
              </a>
            </li>
          ))}
        </ul>
        <span aria-hidden="true" className="-mx-1 my-1 h-px bg-edge" />
        <button
          type="button"
          data-row=""
          data-active={active === copyIndex || undefined}
          data-copied={copied || undefined}
          className="ds-connect-copy flex h-control-md cursor-pointer items-center gap-3 rounded-ds-sm px-2 text-left type-ui font-medium text-fg-soft outline-none transition-[color] duration-160 ease-loop focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus data-active:text-fg data-copied:text-fg max-md:h-control-form"
          onPointerEnter={() => setActive(copyIndex)}
          onFocus={() => setActive(copyIndex)}
          onClick={copy}
        >
          <span aria-hidden="true" className="grid w-8 flex-none place-items-center">
            <Glyph name="copy" className="ds-connect-swap [grid-area:1/1]" />
            <Glyph name="check" className="ds-connect-swap [grid-area:1/1]" />
          </span>
          <span className="grid">
            <span className="ds-connect-label [grid-area:1/1]" data-on={!copied || undefined}>{c.copy.label}</span>
            <span className="ds-connect-label [grid-area:1/1]" data-on={copied || undefined} aria-hidden={!copied}>{c.copy.done}</span>
          </span>
        </button>
        <p className="sr-only" role="status">{copied ? c.copy.done : ''}</p>
      </div>
    </div>
  )
}

export default ConnectMenu

const css = `
.ds-connect-panel {
  opacity: 0; visibility: hidden; transform-origin: top left;
  transform: translateY(calc(-1 * var(--ds-space-xs))) scale(var(--ds-menu-from-scale));
  transition: opacity var(--ds-duration-press) var(--ds-easing-out), transform var(--ds-duration-press) var(--ds-easing-out), visibility var(--ds-duration-instant) linear var(--ds-duration-press);
}
.ds-connect[data-up] .ds-connect-panel { transform-origin: bottom left; transform: translateY(var(--ds-space-xs)) scale(var(--ds-menu-from-scale)); }
.ds-connect[data-open] .ds-connect-panel {
  opacity: 1; visibility: visible; transform: none;
  transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-micro) var(--ds-easing-out), visibility var(--ds-duration-instant);
}
.ds-connect[data-instant] .ds-connect-panel { transition: none; }
.ds-connect-chevron { transition: transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-connect[data-open] .ds-connect-chevron { transform: rotate(180deg); }
.ds-connect-pill { transition: transform var(--ds-duration-micro) var(--ds-easing-loop); }
.ds-connect-swap, .ds-connect-label { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-connect-label:not([data-on]) { opacity: 0; transform: translateY(var(--ds-space-xs)); }
.ds-connect-label:not([data-on]):first-child { transform: translateY(calc(-1 * var(--ds-space-xs))); }
.ds-connect-swap:last-child, .ds-connect-copy[data-copied] .ds-connect-swap:first-child { opacity: 0; transform: scale(0.8); }
.ds-connect-copy[data-copied] .ds-connect-swap:last-child { opacity: 1; transform: none; }
@media (max-width: 767px) {
  .ds-connect-panel { transform-origin: top center; }
  .ds-connect[data-up] .ds-connect-panel { transform-origin: bottom center; }
}
@media (prefers-reduced-motion: reduce) {
  .ds-connect-panel, .ds-connect[data-up] .ds-connect-panel, .ds-connect[data-open] .ds-connect-panel { transform: none; }
  .ds-connect-chevron, .ds-connect-pill, .ds-connect-swap, .ds-connect-label { transition: opacity var(--ds-duration-micro) var(--ds-easing-out); }
  .ds-connect-label:not([data-on]), .ds-connect-label:not([data-on]):first-child, .ds-connect-swap:last-child, .ds-connect-copy[data-copied] .ds-connect-swap:first-child { transform: none; }
}
`
