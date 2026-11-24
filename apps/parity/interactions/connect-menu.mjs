// A click opens the panel on the first row; the pill follows the pointer; the copy row swaps to its done state;
// Escape closes it and gives focus back; from the keyboard it opens at once on the first row and arrows move.
export default [
	{ example: 'Default', click: 'role=button[name=/Connect to MCP/]', wait: 400, shot: true, label: 'a click opens the panel, the pill on the first row' },
	{ example: 'Default', hover: 'role=link[name=/Acme Assistant/]', wait: 300, shot: true, label: 'the pill slides to the row under the pointer, its Open turns White' },
	{ example: 'Default', click: 'role=button[name=/Copy prompt/]', wait: 400, shot: true, label: 'the copy row turns to Prompt copied' },
	{ example: 'Default', key: 'Escape', wait: 300, shot: true, label: 'Escape closes it, focus back on the button' },
	{ example: 'Default', key: 'Enter', wait: 200, shot: true, label: 'Enter opens it at once, focus on the first row' },
	{ example: 'Default', key: 'ArrowDown', wait: 300, label: 'ArrowDown moves to the next row' },
	{ example: 'Default', key: 'End', wait: 300, shot: true, label: 'End jumps to the copy row' },
	{ example: 'Default', key: 'Tab', wait: 300, label: 'Tab out closes it' },
	{ example: 'Up', click: 'role=button[name=/Connect to MCP/]', wait: 400, shot: true, label: 'the panel opens above' },
	{ example: 'Up', clickAt: [20, 20], wait: 300, shot: true, label: 'a click outside closes it' },
]
