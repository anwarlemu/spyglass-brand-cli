// Focus raises the templates and widens the bar; a template under the pointer opens its arrow; a question with an
// answer grows the bar into a thread, word by word; a follow-up from under the answer; Escape folds the thread; a
// typed question with no answer gets the fallback; Clear folds it; Cmd+K focuses the bar; Tab moves through the
// templates' row.
export default [
	{ example: 'Site', click: 'role=textbox[name="Message Acme"]', wait: 500, shot: true, label: 'focus raises the templates' },
	{ example: 'Site', hover: 'role=button[name="Which part should I use?"]', wait: 400, shot: true, label: 'the arrow opens under the pointer' },
	{ example: 'Site', click: 'role=button[name="Which part should I use?"]', wait: 1500, shot: true, label: 'a template asks: the thread' },
	{ example: 'Site', click: 'role=button[name="What do I have to run?"]', wait: 1500, shot: true, label: 'a follow-up from under the answer' },
	{ example: 'Site', key: 'Escape', wait: 500, shot: true, label: 'Escape folds the thread' },
	{ example: 'Site', type: 'pricing', wait: 300, shot: true, label: 'typing lights the send button' },
	{ example: 'Site', key: 'Enter', wait: 1500, shot: true, label: 'Enter asks: the fallback' },
	{ example: 'Site', click: 'role=button[name="Clear"]', wait: 500, shot: true, label: 'Clear folds it' },
	{ example: 'Site', clickAt: [20, 20], wait: 500, label: 'a click away blurs it' },
	{ example: 'Site', key: 'Meta+k', wait: 500, shot: true, label: 'Cmd+K focuses it' },
]
