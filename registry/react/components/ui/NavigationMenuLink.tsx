import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A link in a NavigationMenuItem's panel: its title in DM Sans Medium and a muted line under it, the small corner; the
// link under the pointer or focus takes the #262626 fill. Other props (onClick) land on the <a>.
export interface NavigationMenuLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> {
  href?: string
  /** The link's title. */
  title: string
  /** A line under it. */
  description?: string
  children?: ReactNode
}

export function NavigationMenuLink({ href, title, description, className, ...rest }: NavigationMenuLinkProps) {
  return (
    <a data-ds="navigation-menu-link" href={href} className={cn('flex flex-col gap-1 rounded-ds-sm p-3 -outline-offset-2 transition-[background-color] duration-150 ease-standard hover:bg-action-secondary focus-visible:bg-action-secondary', className)} {...rest}>
      <span className="type-ui-strong text-fg">{title}</span>
      {description && <span className="type-caption text-fg-muted">{description}</span>}
    </a>
  )
}

export default NavigationMenuLink
