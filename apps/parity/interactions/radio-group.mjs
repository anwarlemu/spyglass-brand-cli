export default [
	{ click: 'role=radio[name=/Thorough/]', wait: 300, shot: true, label: 'a click picks' },
	{ key: 'ArrowDown', wait: 300, shot: true, label: 'ArrowDown wraps to the first' },
	{ key: 'ArrowUp', wait: 300, label: 'ArrowUp goes back' },
	{ key: 'Tab', wait: 200, label: 'Tab moves to the next group' },
	{ key: 'ArrowRight', wait: 300, shot: true, label: 'ArrowRight picks in a row' },
	{ hover: 'role=radio[name="United States"]', wait: 300, shot: true, label: 'hover darkens the edge' },
]
