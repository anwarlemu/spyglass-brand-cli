'use client'
import { Fragment, type ElementType, type MouseEvent } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/react/lib/cn'

// shadcn's breadcrumb in the brand: where you are, in DM Sans 14px. Each step back is a muted link that turns White
// under the pointer (150ms), a small chevron between them, and the page itself in White, the only step that truncates.
// `as` renders a router link component for the steps back (it gets `href` and `to`); `onNavigate` hears a click.
export interface Crumb {
  label: string
  href?: string
}
export interface BreadcrumbProps {
  /** The steps, the page last. */
  items: Crumb[]
  /** The trail's name for assistive tech. */
  label?: string
  /** A router link component for the steps back. */
  as?: ElementType
  onNavigate?: (crumb: Crumb, event: MouseEvent) => void
  className?: string
}

export function Breadcrumb({ items, label = 'Breadcrumb', as: Link = 'a', onNavigate, className }: BreadcrumbProps) {
  return (
    <nav data-ds="breadcrumb" className={cn('flex min-w-0 items-center gap-1.5 overflow-hidden type-ui', className)} aria-label={label}>
      {items.map((crumb, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight size={14} strokeWidth={1.5} className="shrink-0 text-fg-faint rtl:-scale-x-100" aria-hidden="true" />}
          {i < items.length - 1
            ? <Link href={crumb.href ?? '#'} to={Link === 'a' ? undefined : crumb.href} className="shrink-0 rounded-ds-sm text-fg-muted transition-[color] duration-150 ease-standard hover:text-fg" onClick={(event: MouseEvent) => onNavigate?.(crumb, event)}>{crumb.label}</Link>
            : <span className="min-w-0 truncate text-fg" aria-current="page">{crumb.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb
