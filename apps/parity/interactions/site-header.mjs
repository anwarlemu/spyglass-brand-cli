// From 1280 the menus open on hover (after a short pause), swap at once, follow the row under the pointer, and close on
// Escape or a click outside; from the keyboard Enter or ArrowDown opens a menu at once with focus on its first link,
// arrows and End move through it, Escape returns focus to its link. On a phone the menu button opens the sheet, a
// disclosure opens its rows, Escape closes the sheet and returns focus; from the keyboard the sheet opens on its close
// button and Shift+Tab wraps inside it.
export default [
	{ example: 'Default', width: 1440, hover: 'role=button[name="Products"]', wait: 600, shot: true, label: 'hover opens the products menu beside its live card' },
	{ example: 'Default', width: 1440, hover: 'role=link[name=/Media archive/]', wait: 500, shot: true, label: 'the live card crossfades to the row under the pointer' },
	{ example: 'Default', width: 1440, hover: 'role=link[name=/Coming soon/]', wait: 500, shot: true, label: 'the live soon row shows its groups in words' },
	{ example: 'Default', width: 1440, hover: 'role=button[name="Use cases"]', wait: 500, shot: true, label: 'moving to Use cases swaps the menu at once' },
	{ example: 'Default', width: 1440, hover: 'role=link[name=/Paid ads/]', wait: 400, shot: true, label: 'the card follows the row under the pointer' },
	{ example: 'Default', width: 1440, hover: 'role=button[name="Resources"]', wait: 500, shot: true, label: 'the resources menu with the docs card' },
	{ example: 'Default', width: 1440, clickAt: [700, 560], wait: 400, shot: true, label: 'a click outside closes it' },
	{ example: 'Default', width: 1440, focus: 'role=button[name="Products"]', key: 'Enter', wait: 300, shot: true, label: 'Enter opens it at once, focus on the first link' },
	{ example: 'Default', width: 1440, key: 'ArrowDown', wait: 300, label: 'ArrowDown moves to the next link' },
	{ example: 'Default', width: 1440, key: 'End', wait: 300, label: 'End jumps to the last link' },
	{ example: 'Default', width: 1440, key: 'Escape', wait: 400, shot: true, label: 'Escape closes it and returns focus to Products' },
	{ example: 'Default', width: 1440, key: 'ArrowRight', wait: 100, label: 'focus stays on the link (no menu)' },
	{ example: 'Default', width: 390, click: 'role=button[name="Menu"]', wait: 600, shot: true, label: 'the menu button opens the sheet' },
	{ example: 'Default', width: 390, click: 'role=button[name="Products"]', wait: 600, shot: true, label: 'a disclosure opens its rows' },
	{ example: 'Default', width: 390, key: 'Escape', wait: 500, shot: true, label: 'Escape closes the sheet, focus back on the menu button' },
	{ example: 'Default', width: 390, key: 'Enter', wait: 500, label: 'Enter opens it with focus on the close button' },
	{ example: 'Default', width: 390, key: 'Shift+Tab', wait: 100, label: 'Shift+Tab to the key' },
	{ example: 'Default', width: 390, key: 'Shift+Tab', wait: 100, label: 'Shift+Tab to the lockup' },
	{ example: 'Default', width: 390, key: 'Shift+Tab', wait: 100, shot: true, label: 'Shift+Tab wraps to the last button in the foot' },
	{ example: 'Default', width: 390, key: 'Escape', wait: 500, label: 'Escape closes it' },
	{ example: 'Centered', width: 1440, hover: 'role=link[name="Customers"]', wait: 300, shot: true, label: 'a link under the pointer fills #262626' },
]
