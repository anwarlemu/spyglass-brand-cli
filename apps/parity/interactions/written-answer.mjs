// Answer first: a citation opens and flashes its result below. Beside the page: pointing at a citation turns the page
// beside the words to it. On request: Write an answer shows the dot matrix, then the answer; its citations work too.
export default [
	{ example: 'AnswerFirst', click: 'role=button[name="Source 3"]', wait: 700, shot: true, label: 'a citation opens its result below' },
	{ example: 'AnswerFirst', focus: 'role=button[name="Source 1"]', key: 'Tab', label: 'Tab to the next citation' },
	{ example: 'BesideThePage', hover: 'role=button[name="Source 2"]', wait: 300, shot: true, label: 'pointing at a citation turns the page to it' },
	{ example: 'BesideThePage', focus: 'role=button[name="Source 1"]', wait: 300, shot: true, label: 'focus turns it back' },
	{ example: 'OnRequest', hover: 'role=button[name="Write an answer"]', wait: 300, shot: true, label: 'the request button under the pointer' },
	{ example: 'OnRequest', click: 'role=button[name="Write an answer"]', wait: 400, shot: true, label: 'Write an answer: the dot matrix' },
	{ example: 'OnRequest', wait: 1700, shot: true, label: 'then the answer' },
	{ example: 'OnRequest', click: 'role=button[name="Source 3"]', wait: 700, shot: true, label: 'its citation opens a result' },
]
