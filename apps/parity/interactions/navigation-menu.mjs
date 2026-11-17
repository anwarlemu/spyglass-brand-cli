// The pointer resting on Product opens its panel; moving to Resources switches at once; leaving both closes it. A click
// toggles; Down opens from the keyboard on the first link; Left and Right move along the row; Escape closes it.
export default [
	{ hover: 'role=button[name="Product"]', wait: 600, shot: true, label: 'the pointer rests on Product: its panel opens' },
	{ hover: 'role=link[name=/Boards/]', wait: 300, shot: true, label: 'into the panel: a link fills' },
	{ hover: 'role=button[name="Resources"]', wait: 400, shot: true, label: 'Resources switches at once' },
	{ hover: 'role=link[name="About"]', wait: 600, shot: true, label: 'leaving both closes it' },
	{ focus: 'role=button[name="Product"]', key: 'ArrowDown', wait: 300, shot: true, label: 'Down opens Product at once, focus on Search' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus on Product' },
	{ key: 'ArrowRight', wait: 200, label: 'Right moves to Resources' },
	{ key: 'ArrowRight', wait: 200, label: 'Right moves to Pricing' },
	{ key: 'Enter', wait: 100, label: 'Enter follows the link' },
	{ clickAt: [1300, 600], wait: 300, label: 'away' },
	{ click: 'role=button[name="Resources"]', wait: 500, shot: true, label: 'a click opens Resources' },
	{ clickAt: [1300, 600], wait: 500, shot: true, label: 'a press outside closes it' },
]
