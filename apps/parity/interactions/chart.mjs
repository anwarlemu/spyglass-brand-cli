// Bars: pointing at one names its day and value and quiets the rest; lines: the crosshair with both values, and it
// goes as the pointer leaves; share: a row under the pointer, or focused, rolls its percent to its cost; split: a row
// under the pointer or focus picks it, the block and the red mark glide to it.
export default [
	{ example: 'Usage', hover: 'role=img[name=/Queries per day/]', wait: 400, shot: true, label: 'a bar under the pointer names its day' },
	{ example: 'Usage', clickAt: [10, 10], wait: 400, shot: true, label: 'the bars come back as the pointer leaves' },
	{ example: 'Product', hover: 'role=img[name=/Search latency/]', wait: 300, shot: true, label: 'the crosshair and both values' },
	{ example: 'Share', hover: 'role=row[name=/contracts/]', wait: 400, shot: true, label: 'a row rolls its percent to its cost' },
	{ example: 'Share', focus: 'role=row[name=/slack/]', wait: 400, shot: true, label: 'focus rolls it too' },
	{ example: 'Split', hover: 'role=button[name=/Indexing/]', wait: 500, shot: true, label: 'a row under the pointer picks it' },
	{ example: 'Split', focus: 'role=button[name=/Storage/]', wait: 500, shot: true, label: 'focus picks a row' },
	{ example: 'Split', key: 'Shift+Tab', wait: 500, shot: true, label: 'Shift+Tab picks the row before' },
]
