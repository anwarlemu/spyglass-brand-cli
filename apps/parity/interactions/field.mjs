// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Fields', click: 'role=textbox[name="Brand or creator"]', type: 'Acme Studio', wait: 300, shot: true, label: 'typing, with the White hairline of focus' },
	{ example: 'Fields', key: 'Tab', wait: 200, label: 'Tab moves to the field with the error' },
]
