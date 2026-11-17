'use client'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

// A form composed from Field, Input and Button: fields stacked 24px apart, each a Field with its label over it and its
// description or error under it; a failure from the server in a dark red box with the brand corner above the actions;
// the actions at the end, the main one last. It never validates as the first value is typed: useForm shows an error
// once its field is left or the form is sent, then follows the value; on a send with errors focus moves to the first
// field that is wrong. The browser's own bubbles are off (noValidate); Enter in a field sends it.
export interface FormProps {
  /** A failure from the server, shown above the actions. */
  failure?: string
  /** The form's name for assistive tech. */
  label?: string
  /** It was sent (a submit button or Enter in a field). */
  onSubmit?: () => void
  /** The buttons at the end, the main one last. */
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

export function Form({ failure, label, onSubmit, actions, children, className }: FormProps) {
  const form = useRef<HTMLFormElement | null>(null)
  // Focus moves after the next render, once the errors the submit raised are drawn.
  const [sent, setSent] = useState(0)
  useEffect(() => {
    if (sent) form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [sent])
  function send(event: FormEvent) {
    event.preventDefault()
    onSubmit?.()
    setSent(n => n + 1)
  }
  return (
    <form data-ds="form" ref={form} className={className ? `flex flex-col gap-6 ${className}` : 'flex flex-col gap-6'} noValidate aria-label={label} onSubmit={send}>
      {children}
      {failure && <p className="rounded-control bg-surface-danger px-4 py-3 type-ui text-fg-danger" role="alert">{failure}</p>}
      {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
    </form>
  )
}

export default Form
