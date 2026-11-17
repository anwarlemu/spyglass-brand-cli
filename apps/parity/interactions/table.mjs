// A row opens in place under a click (its chevron turns over); another row closes it as it opens; Enter and Space
// toggle from the keyboard; a row takes the paper under the pointer.
export default [
	{ example: 'Product', hover: 'role=row[name=/slack/]', wait: 300, shot: true, label: 'a row under the pointer' },
	{ example: 'Product', click: 'role=row[name=/contracts/]', wait: 400, shot: true, label: 'a click opens the row' },
	{ example: 'Product', click: 'role=row[name=/crm/]', wait: 400, shot: true, label: 'another row closes it as it opens' },
	{ example: 'Product', focus: 'role=row[name=/support/]', key: 'Enter', wait: 400, shot: true, label: 'Enter opens a row' },
	{ example: 'Product', key: 'Space', wait: 400, shot: true, label: 'Space closes it' },
	{ example: 'Settings', focus: 'role=button[name="Manage"] >> nth=0', key: 'Tab', label: 'Tab to the next Manage' },
]
