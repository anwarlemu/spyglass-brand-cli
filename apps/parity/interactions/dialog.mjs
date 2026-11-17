// The dialog opens with the page: Tab stays inside it, Escape closes it, the button opens it on the Name field, Enter
// in the form submits and closes, and the scrim closes it.
export default [
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape closes it' },
	{ click: 'role=button[name="New organization"]', wait: 500, shot: true, label: 'the button opens it on the Name field' },
	{ type: 'Legal', wait: 100, label: 'type a name' },
	{ key: 'Tab', label: 'Tab to Cancel' },
	{ key: 'Tab', label: 'Tab to Create' },
	{ key: 'Tab', label: 'Tab wraps to the close button' },
	{ key: 'Shift+Tab', label: 'Shift+Tab back to Create' },
	{ key: 'Enter', wait: 400, label: 'Enter on Create submits and closes' },
	{ click: 'role=button[name="New organization"]', wait: 500, label: 'open again' },
	{ click: 'role=button[name="close"]', wait: 400, label: 'the close button closes it' },
	{ click: 'role=button[name="New organization"]', wait: 500, label: 'open once more' },
	{ clickAt: [8, 8], wait: 400, label: 'a click on the scrim closes it' },
]
