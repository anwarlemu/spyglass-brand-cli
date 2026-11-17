export default [
	{ click: 'role=textbox[name="Text"]', wait: 200, label: 'a click focuses the first field' },
	{ type: 'Acme refunds', wait: 300, shot: true, label: 'typing counts the characters' },
	{ click: 'role=textbox[name="Summary"]', key: 'Meta+a', wait: 200, label: 'select the long summary' },
	{ type: 'Short.', wait: 300, shot: true, label: 'a short summary clears the error' },
	{ key: 'Shift+Tab', wait: 200, label: 'Shift+Tab goes back' },
	{ click: 'text=Summary', wait: 200, label: 'the label focuses its field' },
	{ hover: 'role=textbox[name="Text"]', wait: 400, shot: true, label: 'hover darkens the edge' },
]
