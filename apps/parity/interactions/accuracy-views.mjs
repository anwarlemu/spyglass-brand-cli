// Each view opens a question to what came back, in place.
export default [
	{ example: 'VerdictFirst', click: 'role=button[name=/reseller agreement cap/]', wait: 700, shot: true, label: 'open a question' },
	{ example: 'VerdictFirst', click: 'role=button[name=/reseller agreement cap/]', wait: 700, shot: true, label: 'close it' },
	{ example: 'TwoSearches', click: 'role=tab[name=/^All/]', wait: 700, shot: true, label: 'all questions' },
	{ example: 'TwoSearches', click: 'role=button[name=/breach notification window/]', wait: 700, shot: true, label: 'open another' },
	{ example: 'QuestionSheet', click: 'role=button[name=/cash did we hold/]', wait: 700, shot: true, label: 'open a row' },
	{ example: 'QuestionSheet', focus: 'role=textbox[name="add a question"]', type: 'Is there a cap on fees?', wait: 200 },
	{ example: 'QuestionSheet', key: 'Enter', wait: 700, shot: true, label: 'add a question' },
	{ example: 'TestAtWork', click: 'role=button[name=/^Where they differ/]', wait: 600, shot: true, label: 'filter: where they differ' },
]
