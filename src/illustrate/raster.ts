// A small raster compositor for effects SVG rasterizers cannot draw: additive ("lighter", plus-lighter) blending of
// many blurred, tinted, transformed copies of a shape. Images are premultiplied RGBA in floats (0 to 1); masks are one
// float channel. Everything is deterministic: no randomness, no platform code, so the same input gives the same
// pixels everywhere.

export type Img = { w: number; h: number; d: Float32Array };
export type Mask = { w: number; h: number; a: Float32Array };
/** A patch of a mask placed at (x, y) in a larger frame. */
export type Patch = { x: number; y: number; w: number; h: number; a: Float32Array };
export type Rgb = [number, number, number];

export const newImg = (w: number, h: number): Img => ({ w, h, d: new Float32Array(w * h * 4) });
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function rgbOf(hex: string): Rgb {
	const h = hex.replace('#', '');
	const n = Number.parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6), 16);
	return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** The color at `t` along stops ([position, rgb]), as the shader's `at` interpolates. */
export function at(stops: [number, Rgb][], t: number): Rgb {
	for (let i = 1; i < stops.length; i++) {
		if (t <= stops[i]![0]) {
			const [t0, a] = stops[i - 1]!;
			const [t1, b] = stops[i]!;
			const k = (t - t0) / (t1 - t0 || 1);
			return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
		}
	}
	return stops[stops.length - 1]![1];
}

export function fill(img: Img, c: Rgb, a = 1) {
	for (let i = 0; i < img.w * img.h; i++) {
		img.d[i * 4] = c[0] * a;
		img.d[i * 4 + 1] = c[1] * a;
		img.d[i * 4 + 2] = c[2] * a;
		img.d[i * 4 + 3] = a;
	}
}

// ----- Blur -----

/** Box sizes whose three passes approximate a Gaussian of standard deviation `sigma` (W3C filter effects). */
function boxRadius(sigma: number): number {
	const d = Math.floor(sigma * 3 * Math.sqrt(2 * Math.PI) / 4 + 0.5);
	return Math.max(0, Math.floor(d / 2));
}

function boxPass(src: Float32Array, dst: Float32Array, w: number, h: number, r: number, horizontal: boolean, stride: number, channels: number) {
	const n = horizontal ? w : h;
	const lines = horizontal ? h : w;
	const step = horizontal ? stride : w * stride;
	const lineStep = horizontal ? w * stride : stride;
	const norm = 1 / (2 * r + 1);
	for (let c = 0; c < channels; c++) {
		for (let line = 0; line < lines; line++) {
			const base = line * lineStep + c;
			let s = 0;
			// Outside the patch is empty (transparent), as a canvas filter sees it.
			for (let k = 0; k <= r && k < n; k++) s += src[base + k * step]!;
			for (let i = 0; i < n; i++) {
				dst[base + i * step] = s * norm;
				const add = i + r + 1;
				const sub = i - r;
				if (add < n) s += src[base + add * step]!;
				if (sub >= 0) s -= src[base + sub * step]!;
			}
		}
	}
}

/** Blurs `channels` interleaved float channels in place (three box passes each way). */
export function blurData(data: Float32Array, w: number, h: number, sigma: number, channels = 1) {
	if (sigma < 0.3) return;
	const r = boxRadius(sigma);
	if (r < 1) return;
	const tmp = new Float32Array(data.length);
	for (let pass = 0; pass < 3; pass++) {
		boxPass(data, tmp, w, h, r, true, channels, channels);
		boxPass(tmp, data, w, h, r, false, channels, channels);
	}
}

export function blurImg(img: Img, sigma: number): Img {
	const out = { w: img.w, h: img.h, d: new Float32Array(img.d) };
	blurData(out.d, img.w, img.h, sigma, 4);
	return out;
}

/** A square box blur of radius r, one pass each way, edges clamped (the shader's rim). */
export function boxBlurClamped(a: Float32Array, w: number, h: number, r: number): Float32Array {
	const t = new Float32Array(w * h);
	const b = new Float32Array(w * h);
	const R = Math.max(1, Math.round(r));
	for (let y = 0; y < h; y++) {
		let s = 0;
		const row = y * w;
		for (let x = -R; x <= R; x++) s += a[row + clamp(x, 0, w - 1)]!;
		for (let x = 0; x < w; x++) {
			t[row + x] = s / (2 * R + 1);
			s += a[row + Math.min(w - 1, x + R + 1)]! - a[row + Math.max(0, x - R)]!;
		}
	}
	for (let x = 0; x < w; x++) {
		let s = 0;
		for (let y = -R; y <= R; y++) s += t[clamp(y, 0, h - 1) * w + x]!;
		for (let y = 0; y < h; y++) {
			b[y * w + x] = s / (2 * R + 1);
			s += t[Math.min(h - 1, y + R + 1) * w + x]! - t[Math.max(0, y - R) * w + x]!;
		}
	}
	return b;
}

