// Pointing at a region on the page lights it in the text and the other way round; a click pins it; the output's tabs
// switch what was read; the handle moves with the arrow keys.
export default [
	{ example: 'PageBesideText', hover: 'role=button[name=/^Title: Consolidated/]', wait: 300, shot: true, label: 'point at the title on the page' },
	{ example: 'PageBesideText', click: 'role=button[name=/^Table: 13 rows/]', wait: 300, shot: true, label: 'pin the table' },
	{ example: 'PageBesideText', click: 'role=tab[name="Markdown"]', wait: 400, shot: true, label: 'Markdown tab' },
	{ example: 'PageBesideText', click: 'role=tab[name="Text"]', wait: 400, label: 'back to text' },
	{ example: 'PageBesideText', focus: 'role=tab[name="Text"]', key: 'Tab', wait: 300, shot: true, label: 'Tab into the text' },
	{ example: 'Regions', hover: 'role=button[name=/^\\(dollars/]', wait: 300, shot: true, label: 'point at a row' },
	{ example: 'Regions', click: 'role=button[name=/^13 rows/]', wait: 300, shot: true, label: 'pin a row' },
	{ example: 'PlainOrConare', focus: 'role=slider', key: 'ArrowRight', wait: 300, shot: true, label: 'move the handle' },
	{ example: 'PlainOrConare', key: 'End', wait: 300, shot: true, label: 'handle to the end' },
]
