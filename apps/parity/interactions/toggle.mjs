export default [
	{ click: 'role=button[name="Include archived"]', wait: 300, shot: true, label: 'a click turns it on' },
	{ key: 'Space', wait: 300, shot: true, label: 'Space turns it off' },
	{ key: 'Enter', wait: 300, shot: true, label: 'Enter turns it on' },
	{ key: 'Tab', wait: 200, label: 'Tab moves on and skips the disabled one' },
	{ key: 'Tab', wait: 200, label: 'Tab leaves the row' },
	{ hover: 'role=button[name="Only mine"]', wait: 300, shot: true, label: 'hover shows the red square' },
]
