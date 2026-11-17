'use client'
import { useId, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { useControllable } from '@/react/hooks/useControllable'
import { onMenuRows, usePopover } from '@/react/hooks/usePopover'
import { cn } from '@/react/lib/cn'

// One choice from a short list, drawn as the field is (shadcn's select): a Black field with a #363636 hairline that
// turns White while open, the chosen label (or a muted placeholder) and a chevron. The list opens in the card's #171717
// panel, as wide as the field, focus on the chosen row; the chosen row has a check. Arrow keys, Home, End and the first
// letter move through it, Enter or Space picks, Escape closes and returns focus. Opened from the keyboard it shows at
// once; from a click it grows from the field. `value` with `onValueChange`; `name` sends the value with a form.
export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps {
  /** The choices. */
  options: SelectOption[]
  /** The chosen value (with onValueChange). */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Shown, muted, until something is chosen. */
  placeholder?: string
  /** sm (32px), md (40px) or lg (48px), as Input. */
  size?: SelectSize
  /** The field's name for assistive tech, when no <label> names it. */
  label?: string
  /** The id a <label for> points at. */
  id?: string
  /** Sends the value with a form. */
  name?: string
  disabled?: boolean
  /** A red hairline (with the message beside it). */
  invalid?: boolean
  className?: string
}

const SIZES: Record<SelectSize, string> = { sm: 'h-control-sm pr-2 pl-2.5', md: 'h-control-md pr-3 pl-3', lg: 'h-control-lg pr-4 pl-4' }

export function Select({ options, value: given, defaultValue = '', onValueChange, placeholder = 'Select', size = 'md', label, id, name, disabled, invalid, className }: SelectProps) {
  const [value, setValue] = useControllable(given, defaultValue, onValueChange)
  const pop = usePopover({ side: 'bottom', align: 'start', matchWidth: true, gap: 4 })
  const listId = `select-${useId()}`
  const typed = useRef({ text: '', at: 0 })
  const chosen = options.find((o) => o.value === value)
  const rows = () => [...(pop.panel.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? [])]

  async function open(keyboard: boolean, at: 'chosen' | 'first' | 'last' = 'chosen') {
    await pop.show({ keyboard })
    const all = rows()
    const target = at === 'first' ? all[0] : at === 'last' ? all.at(-1) : all.find((r) => r.dataset.value === value) ?? all[0]
    ;(target ?? pop.panel.current)?.focus({ preventScroll: true })
  }
  function pick(v: string, keyboard: boolean) {
    setValue(v)
    pop.hide(true, keyboard)
  }
  // A click from the keyboard has no pointer detail: the list opens and closes at once.
  function onClick(event: MouseEvent) {
    const keyboard = event.detail === 0
    if (pop.open) pop.hide(keyboard, keyboard)
    else void open(keyboard)
  }
  function onTriggerKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!pop.open) void open(true, value ? 'chosen' : event.key === 'ArrowDown' ? 'first' : 'last')
    }
  }
  // The first letters typed in a moment find the next row that starts with them.
  function typeahead(key: string) {
    const now = Date.now()
    typed.current = { text: now - typed.current.at < 500 ? typed.current.text + key.toLowerCase() : key.toLowerCase(), at: now }
    const all = rows()
    const from = all.indexOf(document.activeElement as HTMLElement)
    const order = [...all.slice(from + 1), ...all.slice(0, from + 1)]
    order.find((r) => r.textContent?.trim().toLowerCase().startsWith(typed.current.text))?.focus()
  }
  function onListKey(event: KeyboardEvent) {
    const row = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]')
    if ((event.key === 'Enter' || event.key === ' ') && row) {
      event.preventDefault()
      if (row.getAttribute('aria-disabled') !== 'true') pick(row.dataset.value ?? '', true)
    }
    else if (event.key.length === 1 && /\S/.test(event.key)) typeahead(event.key)
    else onMenuRows(event, pop.panel.current, (refocus) => pop.hide(refocus))
  }

  return (
    <>
      <button
        data-ds="select"
        ref={(el) => { pop.anchor.current = el }}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={pop.open}
        aria-controls={pop.open ? listId : undefined}
        aria-label={label}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        className={cn('flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-control border border-edge-strong bg-surface type-ui text-fg outline-none transition-[border-color] duration-150 ease-standard hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-expanded:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', SIZES[size], className)}
        onClick={onClick}
        onKeyDown={onTriggerKey}
      >
        <span className={cn('min-w-0 truncate text-left', chosen ? 'text-fg' : 'text-fg-muted')}>{chosen ? chosen.label : placeholder}</span>
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-fg-muted" />
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverPanel data-ds="select" id={listId} pop={pop} role="listbox" aria-label={label} tabIndex={-1} className="p-1" onKeyDown={onListKey}>
        {options.map((o) => (
          <div
            key={o.value}
            role="option"
            tabIndex={-1}
            data-value={o.value}
            aria-selected={o.value === value}
            aria-disabled={o.disabled || undefined}
            className="flex h-control-sm cursor-pointer items-center justify-between gap-3 rounded-ds-sm px-2 type-ui text-fg-soft outline-none transition-[background-color,color] duration-150 ease-standard focus:bg-action-secondary focus:text-fg aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint aria-selected:text-fg max-md:h-control-touch"
            onPointerMove={(event) => { if (!o.disabled && document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true }) }}
            onClick={(event) => { if (!o.disabled) pick(o.value, event.detail === 0) }}
          >
            <span className="min-w-0 truncate">{o.label}</span>
            {o.value === value && <Check size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />}
          </div>
        ))}
      </PopoverPanel>
    </>
  )
}

export default Select
