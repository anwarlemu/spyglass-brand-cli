'use client'
import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Button } from '@/react/components/ui/Button'
import { authContent, emailProblem, type AuthContent } from '@/lib/pages/auth'
import { cn } from '@/react/lib/cn'

// The site's sign-in and sign-up form (pages/Auth/AuthForm): the title and lead, a quiet provider button, a rule with
// "or", the email field with its label and the message beside it, the one White button, the legal line and the way to
// the other mode. Centered in a 400px column. A press shows a spinner in the pressed button (the label and the spinner
// cross-fade over 160ms) until the app takes over; pressing again does nothing meanwhile. The email is checked as the
// site checks it: empty or malformed puts the message beside the label, rings the field White and focuses it.
// The provider's mark comes in through `providerIcon` (no third-party logo ships with the library). `onProvider` and
// `onEmail` take the presses; without them a press goes to the mode's `next` address.
export type AuthMode = 'sign-in' | 'sign-up'

export interface AuthFormProps {
  mode?: AuthMode
  content?: AuthContent
  /** The provider's mark, 20px, before the provider button's label. */
  providerIcon?: ReactNode
  /** The provider button's press. */
  onProvider?: () => void
  /** A valid email sent. */
  onEmail?: (email: string) => void
  className?: string
}

function Labels({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <span className="grid place-items-center">
      <span className={cn('col-start-1 row-start-1 inline-flex items-center gap-3 transition-opacity duration-160 ease-out', busy && 'opacity-0')}>{children}</span>
      <span aria-hidden="true" className={cn('col-start-1 row-start-1 inline-flex items-center transition-opacity duration-160 ease-out', !busy && 'opacity-0')}>
        <span className={cn('ds-auth-spin size-5 rounded-full border-2 border-current border-t-transparent', !busy && '[animation-play-state:paused]')} />
      </span>
    </span>
  )
}

const LINK = 'rounded-ds-sm underline decoration-transparent decoration-from-font underline-offset-4 transition-[text-decoration-color] duration-160 ease-out pointer-fine:hover:decoration-current'

export function AuthForm({ mode = 'sign-up', content: c = authContent, providerIcon, onProvider, onEmail, className }: AuthFormProps) {
  const m = mode === 'sign-in' ? c.signIn : c.signUp
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'provider' | 'email' | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const id = useId()

  // Back from the next page (the page restored from the cache): the buttons wake up again.
  useEffect(() => {
    const back = (event: PageTransitionEvent) => { if (event.persisted) setBusy(null) }
    window.addEventListener('pageshow', back)
    return () => window.removeEventListener('pageshow', back)
  }, [])

  function go(method: 'provider' | 'email', value = '') {
    if (busy) return
    setBusy(method)
    if (method === 'provider' && onProvider) onProvider()
    else if (method === 'email' && onEmail) onEmail(value)
    else window.location.assign(m.next)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const problem = emailProblem(email, c)
    setError(problem)
    if (problem) input.current?.focus()
    else go('email', email.trim())
  }

  return (
    <section data-ds="auth-form" aria-labelledby={`${id}-title`} className={cn('mx-auto flex w-full max-w-[calc(var(--ds-layout-auth)+2*var(--ds-layout-gutter))] flex-col items-center px-(--ds-layout-gutter) text-center text-fg', className)}>
      <style href="ds-auth-form" precedence="ds">{css}</style>
      <h1 id={`${id}-title`} className="type-title md:whitespace-nowrap">{m.title}</h1>
      {m.lead && <p className="mt-3 type-body text-balance text-fg-soft">{m.lead}</p>}
      <Button variant="secondary" size="form" className="mt-8 w-full" aria-disabled={busy ? true : undefined} onClick={() => go('provider')}>
        <Labels busy={busy === 'provider'}>{providerIcon && <span className="grid size-5 flex-none place-items-center [&_svg]:size-5">{providerIcon}</span>}{c.provider}</Labels>
      </Button>
      <p className="my-4 flex w-full items-center gap-4 type-ui text-fg-muted before:h-px before:flex-1 before:bg-edge after:h-px after:flex-1 after:bg-edge">{c.or}</p>
      <form noValidate onSubmit={submit} className="flex w-full flex-col text-left">
        <div className="mb-2 flex justify-between gap-4 type-ui">
          <label htmlFor={`${id}-email`} className="font-medium">{c.email}</label>
          <span id={`${id}-error`} role="alert" className="text-fg">{error}</span>
        </div>
        <input
          ref={input}
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={c.placeholder}
          value={email}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => { setEmail(event.target.value); if (error) setError('') }}
          className="mb-3 h-control-form w-full appearance-none rounded-control bg-surface-subtle px-4 type-body text-fg shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge)] transition-[box-shadow] duration-160 ease-out placeholder:text-fg-muted focus-visible:-outline-offset-1 aria-invalid:shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-white)]"
        />
        <Button type="submit" size="form" className="w-full" aria-disabled={busy ? true : undefined}>
          <Labels busy={busy === 'email'}>{m.submit}</Labels>
        </Button>
      </form>
      <p role="status" className="sr-only">{busy ? c.working : ''}</p>
      <p className="mt-5 type-ui text-balance text-fg-faint">
        {c.legal.before}<a href={c.legal.terms.href} className={cn('text-fg-soft', LINK)}>{c.legal.terms.label}</a>{c.legal.between}<a href={c.legal.privacy.href} className={cn('text-fg-soft', LINK)}>{c.legal.privacy.label}</a>{c.legal.after}
      </p>
      <p className="mt-5 type-ui text-fg-muted">
        {m.other.ask} <a href={m.other.href} className={cn('relative py-3 font-medium text-fg', LINK)}>{m.other.label}</a>
      </p>
    </section>
  )
}

export default AuthForm

const css = `
.ds-auth-spin { animation: ds-auth-spin 800ms linear infinite; }
@keyframes ds-auth-spin { to { transform: rotate(1turn); } }
@keyframes ds-auth-breathe { 50% { opacity: 0.5; } }
@media (prefers-reduced-motion: reduce) { .ds-auth-spin { animation: ds-auth-breathe 2s var(--ds-easing-in-out) infinite; } }
`
