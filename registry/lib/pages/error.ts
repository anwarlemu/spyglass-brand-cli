// The 500 page's copy: what happened in a plain sentence, a way to try again and the way home. Both flavors read it.
export const errorContent = {
	eyebrow: 'Error 500',
	headline: 'Something broke on our side.',
	body: 'It is not you. Try again in a moment; if it keeps happening, write to us.',
	retry: { label: 'Try again', href: '' },
	home: { label: 'Go home', href: '/' },
	contact: { label: 'Write to us', href: '/contact' },
}
export type ErrorContent = typeof errorContent
