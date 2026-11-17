// Next and previous move the audit log's page and grey the ends; Show more adds five, then the last two, then goes.
export default [
	{ example: 'Product', click: 'role=button[name="Next page"]', wait: 300, shot: true, label: 'next page' },
	{ example: 'Product', click: 'role=button[name="Previous page"]', wait: 300, shot: true, label: 'back to the first, previous greys' },
	{ example: 'Product', focus: 'role=button[name="Next page"]', key: 'Enter', wait: 200, label: 'Enter moves on' },
	{ example: 'Product', key: 'Enter', wait: 200, label: 'and on' },
	{ example: 'Product', key: 'Enter', wait: 200, label: 'and on' },
	{ example: 'Product', key: 'Enter', wait: 300, shot: true, label: 'the last page greys next' },
	{ example: 'Product', hover: 'role=button[name="Show 5 more"]', wait: 300, shot: true, label: 'Show more darkens under the pointer' },
	{ example: 'Product', click: 'role=button[name="Show 5 more"]', wait: 300, shot: true, label: 'five more' },
	{ example: 'Product', focus: 'role=button[name="Show 2 more"]', key: 'Enter', wait: 300, shot: true, label: 'Enter shows the last two; Show more goes' },
]
