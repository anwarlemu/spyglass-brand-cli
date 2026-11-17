'use client'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// shadcn's checkbox in the brand: a yes or no that is part of a form. A 16px box with a 4px corner in a #363636
// hairline on Black that lifts to #4D4D4D under the pointer; checked, it fills White and a Black check draws its stroke
// (250ms on the strong ease-out); `indeterminate` shows a bar for a group partly on. Focus is the White ring. The label
// sits right of it in DM Sans 14px, the whole row pressable, 32px tall (44px on phones); `hint` is a muted line under
// it. `invalid` turns the hairline red. A setting that takes effect at once is a switch. `checked` with
// `onCheckedChange` (or `defaultChecked` alone); the label goes in `label` or `children`.
export interface CheckboxProps {
  /** The label, when children do not give it. */
  label?: string
  /** A muted line under the label. */
  hint?: string
  /** A bar in place of the check, for a group partly on. */
  indeterminate?: boolean
  disabled?: boolean
  /** A red hairline. */
  invalid?: boolean
  id?: string
  name?: string
  value?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  children?: ReactNode
}

export function Checkbox({ label, hint, indeterminate, disabled, invalid, id: given, name, value, checked, defaultChecked = false, onCheckedChange, className, children }: CheckboxProps) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange)
  const auto = useId()
  const id = given ?? `checkbox-${auto}`
  const input = useRef<HTMLInputElement | null>(null)
  // `indeterminate` is the input's property; React has no attribute for it.
  useEffect(() => {
    if (input.current) input.current.indeterminate = !!indeterminate
  }, [indeterminate])
  return (
    <>
      <style href="ds-checkbox" precedence="ds">{css}</style>
      <label data-ds="checkbox" className={className ? `ds-checkrow ${className}` : 'ds-checkrow'} htmlFor={id} data-disabled={disabled || undefined}>
        <span className="ds-checkbox">
          <input ref={input} id={id} type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} name={name} value={value} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={hint ? `${id}-hint` : undefined} />
          {indeterminate
            ? <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8h8" /></svg>
            : <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 4.5" pathLength="1" /></svg>}
        </span>
        {(label || children || hint) && (
          <span className="flex min-w-0 flex-col">
            <span>{children ?? label}</span>
            {hint && <span id={`${id}-hint`} className="type-caption text-fg-muted">{hint}</span>}
          </span>
        )}
      </label>
    </>
  )
}

export default Checkbox

const css = `
/* The row: the box and its label, 32px tall (44px on phones), the whole row pressable. */
.ds-checkrow { display: inline-flex; min-height: var(--ds-size-control-sm); align-items: flex-start; gap: var(--ds-space-md); padding-block: 6px; color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); cursor: pointer; }
.ds-checkrow[data-disabled] { color: var(--ds-color-fg-faint); cursor: not-allowed; }
.ds-checkbox { position: relative; display: inline-grid; width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
.ds-checkbox > * { grid-area: 1 / 1; }
.ds-checkbox > input { width: 16px; height: 16px; margin: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-radius: var(--ds-radius-sm); background: var(--ds-color-surface); appearance: none; cursor: inherit; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-checkbox > input:is(:checked, :indeterminate) { border-color: var(--ds-color-action-primary); background: var(--ds-color-action-primary); }
.ds-checkbox > input:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
.ds-checkbox > input[aria-invalid="true"]:not(:checked) { border-color: var(--ds-color-action-danger); }
.ds-checkbox > input:disabled { border-color: var(--ds-color-edge); background: var(--ds-color-action-disabled); }
.ds-checkbox > input:disabled:is(:checked, :indeterminate) { border-color: var(--ds-color-edge-strong); background: var(--ds-color-edge-strong); }
.ds-checkbox > svg { width: 16px; height: 16px; fill: none; stroke: var(--ds-color-action-primary-fg); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
.ds-checkbox > svg path[pathLength] { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-checkbox > input:checked + svg path[pathLength] { stroke-dashoffset: 0; transition: stroke-dashoffset var(--ds-duration-glide) var(--ds-easing-out); }
.ds-checkbox > input:not(:indeterminate) + svg path:not([pathLength]) { opacity: 0; }
@media (hover: hover) and (pointer: fine) { .ds-checkrow:hover > .ds-checkbox > input:not(:disabled, :checked, :indeterminate) { border-color: var(--ds-color-action-secondary-edge-hover); } }
@media (pointer: coarse), (max-width: 767px) { .ds-checkrow { min-height: var(--ds-size-control-touch); align-items: center; padding-block: 8px; font-size: var(--ds-text-body); } .ds-checkbox { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-checkbox > svg path[pathLength], .ds-checkbox > input:checked + svg path[pathLength] { transition: none; } }
`
