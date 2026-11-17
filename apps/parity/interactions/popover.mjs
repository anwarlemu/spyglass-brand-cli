// What a person does with the popover; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Board', click: 'role=button[name="Save to board"]', wait: 400, shot: true, label: 'a click opens the panel and focus moves to the field' },
	{ example: 'Board', key: 'Escape', wait: 300, label: 'Escape closes it and focus returns to the trigger' },
]
