// Keyboard first, with the pointer off the menu: Escape closes with focus back on the button, Enter opens it again,
// Tab goes into the list. Then the highlight glides to the item under the pointer and its window plays.
export default [
	{ focus: 'role=button[name="Product"]', key: 'Escape', wait: 400, shot: true, label: 'Escape closes' },
	{ key: 'Enter', wait: 600, shot: true, label: 'Enter opens' },
	{ key: 'Tab', wait: 400, shot: true, label: 'Tab into the list' },
	{ hover: 'role=link[name=/Parse/]', wait: 600, shot: true, label: 'point at Parse' },
	{ hover: 'role=link[name=/Benchmarks/]', wait: 600, shot: true, label: 'point at Benchmarks' },
]
