// A name's tip shows on focus; on a phone the picker shows another plan's column.
export default [
	{ example: 'Compare', focus: 'role=button[name="Credits"]', wait: 400, shot: true, label: 'focus shows the tip above the name' },
	{ example: 'Compare', width: 390, click: 'role=radio[name="Free"] >> nth=0', wait: 400, shot: true, label: 'the phone picker shows the Free column' },
]
