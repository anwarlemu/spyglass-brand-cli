// Pointing at a row scopes its point (crosshair, brackets, readouts and the tooltip); the next row glides it there;
// leaving the rows lets it go.
export default [
	{ hover: 'role=listitem >> text=voyage-4-large', wait: 500, shot: true, label: 'scope a row' },
	{ hover: 'role=listitem >> text=Mixedbread', wait: 500, shot: true, label: 'glide to another' },
	{ clickAt: [1400, 880], wait: 500, shot: true, label: 'let it go' },
	{ hover: '.cursor-crosshair >> nth=2', wait: 500, shot: true, label: 'point at a point' },
]
