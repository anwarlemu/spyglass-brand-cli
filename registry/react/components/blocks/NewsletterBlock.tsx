'use client'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Input } from '@/react/components/ui/Input'
import { cn } from '@/react/lib/cn'

// A newsletter sign-up on a #262626 card with the 4px corner: the title, a #D4D4D4 line, an email field and the White
// button side by side from 640 (stacked on phones), and a line of small print under them. onSubscribe gets the address;
// after it the card says `done` in its place. Nothing moves.
export interface NewsletterBlockProps {
  title: ReactNode
  body?: ReactNode
  placeholder?: string
  /** The button's label. */
  cta?: string
  /** Small print under the field. */
  note?: ReactNode
  /** Said in the field's place once subscribed. */
  done?: string
  onSubscribe?: (email: string) => void
  className?: string
}

export function NewsletterBlock({ title, body, placeholder = 'you@company.com', cta = 'Subscribe', note, done = 'You are on the list.', onSubscribe, className }: NewsletterBlockProps) {
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim()
    if (!email) return
    onSubscribe?.(email)
    setSent(true)
  }
  return (
    <section data-ds="newsletter-block" className={cn('grid gap-6 rounded-container bg-surface-raised p-8 text-fg max-sm:p-6 lg:grid-cols-2 lg:items-end lg:gap-12', className)}>
      <div className="grid gap-3">
        <h2 className="type-heading-1">{title}</h2>
        {body && <p className="max-w-measure type-body text-fg-soft">{body}</p>}
      </div>
      <div className="grid gap-3">
        {sent ? (
          <p role="status" className="type-body text-fg">{done}</p>
        ) : (
          <form onSubmit={submit} className="flex gap-3 max-sm:flex-col">
            <Input name="email" type="email" autoComplete="email" required placeholder={placeholder} aria-label="Email" className="min-w-0 flex-1" />
            <Button type="submit">{cta}</Button>
          </form>
        )}
        {note && <p className="type-caption text-fg-muted">{note}</p>}
      </div>
    </section>
  )
}

export default NewsletterBlock
