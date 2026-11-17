// Parse: pick a file to try and the reading follows (the dot matrix while it reads); pick a namespace and add the
// reading to it; the API call opens in place.
export default [
	{ click: 'role=button[name=/^Scanned contract/]', wait: 1000, shot: true, label: 'read the scan' },
	{ click: 'role=button[name=/^Supplier invoice/]', wait: 1000, shot: true, label: 'read the invoice' },
	{ click: 'role=button[name="API call"]', wait: 500, shot: true, label: 'open the API call' },
	{ key: 'Escape', wait: 400, label: 'close it' },
	{ click: 'role=button[name="add to"]', wait: 400, shot: true, label: 'open the namespaces' },
	{ click: 'role=option[name=/^contracts/]', wait: 400, label: 'pick contracts' },
	{ click: 'role=button[name="Add to namespace"]', wait: 400, shot: true, label: 'add it' },
]
