export default [
	{ example: 'Navigation', click: 'role=button[name="open menu"]', wait: 600, shot: true, label: 'the menu button slides the sidebar in' },
	{ example: 'Navigation', key: 'Tab', label: 'Tab moves through the links' },
	{ example: 'Navigation', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it at once, focus back on the button' },
	{ example: 'Navigation', key: 'Enter', wait: 600, label: 'Enter opens it again' },
	{ example: 'Navigation', click: 'role=link[name=/Usage/]', wait: 600, shot: true, label: 'picking a page closes it' },
	{ example: 'Navigation', click: 'role=button[name="open menu"]', wait: 600, shot: true, label: 'open once more: the pick is the page you are on' },
	{ example: 'Navigation', clickAt: [1300, 400], wait: 600, shot: true, label: 'a press on the dimmed page closes it' },
	{ example: 'Bottom', click: 'role=button[name="All searches"]', wait: 600, shot: true, label: 'the button slides the choice up' },
	{ example: 'Bottom', key: 'Tab', label: 'Tab to the rows' },
	{ example: 'Bottom', click: 'role=button[name="Nothing found"]', wait: 600, shot: true, label: 'a row picks and closes it' },
	{ example: 'Bottom', click: 'role=button[name="Nothing found"]', wait: 600, label: 'open again' },
	{ example: 'Bottom', click: 'role=button[name="close"]', wait: 600, shot: true, label: 'the close button closes it' },
]
