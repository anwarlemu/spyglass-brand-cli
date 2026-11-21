'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Search } from 'lucide-react'

// shadcn's command menu in the brand: a box to type in over a list of actions and places, on the #171717 overlay
// surface in a neutral hairline with the brand corner. The field sits on top over a hairline, DM Sans with a search
// glyph; groups have a capital label; rows are the menus' rows (32px, a 4px corner, a #262626 fill on the row the
// arrows or the pointer are on), an icon first and a shortcut last. The field keeps focus: typing filters (label and
// keywords), arrows move the highlight and wrap, Home and End jump, Enter runs the row, the pointer moves the
// highlight too. Nothing animates: it is used many times a day. `onSelect` gets the row. CommandDialog puts it in a
// window opened with Cmd+K.
export interface CommandItem {
  id: string
  label: string
  /** More words that find it. */
  keywords?: string[]
  /** A key or chord shown at the end ("⌘B"). */
  shortcut?: string
  /** A 16px Lucide icon before the label. */
  icon?: ReactNode
  disabled?: boolean
}
export interface CommandGroup {
  /** The group's label, in capitals. */
  heading?: string
  items: CommandItem[]
}
export interface CommandProps {
  groups: CommandGroup[]
  /** The list's name for assistive tech. */
  label?: string
  /** The field's placeholder. */
  placeholder?: string
  /** What the list says when nothing matches. */
  empty?: string
  /** Focus the field when it mounts. */
  autoFocus?: boolean
  onSelect?: (item: CommandItem) => void
  className?: string
}

export const COMMAND_ROW = 'flex h-control-sm shrink-0 cursor-pointer items-center gap-2 rounded-ds-sm px-2 type-ui text-fg transition-[background-color] duration-150 ease-standard data-active:bg-ds-neutral-4 aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint max-md:h-auto max-md:min-h-control-touch'

export function matches(item: CommandItem, q: string) {
  if (!q) return true
  const t = q.toLowerCase()
  return item.label.toLowerCase().includes(t) || !!item.keywords?.some((k) => k.toLowerCase().includes(t))
}

export function Command({ groups, label = 'Commands', placeholder = 'Type a command or search', empty = 'No results.', autoFocus, onSelect, className }: CommandProps) {
  const id = `command-${useId()}`
  const input = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState('')
  const q = query.trim()
  const shown = groups.map((g) => ({ ...g, items: g.items.filter((i) => matches(i, q)) })).filter((g) => g.items.length)
  const rows = shown.flatMap((g) => g.items)
  const enabled = rows.filter((r) => !r.disabled)
  // The highlight is kept by id, so it stays on its row as the list changes; with none, the first enabled row.
  const active = enabled.find((r) => r.id === activeId) ?? enabled[0]
  const rowId = (item: CommandItem) => `${id}-${rows.indexOf(item)}`

  useEffect(() => {
    if (autoFocus) input.current?.focus({ preventScroll: true })
  }, [autoFocus])
  const scroll = useRef(false)
  useEffect(() => {
    if (!scroll.current || !active) return
    scroll.current = false
    document.getElementById(rowId(active))?.scrollIntoView({ block: 'nearest' })
  })

  function move(to: number) {
    const n = enabled.length
    if (!n) return
    setActiveId(enabled[(to % n + n) % n]!.id)
    scroll.current = true
  }
  function run(item: CommandItem | undefined) {
    if (!item || item.disabled) return
    onSelect?.(item)
  }
  function onKey(event: KeyboardEvent) {
    const at = active ? enabled.indexOf(active) : -1
    if (event.key === 'ArrowDown') { event.preventDefault(); move(at + 1) }
    else if (event.key === 'ArrowUp') { event.preventDefault(); move(at - 1) }
    else if (event.key === 'Home' && !query) { event.preventDefault(); move(0) }
    else if (event.key === 'End' && !query) { event.preventDefault(); move(enabled.length - 1) }
    else if (event.key === 'Enter') { event.preventDefault(); run(active) }
  }

  return (
    <div data-ds="command" className={className ? `flex w-full flex-col overflow-hidden rounded-container border border-edge bg-surface-raised text-fg ${className}` : 'flex w-full flex-col overflow-hidden rounded-container border border-edge bg-surface-raised text-fg'}>
      <label className="flex h-control-lg shrink-0 items-center gap-2 border-b border-edge px-3">
        <Search size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
        <input
          ref={input}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveId('') }}
          className="h-full min-w-0 flex-1 bg-transparent type-ui text-fg outline-none placeholder:text-fg-muted max-md:text-input"
          role="combobox"
          aria-label={placeholder}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-activedescendant={active ? rowId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          onKeyDown={onKey}
        />
      </label>
      <div id={`${id}-list`} role="listbox" aria-label={label} className="max-h-96 overflow-y-auto overscroll-contain p-1 fade-y">
        {shown.map((g, gi) => (
          <div key={g.heading ?? gi} role="group" aria-label={g.heading} className={gi ? '-mx-1 mt-1 border-t border-edge px-1 pt-1' : ''}>
            {g.heading && <p className="px-2 pt-2 pb-1 type-label text-fg-muted" aria-hidden="true">{g.heading}</p>}
            {g.items.map((item) => (
              <div
                key={item.id}
                id={rowId(item)}
                role="option"
                className={COMMAND_ROW}
                aria-selected={item === active}
                aria-disabled={item.disabled || undefined}
                data-active={item === active || undefined}
                onPointerMove={() => { if (!item.disabled && item !== active) setActiveId(item.id) }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(item)}
              >
                {item.icon && <span className="flex shrink-0 text-fg-muted" aria-hidden="true">{item.icon}</span>}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.shortcut && <span className="shrink-0 type-caption text-fg-faint">{item.shortcut}</span>}
              </div>
            ))}
          </div>
        ))}
        {!rows.length && <p className="px-2 py-6 text-center type-ui text-fg-muted">{empty}</p>}
      </div>
    </div>
  )
}

export default Command
