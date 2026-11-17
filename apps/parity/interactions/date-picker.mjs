export default [
	{ click: 'role=button[name="Expires"]', wait: 500, shot: true, label: 'a click opens the calendar on today' },
	{ key: 'ArrowRight', wait: 200, label: 'ArrowRight moves to tomorrow' },
	{ key: 'Enter', wait: 500, shot: true, label: 'Enter picks it, closes and returns focus' },
	{ key: 'ArrowDown', wait: 300, shot: true, label: 'ArrowDown opens it from the keyboard on the picked day' },
	{ key: 'ArrowDown', wait: 200, label: 'ArrowDown moves a week' },
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape closes it unchanged' },
	{ key: 'Space', wait: 500, label: 'Space opens it' },
	{ clickAt: [1200, 600], wait: 500, shot: true, label: 'a press outside closes it' },
	{ click: 'role=button[name=/Expires/]', wait: 500, label: 'open again' },
	{ key: 'Shift+Tab', wait: 400, label: 'Shift+Tab moves inside the panel' },
	{ click: 'role=button[name="next month"]', wait: 300, shot: true, label: 'the next month' },
	{ click: 'role=button[name=/Expires/]', wait: 500, shot: true, label: 'a click on the field closes it' },
	// Not compared: Tab past the calendar's last day. Vue and React portal the panel to the end of the body, so focus
	// leaves the page and the panel stays open; the element's panel sits after its field, so focus reaches the submit
	// button and the panel closes.
	{ key: 'Tab', wait: 200, label: 'Tab to the submit button' },
	{ key: 'Enter', wait: 300, label: 'Enter sends the form' },
]
