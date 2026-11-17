export default [
	{ click: 'role=checkbox[name="All events"]', wait: 400, shot: true, label: 'a click on the partly-on box turns every one on' },
	{ key: 'Space', wait: 400, shot: true, label: 'Space turns every one off' },
	{ click: 'text=Document deleted', wait: 400, shot: true, label: 'a click on the label turns one on and the bar shows' },
	{ key: 'Tab', label: 'Tab skips the disabled box' },
	{ hover: 'role=checkbox[name=/Source failed/]', wait: 300, shot: true, label: 'hover darkens the edge' },
]
