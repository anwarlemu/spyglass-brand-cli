// The notes' buttons take focus and hover as buttons do.
export default [
	{ example: 'Notes', focus: 'role=button[name="Undo"]', wait: 200, shot: true, label: 'Undo takes focus' },
	{ example: 'Notes', key: 'Tab', wait: 200, shot: true, label: 'Tab to Dismiss' },
	{ example: 'Notes', hover: 'role=button[name="Dismiss"] >> nth=1', wait: 300, shot: true, label: 'hover fills the close button' },
]
