// A right-click on a row opens the menu at the pointer, naming the row; arrows, Home and End move; Escape closes it.
// Shift+F10 on a focused row opens it at once on its first row; Enter picks a row (a toast says so) and closes it; a
// press outside closes it; Tab out closes it.
export default [
	{ click: 'text=Order form, 2026 renewal', button: 'right', wait: 500, shot: true, label: 'a right-click opens it at the pointer' },
	{ key: 'ArrowDown', label: 'ArrowDown to the first row' },
	{ key: 'ArrowDown', label: 'ArrowDown again' },
	{ key: 'End', label: 'End jumps to Delete' },
	{ key: 'ArrowDown', label: 'ArrowDown wraps to Open' },
	{ key: 'Home', wait: 200, shot: true, label: 'Home stays on Open' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it' },
	{ focus: 'text=Data processing addendum', key: 'Shift+F10', wait: 300, shot: true, label: 'Shift+F10 opens it under the row, on Open' },
	{ key: 'ArrowDown', label: 'to Copy ID' },
	{ key: 'Enter', wait: 600, shot: true, label: 'Enter copies (a toast) and closes, focus back on the row' },
	{ key: 'Shift+F10', wait: 300, label: 'open again' },
	{ key: 'Tab', wait: 300, label: 'Tab closes it' },
	{ click: 'text=Master services agreement', button: 'right', wait: 500, label: 'open with a right-click' },
	{ hover: 'role=menuitem[name=/Delete/]', wait: 300, shot: true, label: 'the row under the pointer turns red' },
	{ clickAt: [1300, 600], wait: 300, label: 'a press outside closes it' },
]
