// The names are links in order from the keyboard; a click stays on the page (the app opens the source).
export default [
	{ example: 'Product', focus: 'role=link[name=/Acme drive/]', key: 'Tab', label: 'Tab to the next source' },
	{ example: 'Product', key: 'Tab', wait: 300, shot: true, label: 'Tab to Wiki, ringed' },
	{ example: 'Product', click: 'role=link[name=/Support inbox/]', wait: 300, shot: true, label: 'a click stays on the page' },
]
