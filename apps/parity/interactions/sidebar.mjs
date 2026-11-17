// A click on a row makes it the page you are on; Tab walks the rows, Enter follows one, and the row under the
// pointer takes the hover fill.
export default [
	{ click: 'role=link[name=/Sources/]', wait: 300, shot: true, label: 'a click moves the red edge' },
	{ hover: 'role=link[name=/Usage/]', wait: 300, shot: true, label: 'the row under the pointer fills' },
	{ focus: 'role=link[name=/API keys/]', key: 'Enter', wait: 300, shot: true, label: 'Enter on a row picks it' },
	{ key: 'Tab', label: 'Tab to the next row' },
]
