// The namespace checks what is typed; Paste text switches the form; typing text enables Add document, which writes
// (Writing, then the notice with Browse, and the form clears); Browse and connect an app answer with a toast. (A file
// pick has no step here: the file chooser is the browser's.)
export default [
	{ example: 'Product', click: 'role=textbox[name="Namespace"]', key: 'End', label: 'focus the namespace' },
	{ example: 'Product', type: ' X', wait: 300, shot: true, label: 'a space and capitals show the error' },
	{ example: 'Product', key: 'Backspace', label: 'remove one' },
	{ example: 'Product', key: 'Backspace', wait: 300, shot: true, label: 'valid again' },
	{ example: 'Product', click: 'role=tab[name="Paste text"]', wait: 300, shot: true, label: 'Paste text switches the form' },
	{ example: 'Product', click: 'role=textbox[name=/Id/]', type: 'refund-policy', label: 'type an id' },
	{ example: 'Product', key: 'Tab', label: 'Tab to the text' },
	{ example: 'Product', type: 'Refunds are available for 30 days.', wait: 300, shot: true, label: 'text enables Add document' },
	{ example: 'Product', click: 'role=button[name="Add document"]', wait: 300, shot: true, label: 'Add document writes' },
	{ example: 'Product', wait: 1000, shot: true, label: 'the notice, the form cleared' },
	{ example: 'Product', click: 'role=button[name="Browse"]', wait: 500, shot: true, label: 'Browse answers with a toast' },
	{ example: 'Product', click: 'role=tab[name="Upload files"]', wait: 300, shot: true, label: 'back to Upload files' },
	{ example: 'Product', click: 'role=button[name="connect an app"]', wait: 500, label: 'connect an app answers with a toast' },
]
