export default [
	{ focus: 'role=slider[name="passages per search"]', key: 'ArrowRight', wait: 200, shot: true, label: 'ArrowRight steps it' },
	{ key: 'PageUp', wait: 200, shot: true, label: 'Page Up' },
	{ key: 'End', wait: 200, shot: true, label: 'End goes to the max' },
	{ key: 'Home', wait: 200, shot: true, label: 'Home goes to the min' },
	{ click: 'role=slider[name="minimum score"]', wait: 300, shot: true, label: 'a click moves the thumb there' },
	{ key: 'ArrowLeft', wait: 200, shot: true, label: 'ArrowLeft steps by its step' },
	{ key: 'Tab', wait: 200, label: 'Tab skips the disabled one' },
]
