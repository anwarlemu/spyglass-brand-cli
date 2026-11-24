// The dashboard's sample data for Acme: the nav, four figures and the latest rows. Both flavors read this file; an app
// passes its own through `content`.
export const dashboardContent = {
	nav: [
		{ label: 'Overview', href: '#overview', current: true },
		{ label: 'Search', href: '#search' },
		{ label: 'Boards', href: '#boards' },
		{ label: 'Alerts', href: '#alerts' },
		{ label: 'Settings', href: '#settings' },
	],
	title: 'Overview',
	action: { label: 'New search', href: '#search' },
	stats: [
		{ label: 'Searches this month', value: '1,284' },
		{ label: 'Credits left', value: '3,716' },
		{ label: 'Brands tracked', value: '42' },
		{ label: 'Alerts sent', value: '96' },
	],
	tableTitle: 'Recent searches',
	columns: ['Search', 'Results', 'When'],
	rows: [
		['Running shoes, longest-running ads', '128', 'Today'],
		['Skincare UGC, before and after', '64', 'Yesterday'],
		['Energy drinks on TikTok', '212', 'Monday'],
	],
}
export type DashboardContent = typeof dashboardContent
