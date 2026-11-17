// One note, then a burst: three at most, the oldest making way; pointing at them holds their time. Then a second note
// arriving as the first is about to leave: the new one rises in below while the first moves up, the first fades where
// it is, and the new one stays alone.
export default [
	{ click: 'role=button[name="Delete a document"]', wait: 500, shot: true, label: 'a note rises in the corner' },
	{ click: 'role=button[name="Delete a document"]', wait: 60, label: 'a second' },
	{ click: 'role=button[name="Delete a document"]', wait: 60, label: 'a third' },
	{ click: 'role=button[name="Delete a document"]', wait: 700, shot: true, label: 'a fourth: three show at most' },
	{ hover: 'text=northwind-msa-4.pdf', wait: 4500, shot: true, label: 'pointing at them holds their time' },
	{ clickAt: [10, 10], wait: 4600, shot: true, label: 'away from them, they leave after four seconds' },
	{ click: 'role=button[name="Delete a document"]', wait: 3650, label: 'a note, nearly at its four seconds' },
	{ click: 'role=button[name="Delete a document"]', wait: 110, shot: true, label: 'a second arrives as the first is about to leave: it rises in below, the first moves up' },
	{ wait: 700, shot: true, label: 'the first has faded where it was; the second stays alone' },
]
