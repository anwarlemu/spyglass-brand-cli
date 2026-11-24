// Focus brings a card forward with its tag; Enter steps it to the next creative in its set; Escape sends it back.
export default [
	{ example: 'Hero', width: 1440, focus: 'role=button[name^="Acme Shoes: Everyday sneaker"]', wait: 600, shot: true, label: 'focus brings the first card forward with its tag' },
	{ example: 'Hero', width: 1440, key: 'Enter', wait: 600, shot: true, label: 'Enter shows the next creative in its set' },
	{ example: 'Hero', width: 1440, key: 'Escape', wait: 600, shot: true, label: 'Escape sends it back' },
]
