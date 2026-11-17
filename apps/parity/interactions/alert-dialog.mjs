// The button opens it on Cancel; Tab stays inside; the scrim does nothing; Escape cancels and focus returns to the
// button; Enter on Cancel closes it; the action confirms and closes, and the line under says so.
export default [
	{ click: 'role=button[name="Delete board"]', wait: 500, shot: true, label: 'the button opens it, focus on Cancel' },
	{ key: 'Tab', label: 'Tab to the action' },
	{ key: 'Tab', label: 'Tab stays inside' },
	{ clickAt: [8, 8], wait: 300, shot: true, label: 'a click on the scrim does nothing' },
	{ key: 'Escape', wait: 400, label: 'Escape cancels, focus back on the button' },
	{ key: 'Enter', wait: 500, label: 'Enter on the button opens it again' },
	{ key: 'Enter', wait: 400, label: 'Enter on Cancel closes it' },
	{ click: 'role=button[name="Delete board"]', wait: 500, label: 'open it once more' },
	{ hover: 'role=alertdialog >> role=button[name="Delete board"]', wait: 300, shot: true, label: 'the action under the pointer darkens' },
	{ click: 'role=alertdialog >> role=button[name="Delete board"]', wait: 600, shot: true, label: 'the action confirms and closes' },
]
