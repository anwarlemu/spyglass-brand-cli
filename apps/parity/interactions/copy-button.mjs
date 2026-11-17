// A click copies: the label swaps to Copied and the check draws; it swaps back after 1.5s. Enter copies from the
// keyboard; hover inks the hairline.
export default [
	{ example: 'Key', hover: 'role=button[name="Copy"]', wait: 300, shot: true, label: 'hover inks the hairline' },
	{ example: 'Key', click: 'role=button[name="Copy"]', wait: 600, shot: true, label: 'a click copies: Copied, the check drawn' },
	{ example: 'Key', wait: 1600, shot: true, label: 'back to Copy after 1.5s' },
	{ example: 'Endpoint', focus: 'role=button[name="Copy"]', key: 'Enter', wait: 600, shot: true, label: 'Enter copies' },
]
