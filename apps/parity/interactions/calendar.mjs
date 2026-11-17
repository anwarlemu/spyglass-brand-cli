// The roving day: arrows move a day or a week, Home and End to the week's ends, Page Down a month, Enter picks;
// the arrow buttons change the month; Tab leaves the grid.
export default [
	{ example: 'Single', focus: 'role=button[name=/November 20, 2026/]', label: 'focus the picked day' },
	{ example: 'Single', key: 'ArrowRight', label: 'ArrowRight moves a day' },
	{ example: 'Single', key: 'ArrowDown', label: 'ArrowDown moves a week' },
	{ example: 'Single', key: 'Home', label: 'Home to the week start' },
	{ example: 'Single', key: 'End', label: 'End to the week end' },
	{ example: 'Single', key: 'PageDown', wait: 200, shot: true, label: 'Page Down to December' },
	{ example: 'Single', key: 'Enter', wait: 300, shot: true, label: 'Enter picks the day (White fill)' },
	{ example: 'Single', click: 'role=button[name="Previous month"]', wait: 300, shot: true, label: 'the arrow goes back a month' },
	{ example: 'Single', hover: 'role=button[name=/November 12, 2026/]', wait: 300, shot: true, label: 'hover fills a day #262626' },
	{ example: 'Window', click: 'role=button[name=/Sunday, November 22, 2026/]', wait: 300, shot: true, label: 'a blocked Sunday does nothing' },
	{ example: 'Window', click: 'role=button[name=/Thursday, November 26, 2026/]', wait: 300, shot: true, label: 'an open day is picked' },
]
