// Category: a click opens the list with focus in the filter; arrows move the highlight; typing filters; Enter picks and
// closes, focus back on the trigger and the line under it says so; ArrowDown on the trigger opens it again; Escape
// closes it. Format: a plain listbox; a letter jumps to the option it starts; Enter picks.
export default [
	{ example: 'Category', click: 'role=button[name="Category"]', wait: 400, shot: true, label: 'a click opens the list, focus in the filter' },
	{ example: 'Category', key: 'ArrowDown', label: 'ArrowDown moves the highlight' },
	{ example: 'Category', key: 'ArrowDown', wait: 200, shot: true, label: 'ArrowDown again' },
	{ example: 'Category', type: 'app', wait: 300, shot: true, label: 'typing filters to Apparel' },
	{ example: 'Category', key: 'Enter', wait: 400, shot: true, label: 'Enter picks it and closes' },
	{ example: 'Category', key: 'ArrowDown', wait: 400, label: 'ArrowDown on the trigger opens it on the pick' },
	{ example: 'Category', key: 'Escape', wait: 300, label: 'Escape closes it, focus on the trigger' },
	{ example: 'Format', click: 'role=button[name="Format"]', wait: 400, shot: true, label: 'a click opens the listbox' },
	{ example: 'Format', key: 'c', wait: 200, label: 'c jumps to Carousel' },
	{ example: 'Format', hover: 'role=option[name=/Image/]', wait: 300, shot: true, label: 'the pointer moves the highlight' },
	{ example: 'Format', key: 'Enter', wait: 400, shot: true, label: 'Enter picks and closes' },
]
