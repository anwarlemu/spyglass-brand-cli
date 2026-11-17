export default [
	{ focus: 'role=combobox[name="Role"]', wait: 200, shot: true, label: 'focus turns the edge ink' },
	{ type: 'v', wait: 300, shot: true, label: 'typing picks by the first letter' },
	{ key: 'Tab', wait: 200, label: 'Tab to the namespace' },
	{ type: 's', wait: 300, shot: true, label: 'a mono pick' },
	{ focus: 'role=combobox[name="range"]', type: '3', wait: 300, shot: true, label: 'the small one' },
	{ hover: 'role=combobox[name="Role"]', wait: 400, shot: true, label: 'hover darkens the edge' },
]
