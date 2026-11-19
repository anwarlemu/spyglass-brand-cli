// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Page', click: 'role=textbox[name="Name"]', type: 'Alex at Acme', wait: 300, shot: true, label: 'typing a name' },
	{ example: 'Page', focus: 'role=textbox[name="Name"]', key: 'Tab', label: 'Tab moves from the name to the work email' },
]
