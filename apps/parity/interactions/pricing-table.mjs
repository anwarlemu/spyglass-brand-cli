// The billing switch: Yearly swaps the prices and units (the pill glides), and a resting pointer lights another plan.
export default [
	{ example: 'Plans', click: 'role=radio[name="Yearly"]', wait: 900, shot: true, label: 'yearly prices, the pill on Yearly' },
	{ example: 'Plans', key: 'ArrowLeft', wait: 900, shot: true, label: 'the left arrow moves back to Monthly' },
	{ example: 'Plans', hover: 'role=heading[name="Creator"]', wait: 600, shot: true, label: 'a resting pointer lights Creator instead' },
]
