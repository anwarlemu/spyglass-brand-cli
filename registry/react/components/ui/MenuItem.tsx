'use client'
import { useContext, type ReactNode } from 'react'
import { MenuClose } from '@/react/components/ui/DropdownMenu'

// One row of a dropdown or context menu: 32px (44px on phones), DM Sans 14px, a 4px corner inside the panel's 8px. The
// row under the pointer or focus takes a #262626 fill (160ms, hover only where a pointer hovers). `current` sets it in
// Medium; `danger` is the red for leaving or deleting. Put a 16px Lucide icon first (muted), a shortcut or a check
// last. Choosing it calls `onSelect` and closes the menu, unless `keepOpen`. `role` and `aria-checked` make it a radio
// or checkbox row (role="menuitemradio" aria-checked={picked}).
export interface MenuItemProps {
  /** Renders a link. */
  href?: string
  /** The current choice, in Medium. */
  current?: boolean
  /** The red for leaving or deleting. */
  danger?: boolean
  disabled?: boolean
  /** Choosing it leaves the menu open. */
  keepOpen?: boolean
  onSelect?: () => void
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox'
  'aria-checked'?: boolean
  className?: string
  children?: ReactNode
}

export const MENU_ITEM = 'flex h-control-sm w-full shrink-0 cursor-pointer items-center gap-2 rounded-ds-sm px-2 text-left type-ui text-fg outline-none transition-[background-color] duration-160 ease-standard hover:bg-ds-neutral-4 focus-visible:bg-ds-neutral-4 aria-[current=true]:font-medium disabled:cursor-not-allowed disabled:text-fg-faint disabled:hover:bg-transparent data-danger:text-fg-danger data-danger:hover:bg-surface-danger data-danger:focus-visible:bg-surface-danger max-md:h-auto max-md:min-h-control-touch'

export function MenuItem({ href, current, danger, disabled, keepOpen, onSelect, role = 'menuitem', 'aria-checked': checked, className, children }: MenuItemProps) {
  const close = useContext(MenuClose)
  function choose() {
    onSelect?.()
    if (!keepOpen) close()
  }
  const shared = { role, 'aria-checked': checked, className: className ? `${MENU_ITEM} ${className}` : MENU_ITEM, 'aria-current': current ? 'true' as const : undefined, 'data-danger': danger || undefined, onClick: choose }
  return href ? <a data-ds="menu-item" href={href} {...shared}>{children}</a> : <button data-ds="menu-item" type="button" disabled={disabled} {...shared}>{children}</button>
}

/** shadcn's name for it. */
export { MenuItem as DropdownMenuItem }

export default MenuItem
