// Create the key: step 1 folds to its line and step 2 opens; its head opens step 1 again; on to step 3 and back to
// the start; the keyboard opens a reached step.
export default [
	{ example: 'Product', click: 'role=button[name="Create key"]', wait: 400, shot: true, label: 'Create key folds step 1, opens step 2' },
	{ example: 'Product', click: 'role=button[name=/Create a key/]', wait: 400, shot: true, label: 'the head opens step 1 again' },
	{ example: 'Product', click: 'role=button[name=/Create a key/]', wait: 400, shot: true, label: 'and folds it' },
	{ example: 'Product', focus: 'role=button[name=/Give the prompt/]', key: 'Enter', wait: 400, shot: true, label: 'Enter opens step 2' },
	{ example: 'Product', click: 'role=button[name="Copy prompt"]', wait: 400, shot: true, label: 'Copy prompt opens step 3' },
	{ example: 'Product', key: 'Tab', label: 'Tab moves into step 3' },
	{ example: 'Product', click: 'role=button[name="Start again"]', wait: 400, shot: true, label: 'Start again opens step 1' },
]
