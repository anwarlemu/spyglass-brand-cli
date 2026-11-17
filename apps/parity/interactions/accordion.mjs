// One open at a time: a press on another row opens it and closes the first, a second press closes it; Enter and Space
// from the keyboard do the same, and Tab skips the closed answers. With `multiple`, rows stay open together.
export default [
	{ example: 'Product', click: 'role=button[name="What are the limits on a namespace?"]', wait: 500, shot: true, label: 'a press opens another row and closes the first' },
	{ example: 'Product', click: 'role=button[name="What are the limits on a namespace?"]', wait: 500, shot: true, label: 'a second press closes it' },
	{ example: 'Product', hover: 'role=button[name="Which regions can a namespace live in?"]', wait: 300, shot: true, label: 'the row under the pointer turns ink' },
	{ example: 'Product', focus: 'role=button[name="How long are deleted documents kept?"]', key: 'Enter', wait: 500, label: 'Enter opens a row' },
	{ example: 'Product', key: 'Tab', label: 'Tab skips nothing open but the next row' },
	{ example: 'Product', key: 'Space', wait: 500, shot: true, label: 'Space opens the focused row' },
	{ example: 'Multiple', click: 'role=button[name="Connect a source"]', wait: 500, shot: true, label: 'a second row opens beside the first' },
	{ example: 'Multiple', click: 'role=button[name="Create an API key"]', wait: 500, shot: true, label: 'the first closes on its own' },
	{ example: 'Multiple', focus: 'role=button[name="Run a search"]', key: 'Enter', wait: 500, shot: true, label: 'Enter opens the third' },
]
