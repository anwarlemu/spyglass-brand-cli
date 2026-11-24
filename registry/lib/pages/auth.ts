// The sign-in and sign-up page's copy. Both flavors read this file.
export const authContent = {
	signIn: { headline: 'Sign in', body: 'Welcome back.', submit: 'Sign in', switch: { text: 'New here?', label: 'Create an account', href: '/sign-up' } },
	signUp: { headline: 'Create your account', body: '500 free credits every month. No card needed.', submit: 'Create account', switch: { text: 'Have an account?', label: 'Sign in', href: '/sign-in' } },
	email: { label: 'Email', placeholder: 'you@acme.com' },
	password: { label: 'Password', placeholder: 'At least 12 characters' },
	forgot: { label: 'Forgot your password?', href: '/reset' },
	legal: 'By continuing you agree to the terms and the privacy policy.',
}
export type AuthContent = typeof authContent
