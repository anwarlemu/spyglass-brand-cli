// Sync now: the dot matrix while it syncs, the check once synced, then back to the start.
export default [
	{ example: 'Product', click: 'role=button[name=/Sync now/]', wait: 600, label: 'syncing', shot: true },
	{ example: 'Product', wait: 2000, label: 'synced', shot: true },
	{ example: 'Product', wait: 2400, label: 'back to the start', shot: true },
]
