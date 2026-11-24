// Focus raises a card and turns it, the cards ahead give way and its note opens; Escape lowers it. (A hover lands on the card above it, so the steps use focus.)
export default [
	{ example: 'Run', width: 1440, focus: 'role=button[name="Acme Skin, Gift kits"]', wait: 1200, shot: true, label: 'focus raises a card too' },
	{ example: 'Run', width: 1440, key: 'Escape', wait: 1200, shot: true, label: 'Escape lowers it' },
]
