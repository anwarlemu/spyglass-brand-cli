// Show more lands five more lines (the list tweens taller, then scrolls inside its window past six and runs down to
// the new lines); again for the last four; then the list takes focus and scrolls from the keyboard.
export default [
	{ example: 'ShowMore', click: 'role=button[name="Show 5 more"]', wait: 1200, shot: true, label: 'Show more lands five more' },
	{ example: 'ShowMore', click: 'role=button[name="Show 4 more"]', wait: 1200, shot: true, label: 'Show more lands the last four' },
	{ example: 'ShowMore', focus: 'role=region[name="credits added"]', key: 'Home', wait: 1200, shot: true, label: 'Home runs the list back to the top' },
	{ example: 'ShowMore', hover: 'role=region[name="credits added"]', wait: 400, shot: true, label: 'pointing at it shows the slim bar' },
]
