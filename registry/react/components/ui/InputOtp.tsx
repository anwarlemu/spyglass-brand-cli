'use client'
import { useRef, useState, type FormEvent } from 'react'
import { useControllable } from '@/react/hooks/useControllable'

// A one-time code: square cells drawn as the Input is (a #363636 hairline on Black, the brand corner, 48px; 40px on
// phones), DM Sans digits at 18px in tabular figures, the cell being typed into edged in White with a caret, and an
// optional gap after `split` cells. It is one real input laid over the cells, so paste, the phone's code suggestion
// (autocomplete="one-time-code"), arrows and delete all work as in any field. Calls `onComplete` when every cell is
// filled. A red hairline on every cell when invalid. The caret blinks in steps (no fade); reduced motion holds it still.
// `value` with `onValueChange` controls it (or `defaultValue` alone).
export interface InputOtpProps {
  /** How many cells (6). */
  length?: number
  /** A gap after this many cells (3 for two threes). */
  split?: number
  /** The name for assistive tech. */
  label: string
  /** Digits only (false takes letters too). */
  numeric?: boolean
  /** A red hairline on every cell. */
  invalid?: boolean
  disabled?: boolean
  name?: string
  value?: string
  defaultValue?: string
  onValueChange?: (code: string) => void
  /** Every cell is filled. */
  onComplete?: (code: string) => void
  className?: string
}

export function InputOtp({ length = 6, split, label, numeric = true, invalid, disabled, name, value, defaultValue = '', onValueChange, onComplete, className }: InputOtpProps) {
  const [code, setCode] = useControllable(value, defaultValue, onValueChange)
  const input = useRef<HTMLInputElement | null>(null)
  const [focused, setFocused] = useState(false)
  const [caret, setCaret] = useState(0)
  const cells = Array.from({ length }, (_, i) => code[i] ?? '')
  const active = focused ? Math.min(caret, length - 1) : -1

  function sync() {
    const el = input.current
    if (!el) return
    setCaret(el.selectionStart ?? el.value.length)
  }
  // A click lands on the next empty cell, as typing would.
  function toEnd() {
    const el = input.current
    if (!el) return
    const end = el.value.length
    el.setSelectionRange(end, end)
    sync()
  }
  function onInput(event: FormEvent<HTMLInputElement>) {
    const el = event.currentTarget
    const clean = (numeric ? el.value.replace(/\D/g, '') : el.value.replace(/\s/g, '')).slice(0, length)
    if (clean !== el.value) el.value = clean
    setCode(clean)
    sync()
    if (clean.length === length) onComplete?.(clean)
  }

  return (
    <>
      <style href="ds-input-otp" precedence="ds">{css}</style>
      <div data-ds="input-otp" className={className ? `ds-otp ${className}` : 'ds-otp'} data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
        <input
          ref={input}
          value={code}
          name={name}
          maxLength={length}
          inputMode={numeric ? 'numeric' : 'text'}
          pattern={numeric ? '[0-9]*' : undefined}
          autoComplete="one-time-code"
          spellCheck="false"
          aria-label={label}
          aria-invalid={invalid || undefined}
          disabled={disabled}
          onChange={onInput}
          onFocus={() => { setFocused(true); toEnd() }}
          onBlur={() => setFocused(false)}
          onKeyUp={sync}
          onClick={toEnd}
        />
        {cells.map((c, i) => (
          <span key={i} className="ds-otp-cell" data-active={i === active || undefined} data-gap={split && i === split - 1 && i < length - 1 ? true : undefined} aria-hidden="true">{c}{i === active && !c && <i />}</span>
        ))}
      </div>
    </>
  )
}

export default InputOtp

const css = `
.ds-otp { position: relative; display: inline-flex; gap: var(--ds-space-sm); }
.ds-otp > input { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; border: 0; background: transparent; color: transparent; caret-color: transparent; font-size: var(--ds-text-input); letter-spacing: 1em; outline: none; cursor: text; }
.ds-otp > input::selection { background: transparent; }
.ds-otp > input:disabled { cursor: not-allowed; }
.ds-otp-cell { position: relative; display: inline-flex; width: var(--ds-size-control-lg); height: var(--ds-size-control-lg); align-items: center; justify-content: center; border: var(--ds-border-hairline) solid var(--ds-color-edge-strong); border-radius: var(--ds-radius-control); background: var(--ds-color-surface); color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-body-lg); line-height: var(--ds-text-body-lg-leading); font-variant-numeric: tabular-nums; transition: border-color var(--ds-duration-micro) var(--ds-easing-standard); }
.ds-otp-cell[data-gap] { margin-right: var(--ds-space-md); }
.ds-otp-cell[data-active] { border-color: var(--ds-color-edge-focus); }
.ds-otp-cell > i { width: 1px; height: 20px; background: var(--ds-color-fg); animation: ds-otp-caret 1000ms steps(1, end) infinite; }
@keyframes ds-otp-caret { 50% { opacity: 0; } }
@media (hover: hover) and (pointer: fine) { .ds-otp:not([data-disabled], [data-invalid]):hover .ds-otp-cell:not([data-active]) { border-color: var(--ds-color-action-secondary-edge-hover); } }
.ds-otp[data-invalid] .ds-otp-cell { border-color: var(--ds-color-action-danger); }
.ds-otp[data-disabled] .ds-otp-cell { border-color: var(--ds-color-edge); background: var(--ds-color-surface-sunken); color: var(--ds-color-fg-faint); }
@media (max-width: 767px) { .ds-otp-cell { width: var(--ds-size-control-md); height: var(--ds-size-control-md); } }
@media (prefers-reduced-motion: reduce) { .ds-otp-cell > i { animation: none; } }
`
