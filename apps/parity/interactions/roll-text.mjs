// Hover rolls the label; Tab (focus-visible) rolls it too; a click marks the current page.
export default [
	{ example: 'Product', hover: 'role=button[name="Namespaces"]', wait: 400, shot: true, label: 'hover a link' },
	{ example: 'Product', click: 'role=button[name="Search"]', wait: 400, shot: true, label: 'click marks it current' },
	{ example: 'Product', clickAt: [1400, 880], wait: 300 },
	{ example: 'Product', focus: 'role=button[name="Connect an agent"]', key: 'Shift+Tab', wait: 400, shot: true, label: 'keyboard focus rolls it' },
	{ example: 'Site', hover: 'role=link[name="Terms"]', wait: 400, shot: true, label: 'hover a footer link' },
]
