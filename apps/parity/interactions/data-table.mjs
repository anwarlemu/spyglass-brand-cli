// Heads sort up, down and off; a filter menu narrows the rows and starts the pages over; Previous and Next page.
export default [
	{ click: 'role=button[name=/^Days running/]', wait: 300, shot: true, label: 'a head sorts up' },
	{ key: 'Enter', wait: 300, shot: true, label: 'Enter on it sorts down' },
	{ key: 'Space', wait: 300, label: 'Space lets the sort go' },
	{ click: 'role=button[name="Next"]', wait: 300, shot: true, label: 'Next shows the second page' },
	{ click: 'role=button[name=/^Format: Any/]', wait: 400, shot: true, label: 'a filter opens its menu' },
	{ click: 'role=menuitemradio[name="Carousel"]', wait: 400, shot: true, label: 'a pick filters and starts the pages over' },
	{ click: 'role=button[name=/^Status: Any/]', wait: 400, label: 'the other filter' },
	{ click: 'role=menuitemradio[name="Paused"]', wait: 400, shot: true, label: 'fewer rows, no pages' },
	{ click: 'role=button[name="Clear filters"] >> nth=0', wait: 400, shot: true, label: 'Clear filters' },
	{ hover: 'role=button[name=/^Spend/]', wait: 300, shot: true, label: 'hover on a sortable head' },
]
