// A row that opens something fills to the card's edge under the pointer, its chevron darkening; Tab moves along the
// rows and to a row's tool.
export default [
	{ example: 'Product', hover: 'role=link[name=/Members/]', wait: 300, shot: true, label: 'a link row fills under the pointer' },
	{ example: 'Product', focus: 'role=button[name="Rotate"]', key: 'Tab', label: 'Tab from the tool to the first link row' },
	{ example: 'Product', key: 'Tab', wait: 300, shot: true, label: 'Tab to the next row, ringed' },
	{ example: 'Sources', hover: 'role=link[name=/Acme Slack/]', wait: 300, shot: true, label: 'a source row under the pointer' },
]
