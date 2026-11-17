'use client'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { MenuClose } from '@/react/components/ui/DropdownMenu'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { onMenuRows, usePopover } from '@/react/hooks/usePopover'

// shadcn's context menu in the brand: the dropdown menu's rows (MenuItem, MenuLabel, MenuSeparator) on the #171717
// overlay panel, opened at the pointer: a right-click (or a long press on
// Android) on children opens `menu` where it landed, flipped and kept inside the viewport. From the keyboard,
// Shift+F10 or the context menu key opens it under the focused element, at once, on its first row. Arrows, Home and
// End move; Escape closes and returns focus; choosing a row closes it. `onOpen` gets what was clicked (the closest
// [data-context] value), so one menu serves a list.
export interface ContextMenuProps {
  /** The menu's name for assistive tech. */
  label: string
  /** The panel's width. */
  width?: string
  /** The rows: MenuItem, MenuLabel, MenuSeparator. */
  menu?: ReactNode
  /** It is opening, with the closest [data-context] value under the pointer. */
  onOpen?: (context: string | undefined) => void
  children?: ReactNode
}

function context(target: EventTarget | null) {
  return (target as HTMLElement | null)?.closest<HTMLElement>('[data-context]')?.dataset.context
}

export function ContextMenu({ label, width, menu, onOpen, children }: ContextMenuProps) {
  const pop = usePopover({ side: 'bottom', align: 'start', gap: 0 })

  async function onContextMenu(event: MouseEvent) {
    event.preventDefault()
    onOpen?.(context(event.target))
    await pop.show({ at: { x: event.clientX, y: event.clientY } })
    pop.panel.current?.focus({ preventScroll: true })
  }
  async function onKey(event: KeyboardEvent) {
    if (event.key !== 'ContextMenu' && !(event.shiftKey && event.key === 'F10')) return
    event.preventDefault()
    const r = (event.target as HTMLElement).getBoundingClientRect()
    onOpen?.(context(event.target))
    await pop.show({ keyboard: true, at: { x: r.left + 8, y: r.bottom } })
    pop.panel.current?.querySelector<HTMLElement>('[role^="menuitem"]:not([disabled])')?.focus()
  }
  return (
    <MenuClose.Provider value={() => pop.hide(true)}>
      <div data-ds="context-menu" onContextMenu={onContextMenu} onKeyDown={onKey}>
        {children}
      </div>
      <PopoverPanel data-ds="context-menu" pop={pop} role="menu" aria-label={label} tabIndex={-1} className="flex flex-col p-1" style={{ width: width ?? '224px' }} onKeyDown={event => onMenuRows(event, pop.panel.current, pop.hide)}>
        {menu}
      </PopoverPanel>
    </MenuClose.Provider>
  )
}

export default ContextMenu
