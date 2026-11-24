'use client'
import { useContext, type PointerEvent, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { MenubarClose } from '@/react/components/ui/Menubar'
import { cn } from '@/react/lib/cn'

// One row of a MenubarMenu: 32px (44px on phones), DM Sans soft gray, the brand's small corner; the row under the
// pointer or focus takes the #262626 fill and White type. Put a 16px Lucide icon first, and a `shortcut` shows muted at
// the end. `checked` makes it a radio or checkbox row with a check (`role`). `danger` is a destructive row's red.
// Choosing it calls `onSelect` and closes the menu, unless `keepOpen`.
export interface MenubarItemProps {
  /** A key or keys, shown muted at the end. */
  shortcut?: string
  /** A destructive row (red). */
  danger?: boolean
  disabled?: boolean
  /** Keeps the menu open after it is chosen. */
  keepOpen?: boolean
  /** Checked, for a radio or checkbox row. */
  checked?: boolean
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox'
  onSelect?: () => void
  className?: string
  children?: ReactNode
}

export function MenubarItem({ shortcut, danger, disabled, keepOpen, checked, role = 'menuitem', onSelect, className, children }: MenubarItemProps) {
  const close = useContext(MenubarClose)
  function choose() {
    onSelect?.()
    if (!keepOpen) close()
  }
  // The row under the pointer takes focus, so the pointer and the keys share one highlight.
  function onPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true })
  }
  return (
    <button
      data-ds="menubar-item"
      type="button"
      role={role}
      aria-checked={role === 'menuitem' ? undefined : !!checked}
      disabled={disabled}
      data-danger={danger || undefined}
      className={cn('flex h-control-sm w-full shrink-0 cursor-pointer items-center gap-3 rounded-ds-sm px-2 text-left type-ui text-fg-soft outline-none transition-[background-color,color] duration-160 ease-standard focus:bg-action-secondary focus:text-fg disabled:cursor-not-allowed disabled:text-fg-faint data-danger:text-fg-danger max-md:h-control-touch', className)}
      onPointerMove={onPointerMove}
      onClick={choose}
    >
      <span className="flex min-w-0 flex-1 items-center gap-3">{children}</span>
      {shortcut && <span className="type-caption text-fg-muted">{shortcut}</span>}
      {role !== 'menuitem' && checked && <Check size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />}
    </button>
  )
}

export default MenubarItem
