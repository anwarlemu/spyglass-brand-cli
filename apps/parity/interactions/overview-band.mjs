// A step or a question takes the paper under the pointer; the live searches land one at a time and hold (the landing
// itself is timed from mount, so it is compared settled here).
export default [
	{ example: 'Pipeline', hover: 'role=link[name=/Retrieve/]', wait: 400, shot: true, label: 'hover a step' },
	{ example: 'ThreeQuestions', hover: 'role=link[name=/Is it answering well/]', wait: 400, shot: true, label: 'hover a question' },
	{ example: 'Live', wait: 5500, shot: true, label: 'all six, holding' },
]
