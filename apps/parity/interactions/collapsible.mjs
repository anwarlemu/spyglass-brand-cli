// A press opens it and the chevron turns; a second press closes it; Enter from the keyboard opens it at once; the
// trigger's words follow its state.
export default [
	{ example: 'Filters', click: 'role=button[name="More filters"]', wait: 400, shot: true, label: 'a press opens it' },
	{ example: 'Filters', click: 'role=button[name="More filters"]', wait: 400, shot: true, label: 'a second press closes it' },
	{ example: 'Filters', focus: 'role=button[name="More filters"]', key: 'Enter', wait: 100, shot: true, label: 'Enter opens it at once' },
	{ example: 'Boards', click: 'role=button[name="Show fewer boards"]', wait: 400, shot: true, label: 'closing it changes the words' },
]
