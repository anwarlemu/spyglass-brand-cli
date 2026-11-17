// The arrows move it a slide at a time (smooth scroll), the arrow keys on the focused track do too, and the place
// between the arrows follows.
export default [
	{ click: 'role=button[name="next ways to add data"]', wait: 900, shot: true, label: 'next' },
	{ click: 'role=button[name="next ways to add data"]', wait: 900, shot: true, label: 'next again: the end' },
	{ click: 'role=button[name="previous ways to add data"]', wait: 900, shot: true, label: 'previous' },
	{ focus: 'role=region[name="ways to add data"] >> [tabindex="0"]', key: 'ArrowLeft', wait: 900, shot: true, label: 'arrow key back to the start' },
	{ key: 'ArrowRight', wait: 900, shot: true, label: 'arrow key forward' },
]