// ----- Placing a mask -----

/**
 * Draws `src` (a mask) into a frame of `W` by `H` as a canvas `drawImage(src, -dw/2, -dh/2, dw, dh)` would after
 * `translate(cx, cy) rotate(angle) scale(sx, sy)`, then blurs it by `blur`. Returns the covered patch only.
 */
export function placeMask(src: Mask, W: number, H: number, cx: number, cy: number, angle: number, sx: number, sy: number, dw: number, dh: number, blur: number): Patch | null {
	const ca = Math.cos(angle);
	const sa = Math.sin(angle);
	// Corners of the drawn rectangle in the frame.
	const pts = [[-dw / 2, -dh / 2], [dw / 2, -dh / 2], [dw / 2, dh / 2], [-dw / 2, dh / 2]].map(([u, v]) => {
		const x = u! * sx;
		const y = v! * sy;
		return [cx + x * ca - y * sa, cy + x * sa + y * ca];
	});
	const m = Math.ceil(blur * 3) + 2;
	const x0 = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[0]!))) - m);
	const y0 = Math.max(0, Math.floor(Math.min(...pts.map((p) => p[1]!))) - m);
	const x1 = Math.min(W, Math.ceil(Math.max(...pts.map((p) => p[0]!))) + m);
	const y1 = Math.min(H, Math.ceil(Math.max(...pts.map((p) => p[1]!))) + m);
	if (x1 <= x0 || y1 <= y0 || Math.abs(sx) < 1e-6 || Math.abs(sy) < 1e-6) return null;
	const w = x1 - x0;
	const h = y1 - y0;
	const a = new Float32Array(w * h);
	// Frame pixel -> source pixel: undo the translate, rotation and scale, then map the drawn rectangle onto src.
	const kx = src.w / dw;
	const ky = src.h / dh;
	for (let j = 0; j < h; j++) {
		const py = y0 + j + 0.5 - cy;
		for (let i = 0; i < w; i++) {
			const px = x0 + i + 0.5 - cx;
			const u = (px * ca + py * sa) / sx;
			const v = (-px * sa + py * ca) / sy;
			const fx = (u + dw / 2) * kx - 0.5;
			const fy = (v + dh / 2) * ky - 0.5;
			if (fx <= -1 || fy <= -1 || fx >= src.w || fy >= src.h) continue;
			a[j * w + i] = bilinear(src, fx, fy);
		}
	}
	blurData(a, w, h, blur, 1);
	return { x: x0, y: y0, w, h, a };
}

function bilinear(src: Mask, fx: number, fy: number): number {
	const x = Math.floor(fx);
	const y = Math.floor(fy);
	const tx = fx - x;
	const ty = fy - y;
	const g = (xx: number, yy: number) => (xx < 0 || yy < 0 || xx >= src.w || yy >= src.h ? 0 : src.a[yy * src.w + xx]!);
	return (g(x, y) * (1 - tx) + g(x + 1, y) * tx) * (1 - ty) + (g(x, y + 1) * (1 - tx) + g(x + 1, y + 1) * tx) * ty;
}

/** Composites a patch tinted `c` at `alpha`: 'lighter' adds (clamped), 'over' is source-over. */
export function drawPatch(dst: Img, p: Patch, c: Rgb, alpha: number, mode: 'lighter' | 'over') {
	const al = clamp(alpha, 0, 1);
	for (let j = 0; j < p.h; j++) {
		const y = p.y + j;
		if (y < 0 || y >= dst.h) continue;
		for (let i = 0; i < p.w; i++) {
			const x = p.x + i;
			if (x < 0 || x >= dst.w) continue;
			const a = p.a[j * p.w + i]! * al;
			if (a <= 0) continue;
			const k = (y * dst.w + x) * 4;
			const d = dst.d;
			if (mode === 'lighter') {
				d[k] = Math.min(1, d[k]! + c[0] * a);
				d[k + 1] = Math.min(1, d[k + 1]! + c[1] * a);
				d[k + 2] = Math.min(1, d[k + 2]! + c[2] * a);
				d[k + 3] = Math.min(1, d[k + 3]! + a);
			} else {
				const ia = 1 - a;
				d[k] = c[0] * a + d[k]! * ia;
				d[k + 1] = c[1] * a + d[k + 1]! * ia;
				d[k + 2] = c[2] * a + d[k + 2]! * ia;
				d[k + 3] = a + d[k + 3]! * ia;
			}
		}
	}
}

