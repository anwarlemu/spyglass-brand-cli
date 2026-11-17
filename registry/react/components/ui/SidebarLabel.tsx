'use client'
import type { ReactNode } from 'react'
import { useSidebarCollapsed } from '@/react/components/ui/Sidebar'

// A group's name in the Sidebar: DM Sans Medium in capitals at 6%, muted, 16px over it. Folded to icons, a hairline
// takes its place and the name stays for assistive tech.
export interface SidebarLabelProps {
  /** The group's name. */
  children?: ReactNode
}

export function SidebarLabel({ children }: SidebarLabelProps) {
  const collapsed = useSidebarCollapsed()
  return (
    <div data-ds="sidebar-label" className="pt-4 pb-2 first:pt-1">
      {collapsed ? <div className="mx-2 border-t border-edge" aria-hidden="true" /> : null}
      <p className={collapsed ? 'sr-only' : 'px-3 type-label text-fg-muted'}>{children}</p>
    </div>
  )
}

export default SidebarLabel
