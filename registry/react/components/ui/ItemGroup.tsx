import type { HTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// Rows of one list, a #363636 hairline between each. Put Item rows in it, one per <li>.
export type ItemGroupProps = HTMLAttributes<HTMLUListElement>

export function ItemGroup({ className, children, ...rest }: ItemGroupProps) {
  return <ul data-ds="item-group" className={cn('flex flex-col [&>*+*]:border-t [&>*+*]:border-edge', className)} {...rest}>{children}</ul>
}

export default ItemGroup
