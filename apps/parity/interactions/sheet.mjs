// Docs opens the sheet (it slides in, focus on the code's Copy); Tab stays inside; Escape closes it at once and focus
// returns to Docs; Enter opens it again; the close button closes it with its exit; a press on the dimmed page closes it.
export default [
	{ example: 'Product', click: 'role=button[name="Docs"]', wait: 600, shot: true, label: 'Docs opens the sheet' },
	{ example: 'Product', key: 'Tab', label: 'Tab to the code' },
	{ example: 'Product', key: 'Tab', label: 'Tab wraps inside the panel' },
	{ example: 'Product', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it, focus back on Docs' },
	{ example: 'Product', key: 'Enter', wait: 600, shot: true, label: 'Enter opens it again' },
	{ example: 'Product', click: 'role=button[name="close"]', wait: 500, shot: true, label: 'the close button closes it' },
	{ example: 'Product', click: 'role=button[name="Docs"]', wait: 600, label: 'open once more' },
	{ example: 'Product', clickAt: [100, 300], wait: 500, shot: true, label: 'a press on the dimmed page closes it' },
]
