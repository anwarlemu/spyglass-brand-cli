'use client'
import { useState, type FormEvent, type Ref } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { cn } from '@/react/lib/cn'

// The site's prompt (v3 HeroPrompt): a #1A1A1A card with the 20px corner inside a #666666 hairline ring, a two-line
// field in DM Sans 16/24 with its hint in #A3A3A3, a square White send button at the lower right, and under a hairline
// an optional row: a #A3A3A3 14/20 label and the places it works, as words in #D4D4D4 (never other companies' logos).
// While the field has focus the ring lightens to #A3A3A3 with a #666666 2px halo (160ms on the site's ease-out).
// Enter (without Shift) or the button calls onSubmit with the text.
export interface PromptCardProps {
  /** The hint in the empty field. */
  placeholder?: string
  /** The field's accessible name. */
  label?: string
  /** The send button's accessible name. */
  sendLabel?: string
  /** The row's label: "Works where you work". */
  worksLabel?: string
  /** The places it works, as words. */
  works?: string[]
  defaultValue?: string
  onSubmit?: (text: string) => void
  name?: string
  disabled?: boolean
  className?: string
  ref?: Ref<HTMLFormElement>
}

export function PromptCard({ placeholder = 'Ask anything', label = 'Your question', sendLabel = 'Send', worksLabel, works = [], defaultValue = '', onSubmit, name = 'q', disabled, className, ref }: PromptCardProps) {
  const [text, setText] = useState(defaultValue)
  const submit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    if (!disabled && text.trim()) onSubmit?.(text.trim())
  }
  return (
    <form data-ds="prompt-card" ref={ref} onSubmit={submit} className={cn('grid w-full max-w-200 grid-cols-1 rounded-ds-lg bg-surface-subtle px-3 pt-3 text-left shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge-strong)] transition-[box-shadow] duration-160 ease-out has-[textarea:focus]:shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-fg-muted),0_0_0_var(--ds-border-focus)_var(--ds-color-edge-strong)]', className)}>
      <div className="flex flex-wrap items-end justify-end gap-3 pb-3">
        <textarea
          name={name}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder={placeholder}
          aria-label={label}
          disabled={disabled}
          rows={2}
          className="block h-18 w-full min-w-0 flex-[1_1_100%] resize-none rounded-control bg-transparent px-4 py-3 type-body text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed"
        />
        <Button type="submit" icon aria-label={sendLabel} disabled={disabled}><ArrowUp size={24} strokeWidth={2} aria-hidden="true" /></Button>
      </div>
      {(worksLabel || works.length > 0) && (
        <div className="grid gap-2 border-t border-edge px-4 py-3 sm:flex sm:items-center sm:justify-between">
          {worksLabel && <p className="type-ui text-fg-muted">{worksLabel}</p>}
          {works.length > 0 && <ul className="flex flex-wrap gap-x-5 gap-y-2 type-ui text-fg-soft">{works.map((w) => <li key={w}>{w}</li>)}</ul>}
        </div>
      )}
    </form>
  )
}

export default PromptCard
