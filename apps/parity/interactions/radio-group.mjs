// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Visibility', click: 'role=radio[name="Only you"]', wait: 300, shot: true, label: 'a click picks it' },
	{ example: 'Visibility', key: 'ArrowDown', wait: 300, shot: true, label: 'an arrow moves the pick and skips the locked one' },
	{ example: 'Inline', focus: 'role=radio[name="Spend"]', key: 'ArrowRight', wait: 300, label: 'an arrow moves the pick along the row' },
]
