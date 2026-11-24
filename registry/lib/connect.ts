// The connect menu's copy and rows (site v3/V3Playground ConnectMenu, content/v3/connect.ts): the agents an MCP server
// can be added to. Both flavors read it. The defaults are neutral Acme rows; pass your own clients and their marks.
export interface ConnectClient {
	id: string
	name: string
	/** One line under the name. */
	description: string
	href: string
	/** Opens in a new tab. */
	web?: boolean
	/** The client's mark (an SVG file, drawn as a White mask in a 16px square). Leave out for its first letter. */
	mark?: string
}

export interface ConnectContent {
	/** The trigger's label. */
	label: string
	/** The list's accessible name. */
	menuLabel: string
	/** The quiet word at the end of each row. */
	open: string
	copy: { label: string; done: string }
	/** What the copy row puts on the clipboard. */
	prompt: string
	clients: ConnectClient[]
}

export const connectContent: ConnectContent = {
	label: 'Connect to MCP',
	menuLabel: 'Connect Acme to your agent',
	open: 'Open',
	copy: { label: 'Copy prompt for another agent', done: 'Prompt copied' },
	prompt: 'Add the Acme MCP server to this agent. URL: https://mcp.acme.com/mcp (remote, Streamable HTTP). Sign in with Acme in the browser when asked.',
	clients: [
		{ id: 'chat', name: 'Acme Chat', description: 'Add as a custom connector', href: '#', web: true },
		{ id: 'assistant', name: 'Acme Assistant', description: 'Install the Acme plugin', href: '#', web: true },
		{ id: 'editor', name: 'Acme Editor', description: 'Adds Acme in one click', href: '#' },
	],
}

// The site's 16px glyphs (stroked, round caps), the same in both flavors.
export const CONNECT_ICONS = {
	chevron: '<path d="M4 6l4 4 4-4" />',
	arrow: '<path d="M5.5 10.5l5-5M6.5 5.5h4v4" />',
	copy: '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" />',
	check: '<path d="M3.5 8.5l3 3 6-7" />',
}
