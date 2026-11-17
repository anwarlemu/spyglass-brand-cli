import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A key: DM Sans 12px in the soft neutral, in a 20px #1A1A1A box with a #363636 hairline and the small corner. Key
// names as words or symbols (⌘, Shift, K), never in capitals or mono. Put a shortcut's keys in KbdGroup.
export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

export const kbdClasses = 'inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-1 rounded-ds-sm border border-edge-strong bg-surface-subtle px-1 type-caption whitespace-nowrap text-fg-soft select-none'

export function Kbd({ className, children, ...rest }: KbdProps) {
  return <kbd data-ds="kbd" className={cn(kbdClasses, className)} {...rest}>{children}</kbd>
}

export default Kbd
