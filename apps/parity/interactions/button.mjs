// What a person does with the button examples, step by step; check-parity compares focus, state and (with `shot`)
// the pixels after each step with the Vue example.
export default [
	{ example: 'Dark', hover: 'role=button[name="Create key"]', wait: 500, shot: true, label: 'hover runs the red squares in' },
	{ example: 'Secondary', hover: 'role=button[name="Copy as code"]', wait: 300, shot: true, label: 'hover inks the hairline' },
	{ example: 'Danger', hover: 'role=button[name="hold to revoke"]', wait: 400, shot: true, label: 'hover rolls the label to Hold' },
	{ example: 'Danger', hold: 'role=button[name="hold to revoke"]', ms: 1500, wait: 200, shot: true, label: 'a full hold ends on the check' },
	{ example: 'Danger', reload: true, focus: 'role=button[name="hold to revoke"]', down: 'Space', wait: 1400, shot: true, label: 'Space held from the keyboard confirms' },
	{ example: 'Ghost', click: 'role=button[name="Sync now"]', wait: 200, shot: true, label: 'a click disables it while it syncs' },
	{ example: 'Product', focus: 'role=button[name="Create key"]', key: 'Tab', label: 'Tab moves to the next button' },
]
