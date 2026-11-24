// What a person does with the product visuals' switches; check-parity compares focus, state and (with `shot`) the
// pixels with React. Pressing a tab stops the loop on that view, so the frame after the change is stable.
export default [
	{ example: 'Sheets', click: 'role=tab[name="90 days"]', wait: 1200, shot: true, label: 'the media mix switches to 90 days: bars and values change' },
	{ example: 'Sheets', key: 'ArrowLeft', wait: 1200, label: 'the arrow key moves back to 30 days and keeps focus on the tab' },
	{ example: 'Sheets', click: 'role=tab[name="All"]', wait: 1500, shot: true, label: 'landing pages show all: the stopped page slides in' },
	{ example: 'Board', click: 'role=tab[name="Personas"]', wait: 1200, shot: true, label: 'the patterns switch to personas: the third ad comes into focus' },
	{ example: 'Board', key: 'Home', wait: 1200, label: 'Home goes back to hooks' },
]
