// Searches: a row opens in place to what the agent read and closes again; the filter narrows the log (and an empty
// filter says so); Show more adds the next rows.
export default [
	{ click: 'role=button[name=/notice period to terminate/]', wait: 500, shot: true, label: 'open a search' },
	{ click: 'role=button[name=/^refund policy/]', wait: 500, shot: true, label: 'open another' },
	{ click: 'role=button[name=/^refund policy/]', wait: 500, label: 'close it' },
	{ click: 'role=tab[name="Weak match"]', wait: 500, shot: true, label: 'weak matches' },
	{ click: 'role=tab[name="Failed"]', wait: 500, shot: true, label: 'failed' },
	{ click: 'role=tab[name="All"]', wait: 500, label: 'all again' },
]
