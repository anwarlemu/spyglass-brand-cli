// What a person does with the rows; check-parity compares focus, state and (with `shot`) the pixels with React.
export default [
	{ example: 'Boards', hover: 'role=link[name=/Acme hooks/]', wait: 300, shot: true, label: 'hover fills the row and brightens the chevron' },
	{ example: 'Boards', focus: 'role=link[name=/Acme summer launch/]', wait: 200, shot: true, label: 'a row takes focus with the White ring' },
	{ example: 'Variants', focus: 'role=button[name="Open"]', key: 'Tab', label: 'Tab moves to the next row action' },
]
