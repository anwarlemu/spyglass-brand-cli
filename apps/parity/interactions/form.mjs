// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Track', click: 'role=button[name="Start tracking"]', wait: 400, shot: true, label: 'sending it empty shows the errors and focuses the first' },
	{ example: 'Track', type: 'Acme', wait: 300, shot: true, label: 'typing clears the first error' },
	{ example: 'Track', click: 'role=textbox[name="Site"]', type: 'acme.com', wait: 200, label: 'a valid site' },
	{ example: 'Track', click: 'role=button[name="Start tracking"]', wait: 1200, shot: true, label: 'the server says Acme is already tracked' },
]
