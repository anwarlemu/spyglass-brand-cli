import type { LabelHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A field's label on its own: the brand's label voice, DM Sans Medium in capitals with 6% tracking at 12px, in the soft
// gray (#D4D4D4), over or beside the control it names, never in place of one. `htmlFor` ties it to the control's id;
// `hint` adds a muted note after it, such as "Optional". Every other prop lands on the <label>.
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** A muted note after the label, such as "Optional". */
  hint?: string
  children?: ReactNode
}

export function Label({ hint, className, children, ...rest }: LabelProps) {
  return <label data-ds="label" {...rest} className={cn('inline-flex items-baseline gap-1.5 type-label text-fg-soft', className)}>{children}{hint && <span className="text-fg-muted">{hint}</span>}</label>
}

export default Label
