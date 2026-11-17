// Queries: pointing at a number shows its part, a press pins it, the tabs cross over to latency; a sidebar link is
// the page you are on.
export default [
	{ hover: 'role=button[name=/^Today/]', wait: 500, shot: true, label: 'point at Today' },
	{ click: 'role=button[name=/^Search p50/]', wait: 700, shot: true, label: 'pin latency' },
	{ click: 'role=button[name=/^Search p50/]', wait: 700, label: 'unpin' },
	{ click: 'role=tab[name="Latency"]', wait: 700, shot: true, label: 'Latency tab' },
	{ click: 'role=tab[name="Volume"]', wait: 700, shot: true, label: 'Volume tab' },
	{ hover: 'role=button[name="Create API key"]', wait: 500, shot: true, label: 'hover Create API key' },
]
