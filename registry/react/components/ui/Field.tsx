import { useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// A label over one control, with a description or an error under it: the label in the brand's label voice (DM Sans
// Medium, capitals, 6% tracking) in the soft gray, the description in the muted gray at caption size, the error in the
// danger red in its place, 8px apart. children may be a function that receives the ids to wire:
// <Field label="Email">{({ id, describedBy, invalid }) => <Input id={id} aria-describedby={describedBy} invalid={invalid} />}</Field>;
// plain children work too (give the control the field's `id`).
export interface FieldSlot { id: string, describedBy?: string, invalid: boolean }
export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The label over the control. */
  label: string
  /** A line under the control: what to type, or what happens next. */
  description?: string
  /** What is wrong, in the description's place (the control turns red). */
  error?: string
  /** The control's id (generated when not given). */
  id?: string
  children?: ReactNode | ((slot: FieldSlot) => ReactNode)
}

export function Field({ label, description, error, id: given, className, children, ...rest }: FieldProps) {
  const auto = useId()
  const id = given ?? `field-${auto}`
  const describedBy = description || error ? `${id}-description` : undefined
  return (
    <div data-ds="field" className={cn('flex flex-col gap-2', className)} {...rest}>
      <label htmlFor={id} className="type-label text-fg-soft">{label}</label>
      {typeof children === 'function' ? children({ id, describedBy, invalid: !!error }) : children}
      {(error || description) && <p id={describedBy} className={cn('type-caption', error ? 'text-fg-danger' : 'text-fg-muted')} role={error ? 'alert' : undefined}>{error || description}</p>}
    </div>
  )
}

export default Field
