// The nested fields open behind their toggle (the plus turns to a minus) and close again; a card's mark turns red under
// the pointer; the table and the code take focus in order from the keyboard.
export default [
	{ example: 'Site', click: 'text=1 field', wait: 300, shot: true, label: 'the toggle opens the nested fields' },
	{ example: 'Site', click: 'text=1 field', wait: 300, label: 'and closes them' },
	{ example: 'Site', hover: 'role=link[name=/Namespaces/]', wait: 300, shot: true, label: 'a card under the pointer' },
	{ example: 'Site', focus: 'role=button[name=/Copy/]', key: 'Tab', label: 'Tab from Copy to the code' },
	{ example: 'Site', key: 'Tab', label: 'Tab to the table' },
	{ example: 'Site', key: 'Tab', wait: 300, shot: true, label: 'Tab to the toggle, ringed' },
]
