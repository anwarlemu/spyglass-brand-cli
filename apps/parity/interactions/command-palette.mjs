// The search button opens the palette at once, focus in its box; arrows move the highlight (wrapping), the pointer
// moves it too; typing filters and offers a search row, documents arrive after a beat; Enter on a page runs it and
// closes, focus back on the button; Tab stays in the box; Escape closes; a press on the dimmed page closes; Enter on
// the button opens it again; a query with no match says so.
export default [
	{ click: 'role=button[name=/Search/]', wait: 300, shot: true, label: 'a click opens it, focus in the box' },
	{ key: 'ArrowDown', label: 'ArrowDown moves the highlight' },
	{ key: 'ArrowUp', label: 'ArrowUp moves it back' },
	{ key: 'ArrowUp', wait: 200, shot: true, label: 'ArrowUp from the first wraps to the last' },
	{ key: 'Tab', label: 'Tab stays in the box' },
	{ hover: 'role=option[name=/Billing/]', wait: 200, shot: true, label: 'the pointer moves the highlight' },
	{ type: 'notice', wait: 600, shot: true, label: 'typing filters, documents arrive' },
	{ key: 'ArrowDown', label: 'to the first document' },
	{ key: 'Enter', wait: 200, label: 'Enter on a document runs it and closes' },
	{ key: 'Enter', wait: 300, label: 'Enter on the button opens it again, the box empty' },
	{ type: 'usage', wait: 400, label: 'type a page' },
	{ key: 'ArrowDown', label: 'to Usage' },
	{ key: 'Enter', wait: 300, label: 'Enter on Usage closes it' },
	{ click: 'role=button[name=/Search/]', wait: 300, label: 'open it with a click' },
	{ type: 'zzzz', wait: 400, shot: true, label: 'nothing matches' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus back on the button' },
	{ click: 'role=button[name=/Search/]', wait: 300, label: 'open it again' },
	{ clickAt: [8, 8], wait: 300, label: 'a press on the dimmed page closes it' },
]
