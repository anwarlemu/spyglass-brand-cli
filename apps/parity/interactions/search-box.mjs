// Enter searches (the arrow works, then comes back); the plus opens the add menu and Paste text opens the paste box,
// whose text is added as a file; the file's cross removes it; the scope menu names where data goes; Shift+Enter breaks
// the line and an empty question disables the arrow.
export default [
	{ example: 'Product', click: 'role=textbox[name="question"]', key: 'End', label: 'focus the question' },
	{ example: 'Product', key: 'Enter', wait: 300, shot: true, label: 'Enter searches: the arrow works' },
	{ example: 'Product', wait: 1200, shot: true, label: 'the arrow comes back' },
	{ example: 'Product', click: 'role=button[name="add data"]', wait: 500, shot: true, label: 'the plus opens the add menu' },
	{ example: 'Product', click: 'role=menuitem[name=/Paste text/]', wait: 400, shot: true, label: 'Paste text opens the paste box' },
	{ example: 'Product', type: 'Refunds are available for thirty days after purchase', wait: 300, shot: true, label: 'type the text' },
	{ example: 'Product', click: 'role=button[name="Add text"]', wait: 300, shot: true, label: 'Add text attaches it, adding' },
	{ example: 'Product', wait: 1000, shot: true, label: 'then added' },
	{ example: 'Product', click: 'role=button[name="remove acme-msa.pdf from the list"]', wait: 400, shot: true, label: 'the cross removes a file' },
	{ example: 'Product', click: 'role=button[name=/search in/]', wait: 500, label: 'open the scope menu' },
	{ example: 'Product', click: 'role=option[name=/slack/]', wait: 400, label: 'pick slack' },
	{ example: 'Product', click: 'role=button[name="add data"]', wait: 500, shot: true, label: 'the add menu names slack' },
	{ example: 'Product', key: 'Escape', wait: 300, label: 'Escape closes it' },
	{ example: 'Product', click: 'role=textbox[name="question"]', key: 'ControlOrMeta+a', label: 'select the question' },
	{ example: 'Product', key: 'Backspace', wait: 300, shot: true, label: 'an empty question disables the arrow' },
	{ example: 'Product', type: 'line one', label: 'type a line' },
	{ example: 'Product', key: 'Shift+Enter', wait: 300, shot: true, label: 'Shift+Enter breaks the line' },
]
