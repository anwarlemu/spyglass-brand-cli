// What a person does here; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Toolbar', click: 'role=button[name="Carousel"]', wait: 300, shot: true, label: 'a click presses it' },
	{ example: 'Toolbar', focus: 'role=button[name="Video"]', key: 'Space', wait: 300, shot: true, label: 'Space lets the pressed one go' },
	{ example: 'Toolbar', hover: 'role=button[name="Saved only"]', wait: 300, shot: true, label: 'hover darkens the outline' },
]
