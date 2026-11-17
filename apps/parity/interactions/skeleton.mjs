// The rows are held for three seconds as the page loads, then land; Reload holds them again (the rules come in after
// 300ms) and they land again.
export default [
	{ example: 'Product', wait: 3000, shot: true, label: 'the rows land' },
	{ example: 'Product', click: 'role=button[name="Reload"]', wait: 500, shot: true, label: 'Reload holds them, the rules come in' },
	{ example: 'Product', wait: 2900, shot: true, label: 'they land again' },
]
