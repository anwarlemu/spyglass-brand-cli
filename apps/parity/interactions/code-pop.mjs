// Show code opens the code on its own line (the label swaps, the chevron turns); Hide code folds it; Enter toggles from
// the keyboard; Tab reaches the code's Copy once open.
export default [
	{ example: 'Product', hover: 'role=button[name="Show code"]', wait: 300, shot: true, label: 'hover rings the button' },
	{ example: 'Product', click: 'role=button[name="Show code"]', wait: 600, shot: true, label: 'Show code opens the code' },
	{ example: 'Product', key: 'Tab', label: 'Tab to the code window\'s Copy' },
	{ example: 'Product', click: 'role=button[name="Hide code"]', wait: 500, shot: true, label: 'Hide code folds it' },
	{ example: 'OpensInPlace', focus: 'role=button[name="Hide code"]', key: 'Enter', wait: 500, shot: true, label: 'Enter folds the open code' },
	{ example: 'OpensInPlace', key: 'Enter', wait: 600, shot: true, label: 'Enter opens it again' },
]
