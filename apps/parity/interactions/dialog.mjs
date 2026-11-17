// NewBoard: the button opens it on the Name field; Tab moves through Cancel, Create and wraps to Close; Enter in the
// form creates and closes; the close button and the scrim close it. Plan: the foot's buttons; Escape closes it.
export default [
	{ example: 'NewBoard', click: 'role=button[name="New board"]', wait: 500, shot: true, label: 'the button opens it on the Name field' },
	{ example: 'NewBoard', type: 'Acme launch', wait: 100, label: 'type a name' },
	{ example: 'NewBoard', key: 'Tab', label: 'Tab to Cancel' },
	{ example: 'NewBoard', key: 'Tab', label: 'Tab to Create board' },
	{ example: 'NewBoard', key: 'Tab', label: 'Tab wraps to Close' },
	{ example: 'NewBoard', key: 'Shift+Tab', label: 'Shift+Tab back to Create board' },
	{ example: 'NewBoard', key: 'Enter', wait: 400, shot: true, label: 'Enter creates and closes' },
	{ example: 'NewBoard', click: 'role=button[name="New board"]', wait: 500, label: 'open again' },
	{ example: 'NewBoard', click: 'role=button[name="Close"]', wait: 400, label: 'the close button closes it' },
	{ example: 'NewBoard', click: 'role=button[name="New board"]', wait: 500, label: 'open once more' },
	{ example: 'NewBoard', clickAt: [8, 8], wait: 400, label: 'a click on the scrim closes it' },
	{ example: 'Plan', click: 'role=button[name="See the Creator plan"]', wait: 500, shot: true, label: 'the button opens the offer' },
	{ example: 'Plan', hover: 'role=button[name="Start Creator for 50% off"]', wait: 300, shot: true, label: 'hover lightens the primary' },
	{ example: 'Plan', key: 'Escape', wait: 400, label: 'Escape closes it' },
]
