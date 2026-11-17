// Actions opens with the page. Arrows move through its rows, Home and End jump, Escape closes it and returns focus to
// the trigger, ArrowDown from the trigger opens it on the first row, ArrowUp on the last, Enter on a row picks it, Tab
// and a click outside close it. Sort picks a radio row and the trigger says so.
export default [
	{ example: 'Actions', reload: true, focus: 'role=menuitem[name=/Copy link/]', label: 'focus a row (the menu open again)' },
	{ example: 'Actions', key: 'ArrowDown', label: 'ArrowDown moves down' },
	{ example: 'Actions', key: 'End', label: 'End jumps to the last row' },
	{ example: 'Actions', key: 'ArrowDown', label: 'ArrowDown wraps to the first' },
	{ example: 'Actions', key: 'Home', label: 'Home jumps to the first row' },
	{ example: 'Actions', key: 'Escape', wait: 300, shot: true, label: 'Escape closes and returns focus to the trigger' },
	{ example: 'Actions', key: 'ArrowDown', wait: 300, shot: true, label: 'ArrowDown on the trigger opens on the first row' },
	{ example: 'Actions', key: 'ArrowUp', label: 'ArrowUp wraps to the last' },
	{ example: 'Actions', key: 'Tab', wait: 300, label: 'Tab closes it' },
	{ example: 'Actions', click: 'role=button[name=/Actions/]', wait: 400, shot: true, label: 'a click opens it, no row focused' },
	{ example: 'Actions', hover: 'role=menuitem[name=/Download/]', wait: 300, shot: true, label: 'the row under the pointer takes the #262626 fill' },
	{ example: 'Actions', clickAt: [1300, 600], wait: 300, label: 'a click outside closes it' },
	{ example: 'Sort', click: 'role=button[name=/Sort/]', wait: 400, shot: true, label: 'a click opens the sort menu' },
	{ example: 'Sort', click: 'role=menuitemradio[name=/Most engagement/]', wait: 300, shot: true, label: 'picking a row checks it and the trigger says so' },
]
