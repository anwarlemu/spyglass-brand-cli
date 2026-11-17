// Format: the button slides the choice up, focus on the current row; Tab moves to the next row; a row picks and
// closes it; the close button closes it. Navigation: the menu button slides the pages in from the left; Escape closes
// it at once with focus back on the button; picking a page closes it; a press on the scrim closes it.
export default [
	{ example: 'Format', click: 'role=button[name="All formats"]', wait: 600, shot: true, label: 'the button slides the choice up' },
	{ example: 'Format', key: 'Tab', label: 'Tab to the next row' },
	{ example: 'Format', click: 'role=button[name="Carousel"]', wait: 600, shot: true, label: 'a row picks and closes it' },
	{ example: 'Format', click: 'role=button[name="Carousel"]', wait: 600, label: 'open again' },
	{ example: 'Format', click: 'role=button[name="Close"]', wait: 600, shot: true, label: 'the close button closes it' },
	{ example: 'Navigation', click: 'role=button[name="Open menu"]', wait: 600, shot: true, label: 'the menu button slides the pages in' },
	{ example: 'Navigation', key: 'Tab', label: 'Tab moves through the links' },
	{ example: 'Navigation', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it at once, focus back on the button' },
	{ example: 'Navigation', key: 'Enter', wait: 600, label: 'Enter opens it again' },
	{ example: 'Navigation', click: 'role=link[name=/Boards/]', wait: 600, shot: true, label: 'picking a page closes it' },
	{ example: 'Navigation', click: 'role=button[name="Open menu"]', wait: 600, label: 'open once more' },
	{ example: 'Navigation', clickAt: [370, 400], wait: 600, shot: true, label: 'a press on the scrim closes it' },
]
