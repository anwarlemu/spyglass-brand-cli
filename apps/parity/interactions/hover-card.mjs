// The pointer resting on the link opens the card after the wait; the pointer can cross into the card and leaving both
// closes it. Keyboard focus opens it at once; Escape closes it.
export default [
	{ hover: 'role=link[name="Acme Studio"]', wait: 800, shot: true, label: 'the pointer rests: the card opens' },
	{ hover: 'text=New this week', wait: 400, shot: true, label: 'the pointer crosses into the card: it stays' },
	{ hover: 'text=Top hooks', wait: 600, shot: true, label: 'leaving both closes it' },
	{ focus: 'role=link[name="Acme Studio"]', wait: 200, shot: true, label: 'keyboard focus opens it at once' },
	{ key: 'Escape', wait: 300, shot: true, label: 'Escape closes it, focus stays on the link' },
]
