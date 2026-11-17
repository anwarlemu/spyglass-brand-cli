// Hover turns a step back White; Tab moves along the links.
export default [
	{ hover: 'role=link[name="Acme skincare"]', wait: 300, shot: true, label: 'hover turns the step White' },
	{ focus: 'role=link[name="Boards"]', key: 'Tab', wait: 200, shot: true, label: 'Tab moves to the next step, with the White ring' },
]
