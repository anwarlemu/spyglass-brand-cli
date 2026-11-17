'use client'
import { createContext, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

// A site's top navigation (shadcn's navigation menu): a row of triggers and links in DM Sans Medium, each trigger
// opening a panel of links in the card's #171717 fill under it (NavigationMenuItem with NavigationMenuLink rows). Under
// a pointer a panel opens after a short wait and closes a moment after the pointer leaves both; while one is open,
// pointing at another trigger switches at once. A click toggles it; Enter, Space or Down opens it at once with focus on
// its first link; Left and Right move along the triggers; Escape closes it and returns focus. The chevron stays still.
export interface NavigationMenuContextValue {
  active: string | null
  setActive: Dispatch<SetStateAction<string | null>>
  /** The triggers and links of the row, in order, for Left and Right. */
  row: () => HTMLElement[]
}
export const NavigationMenuContext = createContext<NavigationMenuContextValue | null>(null)

export interface NavigationMenuProps {
  /** The navigation's name for assistive tech. */
  label?: string
  /** NavigationMenuItem elements. */
  children?: ReactNode
  className?: string
}

export function NavigationMenu({ label = 'Main', children, className }: NavigationMenuProps) {
  const [active, setActive] = useState<string | null>(null)
  const list = useRef<HTMLUListElement | null>(null)
  const row = () => [...(list.current?.querySelectorAll<HTMLElement>('[data-nav-trigger]') ?? [])]
  return (
    <NavigationMenuContext.Provider value={{ active, setActive, row }}>
      <nav data-ds="navigation-menu" aria-label={label} className={className}>
        <ul ref={list} className="flex flex-wrap items-center gap-1">{children}</ul>
      </nav>
    </NavigationMenuContext.Provider>
  )
}

export default NavigationMenu
