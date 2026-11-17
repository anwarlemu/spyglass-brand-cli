// What a person does with the tabs; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Segmented', click: 'role=tab[name="Posts"]', wait: 300, shot: true, label: 'a click picks Posts and shows its panel' },
	{ example: 'Segmented', key: 'ArrowRight', wait: 300, shot: true, label: 'ArrowRight moves to Product shots and selects it' },
	{ example: 'Line', click: 'role=tab[name="Brands"]', wait: 300, shot: true, label: 'the White line moves to Brands' },
	{ example: 'Line', key: 'End', wait: 300, label: 'End skips the disabled tab to Notes' },
	{ example: 'Line', hover: 'role=tab[name="Notes"]', wait: 300, label: 'hover brightens a tab' },
]
