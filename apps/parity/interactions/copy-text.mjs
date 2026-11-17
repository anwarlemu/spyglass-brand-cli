// Hover rounds the quiet button in; a click copies and the glyph turns to a check (its name says copied); Enter copies
// the next one.
export default [
	{ example: 'Product', hover: 'role=button[name="copy key id"]', wait: 300, shot: true, label: 'hover fills the round button' },
	{ example: 'Product', click: 'role=button[name="copy key id"]', wait: 300, shot: true, label: 'a click copies: the check' },
	{ example: 'Product', focus: 'role=button[name="copy embedder model"]', key: 'Enter', wait: 300, shot: true, label: 'Enter copies the model' },
	{ example: 'Product', wait: 1700, shot: true, label: 'both back to the copy glyph' },
]
