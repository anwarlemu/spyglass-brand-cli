import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { BrandLight } from '@/react/components/visuals/BrandLight'
import { Logo } from '@/react/components/visuals/Logo'
import { authContent, type AuthContent } from '@/lib/pages/auth'
import { cn } from '@/react/lib/cn'

// Sign in or sign up, from library items: the light field at the top fading before the card, the lockup, a #262626
// card with the 4px corner holding the head, the email and password fields, the one White button and the way to the
// other mode, the legal line under it. `mode` picks the copy; the form posts to `action` (the app wires it).
export interface AuthPageProps {
  mode?: 'sign-in' | 'sign-up'
  content?: AuthContent
  /** Where the form posts. */
  action?: string
  className?: string
}

export function AuthPage({ mode = 'sign-in', content: c = authContent, action, className }: AuthPageProps) {
  const m = mode === 'sign-up' ? c.signUp : c.signIn
  return (
    <div data-ds="auth-page" className={cn('relative isolate flex min-h-dvh flex-col items-center bg-surface px-4 pt-24 pb-16 text-fg', className)}>
      <BrandLight variant="field" ground={false} cover className="absolute inset-x-0 top-0 -z-10 h-64 mask-b-from-30%" />
      <a href="/" aria-label="Home" className="rounded-control"><Logo height={24} /></a>
      <main className="mt-10 grid w-full max-w-100 gap-6 rounded-container bg-surface-raised p-8 max-sm:p-6">
        <div className="grid gap-2">
          <h1 className="type-heading-2">{m.headline}</h1>
          <p className="type-body text-fg-soft">{m.body}</p>
        </div>
        <form action={action} method="post" className="grid gap-5">
          <Field label={c.email.label}>{({ id }) => <Input id={id} name="email" type="email" autoComplete="email" placeholder={c.email.placeholder} required />}</Field>
          <Field label={c.password.label}>{({ id }) => <Input id={id} name="password" type="password" autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} placeholder={c.password.placeholder} required />}</Field>
          {mode === 'sign-in' && <a href={c.forgot.href} className="justify-self-start rounded-ds-sm type-ui text-fg-soft underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-160 ease-out hover:decoration-fg">{c.forgot.label}</a>}
          <Button type="submit" className="w-full">{m.submit}</Button>
        </form>
        <p className="type-ui text-fg-muted">{m.switch.text} <a href={m.switch.href} className="rounded-ds-sm text-fg underline decoration-edge-strong underline-offset-4 transition-[text-decoration-color] duration-160 ease-out hover:decoration-fg">{m.switch.label}</a></p>
      </main>
      <p className="mt-6 max-w-100 text-center type-caption text-fg-muted">{c.legal}</p>
    </div>
  )
}

export default AuthPage
