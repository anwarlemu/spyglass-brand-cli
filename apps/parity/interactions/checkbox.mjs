// A press on the row toggles it and the check draws; Space toggles from the keyboard; the parent turns the group on and
// shows a bar when some are on.
export default [
	{ example: 'States', click: 'text=Email me when a saved search finds new creatives', wait: 400, shot: true, label: 'a press on the label checks it' },
	{ example: 'States', focus: 'role=checkbox[name="Show ads that are still running"]', key: 'Space', wait: 400, shot: true, label: 'Space unchecks it, with the White ring' },
	{ example: 'States', hover: 'text=I agree to the terms', wait: 300, label: 'hover over the invalid box' },
	{ example: 'Group', click: 'role=checkbox[name="All formats"]', wait: 400, shot: true, label: 'the parent turns every format on' },
	{ example: 'Group', click: 'role=checkbox[name="Carousel"]', wait: 400, shot: true, label: 'one off: the parent shows a bar' },
]
