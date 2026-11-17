// The advanced settings open with a click (the form below moves down) and close with another; from the keyboard,
// Enter opens them at once, Tab then reaches the fields inside, and Space closes them again.
export default [
	{ click: 'role=button[name="Advanced settings"]', wait: 600, shot: true, label: 'a click opens them' },
	{ click: 'role=button[name="Advanced settings"]', wait: 600, shot: true, label: 'a second click closes them' },
	{ focus: 'role=button[name="Advanced settings"]', key: 'Enter', wait: 200, shot: true, label: 'Enter opens them at once' },
	{ key: 'Tab', label: 'Tab to Sync every' },
	{ key: 'Tab', label: 'Tab to the switch' },
	{ key: 'Space', wait: 300, shot: true, label: 'Space turns the switch off' },
	{ key: 'Shift+Tab', label: 'Shift+Tab back to the field' },
	{ key: 'Shift+Tab', label: 'Shift+Tab back to the trigger' },
	{ key: 'Space', wait: 200, label: 'Space closes them at once' },
	{ key: 'Tab', label: 'Tab skips the closed fields' },
]
