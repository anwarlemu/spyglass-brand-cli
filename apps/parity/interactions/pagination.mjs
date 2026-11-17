// What a person does with the pages; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Results', click: 'role=button[name="Page 3"]', wait: 300, shot: true, label: 'a click moves to page 3 and the range follows' },
	{ example: 'Results', click: 'role=button[name="Go to next page"]', wait: 300, shot: true, label: 'Next moves on one page' },
	{ example: 'Results', hover: 'role=button[name="Page 1"]', wait: 300, shot: true, label: 'hover fills a page' },
]
