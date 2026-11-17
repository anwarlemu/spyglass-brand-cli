'use client'
import type { CSSProperties } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// A value on a range: a 4px #363636 track, White up to the value, and a 16px White thumb with the small corner, the
// White focus ring around it. It follows the pointer with no easing, since the hand is moving it; arrows step it, Page
// Up and Down by tens, Home and End to the ends. The whole 32px row takes the pointer (44px on phones). Show the value
// beside it in tabular figures. `value` with `onValueChange` controls it (or `defaultValue` alone).
export interface SliderProps {
  /** The name for assistive tech. */
  label: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  /** What a screen reader says for the value ("$40 a day" for 40). */
  valueText?: string
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  className?: string
}

export function Slider({ label, min = 0, max = 100, step = 1, disabled, valueText, value, defaultValue = 0, onValueChange, className }: SliderProps) {
  const [current, setCurrent] = useControllable(value, defaultValue, onValueChange)
  const share = max > min ? ((current - min) / (max - min)) * 100 : 0
  return (
    <>
      <style href="ds-slider" precedence="ds">{css}</style>
      <span data-ds="slider" className={className ? `ds-slider ${className}` : 'ds-slider'} style={{ '--p': `${share}%` } as CSSProperties} data-disabled={disabled || undefined}>
        <span className="ds-slider-track" aria-hidden="true"><span /></span>
        <input type="range" value={current} onChange={e => setCurrent(Number(e.target.value))} min={min} max={max} step={step} disabled={disabled} aria-label={label} aria-valuetext={valueText} />
      </span>
    </>
  )
}

export default Slider

const css = `
.ds-slider { position: relative; display: flex; width: 100%; height: var(--ds-size-control-sm); align-items: center; }
.ds-slider-track { position: absolute; right: 0; left: 0; height: var(--ds-space-xs); overflow: hidden; border-radius: var(--ds-radius-sm); background: var(--ds-color-edge-strong); pointer-events: none; }
.ds-slider-track > span { display: block; width: var(--p); height: 100%; background: var(--ds-color-action-primary); }
.ds-slider[data-disabled] .ds-slider-track > span { background: var(--ds-color-action-disabled-fg); }
.ds-slider > input { position: relative; width: 100%; height: 100%; margin: 0; background: transparent; appearance: none; cursor: pointer; }
.ds-slider > input:disabled { cursor: not-allowed; }
.ds-slider > input:focus-visible { outline: none; }
.ds-slider > input::-webkit-slider-runnable-track { height: var(--ds-space-xs); background: transparent; }
.ds-slider > input::-moz-range-track { height: var(--ds-space-xs); background: transparent; }
.ds-slider > input::-webkit-slider-thumb { width: var(--ds-size-icon-sm); height: var(--ds-size-icon-sm); margin-top: calc((var(--ds-space-xs) - var(--ds-size-icon-sm)) / 2); border: 0; border-radius: var(--ds-radius-sm); background: var(--ds-color-action-primary); appearance: none; }
.ds-slider > input::-moz-range-thumb { width: var(--ds-size-icon-sm); height: var(--ds-size-icon-sm); border: 0; border-radius: var(--ds-radius-sm); background: var(--ds-color-action-primary); }
.ds-slider > input:disabled::-webkit-slider-thumb { background: var(--ds-color-action-disabled-fg); }
.ds-slider > input:disabled::-moz-range-thumb { background: var(--ds-color-action-disabled-fg); }
.ds-slider > input:focus-visible::-webkit-slider-thumb { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
.ds-slider > input:focus-visible::-moz-range-thumb { outline: var(--ds-border-focus) solid var(--ds-color-edge-focus); outline-offset: var(--ds-border-focus); }
@media (pointer: coarse), (max-width: 767px) { .ds-slider { height: var(--ds-size-control-touch); } }
`
