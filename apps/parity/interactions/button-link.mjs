// Hover runs the squares in (the label's copies turn with them on secondary and light); focus fills it too; Tab moves
// along the row.
export default [
	{ example: 'Dark', hover: 'role=link[name="Book a demo"]', wait: 500, shot: true, label: 'hover runs the red squares in' },
	{ example: 'Outlined', hover: 'role=link[name="Read the docs"]', wait: 500, shot: true, label: 'hover fills it red, the label turns' },
	{ example: 'Light', hover: 'role=link[name="Book a demo"]', wait: 500, shot: true, label: 'hover on a dark band' },
	{ example: 'Ghost', hover: 'role=link[name="Read the docs"]', wait: 500, shot: true, label: 'ghost border turns red' },
	{ example: 'Red', hover: 'role=link[name="Book a demo"]', wait: 500, shot: true, label: 'black squares on the red block' },
	{ example: 'Small', focus: 'role=link[name="Pricing"]', wait: 500, shot: true, label: 'focus fills it and rings it' },
	{ example: 'Site', focus: 'role=link[name="Book a demo"] >> nth=0', key: 'Tab', label: 'Tab to Read the docs' },
	{ example: 'Site', key: 'Tab', wait: 400, shot: true, label: 'Tab to Pricing' },
]
