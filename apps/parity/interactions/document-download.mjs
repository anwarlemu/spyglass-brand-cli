// The mark downloads: the dot matrix while it works, then the check, and the button says Downloaded too, as the state
// is the document's (focusing it records its name, "Download downloaded"); then both clear; the button downloads the
// same way, from the keyboard, and says Downloaded itself.
export default [
	{ example: 'Product', hover: 'role=button[name="download handbook-security"]', wait: 300, shot: true, label: 'the mark inks under the pointer' },
	{ example: 'Product', click: 'role=button[name="download handbook-security"]', wait: 300, shot: true, label: 'the dot matrix while it works' },
	{ example: 'Product', focus: 'role=button[name=/^Download/]', wait: 500, shot: true, label: 'the check on the mark, and the button says Downloaded' },
	{ example: 'Product', wait: 2000, shot: true, label: 'both clear' },
	{ example: 'Product', focus: 'role=button[name=/^Download/]', key: 'Enter', wait: 900, shot: true, label: 'Enter on the button downloads: Downloaded' },
]
