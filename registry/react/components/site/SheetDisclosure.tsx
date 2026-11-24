'use client'
import { useId, useState, type ReactNode } from 'react'
import { Chevron } from '@/react/components/site/NavIcon'
import { cn } from '@/react/lib/cn'

// The phone sheet's disclosure (site/Header SheetDisclosure): a 48px row in Funnel Display 24/28 with a 16px chevron in
// the soft gray that turns over; its list opens to its height and fades in over 320ms (160ms closing), as the library's
// accordion rows do. Reduced motion keeps the fade.
export const SHEET_LINK = 'flex min-h-12 items-center rounded-control px-3 -mx-3 type-heading-3 text-fg transition-[color] duration-160 ease-out outline-offset-[calc(-1*var(--ds-space-xs))] hover:text-fg-soft active:text-fg-soft'

export interface SheetDisclosureProps {
  label: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

export function SheetDisclosure({ label, children, defaultOpen = false, className }: SheetDisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div data-ds="sheet-disclosure" data-open={open || undefined} className={cn('flex flex-col', className)}>
      <style href="ds-sheet-disclosure" precedence="ds">{css}</style>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((was) => !was)} className={cn(SHEET_LINK, 'w-[calc(100%+2*var(--ds-space-md))] cursor-pointer justify-between text-start')}>
        {label}
        <Chevron size={16} className="ds-sheet-chevron size-4 text-fg-soft" />
      </button>
      <div id={id} inert={!open} data-open={open} className="ds-sheet-collapse">
        <div><div className="ds-sheet-collapse-body">{children}</div></div>
      </div>
    </div>
  )
}

export default SheetDisclosure

const css = `
.ds-sheet-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-exit) var(--ds-easing-out); }
.ds-sheet-collapse[data-open="true"] { grid-template-rows: 1fr; transition-duration: var(--ds-duration-glide); }
.ds-sheet-collapse > div { min-height: 0; overflow: hidden; }
.ds-sheet-collapse-body { opacity: 0; transition: opacity var(--ds-duration-exit) var(--ds-easing-out); }
.ds-sheet-collapse[data-open="true"] .ds-sheet-collapse-body { opacity: 1; transition-duration: var(--ds-duration-glide); }
.ds-sheet-chevron { transition: transform var(--ds-duration-glide) var(--ds-easing-in-out); }
[aria-expanded="true"] > .ds-sheet-chevron { transform: rotate(180deg); }
@media (prefers-reduced-motion: reduce) {
  .ds-sheet-collapse, .ds-sheet-collapse[data-open="true"], .ds-sheet-chevron { transition: none; }
}
`
