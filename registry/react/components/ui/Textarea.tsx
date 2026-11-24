import type { Ref, TextareaHTMLAttributes } from 'react'
import { cn } from '@/react/lib/cn'

// Several lines of text, drawn as the Input is: a #666666 hairline on Black that turns White on focus, DM Sans at 14px
// (16px on phones, so iOS does not zoom), a #A3A3A3 placeholder, the brand corner, 10px 12px inside. It grows by hand
// downward only. `invalid` turns the hairline red. Put it in a Field for its label and description. Every other prop
// lands on the <textarea> (value and onChange as React's own).
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** A red hairline (with the message under it). */
  invalid?: boolean
  /** Visible lines before it scrolls (4). */
  rows?: number
  ref?: Ref<HTMLTextAreaElement>
}

export function Textarea({ invalid, rows = 4, className, ...rest }: TextareaProps) {
  return (
    <textarea
      data-ds="textarea"
      {...rest}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn('block w-full min-w-0 resize-y rounded-control border border-edge-strong bg-surface-subtle px-3 py-2.5 type-ui text-fg outline-none transition-[border-color] duration-160 ease-standard placeholder:text-fg-muted hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', className)}
    />
  )
}

export default Textarea
