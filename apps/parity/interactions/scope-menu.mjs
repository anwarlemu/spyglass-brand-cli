// The scope menu filters past six, the select jumps by typing and skips what is disabled, the combobox filters.
export default [
	{ example: 'Product', click: 'role=button[name=/search in/]', wait: 500, shot: true, label: 'a click opens it on the filter' },
	{ example: 'Product', type: 'co', wait: 300, shot: true, label: 'typing narrows the list' },
	{ example: 'Product', key: 'ArrowDown', label: 'ArrowDown moves the marker' },
	{ example: 'Product', key: 'Enter', wait: 400, shot: true, label: 'Enter picks, the chip shows it in mono' },
	{ example: 'Product', key: 'ArrowDown', wait: 300, label: 'ArrowDown on the chip opens it again' },
	{ example: 'Product', key: 'Escape', wait: 300, label: 'Escape closes it, focus back on the chip' },
	{ example: 'Select', focus: 'role=button[name="region"]', key: 'ArrowDown', wait: 300, shot: true, label: 'ArrowDown opens on the pick' },
	{ example: 'Select', key: 'End', label: 'End skips the disabled last option' },
	{ example: 'Select', type: 'eu', wait: 100, label: 'typing jumps to EU Central' },
	{ example: 'Select', key: 'Enter', wait: 400, shot: true, label: 'Enter picks it' },
	{ example: 'Combobox', click: 'role=button[name="model"]', wait: 400, label: 'a click opens it on the filter' },
	{ example: 'Combobox', type: 'rerank', wait: 300, shot: true, label: 'typing narrows to the rerankers' },
	{ example: 'Combobox', type: 'zzz', wait: 300, shot: true, label: 'nothing matches says so' },
	{ example: 'Combobox', key: 'Escape', wait: 300, label: 'Escape closes it' },
]
