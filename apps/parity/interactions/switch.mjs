export default [
	{ click: 'role=switch[name="email sign-in"]', wait: 300, shot: true, label: 'a click turns it off' },
	{ key: 'Space', wait: 300, shot: true, label: 'Space turns it on again' },
	{ hover: 'role=switch[name="email sign-in"]', wait: 200, label: 'hover' },
]
