export default [
	{ hover: 'role=link[name="Try a search"]', wait: 400, shot: true, label: 'hover darkens the underline' },
	{ hover: 'role=button[name="Show 5 more"]', wait: 400, shot: true, label: 'hover on the quiet link' },
	{ focus: 'role=button[name="Show 5 more"]', wait: 200, shot: true, label: 'focus on the quiet link' },
	{ focus: 'role=link[name="Docs"]', key: 'Enter', wait: 300, label: 'Enter follows a link' },
]
