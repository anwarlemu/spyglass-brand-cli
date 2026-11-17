// Hover runs the squares across; a press signs in, then counts the changes back as the black wipes off, then ends on
// the check; the red one the same, from the keyboard.
export default [
	{ example: 'Product', hover: 'role=button[name="Reconnect Acme CRM"] >> nth=0', wait: 500, shot: true, label: 'hover runs the red squares across' },
	{ example: 'Product', click: 'role=button[name="Reconnect Acme CRM"] >> nth=0', wait: 600, shot: true, label: 'a press signs in' },
	{ example: 'Product', wait: 1200, shot: true, label: 'the changes come back as the black wipes off' },
	{ example: 'Product', wait: 1600, shot: true, label: 'done: the check and the count' },
	{ example: 'Product', focus: 'role=button[name="Reconnect Acme CRM"] >> nth=-1', key: 'Enter', wait: 600, shot: true, label: 'Enter presses the red one' },
]
