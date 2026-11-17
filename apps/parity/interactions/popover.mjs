// Settings in a popover: a click opens it on its first control, Tab moves inside, Escape closes it back to the
// button, Enter on the button opens it at once, Enter in the field submits and closes, and tabbing out closes it.
export default [
	{ click: 'role=button[name="Settings"]', wait: 500, shot: true, label: 'a click opens it on the Results field' },
	{ key: 'Tab', label: 'Tab to the switch' },
	{ key: 'Space', wait: 300, shot: true, label: 'Space turns rerank off' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus back on the button' },
	{ key: 'Enter', wait: 300, shot: true, label: 'Enter on the button opens it at once' },
	{ key: 'Enter', wait: 300, label: 'Enter in the field submits and closes' },
	{ key: 'Enter', wait: 300, label: 'open again from the keyboard' },
	{ key: 'Tab', label: 'Tab to the switch' },
	{ key: 'Tab', label: 'Tab to Save' },
	{ key: 'Tab', wait: 300, label: 'Tab out closes it' },
	{ click: 'role=button[name="Settings"]', wait: 400, label: 'open with a click' },
	{ clickAt: [20, 300], wait: 300, label: 'a press outside closes it' },
]
