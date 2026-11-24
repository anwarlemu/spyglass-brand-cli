'use client'
import { useEffect, useId, useImperativeHandle, useRef, type ReactNode, type Ref, type MouseEvent } from 'react'
import { buttonClasses } from '@/react/components/ui/Button'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { firstFocusable, usePopover, type Align, type Side } from '@/react/hooks/usePopover'

// A panel for any content (a short form, a few settings, a note), opened from a button: the card's #262626 fill on
// Black with a hairline and the brand corner. The trigger's content is `trigger`, drawn as a small secondary button
// unless `triggerClass` says otherwise. Opening moves focus to the panel's first control (or the panel); Escape, a
// press outside or tabbing away closes it, and Escape returns focus to the trigger. It flips to the side with room and
// stays 8px inside the viewport. children may be a function of `close`. `open` with `onOpenChange` controls it; `ref`
// gets { close }.
export interface PopoverProps {
  /** The panel's name for assistive tech. */
  label: string
  /** The side it opens on (it flips when there is no room). */
  side?: Side
  /** Where it lines up with the trigger. */
  align?: Align
  /** The panel's width (a CSS length). */
  width?: string
  /** Classes for the trigger in place of the small secondary button. */
  triggerClass?: string
  /** The trigger's name, when its content is only an icon. */
  triggerLabel?: string
  /** The trigger's content, or a function of whether it is open. */
  trigger?: ReactNode | ((open: boolean) => ReactNode)
  /** Opens or closes it (with onOpenChange). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** The panel's content, or a function of `close`. */
  children?: ReactNode | ((close: (refocus?: boolean) => void) => ReactNode)
  ref?: Ref<{ close: (refocus?: boolean) => void }>
}

export function Popover({ label, side = 'bottom', align = 'start', width = '288px', triggerClass, triggerLabel, trigger, open, onOpenChange, children, ref }: PopoverProps) {
  const pop = usePopover({ side, align, gap: 8 })
  const id = `popover-${useId()}`
  const close = (refocus = true) => pop.hide(refocus)
  useImperativeHandle(ref, () => ({ close }))

  async function show(keyboard = false) {
    await pop.show({ keyboard })
    ;(firstFocusable(pop.panel.current) ?? pop.panel.current)?.focus({ preventScroll: true })
  }
  useEffect(() => {
    if (open && !pop.open) void show()
    if (open === false && pop.open) pop.hide()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const report = useRef(onOpenChange)
  report.current = onOpenChange
  const was = useRef(pop.open)
  useEffect(() => {
    if (was.current !== pop.open) report.current?.(pop.open)
    was.current = pop.open
  }, [pop.open])
  // A click from the keyboard has no pointer detail: the panel opens and closes at once.
  function onClick(event: MouseEvent) {
    const keyboard = event.detail === 0
    if (pop.open) pop.hide(keyboard, keyboard)
    else void show(keyboard)
  }
  return (
    <>
      <button
        data-ds="popover"
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        className={triggerClass ?? buttonClasses({ variant: 'secondary', size: 'sm' })}
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        aria-controls={pop.open ? id : undefined}
        aria-label={triggerLabel}
        onClick={onClick}
      >
        {typeof trigger === 'function' ? trigger(pop.open) : trigger}
      </button>
      <PopoverPanel data-ds="popover" id={id} pop={pop} role="dialog" aria-label={label} tabIndex={-1} className="p-4" style={{ width }}>
        {typeof children === 'function' ? children(close) : children}
      </PopoverPanel>
    </>
  )
}

export default Popover
