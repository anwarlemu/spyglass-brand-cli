// A click opens the chip's radio list on Any; picking a row names it in the chip and closes; arrows move; Escape closes
// and returns focus; ArrowUp on the chip opens it on the last row; a click outside closes.
export default [
	{ click: 'role=button[name="App"]', wait: 400, shot: true, label: 'a click opens the list, Any checked' },
	{ click: 'role=menuitemradio[name="Notion"]', wait: 400, shot: true, label: 'picking Notion names it and closes' },
	{ focus: 'role=button[name="Type"]', key: 'ArrowDown', wait: 300, label: 'ArrowDown opens Type on Any' },
	{ key: 'ArrowDown', label: 'to Message' },
	{ key: 'ArrowDown', label: 'to Page' },
	{ key: 'Enter', wait: 400, shot: true, label: 'Enter picks Page' },
	{ key: 'ArrowUp', wait: 300, shot: true, label: 'ArrowUp opens it on File, Page checked' },
	{ key: 'Home', label: 'Home to Any' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus on the chip' },
	{ click: 'role=button[name="App: Notion"]', wait: 400, label: 'open App again' },
	{ click: 'role=menuitemradio[name="Any app"]', wait: 400, shot: true, label: 'Any clears it' },
	{ click: 'role=button[name="App"]', wait: 400, label: 'open App' },
	{ clickAt: [1300, 600], wait: 300, label: 'a click outside closes it' },
]
