export default [
	{ click: 'text=Name', wait: 200, shot: true, label: 'the label focuses its field' },
	{ type: 'acme-agent', wait: 200, label: 'typing goes into it' },
	{ click: 'text=Description', wait: 200, shot: true, label: 'the second label focuses its field' },
	{ click: 'text=optional', wait: 200, label: 'the note is part of the label' },
]
