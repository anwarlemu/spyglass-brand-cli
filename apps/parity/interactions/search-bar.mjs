export default [
	{ example: 'Default', click: 'role=searchbox[name="Search creatives"]', key: 'Enter', wait: 300, shot: true, label: 'Enter searches and says so' },
	{ example: 'Default', click: 'role=button[name="Search"]', wait: 300, label: 'the button searches too' },
	{ example: 'OnLight', click: 'role=searchbox[name="Search creatives"]', type: 'Acme hooks', wait: 300, shot: true, label: 'typing over the light' },
]
