// A team picked by pointer takes the frame and its window's parts rise again; the arrow keys move along the tabs.
export default [
	{ click: 'role=tab[name="Finance"]', wait: 1600, shot: true, label: 'pick Finance' },
	{ focus: 'role=tab[name="Finance"]', key: 'ArrowRight', wait: 1600, shot: true, label: 'arrow to Engineering' },
	{ key: 'End', wait: 1600, shot: true, label: 'End to Legal' },
]

// The tab timer is an animation: screenshots let it run, so the settled shot does not end it (and advance the tab).
export const settle = false
