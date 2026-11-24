'use client'
import { useControllable } from '@/react/hooks/useControllable'

// On or off, with no words: a 36 by 20 track with the brand corner and a 14px thumb (the small corner, nested inside).
// Off is the secondary #262626 fill with a #666666 hairline and a gray thumb; on is the primary White with a Black
// thumb, as the brand's one White action. The thumb slides over 320ms on the strong ease-out (reduced motion keeps only
// the color change). The row beside it says what the state means. Disabled is the disabled fill, never faded.
// `checked` with `onCheckedChange` controls it (or `defaultChecked` alone).
export interface SwitchProps {
  /** What it turns, for assistive tech (the row beside it says it for the eye). */
  label: string
  disabled?: boolean
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function Switch({ label, disabled, checked, defaultChecked = false, onCheckedChange, className }: SwitchProps) {
  const [on, setOn] = useControllable(checked, defaultChecked, onCheckedChange)
  return (
    <>
      <style href="ds-switch" precedence="ds">{css}</style>
      <button data-ds="switch" type="button" role="switch" className={className ? `ds-switch ${className}` : 'ds-switch'} aria-checked={on} aria-label={label} disabled={disabled} onClick={() => setOn(!on)}><span aria-hidden="true" /></button>
    </>
  )
}

export default Switch

const css = `
.ds-switch { --w: 36px; --h: 20px; position: relative; display: inline-flex; width: var(--w); height: var(--h); flex-shrink: 0; align-items: center; padding: var(--ds-space-2xs); border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-radius: var(--ds-radius-control); background: var(--ds-color-action-secondary); cursor: pointer; touch-action: manipulation; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-switch > span { width: calc(var(--h) - 6px); height: calc(var(--h) - 6px); border-radius: var(--ds-radius-sm); background: var(--ds-color-fg-muted); transition: transform var(--ds-duration-glide) var(--ds-easing-out), background-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-switch[aria-checked="true"] { border-color: var(--ds-color-action-primary); background: var(--ds-color-action-primary); }
.ds-switch[aria-checked="true"] > span { background: var(--ds-color-action-primary-fg); transform: translateX(calc(var(--w) - var(--h))); }
.ds-switch:disabled { border-color: var(--ds-color-edge); background: var(--ds-color-action-disabled); cursor: not-allowed; }
.ds-switch:disabled > span { background: var(--ds-color-action-disabled-fg); }
.ds-switch:focus-visible { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
@media (hover: hover) and (pointer: fine) {
  .ds-switch:hover:not(:disabled, [aria-checked="true"]) { border-color: var(--ds-color-action-secondary-edge-hover); }
  .ds-switch[aria-checked="true"]:hover:not(:disabled) { border-color: var(--ds-color-action-primary-hover); background: var(--ds-color-action-primary-hover); }
}
/* A 44px place to land on phones, the switch keeping its size. */
@media (pointer: coarse), (max-width: 767px) { .ds-switch::after { position: absolute; inset: -12px; content: ""; } }
@media (prefers-reduced-motion: reduce) { .ds-switch > span { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); } }
`