/** Composites a whole image onto another at `alpha`. */
export function drawImg(dst: Img, src: Img, alpha: number, mode: 'lighter' | 'over', clip?: Float32Array) {
	const al = clamp(alpha, 0, 1);
	const d = dst.d;
	const s = src.d;
	for (let i = 0; i < dst.w * dst.h; i++) {
		const k = i * 4;
		const m = al * (clip ? clip[i]! : 1);
		if (m <= 0) continue;
		const sa = s[k + 3]! * m;
		if (mode === 'lighter') {
			d[k] = Math.min(1, d[k]! + s[k]! * m);
			d[k + 1] = Math.min(1, d[k + 1]! + s[k + 1]! * m);
			d[k + 2] = Math.min(1, d[k + 2]! + s[k + 2]! * m);
			d[k + 3] = Math.min(1, d[k + 3]! + sa);
		} else {
			const ia = 1 - sa;
			d[k] = s[k]! * m + d[k]! * ia;
			d[k + 1] = s[k + 1]! * m + d[k + 1]! * ia;
			d[k + 2] = s[k + 2]! * m + d[k + 2]! * ia;
			d[k + 3] = sa + d[k + 3]! * ia;
		}
	}
}

/** Multiplies every pixel by a mask (canvas destination-in). */
export function keepWhere(img: Img, mask: Float32Array) {
	for (let i = 0; i < img.w * img.h; i++) {
		const m = mask[i]!;
		const k = i * 4;
		img.d[k]! *= m;
		img.d[k + 1]! *= m;
		img.d[k + 2]! *= m;
		img.d[k + 3]! *= m;
	}
}

/** A linear ramp from 0 at (x0, y0) to 1 at (x1, y1), clamped, as a canvas linear gradient. */
export function ramp(w: number, h: number, x0: number, y0: number, x1: number, y1: number): Float32Array {
	const out = new Float32Array(w * h);
	const dx = x1 - x0;
	const dy = y1 - y0;
	const len2 = dx * dx + dy * dy || 1;
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[y * w + x] = clamp(((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2, 0, 1);
	return out;
}

// ----- Rounded rectangles (the glass tile) -----

/** Signed distance to a rounded rectangle's edge (negative inside). */
function sdRound(px: number, py: number, x: number, y: number, w: number, h: number, r: number): number {
	const cx = x + w / 2;
	const cy = y + h / 2;
	const qx = Math.abs(px - cx) - (w / 2 - r);
	const qy = Math.abs(py - cy) - (h / 2 - r);
	return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

/** Coverage of a rounded rectangle (filled), antialiased over one pixel. */
export function roundRectFill(W: number, H: number, x: number, y: number, w: number, h: number, r: number): Float32Array {
	const out = new Float32Array(W * H);
	for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) out[j * W + i] = clamp(0.5 - sdRound(i + 0.5, j + 0.5, x, y, w, h, r), 0, 1);
	return out;
}

/** Coverage of a rounded rectangle's outline, `lw` wide and centered on the edge. */
export function roundRectStroke(W: number, H: number, x: number, y: number, w: number, h: number, r: number, lw: number): Float32Array {
	const out = new Float32Array(W * H);
	for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) out[j * W + i] = clamp(lw / 2 + 0.5 - Math.abs(sdRound(i + 0.5, j + 0.5, x, y, w, h, r)), 0, 1);
	return out;
}

// ----- Out -----

/** Straight 8-bit RGBA for the PNG writer, over `ground` when given (an opaque picture), else with its alpha. */
export function toStraight(img: Img): Buffer {
	const out = Buffer.alloc(img.w * img.h * 4);
	for (let i = 0; i < img.w * img.h; i++) {
		const k = i * 4;
		const a = img.d[k + 3]!;
		out[k + 3] = Math.round(clamp(a, 0, 1) * 255);
		if (a > 0) for (let c = 0; c < 3; c++) out[k + c] = Math.round(clamp(img.d[k + c]! / a, 0, 1) * 255);
	}
	return out;
}

/** An Img from resvg's premultiplied 8-bit RGBA. */
export function fromPremultiplied(px: Buffer | Uint8Array, w: number, h: number): Img {
	const img = newImg(w, h);
	for (let i = 0; i < w * h * 4; i++) img.d[i] = px[i]! / 255;
	return img;
}

/** mulberry32: a small seeded generator (the grain). */
export function seeded(seed: number) {
	let s = (seed | 0) ^ 0x2f6b1d;
	return () => {
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
