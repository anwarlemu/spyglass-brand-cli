// A click opens the menu of organizations, grouped by customer; arrows, Home and End move; Enter on another
// organization switches to it (its check moves and the row says so) and closes; Escape closes and returns focus; Tab
// closes; a click outside closes.
export default [
	{ click: 'role=button[name=/Acme production/]', wait: 400, shot: true, label: 'a click opens it' },
	{ hover: 'role=menuitem[name=/Acme research/]', wait: 300, shot: true, label: 'the row under the pointer takes the marker' },
	{ clickAt: [1300, 600], wait: 300, label: 'a click outside closes it' },
	{ focus: 'role=button[name=/Acme production/]', key: 'ArrowDown', wait: 300, label: 'ArrowDown opens it on the first organization' },
	{ key: 'ArrowDown', label: 'ArrowDown to Acme staging' },
	{ key: 'End', label: 'End to Invite members' },
	{ key: 'Home', label: 'Home back to the first' },
	{ key: 'ArrowDown', label: 'to Acme staging' },
	{ key: 'Enter', wait: 400, shot: true, label: 'Enter switches to Acme staging and closes' },
	{ key: 'ArrowUp', wait: 300, label: 'ArrowUp opens it on the last row' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus on the row' },
	{ key: 'ArrowDown', wait: 300, label: 'open again' },
	{ key: 'Tab', wait: 300, label: 'Tab closes it' },
]
