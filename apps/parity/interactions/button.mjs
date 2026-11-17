// What a person does with the buttons; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Variants', hover: 'role=button[name="Get 50% off"]', wait: 300, shot: true, label: 'hover lightens the primary fill' },
	{ example: 'Variants', hover: 'role=button[name="Explore the product"]', wait: 300, shot: true, label: 'hover lifts the secondary fill' },
	{ example: 'Variants', focus: 'role=button[name="Compare plans"]', key: 'Tab', label: 'Tab leaves the last button' },
	{ example: 'States', focus: 'role=link[name=/See pricing/]', wait: 200, shot: true, label: 'a link takes focus with the White ring' },
]
