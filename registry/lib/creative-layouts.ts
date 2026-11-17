// Where the brand assets put their creatives, in Figma's numbers (page "8. Brand assets"), for the arrangements both
// flavors draw: the creative ring (Post, Creative ring, 1080x1080), the corridor (Ad, The world's largest creative
// search engine: twelve walls receding to the light at 540, 700) and the deck cover's row of creatives (sizes rising
// to the middle). Positions become percentages of the frame, so an arrangement scales with its box.

export interface Rect { x: number; y: number; w: number; h: number }

/** Percent of a length, rounded to 4 places. */
export const pct = (v: number, of: number) => `${Math.round((v / of) * 1e6) / 1e4}%`

/** A rect as left, top, width and height in percent of its frame. */
export const placeAt = (r: Rect, width: number, height: number) => ({ left: pct(r.x, width), top: pct(r.y, height), width: pct(r.w, width), height: pct(r.h, height) })

/** The creative ring: 1080x1080, twelve tiles clockwise from the top, four of them light tiles, the lockup inside. */
export const RING_FRAME = 1080
export const RING_SLOTS: (Rect & { light?: boolean })[] = [
	{ x: 475, y: 116, w: 128, h: 128 },
	{ x: 674, y: 154, w: 112, h: 146 },
	{ x: 789, y: 303, w: 160, h: 114 },
	{ x: 856, y: 475, w: 128, h: 128, light: true },
	{ x: 813, y: 647, w: 112, h: 146 },
	{ x: 650, y: 795, w: 160, h: 114 },
	{ x: 483, y: 827, w: 112, h: 145, light: true },
	{ x: 286, y: 788, w: 128, h: 128 },
	{ x: 131, y: 663, w: 160, h: 114 },
	{ x: 96, y: 475, w: 128, h: 128, light: true },
	{ x: 155, y: 287, w: 112, h: 146 },
	{ x: 294, y: 155, w: 112, h: 145, light: true },
]
/** How many creatives the ring shows (the other four slots are light tiles). */
export const RING_CREATIVES = RING_SLOTS.filter((s) => !s.light).length

/** The corridor, cut to its walls: 1080 wide, 744 tall (the ad's y 328 to 1072), vanishing at 540, 372. */
export const CORRIDOR_FRAME = { width: 1080, height: 744 }
const VP = 540
const WALLS: Rect[] = [
	{ x: -60, y: 0, w: 200, h: 744 },
	{ x: 170, y: 142, w: 87, h: 459 },
	{ x: 272, y: 206, w: 48, h: 332 },
	{ x: 330, y: 242, w: 31, h: 260 },
	{ x: 368, y: 265, w: 21, h: 213 },
	{ x: 394, y: 281, w: 15, h: 181 },
]
/** The light at the end of the corridor (140x104, the close-up's proportions). */
export const CORRIDOR_LIGHT: Rect = { x: 470, y: 320, w: 140, h: 104 }

export interface Wall extends Rect {
	side: 'left' | 'right'
	/** The clip that draws the wall in perspective: its far edge shorter, toward the vanishing point. */
	clip: string
}

/** The twelve walls, nearest first, left then right: L0, R0, L1, R1 ... L5, R5. */
export function corridorWalls(): Wall[] {
	const out: Wall[] = []
	for (const l of WALLS) {
		const near = VP - l.x
		const far = VP - (l.x + l.w)
		const inset = Math.round(((1 - far / near) / 2) * 1e4) / 100
		out.push({ ...l, side: 'left', clip: `polygon(0 0, 100% ${inset}%, 100% ${100 - inset}%, 0 100%)` })
		out.push({ ...l, x: 2 * VP - l.x - l.w, side: 'right', clip: `polygon(0 ${inset}%, 100% 0, 100% 100%, 0 ${100 - inset}%)` })
	}
	return out
}

/** The deck cover's row: widths rising to the middle (200, 240, 304 on the 1920 canvas), all 4/5. */
export function peakWeights(n: number): number[] {
	const mid = (n - 1) / 2
	return Array.from({ length: n }, (_, i) => {
		const d = Math.abs(i - mid)
		return d < 0.75 ? 304 : d < 1.75 ? 240 : 200
	})
}
