import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The keys of one shortcut, 4px apart: <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>.
export interface KbdGroupProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

export function KbdGroup({ className, children, ...rest }: KbdGroupProps) {
  return <kbd data-ds="kbd-group" className={cn('inline-flex items-center gap-1', className)} {...rest}>{children}</kbd>
}

export default KbdGroup
