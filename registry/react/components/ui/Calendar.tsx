'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'
import { useControllable } from '@/react/hooks/useControllable'

// shadcn's calendar in the brand: a month to pick a day from. 40px day cells (44px on phones) with the 4px corner,
// weekday heads in DM Sans 12px muted, the month in DM Sans Medium between two ghost arrow buttons. The picked day is a
// White fill with a Black figure; today carries a neutral hairline ring; the days of the months either side are faint;
// days that can't be picked are faint and struck through. Arrows move a day or a week, Home and End to the week's
// ends, Page Up and Page Down a month (with Shift a year), Enter or Space picks. Changing month doesn't animate: it is
// pressed many times in a row. `value` with `onValueChange` (or `defaultValue` alone); `onSelect` fires on every pick.
export interface CalendarProps {
  /** The calendar's name for assistive tech. */
  label?: string
  /** The first day that can be picked. */
  min?: Date
  /** The last day that can be picked. */
  max?: Date
  /** Days that can't be picked. */
  disabled?: (day: Date) => boolean
  /** 0 for Sunday, 1 for Monday. */
  weekStartsOn?: 0 | 1
  locale?: string
  value?: Date | null
  defaultValue?: Date | null
  onValueChange?: (day: Date | null) => void
  /** A day was picked. */
  onSelect?: (day: Date) => void
  className?: string
}

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
function addMonths(d: Date, n: number) {
  const last = new Date(d.getFullYear(), d.getMonth() + n + 1, 0).getDate()
  return new Date(d.getFullYear(), d.getMonth() + n, Math.min(d.getDate(), last))
}

export const DAY = 'inline-flex size-control-md cursor-pointer items-center justify-center rounded-ds-sm border border-transparent type-ui tabular-nums text-fg outline-none transition-[background-color,color] duration-150 ease-standard hover:not-data-picked:not-aria-disabled:bg-ds-neutral-4 aria-[current=date]:border-fg-faint data-outside:text-fg-faint data-picked:bg-action-primary data-picked:font-medium data-picked:text-action-primary-fg aria-disabled:cursor-not-allowed aria-disabled:text-fg-faint aria-disabled:line-through focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-edge-focus data-picked:focus-visible:outline-fg-inverse max-md:size-control-touch'

export function Calendar({ label = 'Calendar', min, max, disabled, weekStartsOn = 0, locale = 'en-US', value, defaultValue = null, onValueChange, onSelect, className }: CalendarProps) {
  const [model, setModel] = useControllable<Date | null>(value, defaultValue, onValueChange)
  const today = day0(new Date())
  const [focused, setFocused] = useState(() => day0(model ?? today))
  const month = new Date(focused.getFullYear(), focused.getMonth(), 1)
  useEffect(() => {
    if (model && !same(model, focused)) setFocused(day0(model))
  }, [model]) // eslint-disable-line react-hooks/exhaustive-deps

  const caption = month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 1, 1 + ((i + weekStartsOn) % 7)) // 1 February 2026 is a Sunday.
    return { short: d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2), long: d.toLocaleDateString(locale, { weekday: 'long' }) }
  })
  // Whole weeks: the days of the months either side fill the first and last rows.
  const lead = (month.getDay() - weekStartsOn + 7) % 7
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((lead + count) / 7) * 7 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i - lead + 1))
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
  const blocked = (d: Date) => (!!min && d < day0(min)) || (!!max && d > day0(max)) || !!disabled?.(d)
  const dayLabel = (d: Date) => d.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const grid = useRef<HTMLTableElement | null>(null)
  // The roving day takes focus once the move has rendered.
  const [pendingFocus, setPendingFocus] = useState(0)
  useEffect(() => {
    if (pendingFocus) grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
  }, [pendingFocus])
  function moveTo(d: Date) {
    setFocused(d)
    setPendingFocus(n => n + 1)
  }
  function pick(d: Date) {
    if (blocked(d)) return
    setFocused(d)
    setModel(d)
    onSelect?.(d)
  }
  function onKey(event: KeyboardEvent<HTMLTableElement>) {
    const d = focused
    const start = addDays(d, -((d.getDay() - weekStartsOn + 7) % 7))
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(d, -1),
      ArrowRight: () => addDays(d, 1),
      ArrowUp: () => addDays(d, -7),
      ArrowDown: () => addDays(d, 7),
      Home: () => start,
      End: () => addDays(start, 6),
      PageUp: () => addMonths(d, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(d, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      moveTo(move())
    }
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      pick(d)
    }
  }

  return (
    <div data-ds="calendar" className={cn('inline-flex flex-col gap-2 type-ui text-fg', className)} role="group" aria-label={label}>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" icon aria-label="Previous month" onClick={() => setFocused(addMonths(focused, -1))}><ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
        <p className="min-w-0 flex-1 text-center type-ui-strong" aria-live="polite">{caption}</p>
        <Button variant="ghost" size="sm" icon aria-label="Next month" onClick={() => setFocused(addMonths(focused, 1))}><ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
      </div>
      <table ref={grid} role="grid" aria-label={caption} className="border-collapse" onKeyDown={onKey}>
        <thead>
          <tr>
            {weekdays.map(w => (
              <th key={w.long} scope="col" abbr={w.long} className="h-8 w-control-md p-0 text-center type-caption font-regular text-fg-muted max-md:w-control-touch">{w.short}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((d) => {
                const outside = d.getMonth() !== month.getMonth()
                return (
                  <td key={d.getTime()} className="p-0" role="gridcell" aria-selected={same(d, model)}>
                    <button
                      type="button"
                      className={DAY}
                      tabIndex={same(d, focused) ? 0 : -1}
                      aria-label={dayLabel(d)}
                      aria-current={same(d, today) ? 'date' : undefined}
                      aria-disabled={blocked(d) || undefined}
                      data-picked={same(d, model) || undefined}
                      data-outside={outside || undefined}
                      onClick={() => pick(d)}
                      onFocus={outside ? undefined : () => setFocused(d)}
                    >
                      {d.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Calendar
