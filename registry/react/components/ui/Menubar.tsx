'use client'
import { createContext, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

// Menu triggers in a row (shadcn's menubar): a Black strip in a hairline with the brand corner, 32px triggers in DM Sans
// Medium, each opening a panel of rows in the card's #171717 fill (MenubarMenu with MenubarItem, MenubarLabel and
// MenubarSeparator). One trigger is in the tab order; Left and Right move along the row, Down, Enter or Space open, and
// with a menu open Left and Right open the next one. While one is open, pointing at another trigger switches to it at
// once. Menus opened from the keyboard show without motion.
export interface MenubarEntry { key: string, el: () => HTMLElement | null, open: () => Promise<void> }
export interface MenubarContextValue {
  active: string | null
  setActive: Dispatch<SetStateAction<string | null>>
  focused: string | null
  setFocused: Dispatch<SetStateAction<string | null>>
  entries: MenubarEntry[]
  move: (from: string, step: number, open: boolean) => void
}
export const MenubarContext = createContext<MenubarContextValue | null>(null)
/** Closes the menu a row is in (refocusing its trigger). */
export const MenubarClose = createContext<() => void>(() => {})

export interface MenubarProps {
  /** The bar's name for assistive tech. */
  label: string
  /** MenubarMenu elements. */
  children?: ReactNode
}

export function Menubar({ label, children }: MenubarProps) {
  const [active, setActive] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const entries = useRef<MenubarEntry[]>([]).current
  function move(from: string, step: number, open: boolean) {
    const at = entries.findIndex((e) => e.key === from)
    const next = entries[(at + step + entries.length) % entries.length]
    if (!next) return
    setFocused(next.key)
    next.el()?.focus()
    if (open) void next.open()
  }
  return (
    <MenubarContext.Provider value={{ active, setActive, focused, setFocused, entries, move }}>
      <div data-ds="menubar" role="menubar" aria-label={label} className="inline-flex items-center gap-1 rounded-control border border-edge bg-surface p-1">
        {children}
      </div>
    </MenubarContext.Provider>
  )
}

export default Menubar
