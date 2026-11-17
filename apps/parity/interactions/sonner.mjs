// One note, then a burst: three at most, the oldest making way; pointing at the stack spreads it and holds their time;
// away from it they leave after four seconds. Undo closes its note; Dismiss closes one.
export default [
	{ example: 'Board', click: 'role=button[name="Save to board"]', wait: 600, shot: true, label: 'a note rises in the corner' },
	{ example: 'Board', click: 'role=button[name="Save to board"]', wait: 80, label: 'a second' },
	{ example: 'Board', click: 'role=button[name="Track brand"]', wait: 80, label: 'a third' },
	{ example: 'Board', click: 'role=button[name="Save to board"]', wait: 700, shot: true, label: 'a fourth: three show at most, stacked' },
	{ example: 'Board', hover: 'text=Acme hooks now has 26 creatives.', wait: 4500, shot: true, label: 'pointing spreads the stack and holds their time' },
	{ example: 'Board', click: 'role=button[name="Undo"] >> nth=-1', wait: 600, shot: true, label: 'Undo closes its note' },
	{ example: 'Board', clickAt: [10, 10], wait: 4800, shot: true, label: 'away from them, they leave after four seconds' },
	{ example: 'Board', click: 'role=button[name="Track brand"]', wait: 600, label: 'a note' },
	{ example: 'Board', click: 'role=button[name="Dismiss"]', wait: 500, shot: true, label: 'Dismiss closes it' },
]
