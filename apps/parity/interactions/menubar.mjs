// One trigger in the tab order; Left and Right move along the bar; Down opens a menu on its first row, Up on its last;
// with a menu open, Right opens the next one; Escape closes and returns focus to the trigger; a click opens a menu and
// pointing at another trigger switches to it; Enter on a row picks it; a press outside closes.
export default [
	{ focus: 'role=menuitem[name="Board"]', label: 'focus the first trigger' },
	{ key: 'ArrowRight', label: 'Right moves to View' },
	{ key: 'ArrowRight', label: 'Right moves to Share' },
	{ key: 'ArrowRight', label: 'Right wraps to Board' },
	{ key: 'ArrowLeft', label: 'Left wraps to Share' },
	{ key: 'ArrowLeft', label: 'Left moves to View' },
	{ key: 'ArrowDown', wait: 300, shot: true, label: 'Down opens View on its first row' },
	{ key: 'ArrowDown', label: 'Down to Longest running' },
	{ key: 'Enter', wait: 300, label: 'Enter picks it and closes, focus on the trigger' },
	{ key: 'ArrowUp', wait: 300, shot: true, label: 'Up opens View on its last row, Longest running checked' },
	{ key: 'ArrowRight', wait: 300, shot: true, label: 'Right opens Share on its first row' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus on Share' },
	{ key: 'Tab', wait: 200, label: 'Tab leaves the bar' },
	{ click: 'role=menuitem[name="Board"]', wait: 500, shot: true, label: 'a click opens Board' },
	{ hover: 'role=menuitem[name=/Delete board/]', wait: 300, shot: true, label: 'the row under the pointer fills' },
	{ hover: 'role=menuitem[name="View"]', wait: 400, shot: true, label: 'pointing at View switches to it' },
	{ clickAt: [1300, 600], wait: 400, label: 'a press outside closes it' },
]
