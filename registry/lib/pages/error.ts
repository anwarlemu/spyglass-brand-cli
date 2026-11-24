// The error page's copy (site content/pages/errors.ts): the title, what happened in a plain sentence, try again and the
// way home. Both flavors read this file.
export const errorContent = {
	lines: ['Something went wrong'],
	lead: 'This page did not load. Try again, or start from the homepage.',
	retry: 'Try again',
	home: { label: 'Go to the homepage', href: '/' },
}
export type ErrorContent = typeof errorContent
