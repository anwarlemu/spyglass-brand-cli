export default [
	{ focus: 'role=region[name="documents"]', wait: 200, shot: true, label: 'the region takes focus' },
	{ key: 'PageDown', wait: 400, shot: true, label: 'Page Down scrolls it' },
	{ key: 'End', wait: 400, shot: true, label: 'End scrolls to the last' },
	{ key: 'Tab', wait: 200, label: 'Tab to the row of tags' },
	{ key: 'ArrowRight', wait: 400, shot: true, label: 'ArrowRight scrolls sideways' },
]
