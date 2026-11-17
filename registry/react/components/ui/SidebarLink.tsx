'use client'
import type { AnchorHTMLAttributes, ComponentType, ElementType } from 'react'
import { useSidebarCollapsed } from '@/react/components/ui/Sidebar'
import { cn } from '@/react/lib/cn'

// One page in the Sidebar: a 40px row (44px on phones) with its 16px icon, the label and a count at the end, the brand
// corner. The page you are on is White with Black type, as the primary button; the others are soft gray and fill on
// hover. Folded to icons, the row is a 40px square and the label stays for assistive tech. `as` renders a router link
// component instead of an anchor; other props (onClick) land on the link.
export interface SidebarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string
  /** The page you are on. */
  active?: boolean
  /** A Lucide icon. */
  icon?: ComponentType<{ size?: number, strokeWidth?: number, 'aria-hidden'?: boolean | 'true' }>
  /** A count at the end of the row. */
  status?: string
  /** A router link component in place of <a>. */
  as?: ElementType
}

export function SidebarLink({ href, active, icon: Icon, status, as: Link = 'a', className, children, ...rest }: SidebarLinkProps) {
  const collapsed = useSidebarCollapsed()
  return (
    <Link
      data-ds="sidebar-link"
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-row shrink-0 cursor-pointer items-center gap-3 rounded-control type-ui -outline-offset-2 transition-[background-color,color] duration-150 ease-standard max-md:h-control-touch',
        collapsed ? 'w-row justify-center px-0' : 'px-3',
        active ? 'bg-action-primary text-action-primary-fg' : 'text-fg-soft hover:bg-action-ghost-hover hover:text-fg',
        className,
      )}
      {...rest}
    >
      {Icon && <span className={cn('flex shrink-0', active ? 'text-action-primary-fg' : 'text-fg-muted')}><Icon size={16} strokeWidth={1.5} aria-hidden="true" /></span>}
      <span className={collapsed ? 'sr-only' : 'min-w-0 flex-1 truncate'}>{children}</span>
      {status && !collapsed && <span className={cn('type-caption tabular-nums', active ? 'text-action-primary-fg' : 'text-fg-muted')}>{status}</span>}
    </Link>
  )
}

export default SidebarLink
