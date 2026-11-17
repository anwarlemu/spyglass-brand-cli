// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Formats', click: 'role=button[name="Carousel"]', wait: 300, shot: true, label: 'a click adds a format' },
	{ example: 'Formats', click: 'role=button[name="Large"]', wait: 300, shot: true, label: 'one grid size at a time' },
	{ example: 'Formats', focus: 'role=button[name="Video"]', key: 'Enter', wait: 300, label: 'Enter lets a format go' },
]
