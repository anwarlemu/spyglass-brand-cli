// The switcher opens with the page. Arrows move through its rows, Home and End jump, Escape closes it and returns
// focus to the trigger, ArrowDown from the trigger opens it on the first row, ArrowUp on the last, Enter on a row
// picks it, and a click outside closes it.
export default [
	{ reload: true, focus: 'role=menuitem[name=/Acme staging/]', label: 'focus a row (the menu open again)' },
	{ key: 'ArrowDown', label: 'ArrowDown moves down' },
	{ key: 'End', label: 'End jumps to the last row' },
	{ key: 'ArrowDown', label: 'ArrowDown wraps to the first' },
	{ key: 'Home', label: 'Home jumps to the first row' },
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape closes and returns focus to the trigger' },
	{ key: 'ArrowDown', wait: 300, shot: true, label: 'ArrowDown on the trigger opens on the first row' },
	{ key: 'ArrowDown', label: 'ArrowDown again' },
	{ key: 'Enter', wait: 300, shot: true, label: 'Enter picks Acme staging and closes' },
	{ key: 'ArrowUp', wait: 300, label: 'ArrowUp on the trigger opens on the last row' },
	{ key: 'Tab', wait: 300, label: 'Tab closes it' },
	{ click: 'role=button[name=/Acme staging/]', wait: 400, shot: true, label: 'a click opens it, no row focused' },
	{ hover: 'role=menuitem[name=/Invite members/]', wait: 300, shot: true, label: 'the row under the pointer takes the marker' },
	{ clickAt: [1200, 600], wait: 300, label: 'a click outside closes it' },
]
