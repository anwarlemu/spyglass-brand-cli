// The menu opens with the frame. A click picks a filter and the button counts it, the menu staying open; a second
// click on it clears it; arrows, Home and End move through every group; Enter picks; Escape closes and returns focus;
// ArrowDown on the button opens it on the first row; a click outside closes it.
export default [
	{ reload: true, wait: 600, label: 'the menu opens with the frame' },
	{ click: 'role=menuitemradio[name="Notion"]', wait: 300, shot: true, label: 'a click picks Notion, counted, the menu stays open' },
	{ click: 'role=menuitemradio[name="Past month"]', wait: 300, shot: true, label: 'a second group counts too' },
	{ click: 'role=menuitemradio[name="Notion"]', wait: 300, label: 'a second click on Notion clears it' },
	{ clickAt: [1300, 600], wait: 300, label: 'a click outside closes it' },
	{ focus: 'role=button[name=/Filters/]', key: 'ArrowDown', wait: 300, label: 'ArrowDown opens it on Slack' },
	{ key: 'ArrowDown', label: 'to Notion' },
	{ key: 'Enter', wait: 300, label: 'Enter picks Notion, the menu stays open' },
	{ key: 'End', label: 'End to Past year' },
	{ key: 'ArrowDown', label: 'wraps to Slack' },
	{ key: 'Home', wait: 200, shot: true, label: 'Home stays on Slack' },
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape closes it, focus on the button' },
]
