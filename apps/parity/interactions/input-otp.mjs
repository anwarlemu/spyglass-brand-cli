export default [
	{ click: 'role=textbox[name="code from the email"]', wait: 200, shot: true, label: 'a click puts the caret in the first cell' },
	{ type: '12a3', wait: 200, shot: true, label: 'digits fill the cells, letters are dropped' },
	{ key: 'Backspace', wait: 200, shot: true, label: 'Backspace clears the last' },
	{ type: '3456', wait: 1000, shot: true, label: 'the last cell completes it and it signs in' },
	{ reload: true, click: 'role=textbox[name="code from the email"]', type: '000000', wait: 1000, shot: true, label: '000000 shows the wrong code' },
	{ key: 'Backspace', wait: 300, shot: true, label: 'editing clears the error' },
	{ key: 'Tab', wait: 200, label: 'Tab leaves it' },
]
