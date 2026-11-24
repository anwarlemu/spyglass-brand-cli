import type { Ref, SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/react/lib/cn'

// The browser's own select, drawn as the Input is: a #666666 hairline on Black that turns White on focus, DM Sans at
// 14px (16px on phones, where the system picker opens), the brand corner, and its own 16px chevron in the muted gray,
// the same in every browser. Sizes follow the input's: sm 32px, md 40px, lg 48px. Options go in as <option> children.
// For a list with search or custom rows, use Select. `className` lands on the wrapper, every other prop on the
// <select> (value and onChange as React's own).
export type NativeSelectSize = 'sm' | 'md' | 'lg'

const SIZES: Record<NativeSelectSize, string> = { sm: 'h-control-sm pr-8 pl-2.5', md: 'h-control-md pr-9 pl-3', lg: 'h-control-lg pr-10 pl-4' }
const CHEVRON: Record<NativeSelectSize, string> = { sm: 'right-2.5', md: 'right-3', lg: 'right-4' }

export interface NativeSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** sm (32px), md (40px) or lg (48px). */
  size?: NativeSelectSize
  /** A red hairline (with the message beside it). */
  invalid?: boolean
  ref?: Ref<HTMLSelectElement>
}

export function NativeSelect({ size = 'md', invalid, className, children, ...rest }: NativeSelectProps) {
  return (
    <span data-ds="native-select" className={cn('relative inline-flex w-full items-center', className)}>
      <select {...rest} aria-invalid={invalid || undefined} className={cn('w-full min-w-0 cursor-pointer appearance-none rounded-control border border-edge-strong bg-surface-subtle type-ui text-fg outline-none transition-[border-color] duration-160 ease-standard hover:not-disabled:border-action-secondary-edge-hover focus-visible:border-edge-focus aria-invalid:border-action-danger disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input', SIZES[size])}>{children}</select>
      <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" className={cn('pointer-events-none absolute text-fg-muted', CHEVRON[size])} />
    </span>
  )
}

export default NativeSelect
