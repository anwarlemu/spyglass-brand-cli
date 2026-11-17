// A press opens a row and closes the open one; a second press closes it; Tab moves between the questions; a disabled
// row stays shut.
export default [
	{ example: 'Faq', click: 'role=button[name="How much does it cost?"]', wait: 400, shot: true, label: 'a press opens the row and closes the first' },
	{ example: 'Faq', click: 'role=button[name="How much does it cost?"]', wait: 400, shot: true, label: 'a second press closes it' },
	{ example: 'Faq', focus: 'role=button[name="What is Spyglass?"]', key: 'Tab', label: 'Tab moves to the next question' },
	{ example: 'Faq', hover: 'role=button[name="Can I share a board with my team?"]', wait: 300, shot: true, label: 'hover turns the question White' },
	{ example: 'Multiple', click: 'role=button[name="Format"]', wait: 400, shot: true, label: 'closing one leaves the other open' },
]
