// The answer is in: pointing at the run holds it; a found square names its document under the pointer and on focus;
// Show code opens the request under the footer; Tab moves along the squares.
export default [
	{ example: 'Product', hover: 'role=button[name=/acme-msa-2026 in contracts/]', wait: 400, shot: true, label: 'a square names its document' },
	{ example: 'Product', hover: 'role=button[name=/legal-thread-1182 in slack/]', wait: 300, shot: true, label: 'the next square' },
	{ example: 'Product', click: 'role=button[name="Show code"]', wait: 600, shot: true, label: 'Show code opens the request' },
	{ example: 'Product', focus: 'role=button[name=/acme-renewal-2026 in crm/]', key: 'Tab', wait: 300, shot: true, label: 'Tab to the next square names it' },
]
