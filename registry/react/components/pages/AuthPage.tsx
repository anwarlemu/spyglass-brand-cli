import { type CSSProperties, type ReactNode, Fragment } from 'react'
import { AuthForm, type AuthMode } from '@/react/components/site/AuthForm'
import { ProofStrip, proofPlaceholders, type ProofLogo } from '@/react/components/site/ProofStrip'
import { Logo } from '@/react/components/visuals/Logo'
import { asciiDriftStyleObject } from '@/lib/ascii-drift'
import { authContent, type AuthContent, authSections, type AuthSection } from '@/lib/pages/auth'
import { AUTH_LIGHT_LEFT, AUTH_LIGHT_RIGHT, AUTH_LIGHT_RIGHT_PHONE } from '@/lib/textures'
import { cn } from '@/react/lib/cn'
import { pageSections } from '@/lib/image'

// The site's sign-in and sign-up pages (app/(auth), pages/Auth/AuthShell): Black with the brand light in two corners,
// the site's own pre-made light images (the top right one alone on phones), bobbing 12px back and forth over 14s on an
// ease that turns gently at both ends (still with reduced motion); from 1024 two crops of the ASCII texture fade in from
// the left at the top and the right at the bottom. A bar with the lockup (20px) over the form, centered in the height
// left, and on sign-up the proof row under it (sign-in keeps the room empty): "Trusted by teams at" over the marquee of marks (Acme placeholders; pass your own
// through `logos`). `providerIcon`, `onProvider` and `onEmail` go to the form.
export interface AuthPageProps {
  mode?: AuthMode
  content?: AuthContent
  /** The provider's mark, 20px, in the provider button. */
  providerIcon?: ReactNode
  onProvider?: () => void
  onEmail?: (email: string) => void
  /** The proof row's marks. */
  logos?: ProofLogo[]
  /** Show the proof row (the site shows it on sign-up; sign-in keeps its room empty so the form sits as high). */
  proof?: boolean
  /** The sections to show, in order; all of them in the page order by default (leave one out to omit it). */
  sections?: readonly AuthSection[]
  className?: string
}

export function AuthPage({ mode = 'sign-up', content: c = authContent, providerIcon, onProvider, onEmail, logos = proofPlaceholders, proof = mode === 'sign-up', sections, className }: AuthPageProps) {
  const parts: Record<AuthSection, ReactNode> = {
    form: <AuthForm mode={mode} content={c} providerIcon={providerIcon} onProvider={onProvider} onEmail={onEmail} />,
    proof: (
      proof ? (
        <section aria-label={c.proof} className="mx-auto flex min-h-(--ds-layout-auth-proof-h) w-full max-w-[calc(var(--ds-layout-auth-proof)+2*var(--ds-layout-gutter))] flex-col items-center gap-6 px-(--ds-layout-gutter)">
          <h2 className="type-ui text-fg-muted">{c.proof}</h2>
          <ProofStrip logos={logos} tight />
        </section>
      ) : <div aria-hidden="true" className="mx-auto min-h-(--ds-layout-auth-proof-h) w-full" />
    ),
  }
  return (
    <div data-ds="auth-page" className={cn('relative isolate grid min-h-svh grid-cols-[minmax(0,1fr)] grid-rows-[auto_1fr] overflow-clip bg-surface text-fg', className)}>
      <style href="ds-auth-page" precedence="ds">{css}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-1 overflow-clip">
        <span className="ds-auth-light" data-side="left" style={{ backgroundImage: `url("${AUTH_LIGHT_LEFT}")` }} />
        <span className="ds-auth-light" data-side="right" style={{ '--light-phone': `url("${AUTH_LIGHT_RIGHT_PHONE}")`, '--light': `url("${AUTH_LIGHT_RIGHT}")` } as CSSProperties} />
        <span className="pointer-events-none absolute top-0 left-0 -z-1 hidden h-[44%] w-[36%] select-none lg:block" style={asciiDriftStyleObject('mass', 'left')} />
        <span className="pointer-events-none absolute right-0 bottom-0 -z-1 hidden h-[44%] w-[36%] select-none lg:block" style={asciiDriftStyleObject('cluster', 'right')} />
      </div>
      <header className="relative z-1">
        <div className="mx-auto flex h-16 w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] items-center px-(--ds-layout-gutter) lg:h-header">
          <a href="/" aria-label={c.home} className="-ms-2 block rounded-ds-sm px-2 py-3 text-fg"><Logo height={20} /></a>
        </div>
      </header>
      <main className="ds-auth-main flex min-w-0 flex-col justify-center gap-16 py-8">
        {pageSections(authSections, sections).map((k) => <Fragment key={k}>{parts[k]}</Fragment>)}
      </main>
    </div>
  )
}

export default AuthPage

const css = `
.ds-auth-light {
  --w: calc(var(--ds-auth-light-w-phone) + 2 * var(--ds-auth-light-drift));
  position: absolute; width: var(--w); aspect-ratio: 11 / 16;
  background-position: center; background-size: 100% 100%; background-repeat: no-repeat;
  rotate: var(--ds-auth-light-tilt); backface-visibility: hidden; will-change: transform;
  animation: ds-auth-drift 14s var(--ds-easing-drift) infinite alternate;
}
.ds-auth-light[data-side="right"] { top: calc(-2 * var(--ds-auth-light-drift)); right: calc(-2 * var(--ds-auth-light-drift)); background-image: var(--light-phone); }
.ds-auth-light[data-side="left"] { --to-x: var(--ds-auth-light-drift); display: none; left: calc(-2 * var(--ds-auth-light-drift)); bottom: var(--ds-auth-light-left-rise); }
@keyframes ds-auth-drift { from { transform: translate3d(0, 0, 0); } to { transform: translate3d(var(--to-x, calc(-1 * var(--ds-auth-light-drift))), var(--ds-auth-light-drift), 0); } }
@media (min-width: 768px) {
  .ds-auth-light { --w: calc(var(--ds-auth-light-w) + 2 * var(--ds-auth-light-drift)); }
  .ds-auth-light[data-side="left"] { display: block; }
  .ds-auth-light[data-side="right"] { background-image: var(--light); }
}
@media (min-width: 768px) and (min-height: 820px) { .ds-auth-main { padding-bottom: calc(var(--ds-space-4xl) + var(--ds-space-2xl)); } }
@media (min-width: 1024px) and (min-height: 820px) { .ds-auth-main { padding-bottom: calc(var(--ds-size-header) + var(--ds-space-2xl)); } }
@media (prefers-reduced-motion: reduce) { .ds-auth-light { animation: none; } }
`
