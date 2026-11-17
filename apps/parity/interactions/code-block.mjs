// A pill picks the language; Copy swaps to Copied in one cell; the code takes focus to scroll.
export default [
	{ example: 'Product', click: 'role=tab[name="Python"]', wait: 300, shot: true, label: 'Python shows the Python sample' },
	{ example: 'Product', hover: 'role=tab[name="TypeScript"]', wait: 300, shot: true, label: 'hover lights a pill' },
	{ example: 'Product', click: 'role=button[name=/Copy/]', wait: 500, shot: true, label: 'Copy swaps to Copied' },
	{ example: 'Product', focus: 'role=tab[name="cURL"]', key: 'Enter', wait: 300, shot: true, label: 'Enter on cURL picks it' },
	{ example: 'Product', key: 'Tab', label: 'Tab to the next pill' },
	{ example: 'Single', focus: 'role=button[name=/Copy/]', key: 'Enter', wait: 500, shot: true, label: 'Enter copies the command' },
	{ example: 'Single', key: 'Tab', wait: 300, shot: true, label: 'Tab to the code, ringed' },
]
