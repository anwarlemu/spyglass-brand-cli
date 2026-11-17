// The pointer block glides along the links and fades when the pointer leaves the row; the Product menu opens under
// the pointer. On a phone the square button unrolls the sheet (the steps run at 1440, so the sheet's button is hidden).
export default [
	{ hover: 'role=link[name="FAQ"]', wait: 400, shot: true, label: 'point at FAQ' },
	{ hover: 'role=link[name="Docs"]', wait: 400, shot: true, label: 'glide to Docs' },
	{ hover: 'role=button[name="Product"]', wait: 600, shot: true, label: 'Product opens' },
	{ clickAt: [1400, 880], wait: 500, shot: true, label: 'press outside' },
]
