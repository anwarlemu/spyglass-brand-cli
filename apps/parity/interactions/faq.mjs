// Wide: a question under the pointer takes the lighter ground, a click opens its answer and moves the red mark, the
// arrows, Home and End move between questions, and the ground fades when the pointer leaves. (The phone accordion
// shows at 390, where steps do not run; its rows are tried from the wide page's hidden list only by their markup.)
export default [
	{ example: 'Site', hover: 'role=tab[name=/Which part should I use/]', wait: 400, shot: true, label: 'the pointer takes the lighter ground' },
	{ example: 'Site', hover: 'role=tab[name=/Is my data used/]', wait: 400, shot: true, label: 'it glides to the next question' },
	{ example: 'Site', click: 'role=tab[name=/Is my data used/]', wait: 400, shot: true, label: 'a click opens its answer' },
	{ example: 'Site', key: 'ArrowDown', wait: 400, shot: true, label: 'ArrowDown moves to the next question' },
	{ example: 'Site', key: 'End', wait: 400, label: 'End jumps to the last' },
	{ example: 'Site', key: 'ArrowDown', wait: 400, label: 'ArrowDown wraps to the first' },
	{ example: 'Site', key: 'Home', wait: 400, label: 'Home stays on the first' },
	{ example: 'Site', key: 'ArrowUp', wait: 400, shot: true, label: 'ArrowUp wraps to the last' },
	{ example: 'Site', clickAt: [20, 20], wait: 400, shot: true, label: 'the ground fades when the pointer leaves' },
]
