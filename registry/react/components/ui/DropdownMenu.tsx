'use client'
import { createContext, useEffect, useId, useImperativeHandle, useRef, type ReactNode, type Ref } from 'react'
import { useMenu } from '@/react/hooks/useMenu'
import { cn } from '@/react/lib/cn'

// shadcn's dropdown menu in the brand: a button that opens a short list of actions or choices on the #171717 overlay
// surface, a neutral hairline, the 8px corner, no shadow, 4px inside; rows are DropdownMenuItem, with
// DropdownMenuLabel and DropdownMenuSeparator between groups. It comes in over 200ms (a 4px drop and a touch of scale
// from its trigger's edge, ease-out), leaves at once, and does not animate when opened from the keyboard, which is
// how menus are opened most. Arrows, Home, End, Escape, Tab and a click outside are handled (useMenu). The trigger's
// content is `trigger` (a node, or a function of `open`), drawn as a small secondary button unless `triggerClass`
// says otherwise. `defaultOpen` opens it with the page; `ref` gets { open, show, close }; `onOpenChange` hears it.
export const MenuClose = createContext<() => void>(() => {})

export interface DropdownMenuHandle { open: boolean, show: (focus?: 'first' | 'last' | 'none') => void, close: (refocus?: boolean) => void }
export interface DropdownMenuProps {
  /** The menu's name for assistive tech. */
  label: string
  /** Opens upward. */
  up?: boolean
  /** The panel's edge: start, or end to line up with the trigger's end. */
  align?: 'start' | 'end'
  /** The panel's width. */
  width?: string
  /** Moves the panel in from its edge. */
  offset?: string
  /** Classes for the trigger button, in place of the small secondary button. */
  triggerClass?: string
  /** The trigger's name, when its content has none (an icon). */
  triggerLabel?: string
  /** The trigger's content, or a function of whether it is open. */
  trigger?: ReactNode | ((open: boolean) => ReactNode)
  /** Opens with the page. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The root's data-ds, for a component built on it. */
  'data-ds'?: string
  className?: string
  children?: ReactNode
  ref?: Ref<DropdownMenuHandle>
}

export const MENU_TRIGGER = 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 rounded-control bg-action-secondary px-3 type-ui-strong text-action-secondary-fg transition-[background-color] duration-150 ease-standard hover:bg-action-secondary-hover aria-expanded:bg-action-secondary-hover max-md:h-control-touch'

export function DropdownMenu({ label, up, align = 'start', width = '240px', offset = '0px', triggerClass, triggerLabel, trigger: triggerContent, defaultOpen, onOpenChange, 'data-ds': ds = 'dropdown-menu', className, children, ref }: DropdownMenuProps) {
  const { open, root, trigger, show, close, toggle, onTriggerKey, onMenuKey } = useMenu(defaultOpen)
  const report = useRef(onOpenChange)
  report.current = onOpenChange
  const was = useRef(open)
  useEffect(() => {
    if (was.current === open) return
    was.current = open
    report.current?.(open)
  }, [open])
  useImperativeHandle(ref, () => ({ open, show, close }), [open, show, close])
  const id = `menu-${useId()}`
  return (
    <MenuClose.Provider value={() => close(true)}>
      <style href="ds-dropdown-menu" precedence="ds">{css}</style>
      <div data-ds={ds} ref={root} className={cn('relative inline-block', className)}>
        <button
          ref={trigger}
          type="button"
          className={triggerClass ?? MENU_TRIGGER}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={id}
          aria-label={triggerLabel}
          onClick={toggle}
          onKeyDown={onTriggerKey}
        >
          {typeof triggerContent === 'function' ? triggerContent(open) : triggerContent}
        </button>
        {open && (
          <div
            id={id}
            className="ds-menu"
            data-up={up || undefined}
            data-align={align}
            style={{ width, [align === 'end' ? 'right' : 'left']: offset, [up ? 'bottom' : 'top']: 'calc(100% + 4px)' }}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKey}
          >
            {children}
          </div>
        )}
      </div>
    </MenuClose.Provider>
  )
}

export default DropdownMenu

const css = `
.ds-menu { position: absolute; z-index: 40; display: flex; max-width: calc(100vw - 16px); flex-direction: column; padding: var(--ds-space-xs); border: var(--ds-border-hairline) solid var(--ds-color-edge); border-radius: var(--ds-radius-container); background: var(--ds-color-surface-raised); color: var(--ds-color-fg); transform-origin: top left; animation: ds-menu-in var(--ds-duration-enter) var(--ds-easing-out) both; scroll-margin: 8px; }
.ds-menu[data-align="end"] { transform-origin: top right; }
.ds-menu[data-up] { transform-origin: bottom left; animation-name: ds-menu-up; }
.ds-menu[data-up][data-align="end"] { transform-origin: bottom right; }
/* Opened from the keyboard, focus lands on a row at once: no animation. */
.ds-menu:has(:focus-visible) { animation: none; }
.ds-menu > * { flex-shrink: 0; }
@keyframes ds-menu-in { from { opacity: 0; transform: translateY(-4px) scale(0.98); } }
@keyframes ds-menu-up { from { opacity: 0; transform: translateY(4px) scale(0.98); } }
@media (prefers-reduced-motion: reduce) { .ds-menu, .ds-menu[data-up] { animation-name: ds-menu-fade; } }
@keyframes ds-menu-fade { from { opacity: 0; } }
`
