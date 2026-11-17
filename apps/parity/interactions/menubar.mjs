// One trigger in the tab order; Left and Right move along the bar; Down opens a menu on its first row, Up on its last;
// with a menu open, Right opens the next one; Escape closes and returns focus to the trigger; a click opens a menu and
// pointing at another trigger switches to it; Enter on a row picks it; a press outside closes.
export default [
	{ focus: 'role=menuitem[name="Add"]', label: 'focus the first trigger' },
	{ key: 'ArrowRight', label: 'Right moves to Namespace' },
	{ key: 'ArrowRight', label: 'Right moves to View' },
	{ key: 'ArrowRight', label: 'Right wraps to Add' },
	{ key: 'ArrowLeft', label: 'Left wraps to View' },
	{ key: 'ArrowDown', wait: 300, shot: true, label: 'Down opens View on its first row' },
	{ key: 'ArrowDown', label: 'Down to Title' },
	{ key: 'Enter', wait: 300, label: 'Enter picks Title and closes, focus on the trigger' },
	{ key: 'ArrowUp', wait: 300, shot: true, label: 'Up opens View on its last row, Title checked' },
	{ key: 'ArrowRight', wait: 300, shot: true, label: 'Right opens Add on its first row' },
	{ key: 'ArrowLeft', wait: 300, label: 'Left opens View again' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus on View' },
	{ key: 'Tab', wait: 200, label: 'Tab leaves the bar' },
	{ key: 'Shift+Tab', wait: 200, label: 'Shift+Tab comes back to View, the trigger in the tab order' },
	{ click: 'role=menuitem[name="Add"]', wait: 500, shot: true, label: 'a click opens Add' },
	{ hover: 'role=menuitem[name="Namespace"]', wait: 400, shot: true, label: 'pointing at Namespace switches to it' },
	{ hover: 'role=menuitem[name=/Delete namespace/]', wait: 300, shot: true, label: 'the row under the pointer turns red' },
	{ clickAt: [1300, 600], wait: 400, label: 'a press outside closes it' },
	{ click: 'role=menuitem[name="Namespace"]', wait: 400, label: 'open Namespace' },
	{ click: 'role=menuitem[name="Namespace"]', wait: 400, label: 'a second click closes it' },
]
