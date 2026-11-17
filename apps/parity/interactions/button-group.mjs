// Tab moves through the joined buttons; hover lifts one half; focus shows its ring over its neighbor.
export default [
	{ example: 'Toolbar', focus: 'role=button[name="Previous page"]', key: 'Tab', wait: 200, shot: true, label: 'Tab to the next half, its ring on top' },
	{ example: 'Toolbar', hover: 'role=button[name="Grid"]', wait: 300, shot: true, label: 'hover lifts one half' },
	{ example: 'Field', click: 'role=textbox[name="Email"]', type: 'team@acme.com', wait: 300, shot: true, label: 'typing in the field beside its button' },
]
