'use client'
import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Code } from '@/react/components/site/Code'
import { CopyButton } from '@/react/components/site/CopyButton'
import { codeTabsExample, type CodeTab } from '@/lib/code'
import { cn } from '@/react/lib/cn'

// The site's tabs of code (sections/Connect CodeTabs, Code, CopyButton): a #262626 panel with an 8px corner; a 56px
// head with the tabs (14/20 Medium in the muted gray, White when chosen, the soft gray under the pointer; a 2px White
// line under the chosen one that slides to the next) and the copy button for the shown tab, over a hairline; under it
// the code, 16px in (24 from 768), scrolling across and fading at its edges. Arrows, Home and End move between tabs.
export interface CodeBlockProps {
  /** The tabs: { id, label, code, language }. One tab still shows its label. */
  tabs?: CodeTab[]
  /** The tab list's accessible name. */
  label?: string
  copy?: { label: string; copiedLabel: string; name: string }
  onCopy?: (text: string) => void
  className?: string
}

export function CodeBlock({ tabs = codeTabsExample, label = 'Code', copy = { label: 'Copy', copiedLabel: 'Copied', name: 'Copy code' }, onCopy, className }: CodeBlockProps) {
  const [active, setActive] = useState(0)
  const [line, setLine] = useState<{ x: number; w: number } | null>(null)
  const id = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  // The line moves by transform only: a 100px bar placed and scaled to the chosen tab's label.
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const tab = buttons.current[active]
      if (!tab || !tab.offsetWidth) return
      const pad = parseFloat(getComputedStyle(tab).paddingLeft)
      setLine({ x: tab.offsetLeft + pad, w: tab.offsetWidth - 2 * pad })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [active])

  const select = (index: number) => {
    setActive(index)
    const tab = buttons.current[index]
    const list = listRef.current
    if (!tab || !list) return
    const t = tab.getBoundingClientRect()
    const l = list.getBoundingClientRect()
    if (t.left < l.left) list.scrollLeft += t.left - l.left
    else if (t.right > l.right) list.scrollLeft += t.right - l.right
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = tabs.length - 1
    const next = e.key === 'ArrowRight' ? (active === last ? 0 : active + 1) : e.key === 'ArrowLeft' ? (active === 0 ? last : active - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : -1
    if (next < 0) return
    e.preventDefault()
    select(next)
    buttons.current[next]?.focus()
  }

  if (!tabs.length) return null
  const shown = tabs[active] ?? tabs[0]

  return (
    <div data-ds="code-block" className={cn('min-w-0 rounded-control bg-surface-raised text-fg', className)}>
      <div className="relative flex h-control-lg items-center justify-between gap-2 px-1 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-edge-surface md:px-2">
        <div ref={listRef} role="tablist" aria-label={label} onKeyDown={onKeyDown} className="fade-x relative isolate flex h-full min-w-0 overflow-x-auto [scrollbar-width:none]">
          {line ? <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 z-0 h-0.5 w-25 origin-left bg-fg transition-transform duration-160 ease-loop motion-reduce:transition-none" style={{ transform: `translateX(${line.x}px) scaleX(${line.w / 100})` }} /> : null}
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              ref={(node) => { buttons.current[i] = node }}
              type="button"
              role="tab"
              id={`${id}-tab-${tab.id}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel-${tab.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => select(i)}
              className="relative z-1 h-full flex-none cursor-pointer rounded-ds-sm px-3 type-ui-strong text-fg-muted transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-border-focus))] hover:not-aria-selected:text-fg-soft active:text-fg aria-selected:text-fg md:px-4"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CopyButton key={shown.id} text={shown.code} label={copy.label} copiedLabel={copy.copiedLabel} name={copy.name} selectId={`${id}-panel-${shown.id}`} onCopy={onCopy} />
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)]">
        {tabs.map((tab, i) => (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${id}-panel-${tab.id}`}
            aria-labelledby={`${id}-tab-${tab.id}`}
            tabIndex={i === active ? 0 : -1}
            inert={i !== active}
            className={cn('fade-x min-w-0 overflow-x-auto rounded-b-control p-4 outline-offset-[calc(-1*var(--ds-border-focus))] [grid-area:1/1] [scrollbar-color:var(--ds-color-edge-strong)_transparent] [scrollbar-width:thin] md:p-6', i === active ? 'visible' : 'invisible')}
          >
            <Code source={tab.code} language={tab.language} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default CodeBlock
