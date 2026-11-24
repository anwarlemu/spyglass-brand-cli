// The careers page's copy: a head, why join in three lines, and the open roles. Both flavors read this file.
export const careersContent = {
	eyebrow: 'Careers',
	headline: 'Build the record of creative.',
	body: 'A small team, working in the open, shipping every week.',
	values: [
		{ title: 'Small team', body: 'Every person owns a part of the product.' },
		{ title: 'Remote first', body: 'Work from anywhere in two time zones of each other.' },
		{ title: 'Ship weekly', body: 'Something reaches customers every week.' },
	],
	rolesTitle: 'Open roles',
	roles: [
		{ title: 'Founding designer', team: 'Design', location: 'Remote', href: '#designer' },
		{ title: 'Senior engineer, search', team: 'Engineering', location: 'Remote', href: '#search' },
		{ title: 'Growth lead', team: 'Marketing', location: 'New York', href: '#growth' },
	],
	none: 'No open roles right now.',
}
export type CareersContent = typeof careersContent
