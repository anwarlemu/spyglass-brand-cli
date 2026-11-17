// Under the pointer a tooltip waits, then shows; moving along the row the next shows at once; a press hides it;
// keyboard focus shows it without a wait, Tab moves it along, and Escape hides it.
export default [
	{ hover: 'role=button[name="Save to board"]', wait: 700, shot: true, label: 'the pointer rests: the name shows after the wait' },
	{ hover: 'role=button[name="Copy link"]', wait: 100, shot: true, label: 'moving along: the next shows at once' },
	{ click: 'role=button[name="Copy link"]', wait: 300, shot: true, label: 'a press hides it' },
	{ clickAt: [1300, 20], wait: 400, label: 'away from the row' },
	{ focus: 'role=button[name="Download"]', wait: 200, shot: true, label: 'keyboard focus shows it at once' },
	{ key: 'Tab', wait: 200, shot: true, label: 'Tab moves it to the next button' },
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape hides it' },
]
