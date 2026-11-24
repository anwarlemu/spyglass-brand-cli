// A click picks a tab and the line slides under it; arrows, Home and End move between tabs; the copy button turns to
// Copied (in the headless browser the clipboard may refuse, in which case the code is selected instead).
export default [
	{ example: 'Tabs', click: 'role=tab[name="TypeScript"]', wait: 400, shot: true, label: 'a click picks TypeScript, the line slides under it' },
	{ example: 'Tabs', key: 'ArrowRight', wait: 400, shot: true, label: 'ArrowRight moves to Python' },
	{ example: 'Tabs', key: 'ArrowRight', wait: 400, label: 'ArrowRight wraps to cURL' },
	{ example: 'Tabs', key: 'End', wait: 400, label: 'End jumps to the last tab' },
	{ example: 'Tabs', key: 'Home', wait: 400, shot: true, label: 'Home jumps to the first tab' },
	{ example: 'Tabs', hover: 'role=tab[name="Python"]', wait: 300, shot: true, label: 'a tab under the pointer turns the soft gray' },
]
