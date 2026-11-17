// Filters opens the sheet (it slides in, focus on the first field); Tab stays inside; Escape closes it at once and focus
// returns to Filters; Enter opens it again; Close closes it with its exit; a press on the dimmed page closes it.
export default [
	{ example: 'Filters', click: 'role=button[name="Filters"]', wait: 700, shot: true, label: 'Filters opens the sheet' },
	{ example: 'Filters', key: 'Tab', label: 'Tab to the next field' },
	{ example: 'Filters', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it, focus back on Filters' },
	{ example: 'Filters', key: 'Enter', wait: 700, shot: true, label: 'Enter opens it again' },
	{ example: 'Filters', click: 'role=button[name="Close"]', wait: 600, shot: true, label: 'Close closes it' },
	{ example: 'Filters', click: 'role=button[name="Filters"]', wait: 700, label: 'open once more' },
	{ example: 'Filters', clickAt: [40, 300], wait: 600, shot: true, label: 'a press on the dimmed page closes it' },
	{ example: 'Sides', click: 'role=button[name="Bottom"]', wait: 700, shot: true, label: 'Bottom opens the sheet at the bottom' },
	{ example: 'Sides', key: 'Escape', wait: 300, label: 'Escape closes it' },
	{ example: 'Sides', click: 'role=button[name="Left"]', wait: 700, shot: true, label: 'Left opens the sheet at the left' },
]
