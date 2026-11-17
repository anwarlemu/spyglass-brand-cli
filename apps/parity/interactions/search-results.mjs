// A match opens in place to its passage (the chevron turns) and closes; a citation opens and flashes its result;
// Download saves the best match's document and says Downloaded; Tab moves along the citations.
export default [
	{ example: 'Product', hover: 'role=button[name=/legal-thread-1182/]', wait: 300, shot: true, label: 'a match under the pointer' },
	{ example: 'Product', click: 'role=button[name=/legal-thread-1182/]', wait: 500, shot: true, label: 'a click opens its passage' },
	{ example: 'Product', click: 'role=button[name=/legal-thread-1182/]', wait: 500, label: 'and closes it' },
	{ example: 'Product', click: 'role=button[name="Source 4"]', wait: 700, shot: true, label: 'a citation opens and flashes its result' },
	{ example: 'Product', focus: 'role=button[name="Source 1"] >> nth=0', key: 'Tab', label: 'Tab to the next citation' },
	{ example: 'Product', click: 'role=button[name=/^Download/] >> nth=0', wait: 900, shot: true, label: 'Download saves it: Downloaded' },
]
