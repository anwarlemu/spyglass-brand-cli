import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// shadcn's button group in the brand: buttons that belong together, joined into one block with the brand corner on
// its outer corners only and a 1px Black seam between them (the ground showing through), so #262626 halves read as
// one control. Secondary buttons for a set of tools, a field with its button, a button with its menu arrow.
// `vertical` stacks them. Give it a label for the group.
export interface ButtonGroupProps {
  /** The group's name for assistive tech. */
  label?: string
  /** Stacked. */
  vertical?: boolean
  className?: string
  children?: ReactNode
}

export function ButtonGroup({ label, vertical, className, children }: ButtonGroupProps) {
  return (
    <div data-ds="button-group" className={cn('ds-btngroup', className)} role="group" aria-label={label} data-vertical={vertical || undefined}>
      <style href="ds-button-group" precedence="ds">{css}</style>
      {children}
    </div>
  )
}

export default ButtonGroup

const css = `
.ds-btngroup { display: inline-flex; align-items: stretch; gap: var(--ds-border-hairline); }
.ds-btngroup[data-vertical] { flex-direction: column; }
.ds-btngroup > * { position: relative; }
.ds-btngroup > :is(:hover, :focus-visible, :focus-within) { z-index: 1; }
.ds-btngroup:not([data-vertical]) > :not(:first-child) { border-start-start-radius: 0; border-end-start-radius: 0; }
.ds-btngroup:not([data-vertical]) > :not(:last-child) { border-start-end-radius: 0; border-end-end-radius: 0; }
.ds-btngroup[data-vertical] > :not(:first-child) { border-start-start-radius: 0; border-start-end-radius: 0; }
.ds-btngroup[data-vertical] > :not(:last-child) { border-end-start-radius: 0; border-end-end-radius: 0; }
`
