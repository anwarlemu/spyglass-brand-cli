// The tabs switch the card between right to left and left to right; arrows and Enter reach them from the keyboard.
export default [
	{ click: 'role=tab[name="Left to right"]', wait: 400, shot: true, label: 'left to right' },
	{ click: 'role=tab[name="Right to left"]', wait: 400, shot: true, label: 'back to right to left' },
	{ focus: 'role=tab[name="Left to right"]', key: 'Enter', wait: 400, shot: true, label: 'Enter on a tab switches' },
]
