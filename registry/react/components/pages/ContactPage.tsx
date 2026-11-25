'use client'
import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { Textarea } from '@/react/components/ui/Textarea'
import { FooterRow } from '@/react/components/site/FooterRow'
import { SiteHeader } from '@/react/components/site/SiteHeader'
import { contactContent, type ContactContent, contactSections, type ContactSection } from '@/lib/pages/contact'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'
import { Fragment, type ReactNode } from 'react'

// The contact page from library items: the heading and a line in the first column, the form on the card fill in the
// other (name, work email, message and one White button), one column on phones. The form posts to `content.form.action`
// unless `onSubmit` takes it. `content` replaces the copy (lib/pages/contact.ts).
export interface ContactPageProps {
  content?: ContactContent
  /** Receives the form's values instead of posting it. */
  onSubmit?: (values: { name: string; email: string; message: string }) => void
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly ContactSection[]
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function ContactPage({ content: c = contactContent, onSubmit, sections, className }: ContactPageProps) {
  const f = c.form
  const parts: Record<ContactSection, ReactNode> = {
    intro: (
      <div className="grid max-w-xl gap-6">
        <h1 className="type-section">{c.headline}</h1>
        <p className="type-body-lg text-fg-soft">{c.body}</p>
      </div>
    ),
    form: (
      <form
        aria-label={f.label}
        action={f.action}
        method="post"
        onSubmit={onSubmit ? (e) => {
          e.preventDefault()
          const d = new FormData(e.currentTarget)
          onSubmit({ name: String(d.get('name') ?? ''), email: String(d.get('email') ?? ''), message: String(d.get('message') ?? '') })
        } : undefined}
        className="grid gap-6 rounded-container bg-surface-raised p-8 max-sm:p-6"
      >
        <Field label={f.name.label}>
          {({ id }) => <Input id={id} name="name" autoComplete="name" placeholder={f.name.placeholder} required />}
        </Field>
        <Field label={f.email.label} description={f.email.description}>
          {({ id, describedBy }) => <Input id={id} name="email" type="email" autoComplete="email" placeholder={f.email.placeholder} aria-describedby={describedBy} required />}
        </Field>
        <Field label={f.message.label}>
          {({ id }) => <Textarea id={id} name="message" rows={6} placeholder={f.message.placeholder} required />}
        </Field>
        <Button type="submit" className="w-full">{f.submit}</Button>
      </form>
    ),
  }
  return (
    <div data-ds="contact-page" className={cn('flex min-h-dvh flex-col bg-surface text-fg', className)}>
      <SiteHeader links={c.header.nav} secondary={c.header.secondary} cta={c.header.cta} />
      <main className={cn(WRAP, 'grid flex-1 grid-cols-2 items-start gap-12 py-24 max-md:grid-cols-1 max-md:gap-8 max-sm:py-16')}>
        {pageSections(contactSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
      <footer className="border-t border-edge">
        <div className={cn(WRAP, 'py-10')}>
          <FooterRow domain={c.footer.domain} homeHref="/" links={c.footer.links} />
        </div>
      </footer>
    </div>
  )
}

export default ContactPage
