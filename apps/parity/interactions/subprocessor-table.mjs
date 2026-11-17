// The frame takes focus (it scrolls sideways on a phone), then the vendor links in order; hover inks a link's line.
export default [
	{ example: 'Site', focus: 'role=region[name="subprocessors"]', key: 'Tab', label: 'Tab from the frame to the first vendor' },
	{ example: 'Site', key: 'Tab', label: 'Tab to the next vendor' },
	{ example: 'Site', hover: 'role=link[name="Acme Mail"]', wait: 300, shot: true, label: 'hover inks the underline' },
]
