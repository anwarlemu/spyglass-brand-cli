// The tiles filter the list (a red line across the picked one); a row under the pointer glides the block there and
// the window shows it; Add questions opens in place; Run again plays a sample run.
export default [
	{ click: 'role=button[name=/^To look at/]', wait: 600, shot: true, label: 'filter: to look at' },
	{ hover: 'role=button[name=/EU customers/]', wait: 600, shot: true, label: 'point at a question' },
	{ click: 'role=button[name=/^Conare/]', wait: 600, label: 'back to all' },
	{ click: 'role=button[name="Add questions"]', wait: 600, shot: true, label: 'Add questions opens' },
	{ click: 'role=button[name="close"]', wait: 600, label: 'close it' },
	{ click: 'role=button[name="Run again"]', wait: 400, shot: true, label: 'run again' },
	{ wait: 1400, shot: true, label: 'run done' },
]
