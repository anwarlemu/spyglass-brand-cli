// The first answer is open. A click on another question opens it and closes the first, the rows between sliding;
// a click on the open one closes it; arrows, Home and End move between questions; Enter opens one.
export default [
	{ example: 'Questions', click: 'role=button[name="Which networks are in the index?"]', wait: 500, shot: true, label: 'a click opens the third answer, the first closes' },
	{ example: 'Questions', click: 'role=button[name="Which networks are in the index?"]', wait: 500, shot: true, label: 'a click on the open question closes it' },
	{ example: 'Questions', key: 'ArrowUp', label: 'ArrowUp moves to the question above' },
	{ example: 'Questions', key: 'Home', label: 'Home jumps to the first' },
	{ example: 'Questions', key: 'End', label: 'End jumps to the last' },
	{ example: 'Questions', key: 'Enter', wait: 500, shot: true, label: 'Enter opens the last answer' },
	{ example: 'Rows', hover: 'role=button[name="How many people can use it?"]', wait: 300, shot: true, label: 'a question under the pointer turns White' },
	{ example: 'Rows', click: 'role=button[name="How many people can use it?"]', wait: 500, shot: true, label: 'a click opens it from all closed' },
]
