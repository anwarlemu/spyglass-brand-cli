// A click picks a page (it turns White); hover fills a row; the fold button folds the rail to icons and back.
export default [
	{ example: 'App', click: 'role=link[name=/Acme hooks/]', wait: 300, shot: true, label: 'a click picks the page' },
	{ example: 'App', hover: 'role=link[name=/Creators/]', wait: 300, shot: true, label: 'hover fills a row' },
	{ example: 'App', click: 'role=button[name="Collapse sidebar"]', wait: 300, shot: true, label: 'the button folds the rail to icons' },
	{ example: 'App', key: 'Tab', wait: 200, shot: true, label: 'Tab moves to the first icon' },
	{ example: 'App', click: 'role=button[name="Expand sidebar"]', wait: 300, shot: true, label: 'and unfolds it' },
]
