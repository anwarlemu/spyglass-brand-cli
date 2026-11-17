export default [
	{ focus: 'role=separator[name="resize the docs panel"]', wait: 200, shot: true, label: 'focus turns the hairline ink' },
	{ key: 'ArrowRight', wait: 200, shot: true, label: 'ArrowRight widens the first pane' },
	{ key: 'Shift+ArrowLeft', wait: 200, shot: true, label: 'Shift+ArrowLeft by ten' },
	{ key: 'Home', wait: 200, shot: true, label: 'Home to the minimum' },
	{ key: 'End', wait: 200, shot: true, label: 'End to the maximum' },
	{ key: 'ArrowRight', wait: 200, label: 'held at the maximum' },
	{ hover: 'text=Docs >> nth=0', wait: 300, label: 'pointer off the handle' },
]
