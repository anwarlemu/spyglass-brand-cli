'use client'
import type { FormEvent, Ref } from 'react'
import { Button } from '@/react/components/ui/Button'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// The ad's search bar: a Black field with the brand corner (88px tall on the canvas, 56px here), the prompt in White
// DM Sans and a White "Search" button inside it, 8px in (16px on the canvas). A #363636 hairline lets it read on Black
// and turns White while the field has focus. Enter or the button calls onSearch with the query; the value is
// controlled (value + onValueChange) or kept inside (defaultValue).
export interface SearchBarProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** The query, when Enter is pressed or the button clicked. */
  onSearch?: (query: string) => void
  placeholder?: string
  /** The button's label. */
  buttonLabel?: string
  /** The field's accessible name (the placeholder is not one). */
  label?: string
  name?: string
  disabled?: boolean
  className?: string
  ref?: Ref<HTMLFormElement>
}

export function SearchBar({ value, defaultValue = '', onValueChange, onSearch, placeholder = 'Search creatives', buttonLabel = 'Search', label = 'Search', name = 'q', disabled, className, ref }: SearchBarProps) {
  const [query, setQuery] = useControllable(value, defaultValue, onValueChange)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!disabled) onSearch?.(query)
  }
  return (
    <form data-ds="search-bar" ref={ref} role="search" onSubmit={submit} className={cn('flex h-search w-full items-center gap-2 rounded-control border border-edge-strong bg-surface pr-2 pl-4 transition-[border-color] duration-150 ease-standard has-[input:focus-visible]:border-edge-focus', className)}>
      <input
        type="search"
        name={name}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        disabled={disabled}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent type-body text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden"
      />
      <Button type="submit" disabled={disabled}>{buttonLabel}</Button>
    </form>
  )
}

export default SearchBar
