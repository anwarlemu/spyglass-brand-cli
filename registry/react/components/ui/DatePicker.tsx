'use client'
import { useId, type KeyboardEvent, type MouseEvent } from 'react'
import { CalendarDays } from 'lucide-react'
import { Calendar } from '@/react/components/ui/Calendar'
import { PopoverPanel } from '@/react/components/ui/PopoverPanel'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'
import { usePopover } from '@/react/hooks/usePopover'

// shadcn's date picker in the brand: a button drawn as the text field (40px, the 8px corner, a #363636 hairline that
// turns White while it is open or focused, the placeholder muted) that opens a Calendar on the #171717 overlay panel
// under it. Opening puts focus on the picked day (or today); picking a day closes it and returns focus to the field;
// Escape closes it unchanged. `value` with `onValueChange` (or `defaultValue` alone).
export interface DatePickerProps {
  id?: string
  /** What the field says before a day is picked. */
  placeholder?: string
  /** The first day that can be picked. */
  min?: Date
  /** The last day that can be picked. */
  max?: Date
  /** Days that can't be picked. */
  disabled?: (day: Date) => boolean
  /** A red edge. */
  invalid?: boolean
  locale?: string
  /** How the picked day reads in the field. */
  format?: Intl.DateTimeFormatOptions
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (day: Date | null) => void
  className?: string
  'aria-describedby'?: string
}

const FORMAT: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }

export function DatePicker({ id, placeholder = 'Pick a date', min, max, disabled, invalid, locale = 'en-US', format = FORMAT, value, defaultValue = null, onValueChange, className, 'aria-describedby': describedBy }: DatePickerProps) {
  const [model, setModel] = useControllable<Date | null>(value, defaultValue, onValueChange)
  const pop = usePopover({ side: 'bottom', align: 'start', gap: 4 })
  const panelId = `date-${useId()}`
  const text = model?.toLocaleDateString(locale, format)

  async function onClick(event: MouseEvent | { detail: number }) {
    if (pop.open) return pop.hide(event.detail === 0, event.detail === 0)
    await pop.show({ keyboard: event.detail === 0 })
    pop.panel.current?.querySelector<HTMLElement>('.ds-day[tabindex="0"]')?.focus({ preventScroll: true })
  }
  function onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' && !pop.open) {
      event.preventDefault()
      void onClick({ detail: 0 })
    }
  }
  function picked() {
    pop.hide(true)
  }

  return (
    <>
      <button
        data-ds="date-picker"
        id={id}
        ref={(el) => { pop.anchor.current = el }}
        type="button"
        className={cn('flex h-control-md w-full cursor-pointer items-center gap-2 rounded-control border border-edge-strong bg-surface px-3 text-left type-ui text-fg outline-none transition-[border-color] duration-150 ease-standard hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-expanded:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input', className)}
        aria-haspopup="dialog"
        aria-expanded={pop.open}
        aria-controls={pop.open ? panelId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={onClick}
        onKeyDown={onKey}
      >
        <CalendarDays size={16} strokeWidth={1.5} className="shrink-0 text-fg-muted" aria-hidden="true" />
        <span className={cn('min-w-0 flex-1 truncate', !text && 'text-fg-muted')}>{text ?? placeholder}</span>
      </button>
      <PopoverPanel data-ds="date-picker" id={panelId} pop={pop} role="dialog" aria-label="Choose a date" tabIndex={-1} className="p-3">
        <Calendar value={model} onValueChange={setModel} min={min} max={max} disabled={disabled} locale={locale} onSelect={picked} />
      </PopoverPanel>
    </>
  )
}

export default DatePicker
