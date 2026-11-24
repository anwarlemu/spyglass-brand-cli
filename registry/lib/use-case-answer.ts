// The use case answer (site pages/UseCasesPage/UseCaseAnswer): one question (or one API request) and the answer that
// came back, as a raised panel. Both flavors read this file for its types and the Acme examples.

export interface AnswerRow {
	title: string
	detail: string
	/** The figure on the right ("71", "84 days"). */
	figure?: string
	/** A creative beside the row: the user's own image (`src`), or a neutral placeholder. */
	creative?: { src?: string; alt?: string; brand?: string; tone?: 1 | 2 | 3 | 4 }
}

export interface AnswerExample {
	/** chat (a question in a bubble) or api (the request as code). */
	mode: 'chat' | 'api'
	mention?: string
	question: string
	/** The request, shown in api mode. */
	request?: string
	/** "Worked for 5s", "200 OK in 412ms". */
	status: string
	lead?: string
	/** The item column and, when the rows have figures, the figure column. */
	columns: [string, string?]
	rows: AnswerRow[]
	note?: string
	/** The tools or endpoints called. */
	calls: string[]
}

export const useCaseAnswerChat: AnswerExample = {
	mode: 'chat',
	question: 'What hooks has Acme leaned on in its Meta ads in the last 30 days?',
	status: 'Worked for 5s',
	lead: 'Acme’s Meta ads from Oct 17 to Nov 16 leaned on a handful of repeatable hooks:',
	columns: ['Hook', 'Ads'],
	rows: [
		{ title: 'Mornings without the rush', detail: 'A full breakfast in about a minute.', figure: '71', creative: { brand: 'Acme', tone: 1 } },
		{ title: 'Healthy eating takes effort', detail: 'Skip the meal prep, keep the nutrition.', figure: '64', creative: { brand: 'Acme', tone: 2 } },
		{ title: 'Better value than the usual', detail: '“My breakfast costs less than your coffee.”', figure: '47', creative: { brand: 'Acme', tone: 3 } },
		{ title: 'Try before committing', detail: 'A sampler box takes the risk out of a flavor.', figure: '33', creative: { brand: 'Acme', tone: 4 } },
	],
	note: 'Lead with a familiar friction, then answer it with the nutrition numbers, speed and price. These are the themes that come up again and again, in no ranked order.',
	calls: ['getBrandMediaInsights'],
}

export const useCaseAnswerApi: AnswerExample = {
	mode: 'api',
	question: 'The longest running Meta ads for running shoes',
	request: 'POST /v2/media\n{\n  "accountIds": ["acme-run", "strider", "fleetfoot"],\n  "channel": "META_AD",\n  "sortBy": "LONGEST_RUN",\n  "limit": 3\n}',
	status: '200 OK in 412ms',
	columns: ['media', 'daysActive'],
	rows: [
		{ title: 'Acme Run: the gold racer', detail: 'Video, 15s. Running since Aug 23.', figure: '84 days', creative: { brand: 'Acme Run', tone: 3 } },
		{ title: 'Strider: trail, labelled', detail: 'Image. Running since Sep 15.', figure: '61 days', creative: { brand: 'Strider', tone: 2 } },
		{ title: 'Fleetfoot: on orange', detail: 'Carousel, 4 cards. Running since Sep 29.', figure: '47 days', creative: { brand: 'Fleetfoot', tone: 4 } },
	],
	calls: ['POST /v2/media'],
}

export const useCaseAnswerCallsLabel = 'Called'
