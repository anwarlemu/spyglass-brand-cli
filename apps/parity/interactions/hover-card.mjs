// The pointer resting on the link opens the card after the wait; the pointer can cross into the card and leaving both
// closes it. Keyboard focus opens it at once and Tab away closes it; Escape closes it.
export default [
	{ hover: 'role=link[name="contracts"]', wait: 800, shot: true, label: 'the pointer rests: the card opens' },
	{ hover: 'text=412,830', wait: 400, shot: true, label: 'the pointer crosses into the card: it stays' },
	{ clickAt: [1300, 20], wait: 600, label: 'a press away' },
	{ hover: 'role=link[name="contracts"]', wait: 800, label: 'open it again' },
	{ hover: 'text=Answers about notice periods', wait: 600, shot: true, label: 'leaving both closes it' },
	{ focus: 'role=link[name="contracts"]', wait: 200, shot: true, label: 'keyboard focus opens it at once' },
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape closes it, focus stays on the link' },
	{ key: 'Shift+Tab', wait: 300, label: 'focus leaves' },
]
