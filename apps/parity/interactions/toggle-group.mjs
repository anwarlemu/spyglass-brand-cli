export default [
	{ click: 'role=button[name="Messages"]', wait: 300, shot: true, label: 'several: a click adds one' },
	{ click: 'role=button[name="Pages"]', wait: 300, shot: true, label: 'several: a click lets one go' },
	{ click: 'role=button[name="Most cited"]', wait: 500, shot: true, label: 'one: the block glides to the pick' },
	{ key: 'Enter', wait: 500, shot: true, label: 'one: pressing it again lets it go' },
	{ key: 'Shift+Tab', wait: 200, label: 'Shift+Tab goes back' },
	{ key: 'Space', wait: 500, shot: true, label: 'Space picks the focused one' },
]
