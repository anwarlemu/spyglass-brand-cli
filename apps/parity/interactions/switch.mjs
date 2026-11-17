// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Settings', click: 'role=switch[name="New creative alerts"]', wait: 400, shot: true, label: 'a click turns it on' },
	{ example: 'Settings', key: 'Space', wait: 400, shot: true, label: 'Space turns it off again' },
	{ example: 'Settings', hover: 'role=switch[name="Weekly digest"]', wait: 300, label: 'hover' },
]
