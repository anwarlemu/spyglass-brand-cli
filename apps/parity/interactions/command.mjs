// Menu: arrows move the highlight (wrapping, skipping the disabled row), the pointer moves it too, typing filters on
// labels and keywords, Enter runs the row and the line says so; a query with no match says so. Palette: the button
// opens it at once with focus in the field; Escape closes it with focus back on the button; Cmd+K opens it; typing
// and Enter run a row and close it; a press on the scrim closes it.
export default [
	{ example: 'Menu', click: 'role=combobox', wait: 200, shot: true, label: 'focus the field, the first row highlighted' },
	{ example: 'Menu', key: 'ArrowDown', label: 'ArrowDown moves the highlight' },
	{ example: 'Menu', key: 'ArrowUp', label: 'ArrowUp moves it back' },
	{ example: 'Menu', key: 'ArrowUp', wait: 200, shot: true, label: 'ArrowUp from the first wraps to Billing, past the disabled Team' },
	{ example: 'Menu', hover: 'role=option[name=/Acme serum launch/]', wait: 200, shot: true, label: 'the pointer moves the highlight' },
	{ example: 'Menu', click: 'role=combobox', type: 'plan', wait: 200, shot: true, label: 'typing filters on keywords: Billing' },
	{ example: 'Menu', key: 'Enter', wait: 200, shot: true, label: 'Enter runs it' },
	{ example: 'Menu', type: 'zzz', wait: 200, shot: true, label: 'nothing matches' },
	{ example: 'Palette', click: 'role=button[name=/Search Spyglass/]', wait: 300, shot: true, label: 'the button opens it at once, focus in the field' },
	{ example: 'Palette', key: 'ArrowDown', wait: 100, label: 'ArrowDown moves the highlight' },
	{ example: 'Palette', key: 'Escape', wait: 300, label: 'Escape closes it, focus back on the button' },
	{ example: 'Palette', key: 'Control+k', wait: 300, label: 'Ctrl+K opens it, the field empty' },
	{ example: 'Palette', type: 'brand', wait: 200, shot: true, label: 'typing filters' },
	{ example: 'Palette', key: 'Enter', wait: 300, shot: true, label: 'Enter runs Track a brand and closes' },
	{ example: 'Palette', click: 'role=button[name=/Search Spyglass/]', wait: 300, label: 'open it again' },
	{ example: 'Palette', clickAt: [8, 8], wait: 300, label: 'a press on the scrim closes it' },
]
