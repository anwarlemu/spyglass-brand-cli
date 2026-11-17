// The block appears under the first row the pointer reaches, glides to the next, rests on the picked row when the
// pointer leaves, and follows keyboard focus.
export default [
	{ hover: 'role=button[name="Documents"]', wait: 400, shot: true, label: 'first placement' },
	{ hover: 'role=button[name="Storage"]', wait: 400, shot: true, label: 'glides down' },
	{ click: 'role=button[name="Storage"]', wait: 300, shot: true, label: 'pick Storage' },
	{ hover: 'role=button[name="Indexing"]', wait: 400, label: 'back up' },
	{ clickAt: [1400, 880], wait: 400, shot: true, label: 'pointer leaves: rests on Storage' },
	{ focus: 'role=button[name="Queries"]', key: 'Tab', wait: 400, shot: true, label: 'focus moves it' },
]
