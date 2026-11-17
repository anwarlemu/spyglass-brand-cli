'use client'
import { useId } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// One of a few, all in view: 16px circles in the #363636 hairline (round, as the lens in the logomark; every other
// control keeps the brand corner), the picked one edged in White with a White 8px dot that settles in from 0.6 over
// 150ms on the strong ease-out (reduced motion fades it). Rows 32px (44px on phones) with a DM Sans label and an
// optional muted hint. Arrows move the pick, as native radios do; focus is the White ring. More than five options is a
// Native Select or a Select; views of one thing are Tabs. `value` with `onValueChange` controls it (or `defaultValue`).
export interface RadioOption<T extends string> { value: T, label: string, hint?: string, disabled?: boolean }
export interface RadioGroupProps<T extends string> {
  /** The choices: value, label, an optional hint, disabled. */
  options: RadioOption<T>[]
  /** The group's name for assistive tech. */
  label: string
  /** The form field's name (also the radios' group). */
  name?: string
  /** The options in a row. */
  inline?: boolean
  disabled?: boolean
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  className?: string
}

export function RadioGroup<T extends string>({ options, label, name: given, inline, disabled, value, defaultValue, onValueChange, className }: RadioGroupProps<T>) {
  const [model, setModel] = useControllable<T | undefined>(value, defaultValue, v => v !== undefined && onValueChange?.(v))
  const auto = useId()
  const name = given ?? `radio-${auto}`
  return (
    <>
      <style href="ds-radio-group" precedence="ds">{css}</style>
      <div data-ds="radio-group" role="radiogroup" aria-label={label} className={className ? `ds-radios ${className}` : 'ds-radios'} data-inline={inline || undefined}>
        {options.map(o => (
          <label key={o.value} className="ds-radiorow" data-disabled={disabled || o.disabled || undefined}>
            <span className="ds-radio"><input type="radio" name={name} value={o.value} checked={model === o.value} onChange={() => setModel(o.value)} disabled={disabled || o.disabled} aria-describedby={o.hint ? `${name}-${o.value}` : undefined} /><i aria-hidden="true" /></span>
            <span className="flex min-w-0 flex-col">
              <span>{o.label}</span>
              {o.hint && <span id={`${name}-${o.value}`} className="type-caption text-fg-muted">{o.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </>
  )
}

export default RadioGroup

const css = `
.ds-radios { display: flex; flex-direction: column; gap: var(--ds-space-xs); }
.ds-radios[data-inline] { flex-direction: row; flex-wrap: wrap; column-gap: var(--ds-space-xl); }
.ds-radiorow { display: inline-flex; min-height: var(--ds-size-control-sm); align-items: flex-start; gap: var(--ds-space-md); padding-block: var(--ds-space-xs); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); cursor: pointer; }
.ds-radiorow[data-disabled] { color: var(--ds-color-fg-faint); cursor: not-allowed; }
.ds-radio { display: inline-grid; width: var(--ds-size-icon-sm); height: var(--ds-size-icon-sm); flex-shrink: 0; margin-top: var(--ds-space-2xs); place-items: center; }
.ds-radio > * { grid-area: 1 / 1; }
.ds-radio > input { width: var(--ds-size-icon-sm); height: var(--ds-size-icon-sm); margin: 0; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-radius: var(--ds-radius-full); background: var(--ds-color-surface); appearance: none; cursor: inherit; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-radio > input:checked { border-color: var(--ds-color-action-primary); }
.ds-radio > input:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
.ds-radio > input:disabled { border-color: var(--ds-color-edge); background: var(--ds-color-surface-sunken); }
.ds-radio > i { width: var(--ds-space-sm); height: var(--ds-space-sm); border-radius: var(--ds-radius-full); background: var(--ds-color-action-primary); opacity: 0; pointer-events: none; transform: scale(0.6); transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-radio > input:checked + i { opacity: 1; transform: none; }
.ds-radio > input:disabled + i { background: var(--ds-color-fg-faint); }
@media (hover: hover) and (pointer: fine) { .ds-radiorow:hover > .ds-radio > input:not(:disabled, :checked) { border-color: var(--ds-color-action-secondary-edge-hover); } }
@media (pointer: coarse), (max-width: 767px) { .ds-radiorow { min-height: var(--ds-size-control-touch); align-items: center; padding-block: var(--ds-space-sm); font-size: var(--ds-text-body); line-height: var(--ds-text-body-leading); } .ds-radio { margin-top: 0; } }
@media (prefers-reduced-motion: reduce) { .ds-radio > i { transform: none; transition: opacity var(--ds-duration-micro) var(--ds-easing-standard); } }
`
