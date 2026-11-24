import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A row: media, a title in DM Sans Medium with a muted line under it, and what goes at the end. `variant` default has
// no fill (rows in a list, split by ItemGroup's hairlines), outline a #363636 hairline box, muted the card's #262626
// fill; both boxes take the brand corner. `size` sm is tighter. With `href` the whole row is one link that takes the
// ghost fill under the pointer (160ms), and `arrow` adds a chevron that brightens with it and never moves. A link holds
// no buttons: `actions` only show on a row without `href`.
export type ItemVariant = 'default' | 'outline' | 'muted'
export type ItemSize = 'default' | 'sm'

const VARIANTS: Record<ItemVariant, string> = {
  default: 'bg-transparent',
  outline: 'rounded-container border border-edge',
  muted: 'rounded-container bg-surface-raised',
}
const SIZES: Record<ItemSize, string> = { default: 'gap-4 p-4', sm: 'gap-3 px-4 py-3' }

export interface ItemProps {
  /** The title. */
  title?: string
  /** A muted line under the title (two lines at most). */
  description?: string
  /** default (no fill), outline (a hairline box) or muted (the card's fill). */
  variant?: ItemVariant
  /** default or sm (tighter). */
  size?: ItemSize
  /** The whole row opens this. */
  href?: string
  /** A chevron at the end of a link row. */
  arrow?: boolean
  /** Before the title: an icon, a logo, a thumbnail. */
  media?: ReactNode
  /** At the end, on a row without href: buttons, a tag, a time. */
  actions?: ReactNode
  className?: string
  /** The title, in place of `title`. */
  children?: ReactNode
}

export function Item({ title, description, variant = 'default', size = 'default', href, arrow, media, actions, className, children }: ItemProps) {
  const classes = cn('group/item flex min-w-0 items-center', VARIANTS[variant] ?? VARIANTS.default, SIZES[size] ?? SIZES.default)
  const body = (
    <>
      {media && <span className="flex shrink-0 items-center justify-center text-fg-soft">{media}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate type-ui-strong text-fg">{children ?? title}</span>
        {description && <span className="line-clamp-2 type-ui text-fg-muted">{description}</span>}
      </span>
    </>
  )
  if (href) {
    return (
      <a data-ds="item" href={href} className={cn(classes, 'cursor-pointer rounded-container transition-[background-color] duration-160 ease-standard hover:bg-action-ghost-hover', className)}>
        {body}
        {arrow && <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted transition-[color] duration-160 ease-standard group-hover/item:text-fg" aria-hidden="true" />}
      </a>
    )
  }
  return (
    <div data-ds="item" className={cn(classes, className)}>
      {body}
      {actions && <span className="flex shrink-0 items-center gap-2">{actions}</span>}
    </div>
  )
}

export default Item
