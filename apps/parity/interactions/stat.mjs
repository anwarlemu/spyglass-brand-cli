// Press a stat to pin it: the pinned one fills and takes the red edge; hover fills the others.
export default [
	{ example: 'Product', click: 'role=button[name=/Today/]', wait: 300, shot: true, label: 'a click pins Today' },
	{ example: 'Product', focus: 'role=button[name=/Search p50/]', key: 'Enter', wait: 300, shot: true, label: 'Enter pins the latency' },
	{ example: 'Product', hover: 'role=button[name=/This month/]', wait: 300, shot: true, label: 'hover fills it' },
]
