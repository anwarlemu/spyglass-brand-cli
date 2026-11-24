// What a person does with the sign-in form; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Form', click: 'role=button[name="Get started"]', wait: 300, shot: true, label: 'sending an empty email puts the message beside the label and focuses the field' },
	{ example: 'Form', type: 'you@acme', wait: 200, label: 'typing clears the message' },
	{ example: 'Form', key: 'Enter', wait: 300, shot: true, label: 'a malformed email asks to check it' },
]
