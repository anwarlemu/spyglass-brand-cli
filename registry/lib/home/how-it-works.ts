// The home's set-up section (site v2/V2HowItWorks, content/v2/how-it-works): the copy, the three steps and the
// clients' marks under the buttons. The marks are neutral placeholders (each client's first letter); the site's are
// other companies' logos, which come through `marks` with a `src`. Both flavors read this file.
export interface HowMark {
	name: string
	href: string
	/** The mark (an SVG file, drawn as a mask in the type's color, 24px). Leave out for its first letter. */
	src?: string
}

export interface HowItWorksContent {
	headline: string
	lead: string
	steps: { title: string; body: string }[]
	/** The quiet button beside the connect menu. */
	secondary: { label: string; href: string }
	marksLabel: string
}

export const howItWorksContent: HowItWorksContent = {
	headline: 'Set up in under a minute',
	lead: 'Add the MCP server to your AI tool and sign in. No API key needed for MCP.',
	steps: [
		{ title: 'Create a free account.', body: '500 free credits every month. No card required.' },
		{ title: 'Connect.', body: 'Add the MCP server to your AI tool, or call the REST API.' },
		{ title: 'Ask.', body: 'Ask in plain words. The answer comes back as structured data.' },
	],
	secondary: { label: 'Get a free API key', href: '/sign-up' },
	marksLabel: 'AI tools',
}

export const howMarks: HowMark[] = ['Acme Chat', 'Acme Code', 'Acme Assistant', 'Acme Agent', 'Acme Editor', 'Acme Search', 'Any MCP client'].map((name) => ({ name, href: '#' }))
