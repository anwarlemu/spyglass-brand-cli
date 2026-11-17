// The header on a phone: the menu opens in place, Escape closes it and gives focus back to the button.
export default [
	{ example: 'Default', width: 390, click: 'role=button[name="Open the menu"]', wait: 200, shot: true, label: 'the menu opens under the bar' },
	{ example: 'Default', width: 390, key: 'Escape', wait: 200, shot: true, label: 'Escape closes it, focus back on the button' },
	{ example: 'Default', width: 1440, hover: 'role=link[name="Pricing"]', wait: 300, shot: true, label: 'hover brightens a link' },
]
