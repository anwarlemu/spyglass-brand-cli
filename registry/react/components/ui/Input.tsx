import type { InputHTMLAttributes, Ref } from 'react'
import { cn } from '@/react/lib/cn'

// A text field on Black: a #363636 hairline that turns White on focus, DM Sans at 14px (16px on phones, so iOS does
// not zoom), a #A3A3A3 placeholder and the brand corner. Sizes follow the button's: sm 32px, md 40px, lg 48px.
// `invalid` turns the hairline red. Every other prop lands on the <input> (value and onChange as React's own).
export type InputSize = 'sm' | 'md' | 'lg'

const SIZES: Record<InputSize, string> = { sm: 'h-control-sm px-2.5', md: 'h-control-md px-3', lg: 'h-control-lg px-4' }

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** sm (32px), md (40px) or lg (48px). */
  size?: InputSize
  /** A red hairline (with the message beside it). */
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

export function Input({ size = 'md', invalid, className, ...rest }: InputProps) {
  return (
    <input
      data-ds="input"
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn('w-full min-w-0 rounded-control border border-edge-strong bg-surface type-ui text-fg outline-none transition-[border-color] duration-150 ease-standard placeholder:text-fg-muted hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', SIZES[size], className)}
    />
  )
}

export default Input
