// The settings page's copy for Acme: the sections, the profile fields and the notification switches.
export const settingsContent = {
	nav: [
		{ label: 'Profile', href: '#profile', current: true },
		{ label: 'Team', href: '#team' },
		{ label: 'Billing', href: '#billing' },
		{ label: 'API keys', href: '#keys' },
	],
	title: 'Settings',
	profile: { title: 'Profile', name: { label: 'Name', value: 'Alex Kim' }, email: { label: 'Email', value: 'alex@acme.com' } },
	notifications: {
		title: 'Notifications',
		items: [
			{ label: 'Weekly summary', description: 'What changed across the brands you track, every Monday.', on: true },
			{ label: 'Launch alerts', description: 'An email the day a tracked brand ships a new ad.', on: false },
		],
	},
	save: 'Save changes',
}
export type SettingsContent = typeof settingsContent
