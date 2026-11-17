// A click opens the calendar on the picked day (or today); a pick closes it and returns focus; ArrowDown on the field
// opens it from the keyboard; Escape closes it unchanged.
export default [
	{ example: 'Field', click: 'role=button[name=/Report starts/]', wait: 400, shot: true, label: 'a click opens the calendar under the field' },
	{ example: 'Field', click: 'role=button[name=/November 10, 2026/]', wait: 400, shot: true, label: 'picking a day closes it and fills the field' },
	{ example: 'Field', key: 'ArrowDown', wait: 300, shot: true, label: 'ArrowDown opens it on the picked day' },
	{ example: 'Field', key: 'ArrowRight', label: 'ArrowRight moves a day' },
	{ example: 'Field', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it unchanged, focus on the field' },
	{ example: 'Picked', click: 'role=button[name=/2026/]', wait: 400, shot: true, label: 'opens on November 3, later days blocked' },
	{ example: 'Picked', key: 'Escape', wait: 300, label: 'Escape closes it' },
]
