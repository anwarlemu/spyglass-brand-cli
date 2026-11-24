// The links board's timeline (site v2/motion/collaborate.ts), framework-free: a 1080 board of nine tiles and two
// creators, drawn frame by frame at 60fps. Each scene is 158 frames: the view zooms in from 1.2564, the tiles fade in
// one after another, the creators' pictures grow in with their handles sliding up, and near the end everything clears
// for the next scene. The curves are the site's, sampled per frame.

export const BOARD_STEP = 1000 / 60
export const BOARD_SCENE = 158
export const BOARD_VIEW = 1080
/** The composed frame, shown with reduced motion and held before the loop starts. */
export const BOARD_STILL = 110

type Bezier = [number, number, number, number]
type Ease = { frames: number; curve: Bezier }

const ZOOM = { from: 1.2564, start: -4.174, frames: 97.585, curve: [0.184, -0.154, 0.187, 0.913] as Bezier }

export const BOARD_TILES = [
	{ x: 0, y: 0, w: 522, h: 355, in: 24.79, out: 144 },
	{ x: 550, y: 0, w: 272, h: 356, in: 20.4, out: 142 },
	{ x: 849, y: 0, w: 231, h: 520, in: 27.97, out: 146 },
	{ x: 0, y: 384, w: 223, h: 312, in: 23.84, out: 144 },
	{ x: 849, y: 548, w: 231, h: 532, in: 27.97, out: 146 },
	{ x: 0, y: 724, w: 223, h: 356, in: 27.97, out: 146 },
	{ x: 250, y: 724, w: 273, h: 174, in: 16.45, out: 140 },
	{ x: 552, y: 724, w: 270, h: 356, in: 20.37, out: 142 },
	{ x: 251, y: 927, w: 272, h: 153, in: 25.27, out: 144 },
]

const TILE_IN: Ease = { frames: 21.78, curve: [0.417, 0.889, 0.791, 0.925] }
const TILE_OUT: Ease = { frames: 10.02, curve: [0.34, 0.82, 0.621, 0.953] }
const TILE_OUT_SHRINK: Ease = { frames: 10.44, curve: [0.333, 0.735, 0.486, 0.676] }
const TILE_OUT_SCALE = 0.955

export const BOARD_AVATAR = { d: 255, y: 509.3, x: [385.6, 685.6] }
const AVATAR_IN = { opacityFrames: 8, scaleFrom: 0.7, scale: { frames: 12.51, curve: [0.1, 0.165, 0.279, 1] as Bezier } }
const AVATAR_OUT = { at: [132, 137], scaleTo: 0.7, scale: { frames: 8, curve: [0.479, 1.17, 1, 0.919] as Bezier }, opacity: { frames: 9.01, curve: [0.387, 1.057, 0.799, 0.971] as Bezier } }
const CHIP_IN = { at: [4, 8], from: 18, slide: { frames: 14.03, curve: [0.06, 0.097, 0.27, 0.982] as Bezier }, opacityFrames: 8 }
const CHIP_OUT = { at: [132, 137], to: 12, slide: { frames: 8.02, curve: [0.45, 1.394, 1, 0.837] as Bezier }, opacityFrames: 8 }

function bezier([x1, y1, x2, y2]: Bezier, t: number) {
	if (t <= 0) return 0
	if (t >= 1) return 1
	const bx = (u: number) => 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u ** 2 * x2 + u ** 3
	const by = (u: number) => 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u ** 2 * y2 + u ** 3
	let lo = 0
	let hi = 1
	let u = t
	for (let i = 0; i < 24; i++) {
		const x = bx(u) - t
		if (Math.abs(x) < 1e-6) break
		if (x > 0) hi = u
		else lo = u
		u = (lo + hi) / 2
	}
	return by(u)
}

const ease = (e: Ease, from: number, k: number) => bezier(e.curve, (k - from) / e.frames)
const linear = (from: number, frames: number, k: number) => Math.min(Math.max((k - from) / frames, 0), 1)

export const boardZoomAt = (k: number) => 1 + (ZOOM.from - 1) * (1 - bezier(ZOOM.curve, (k - ZOOM.start) / ZOOM.frames))

export function boardTileAt(i: number, k: number) {
	const t = BOARD_TILES[i]
	return { opacity: ease(TILE_IN, t.in, k) * (1 - ease(TILE_OUT, t.out, k)), scale: 1 - (1 - TILE_OUT_SCALE) * ease(TILE_OUT_SHRINK, t.out, k) }
}

export function boardAvatarAt(i: number, k: number) {
	const leave = AVATAR_OUT.at[i]
	const scaleIn = AVATAR_IN.scaleFrom + (1 - AVATAR_IN.scaleFrom) * ease(AVATAR_IN.scale, 0, k)
	const scaleOut = 1 - (1 - AVATAR_OUT.scaleTo) * ease(AVATAR_OUT.scale, leave, k)
	return { opacity: linear(0, AVATAR_IN.opacityFrames, k) * (1 - ease(AVATAR_OUT.opacity, leave, k)), scale: scaleIn * scaleOut }
}

export function boardChipAt(i: number, k: number) {
	const arrive = CHIP_IN.at[i]
	const go = CHIP_OUT.at[i]
	return {
		opacity: linear(arrive, CHIP_IN.opacityFrames, k) * (1 - linear(go, CHIP_OUT.opacityFrames, k)),
		dy: CHIP_IN.from * (1 - ease(CHIP_IN.slide, arrive, k)) + CHIP_OUT.to * ease(CHIP_OUT.slide, go, k),
	}
}
