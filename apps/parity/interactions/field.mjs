export default [
	{ example: 'Product', click: 'role=textbox[name="Filter"]', key: 'End', wait: 100, label: 'focus the JSON filter' },
	{ example: 'Product', type: '"legal" }', wait: 300, shot: true, label: 'valid JSON shows the hint' },
	{ example: 'Product', key: 'Backspace', wait: 300, shot: true, label: 'invalid again shows the error' },
	{ example: 'Product', click: 'text=Name', wait: 200, label: 'the label focuses its field' },
]
