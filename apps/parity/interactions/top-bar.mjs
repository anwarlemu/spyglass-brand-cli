// Tab walks the steps back (the page itself is not a link); the step under the pointer turns ink.
export default [
	{ hover: 'role=link[name="Namespaces"]', wait: 300, shot: true, label: 'a step back turns ink under the pointer' },
	{ focus: 'role=link[name="Overview"]', label: 'focus the first step' },
	{ key: 'Tab', wait: 200, shot: true, label: 'Tab to the next step, with the focus ring' },
	{ key: 'Enter', wait: 200, label: 'Enter on a step stays on the page (the example routes it)' },
]
