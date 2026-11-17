import type { ReactNode } from 'react'

// A group's name in a MenubarMenu: DM Sans Medium in capitals at 6%, muted.
export interface MenubarLabelProps {
  children?: ReactNode
}

export function MenubarLabel({ children }: MenubarLabelProps) {
  return <p data-ds="menubar-label" className="px-2 pt-2 pb-1 type-label text-fg-muted">{children}</p>
}

export default MenubarLabel
