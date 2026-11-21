'use client'
import { createContext, useContext, type HTMLAttributes, type ReactNode } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// The app's rail: Black with a hairline at its edge, 256px wide. `head` holds the logo or the workspace (56px, over a
// hairline), SidebarLabel names each group in capitals, a SidebarLink per page (the page you are on in White), and
// `foot` the account. `collapsible` adds a button that folds it to 64px of icons (the labels stay for assistive tech);
// it folds at once, no motion, as something pressed many times a day should. `collapsed` with `onCollapsedChange`
// controls it. Other attributes land on the <nav>.
export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The navigation's name for assistive tech. */
  label?: string
  /** The logo or workspace, at the top. */
  head?: ReactNode
  /** The account, at the foot. */
  foot?: ReactNode
  /** Shows the button that folds it to icons. */
  collapsible?: boolean
  /** Folded to icons (with onCollapsedChange). */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
  children?: ReactNode
}

/** Whether the sidebar around a link or label is folded to icons. */
export const SidebarContext = createContext(false)
export const useSidebarCollapsed = () => useContext(SidebarContext)

export function Sidebar({ label = 'Main', head, foot, collapsible, collapsed: given, defaultCollapsed = false, onCollapsedChange, className, children, ...rest }: SidebarProps) {
  const [collapsed, setCollapsed] = useControllable(given, defaultCollapsed, onCollapsedChange)
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose
  return (
    <nav data-ds="sidebar" aria-label={label} data-collapsed={collapsed || undefined} className={cn('flex h-full shrink-0 flex-col border-r border-edge bg-surface', collapsed ? 'w-16' : 'w-rail', className)} {...rest}>
      {(head || collapsible) && (
        <div className={cn('flex h-14 shrink-0 items-center gap-2 border-b border-edge px-3', collapsed ? 'justify-center' : 'justify-between')}>
          {head && !collapsed && <div className="flex min-w-0 flex-1 items-center pl-1">{head}</div>}
          {collapsible && (
            <button type="button" className="inline-flex size-control-md shrink-0 cursor-pointer items-center justify-center rounded-control text-fg-muted transition-[background-color,color] duration-150 ease-standard hover:bg-action-ghost-hover hover:text-fg" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}>
              <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
      <SidebarContext.Provider value={collapsed}>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3 fade-y">{children}</div>
      </SidebarContext.Provider>
      {foot && <div className={cn('shrink-0 border-t border-edge p-3', collapsed && 'hidden')}>{foot}</div>}
    </nav>
  )
}

export default Sidebar
