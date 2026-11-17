// A click opens the menu downward with the credits on top; arrows move between its rows; Escape closes and returns
// focus to the row; ArrowDown on the row opens it on its first item; Enter on Sign out keeps it open on "Signing out";
// a click outside closes it.
export default [
	{ click: 'role=button[name=/you@acme.com/]', wait: 400, shot: true, label: 'a click opens it, the credits on top' },
	{ hover: 'role=menuitem[name=/Sign-in and security/]', wait: 300, shot: true, label: 'the row under the pointer takes the marker' },
	{ clickAt: [1300, 600], wait: 300, label: 'a click outside closes it' },
	{ focus: 'role=button[name=/you@acme.com/]', key: 'ArrowDown', wait: 300, label: 'ArrowDown on the row opens it on its first item' },
	{ key: 'ArrowDown', label: 'ArrowDown to Sign out' },
	{ key: 'ArrowDown', label: 'ArrowDown wraps' },
	{ key: 'End', label: 'End to Sign out' },
	{ key: 'Escape', wait: 300, label: 'Escape closes it, focus on the row' },
	{ key: 'ArrowUp', wait: 300, label: 'ArrowUp opens it on Sign out' },
	{ key: 'Enter', wait: 300, shot: true, label: 'Enter on Sign out keeps it open, signing out' },
]
