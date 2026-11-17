// The split button: Copy prompt copies (Copied, the red held), the arrow opens the installs, Escape closes them; the
// pager: next and previous move the page and disable the ends; the button under the pointer sits on top.
export default [
	{ example: 'Product', hover: 'role=button[name="Page 2 of 4"]', wait: 300, shot: true, label: 'the middle button under the pointer, its edge whole' },
	{ example: 'Product', click: 'role=button[name="next page"]', wait: 300, shot: true, label: 'next page' },
	{ example: 'Product', click: 'role=button[name="next page"]', wait: 300, shot: true, label: 'next page again: the end disables it' },
	{ example: 'Product', click: 'role=button[name="previous page"]', wait: 300, label: 'previous page' },
	{ example: 'Product', click: 'role=button[name=/Copy prompt/]', wait: 500, shot: true, label: 'Copy prompt copies' },
	{ example: 'Product', click: 'role=button[name="other ways to connect"]', wait: 500, shot: true, label: 'the arrow opens the installs' },
	{ example: 'Product', key: 'Escape', wait: 300, shot: true, label: 'Escape closes them' },
	{ example: 'Product', focus: 'role=button[name="other ways to connect"]', key: 'ArrowDown', wait: 300, label: 'ArrowDown opens on the first row' },
	{ example: 'Product', key: 'Escape', wait: 300, label: 'Escape again' },
]
