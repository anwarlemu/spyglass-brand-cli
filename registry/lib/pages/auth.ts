// The sign-in and sign-up pages' copy (the site's content/pages/auth.ts, for Acme). Both flavors read this file. Each
// mode has its title, lead, the White button's label, `next` (where a press goes when no handler takes it) and the way
// to the other mode.
export const authContent = {
	signUp: { title: 'Create your Acme account', lead: '500 free credits every month. No card required.', submit: 'Get started', next: '/app/sign-up', other: { ask: 'Already have an account?', label: 'Sign in', href: '/sign-in' } },
	signIn: { title: 'Welcome back', lead: 'Sign in to your Acme account.', submit: 'Continue', next: '/app/sign-in', other: { ask: 'Don’t have an account?', label: 'Sign up', href: '/sign-up' } },
	provider: 'Continue with Google',
	or: 'or',
	email: 'Email',
	placeholder: 'you@acme.com',
	empty: 'Enter your email',
	invalid: 'Check your email address',
	working: 'One moment',
	legal: { before: 'By continuing, you acknowledge that you understand and agree to the ', terms: { label: 'Terms & Conditions', href: '/terms' }, between: ' and ', privacy: { label: 'Privacy Policy', href: '/privacy' }, after: '.' },
	proof: 'Trusted by teams at',
	home: 'Home',
}
export type AuthContent = typeof authContent

/** The site's email check: something@something.tld, two letters or more after the dot. */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** The message for what was typed, or '' when it will do. */
export function emailProblem(value: string, c: AuthContent = authContent): string {
	const v = value.trim()
	return !v ? c.empty : EMAIL.test(v) ? '' : c.invalid
}
