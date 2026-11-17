// The block appears under the first chip pointed at, glides to the next, fades when the pointer leaves; focus moves it
// too; a click or Enter asks.
export default [
	{ example: 'Product', hover: 'role=button[name=/notice period/]', wait: 300, shot: true, label: 'the block appears under the chip' },
	{ example: 'Product', hover: 'role=button[name=/breach notification/]', wait: 400, shot: true, label: 'it glides to the next' },
	{ example: 'Product', clickAt: [8, 8], wait: 300, shot: true, label: 'it fades when the pointer leaves' },
	{ example: 'Product', focus: 'role=button[name=/cash on hand/]', wait: 300, shot: true, label: 'focus places it' },
	{ example: 'Product', key: 'Enter', wait: 200, shot: true, label: 'Enter asks' },
	{ example: 'Product', click: 'role=button[name=/notice period/]', wait: 300, shot: true, label: 'a click asks' },
]
