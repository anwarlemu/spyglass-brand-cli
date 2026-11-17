import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '@/react/lib/cn'

// A field with something at its start or end inside the same hairline: an icon, a unit or a prefix in the muted gray,
// or a small button. It is drawn as the Input is (a #363636 hairline on Black that turns White while the field has
// focus, DM Sans at 14px, 16px on phones, the brand corner) and sized as it is: sm 32px, md 40px, lg 48px. A button in
// `end` sits 4px from the edge (use a ghost or secondary sm button in md, md in lg). `invalid` turns the hairline red.
// `className` lands on the group; every other prop on the <input> (value and onChange as React's own).
export type InputGroupSize = 'sm' | 'md' | 'lg'

const SIZES: Record<InputGroupSize, string> = { sm: 'h-control-sm gap-1.5 px-2.5', md: 'h-control-md gap-2 px-3', lg: 'h-control-lg gap-2 px-4' }
// A button at the end comes 4px from the edge, whatever the group's padding.
const END: Record<InputGroupSize, string> = { sm: 'has-[button]:-mr-1.5', md: 'has-[button]:-mr-2', lg: 'has-[button]:-mr-3' }

export interface InputGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** What sits before the text: an icon, a prefix. */
  start?: ReactNode
  /** What sits after the text: a unit, a count, a small button. */
  end?: ReactNode
  /** sm (32px), md (40px) or lg (48px). */
  size?: InputGroupSize
  /** A red hairline (with the message beside it). */
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

export function InputGroup({ start, end, size = 'md', invalid, className, ...rest }: InputGroupProps) {
  return (
    <div
      data-ds="input-group"
      data-invalid={invalid || undefined}
      className={cn('flex w-full min-w-0 items-center rounded-control border border-edge-strong bg-surface text-fg transition-[border-color] duration-150 ease-standard hover:not-has-[input:disabled]:border-action-secondary-edge-hover has-[input:focus-visible]:border-edge-focus data-invalid:border-action-danger has-[input:disabled]:cursor-not-allowed', SIZES[size], className)}
    >
      {start && <span className="flex shrink-0 items-center gap-1.5 type-ui text-fg-muted">{start}</span>}
      <input {...rest} aria-invalid={invalid || undefined} className="h-full w-full min-w-0 flex-1 bg-transparent type-ui text-fg outline-none placeholder:text-fg-muted disabled:cursor-not-allowed disabled:text-fg-faint max-md:text-input pointer-coarse:text-input" />
      {end && <span className={cn('flex shrink-0 items-center gap-1.5 type-ui text-fg-muted', END[size])}>{end}</span>}
    </div>
  )
}

export default InputGroup
