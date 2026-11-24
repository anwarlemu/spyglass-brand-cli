'use client'
import { useId, useState, type MouseEvent, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useControllable } from '@/react/hooks/useControllable'

// shadcn's collapsible in the brand: a part that opens in place and pushes what follows. The part grows to its
// content's height over 320ms on the strong ease-out and closes in 160ms; the content fades and settles 4px down; the
// muted chevron turns half a circle. Toggled from the keyboard it opens at once. The trigger's content is `trigger` (a
// node, or a function of `open`), drawn as a quiet DM Sans Medium row unless `triggerClass` says otherwise; it is a
// real button with aria-expanded and aria-controls. `open` with `onOpenChange` (or `defaultOpen` alone).
export interface CollapsibleProps {
  /** Classes for the trigger button, in place of the quiet row. */
  triggerClass?: string
  /** The trigger's content, or a function of whether it is open. */
  trigger?: ReactNode | ((open: boolean) => ReactNode)
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

export function Collapsible({ triggerClass, trigger, open: openProp, defaultOpen = false, onOpenChange, children }: CollapsibleProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [instant, setInstant] = useState(false)
  const id = `collapse-${useId()}`
  function toggle(event: MouseEvent) {
    setInstant(event.detail === 0)
    setOpen(!open)
  }
  return (
    <>
      <style href="ds-collapsible" precedence="ds">{css}</style>
      <div data-ds="collapsible" className="ds-collapsible" data-open={open || undefined} data-instant={instant || undefined}>
        <button
          type="button"
          className={triggerClass ?? 'flex w-full cursor-pointer items-center gap-2 rounded-control py-2 text-left type-ui-strong text-fg max-md:min-h-control-touch'}
          aria-expanded={open}
          aria-controls={id}
          onClick={toggle}
        >
          {typeof trigger === 'function' ? trigger(open) : trigger}
          <ChevronDown size={16} strokeWidth={1.5} className="ds-collapsible-chev ml-auto shrink-0 text-fg-muted" aria-hidden="true" />
        </button>
        <div id={id} className="ds-collapsible-region" inert={!open || undefined}>
          <div><div className="ds-collapsible-content">{children}</div></div>
        </div>
      </div>
    </>
  )
}

export default Collapsible

const css = `
/* The part opens to its content's height (0fr to 1fr) over 320ms and closes in 160ms, on the strong ease-out; the
   content fades and settles 4px down. The chevron turns half a circle (320ms, ease-in-out). Toggled from the keyboard
   it opens at once. Reduced motion: no height, move or turn, opacity only. */
.ds-collapsible-region { display: grid; grid-template-rows: 0fr; transition: grid-template-rows var(--ds-duration-exit) var(--ds-easing-out); }
.ds-collapsible[data-open] > .ds-collapsible-region { grid-template-rows: 1fr; transition-duration: var(--ds-duration-glide); }
.ds-collapsible-region > div { min-height: 0; overflow: hidden; }
.ds-collapsible-content { opacity: 0; transform: translateY(-4px); transition: opacity var(--ds-duration-exit) var(--ds-easing-standard), transform var(--ds-duration-exit) var(--ds-easing-out); }
.ds-collapsible[data-open] > .ds-collapsible-region .ds-collapsible-content { opacity: 1; transform: none; transition-duration: var(--ds-duration-glide); }
.ds-collapsible-chev { transition: rotate var(--ds-duration-glide) var(--ds-easing-in-out); }
.ds-collapsible[data-open] > button .ds-collapsible-chev { rotate: 180deg; }
.ds-collapsible[data-instant] :is(.ds-collapsible-region, .ds-collapsible-content, .ds-collapsible-chev) { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-collapsible-region, .ds-collapsible-chev { transition: none; }
  .ds-collapsible-content, .ds-collapsible[data-open] > .ds-collapsible-region .ds-collapsible-content { transform: none; }
}
`
