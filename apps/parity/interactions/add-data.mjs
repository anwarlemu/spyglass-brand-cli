// Copy prompt copies and starts the wait for the first write, which lands (Open the namespace answers with a toast);
// a tile under the pointer shows its Connect, which opens (Opening) and answers with a toast; Show code opens the
// request; Tab reaches a tile's Connect.
export default [
	{ example: 'Product', hover: 'role=button[name="connect Slack"]', wait: 300, shot: true, label: 'a tile under the pointer shows its Connect' },
	{ example: 'Product', click: 'role=button[name="connect Slack"]', wait: 300, shot: true, label: 'Connect opens: Opening' },
	{ example: 'Product', wait: 1000, shot: true, label: 'then a toast' },
	{ example: 'Product', click: 'role=button[name=/Copy prompt/]', wait: 400, shot: true, label: 'Copy prompt: Copied, waiting for the first document' },
	{ example: 'Product', wait: 3400, shot: true, label: 'the first document lands (the earlier toast gone)' },
	{ example: 'Product', click: 'role=button[name="Open api-documents"]', wait: 500, shot: true, label: 'Open answers with a toast' },
	{ example: 'Product', click: 'role=button[name="Show code"]', wait: 600, shot: true, label: 'Show code opens the request' },
	{ example: 'Product', focus: 'role=button[name="connect Google Drive"]', wait: 300, shot: true, label: 'focus shows a tile\'s Connect' },
]
