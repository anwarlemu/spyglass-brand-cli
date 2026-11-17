// A click opens the list (focus on the first row); arrows move; Enter picks and closes; the keyboard opens it at once on
// the chosen row; a letter jumps; Escape closes and returns focus.
export default [
	{ example: 'Filters', click: 'role=combobox[name="Platform"]', wait: 400, shot: true, label: 'a click opens the list' },
	{ example: 'Filters', key: 'ArrowDown', wait: 150, shot: true, label: 'ArrowDown moves to TikTok' },
	{ example: 'Filters', key: 'Enter', wait: 300, shot: true, label: 'Enter picks it, focus back on the field' },
	{ example: 'Filters', focus: 'role=combobox[name="Sort by"]', key: 'ArrowDown', wait: 150, shot: true, label: 'ArrowDown opens it at once on the chosen row' },
	{ example: 'Filters', key: 'm', wait: 150, label: 'a letter jumps to Most saved' },
	{ example: 'Filters', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it' },
	{ example: 'Filters', click: 'role=combobox[name="Sort by"]', wait: 400, label: 'open again' },
	{ example: 'Filters', click: 'role=option[name="Newest first"]', wait: 400, shot: true, label: 'a click picks a row' },
]
