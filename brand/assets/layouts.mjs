// The image layouts, as functions of the canvas. The compositions come from the Figma page "8. Brand assets" (file
// Qx2i6GhXZD1V4O7RE7hYQi); everything they are drawn in comes from the site (brand/site-changes.md), as the site's own
// share card does it at 1200 by 630 (public/og/*.png): site pixels one to one on the 1080 canvas, Funnel Display heads
// at 450 on the site's steps (112/116, 96/100, 72/76, 64/68, 56/60, 48/52, 44/48, 40/44, 32/36: four pixels of leading),
// DM Sans text in the secondary gray (#D4D4D4) at its steps (28/36, 24/32, 20/28), labels in capitals at 14/20,
// White buttons 56px tall with a 20px label and the 8px control corner, #262626 cards and picture tiles on the 4px
// container corner, the site's ASCII texture tile behind, and the site's own light images (public/brand/light, here
// brand/assets/art) where the site uses lights: the hero band across, the close band on the diagonal, the corner lights,
// the light tiles and the plan cards' edge light. image.json holds each template's name, source, copy slots and sizes;
// this file holds only positions.
//
// Text tops are the top of the capitals. A stack closes up around the copy that is there and steps down together when it
// is long. A light is a piece of the site's art over a box, cropped to cover it (art: file, box, at, flip).
//
// layout(c) gets { W, H, size (the size id), has(slot), pictures (how many, placeholders included), real (how many were passed), safe, keepOut } and returns
// { layers, frame, unit }.

/** The site's ASCII texture, fading out from the middle as its drift does. */
const A = (o = {}) => ({ type: 'ascii', ...o });
/** A piece of the site's light art (brand/assets/art), cropped to cover the box. */
const art = (file, box, o = {}) => ({ type: 'art', id: 'light', file, box, fit: 'cover', ...o });
const P = (index, box, o = {}) => ({ type: 'photo', index, box, ...o });
const text = (slot, face, size, leading, o = {}) => ({ type: 'text', slot, face, size, leading, ...o });
const stack = (box, items, o = {}) => ({ type: 'stack', box, items, ...o });
const list = (n) => Array.from({ length: n }, (_, i) => i);
/** The site's text colors: White for heads, the secondary gray for text and labels. */
const TEXT_2 = 'neutral-11';
/** The site's head steps (size, line). */
const HEADS = [[112, 116], [96, 100], [72, 76], [64, 68], [56, 60], [48, 52], [44, 48], [40, 44], [32, 36], [24, 28], [20, 24]];
/** The site's step nearest a size, with its line. */
const step = (px) => HEADS.reduce((a, b) => (Math.abs(b[0] - px) < Math.abs(a[0] - px) ? b : a));

const CORRIDOR = [[[-60,328],[140,452],[140,948],[-60,1072]],[[170,470.6],[257.4,524.8],[257.4,875.2],[170,929.4]],[[272,533.8],[320.9,564.2],[320.9,835.8],[272,866.2]],[[330,569.8],[361.2,589.1],[361.2,810.9],[330,830.2]],[[368,593.4],[389.7,606.8],[389.7,793.2],[368,806.6]],[[394,609.5],[409.9,619.3],[409.9,780.7],[394,790.5]],[[940,452],[1140,328],[1140,1072],[940,948]],[[823,524.5],[910.4,470.4],[910.4,929.6],[823,875.5]],[[759,564.2],[807.9,533.9],[807.9,866.1],[759,835.8]],[[719,589],[750.2,569.7],[750.2,830.3],[719,811]],[[691,606.4],[712.7,592.9],[712.7,807.1],[691,793.6]],[[670,619.4],[685.9,609.5],[685.9,790.5],[670,780.6]]];
const ROW = [[[817,150],[1015.5,209.5],[1015.5,414.4],[817,480.5]],[[602,296],[800.5,355.5],[800.5,560.4],[602,626.5]],[[494,369],[692.5,428.5],[692.5,633.4],[494,699.5]],[[279,514],[477.5,573.5],[477.5,778.4],[279,844.5]],[[172,587],[370.5,646.5],[370.5,851.4],[172,917.5]],[[64,660],[262.5,719.5],[262.5,924.4],[64,990.5]]];
const TILES = [[[709.4,223.4],[908.9,283],[908.9,488.5],[709.4,554.8]],[[387.8,441.8],[587.4,501.5],[587.4,707],[387.8,773.3]]];

// ----- The canvas -----

/** The shape of the canvas, its unit (pixels per pixel of the 1080 canvas) and the frame inside the margins and inside
 * what the platform shows (c.safe, c.avoid). c.floor is the smallest readable text there. */
function canvas(c, margin) {
	const r = c.W / c.H;
	let shape = r > 2.4 ? 'strip' : r > 1.2 ? 'wide' : r > 0.95 ? 'square' : r > 0.7 ? 'portrait' : 'story';
	const bars = (c.avoid ?? []).filter((z) => z.x <= 0 && z.w >= c.W - 1);
	const sides = (c.avoid ?? []).filter((z) => z.y <= 0 && z.h >= c.H - 1);
	const corners = (c.avoid ?? []).filter((z) => !bars.includes(z) && !sides.includes(z));
	const top = Math.max(0, ...bars.filter((z) => z.y <= 0).map((z) => z.h));
	const foot = Math.min(c.H, ...bars.filter((z) => z.y > 0).map((z) => z.y));
	// A story's bars, or the part of YouTube's art every device shows.
	const safe = c.safe ?? (top > 100 ? { x: 0, y: top, w: c.W, h: foot - top } : undefined);
	let u = shape === 'wide' ? Math.min(c.W / 1200, c.H / 630) : c.W / 1080;
	let m = margin * u;
	let frame = [m, m, c.W - 2 * m, c.H - 2 * m];
	if (safe) {
		const x = Math.max(m, safe.x + 24);
		const y = Math.max(m, safe.y + 16);
		frame = [x, y, Math.min(c.W - m, safe.x + safe.w - 24) - x, Math.min(c.H - m, safe.y + safe.h - 16) - y];
		if (safe.w / safe.h > 2.4) shape = 'strip';
	}
	let logoX;
	if (shape === 'strip') {
		const h = safe ? safe.h : c.H;
		const w = safe ? safe.w : c.W;
		u = safe ? 1.4 : Math.min(h / 500, w / 1200) ** 0.5;
		m = safe ? 24 : Math.min(48, Math.max(24, h * 0.1 + 8));
		if (!safe) {
			const y = Math.max(m, top + 8);
			const b = Math.min(c.H - m, foot - 8);
			const l = Math.max(m, ...sides.filter((z) => z.x <= 0).map((z) => z.w + 8));
			const e = Math.min(c.W - m, ...sides.filter((z) => z.x > 0).map((z) => z.x - 8));
			frame = [l, y, e - l, b - y];
			logoX = l;
		}
		// Words and pictures stand between the profile picture and any other corner the platform draws over; the logo may
		// stand above the profile picture.
		for (const z of corners) {
			if (z.x < c.W / 2) frame = [z.x + z.w + 20, frame[1], frame[0] + frame[2] - (z.x + z.w + 20), frame[3]];
			else frame = [frame[0], frame[1], Math.min(frame[2], z.x - 16 - frame[0]), frame[3]];
		}
	} else {
		const z = corners.find((k) => k.x > c.W / 2);
		if (z) frame = [frame[0], frame[1], frame[2], Math.min(frame[3], z.y - 24 - frame[1])];
	}
	const [x, y, w, h] = frame;
	return { ...c, safe, shape, u, m, frame, x, y, w, h, r: x + w, b: y + h, cx: x + w / 2, cy: y + h / 2, f: c.floor ?? 0, logoX: logoX ?? x, profile: corners.some((z) => z.x < c.W / 2) };
}

const ROW_H = 28;
/** The lockup in a corner row (183 by 28 on the 1080 canvas). */
function logo(v, corner, o = {}) {
	const k = v.shape === 'strip' ? Math.max(0.72, v.safe ? v.u : Math.min(1, v.u)) : v.u;
	const w = 183 * k;
	const h = ROW_H * k;
	const left = corner.endsWith('left');
	const right = corner.endsWith('right');
	const x = left ? (v.shape === 'strip' && !v.safe ? v.logoX : v.x) : right ? v.r - w : v.cx - w / 2;
	return { type: 'logo', lockup: 'horizontal', color: 'white', corner, align: left ? 'left' : right ? 'right' : 'center', box: [x, corner.startsWith('top') ? v.y : v.b - h, w, h], ...o };
}
/** The address, a label in capitals as the site's share card sets its page (12/16 there, 14/20 here for the feed). */
function address(v, corner, kind = 'label', o = {}) {
	const k = v.shape === 'strip' ? Math.max(0.8, v.safe ? v.u : Math.min(1, v.u)) : v.u;
	if (kind === 'ad') {
		const size = Math.max(v.f, 20 * k);
		const w = Math.min(400 * k, v.w / 2);
		const left = corner.endsWith('left');
		const right = corner.endsWith('right');
		const cap = size * 0.7;
		const x = left ? v.x : right ? v.r - w : v.cx - w / 2;
		const top = corner.startsWith('top') ? v.y + (ROW_H * k - cap) / 2 : v.b - (56 * k + cap) / 2;
		return { type: 'text', slot: 'url', face: 'body', size, leading: size * 1.4, x, top, w, align: left ? 'left' : right ? 'right' : 'center', maxLines: 1, min: Math.max(v.f, size * 0.8), corner, color: 'white', caps: false, ...o };
	}
	const size = Math.max(v.f, 14 * k);
	const w = Math.min(400 * k, v.w / 2);
	const left = corner.endsWith('left');
	const right = corner.endsWith('right');
	const cap = size * 0.7;
	const x = left ? v.x : right ? v.r - w : v.cx - w / 2;
	const top = corner.startsWith('top') ? v.y + (ROW_H * k - cap) / 2 : v.b - (ROW_H * k + cap) / 2;
	return { type: 'text', slot: 'url', face: 'label', size, leading: size * (20 / 14), x, top, w, align: left ? 'left' : right ? 'right' : 'center', maxLines: 1, min: Math.max(v.f, size * 0.8), corner, color: TEXT_2, ...o };
}
/** A carousel's page number, set as the address is. */
const page = (v, corner) => ({ ...address(v, corner), slot: 'page', id: 'page' });
/** The site's large button: 56 tall, a 20px Medium label, 32px of padding, the 8px control corner. */
const button = (v, box, corner, o = {}) => {
	const align = corner?.endsWith('left') ? 'left' : corner?.endsWith('right') ? 'right' : 'center';
	const w = Math.min(box[2], 160 * v.u);
	const x = align === 'right' ? box[0] + box[2] - w : align === 'center' ? box[0] + (box[2] - w) / 2 : box[0];
	return { type: 'button', slot: 'cta', box: [x, box[1], w, 56 * v.u], size: Math.max(v.f, 20 * v.u), radius: 8 * v.u, corner, align, ...o };
};
const key = (v, _w, _h, gap, o = {}) => ({ type: 'button', slot: 'cta', w: 160 * v.u, h: 56 * v.u, size: Math.max(v.f, 20 * v.u), radius: 8 * v.u, gap: gap * v.u, ...o });
/** A head on the site's steps, at 1080-canvas numbers: four pixels of leading. */
const head = (v, size, _leading, o = {}) => {
	const [s, l] = step(size);
	return text(o.slot ?? 'headline', 'display', s * v.u, l * v.u, { gap: 0, ...o });
};
/** Text on the site's steps (28/36, 24/32, 20/28), in the secondary gray. */
const body = (v, size, _leading, gap, o = {}) => {
	const [s, l] = size >= 26 ? [28, 36] : size >= 22 ? [24, 32] : [20, 28];
	const px = Math.max(v.f, s * v.u);
	return text(o.slot ?? 'body', 'body', px, (l / s) * px, { gap: gap * v.u, color: TEXT_2, ...o });
};
const label = (v, slot, gap, o = {}) => {
	const px = Math.max(v.f, 14 * v.u);
	return text(slot, 'label', px, px * (20 / 14), { gap: gap * v.u, maxLines: 2, color: TEXT_2, ...o });
};

/** A headline size for a strip: 56 at 500px tall, 48 at 396, 28 at 191, as the Figma banners. */
const stripHead = (v) => {
	const h = v.safe ? v.safe.h * 1.55 : v.H;
	const pts = [[120, 20], [191, 28], [396, 48], [500, 56], [900, 92]];
	for (let i = 1; i < pts.length; i++) if (h <= pts[i][0]) return pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (h - pts[i - 1][0])) / (pts[i][0] - pts[i - 1][0]);
	return 92;
};
/** A strip's head line: the site's four pixels, scaled with the head. */
const stripLine = (s) => s + 4 * Math.max(0.5, s / 56);
/** The texture as the owner's ads set it: at full strength nearly to the edges. */
const AD = (v, o = {}) => A({ strength: 'hero', core: 0.8, ...o });
const done = (v, layers) => ({ layers: layers.filter(Boolean), frame: v.frame, unit: v.shape === 'strip' ? Math.max(0.62, v.u) : v.u });

// ----- Posts (1080 by 1080) -----

/** The ring: eight pictures and four of the site's light tiles around the lockup, as the site's closing section scatters
 * its pictures over the texture. */
function ring(c) {
	const v = canvas(c, 72);
	const sx = v.W / 1080;
	const sy = v.safe ? (v.safe.h + 60) / 1080 : v.H / 1080;
	const k = Math.min(1.35, Math.min(sx, sy) * (v.shape === 'wide' ? 1.3 : 1));
	const oy = v.safe ? v.safe.y - 30 : 0;
	const at = ([x, y, w, h]) => [(x + w / 2) * sx - (w * k) / 2, oy + (y + h / 2) * sy - (h * k) / 2, w * k, h * k];
	const tile = (file, w) => art(file, at(w), { id: 'pictures' });
	const lw = 261 * Math.min(k * 1.15, 1.4);
	const r = 4 * k;
	return done(v, [A({ strength: 'hero' }),
		{ type: 'logo', lockup: 'horizontal', color: 'white', box: [v.W / 2 - lw / 2 + 0.9 * k, oy + (540.364 * sy) - (lw * 40) / 261 / 2, lw, (lw * 40) / 261], align: 'center' },
		P(0, at([155, 287, 112, 146]), { radius: r }),
		tile('tile-a', [294.545, 155.127, 111.927, 145.309]),
		tile('tile-corridor', [96.218, 475.2, 127.636, 127.636]),
		P(1, at([131, 663, 160, 114]), { radius: r }), P(2, at([286, 788, 128, 128]), { radius: r }),
		tile('tile-c', [483.055, 826.691, 111.927, 145.309]),
		P(3, at([650, 795, 160, 114]), { radius: r }), P(4, at([813, 647, 112, 146]), { radius: r }),
		tile('tile-b', [856.145, 475.2, 127.636, 127.636]),
		P(5, at([789, 303, 160, 114]), { radius: r }), P(6, at([674, 155, 112, 146]), { radius: r }), P(7, at([476, 116, 128, 128]), { radius: r }),
	]);
}

/** One tall picture in front of the site's hero band, the lockup above and the headline below. */
function agents(c) {
	const v = canvas(c, 64);
	const words = c.has('headline');
	const wide = v.shape === 'wide';
	const u = v.u;
	const top = v.y + (wide ? 60 : 139) * u;
	const foot = v.b - (words ? (wide ? 118 : 189) * u : wide ? 0 : 40 * u);
	const ph = foot - top;
	const pw = Math.min((ph * 480) / 624, v.w);
	const photo = [v.W / 2 - pw / 2, top, pw, ph];
	const bh = Math.min(ph * 0.5, v.W * 0.28);
	const by = photo[1] + ph * 0.34 - bh / 2 + ph * 0.1;
	return done(v, [A(),
		art('hero-band', [0, by, v.W, bh]),
		P(0, photo, { id: 'picture', radius: 4 * u }),
		logo(v, 'top'),
		stack([v.W / 2 - (560 * u) / 2, foot + (wide ? 28 : 48) * u, 560 * u, v.b + (v.safe || wide ? 0 : 24) * u - foot - (wide ? 28 : 48) * u], [head(v, wide ? 40 : 44, 0, { align: 'center', maxLines: 2 })], { align: 'center', valign: 'top', prefer: foot + (wide ? 34 : 111) * u, grow: Math.min(900 * u, v.w) }),
		c.has('page') && page(v, 'top-right'),
	]);
}

/** A three by three grid of pictures and two of the site's light tiles, the hero band behind its top row. */
function grid(c) {
	const v = canvas(c, 72);
	const u = v.u;
	const wide = v.shape === 'wide';
	const words = c.has('headline');
	const gap = 8 * u;
	if (wide) {
		const cell = (v.h - 2 * gap) / 3;
		const gx = v.r - 3 * cell - 2 * gap;
		const at = (i) => [gx + (i % 3) * (cell + gap), v.y + Math.floor(i / 3) * (cell + gap), cell, cell];
		const k = cell / 200;
		return done(v, [A({ from: 'right' }),
			art('hero-band', [gx - 24 * u, v.y + cell * 0.5, v.W - gx + 24 * u, cell * 1.4]),
			...cells(at, k),
			logo(v, 'top-left'),
			stack([v.x, v.y + 80 * u, gx - v.x - 64 * u, v.h - 130 * u], [head(v, 44, 0, { maxLines: 4 })], { valign: 'center', prefer: v.cy }),
			address(v, 'bottom-left'),
			c.has('page') && { ...page(v, 'top-left'), top: v.y + (ROW_H + 24) * u, w: Math.max(120 * u, gx - v.x - cell) },
		]);
	}
	const story = v.shape === 'story';
	const side = Math.min(v.w, (v.shape === 'square' ? 616 : 760) * u);
	const cell = (side - 2 * gap) / 3;
	const k = cell / 200;
	const gx = v.W / 2 - side / 2;
	const gy = v.shape === 'square' ? v.y + 104 * u : v.y + (words ? 128 : 160) * u;
	const at = (i) => [gx + (i % 3) * (cell + gap), gy + Math.floor(i / 3) * (cell + gap), cell, cell];
	const foot = gy + side;
	return done(v, [A({ strength: story ? 'hero' : 'quiet' }),
		// The band runs behind the grid's top row, clear of the lockup.
		art('hero-band', [0, gy + cell * 0.2, v.W, cell * 1.2]),
		...cells(at, k),
		logo(v, 'top'),
		stack([v.W / 2 - (560 * u) / 2, foot + 40 * u, 560 * u, v.b - 40 * u - foot - 40 * u], [head(v, 44, 0, { align: 'center', maxLines: 2 })], { align: 'center', prefer: foot + (story ? 96 : 64) * u, grow: Math.min(900 * u, v.w) }),
		address(v, 'bottom'),
		c.has('page') && page(v, 'bottom-right'),
	]);
	function cells(at2, k2) {
		const r = 4 * k2;
		return [
			{ type: 'split', index: 0, box: at2(0), shift: 8 * k2, bleed: 12 * k2 },
			...[1, 2, 3].map((i) => P(i, at2(i), { radius: r })),
			art('tile-b', at2(4), { id: 'pictures' }),
			...[4, 5, 6, 7].map((i) => P(i, at2(i + 1), { radius: r })),
		];
	}
}

/** A headline and a paragraph between two of the site's light ribbons, laid upright at each side. */
function strips(c) {
	const v = canvas(c, 72);
	const u = v.u;
	const strip = v.shape === 'strip';
	const sw = strip ? Math.min(v.W * 0.09, 130) : v.shape === 'wide' ? 130 * u : 160 * u;
	const lights = [
		art('video-light-a', [0, 0, sw, v.H], { turn: true }),
		{ ...art('video-light-b', [v.W - sw, 0, sw, v.H], { turn: true, flip: 'x' }), id: 'light-2' },
	];
	if (strip) {
		const s = stripHead(v);
		const x = Math.max(v.x, sw + v.m);
		const w = Math.min(v.r, v.W - sw - v.m) - x;
		const tall = v.h > 200;
		const f = { ...v, x, w, r: x + w, logoX: sw + v.m, frame: [x, v.y, w, v.h] };
		return done(f, [A(), ...lights, logo({ ...f }, 'top-left'),
			stack([x, v.y + ROW_H * (v.safe ? 1.4 : 1) + (tall ? 28 : 12), w, v.h - ROW_H * (v.safe ? 1.4 : 1) - (tall ? 28 : 12)], [text('headline', 'display', s, stripLine(s), { maxLines: 3 }), text('body', 'body', Math.max(v.f, s * 0.43), Math.max(v.f, s * 0.43) * 1.4, { gap: s * 0.6, maxLines: 3, color: TEXT_2 })], { valign: 'center' }),
			tall && address({ ...f }, 'top-right')]);
	}
	const x = sw + v.m;
	const f = { ...v, x, w: v.W - 2 * x, r: v.W - x, frame: [x, v.y, v.W - 2 * x, v.h] };
	return done(f, [A(), ...lights,
		logo(f, 'top-left'),
		stack([x, v.y + 84 * u, f.w, v.h - (84 + 56) * u], [head(v, 56, 0, { maxLines: 4 }), body(v, 24, 0, 40, { w: v.shape === 'wide' ? f.w : Math.max(560 * u, f.w - 56 * u), maxLines: 4 })], { prefer: v.shape === 'square' ? v.y + 312.2 * u : undefined, valign: v.shape === 'square' ? 'top' : 'center' }),
		address(f, 'bottom-left'),
		c.has('page') && page(f, 'bottom-right'),
	]);
}

/** Post, headline over a band (the site's light ribbon across), and the Open Graph card derived from it. */
function band(c, card = false) {
	const v = canvas(c, card && (c.W / c.H) > 1.2 ? 64 : 72);
	const u = v.u;
	if (v.shape === 'strip') {
		const s = stripHead(v);
		const tall = v.h > 200;
		const bh = Math.round((v.safe ? v.safe.h : v.H) * (tall ? 0.26 : 0.22));
		const by = v.safe ? v.safe.y + v.safe.h - bh : v.H - bh;
		const top = v.y + (tall ? ROW_H * (v.safe ? 1.4 : 1) + 28 : ROW_H * 0.8 + 8);
		return done(v, [A(), art('video-light-a', [0, by, v.W, bh]),
			logo(v, 'top-left'),
			stack([v.r - Math.min(v.w, 900), top, Math.min(v.w, 900), by - (tall ? 28 : 12) - top], [text('headline', 'display', s, stripLine(s), { maxLines: 2 }), text('body', 'body', Math.max(v.f, s * 0.42), Math.max(v.f, s * 0.42) * 1.4, { gap: s * 0.5, maxLines: 2, color: TEXT_2 })], { valign: 'center', align: 'right', grow: v.w }),
			address(v, 'top-right')]);
	}
	if (v.shape === 'wide') {
		const withBody = c.has('body');
		const tight = v.f > 24;
		const bh = withBody ? (tight ? 84 : 112) * u : 178 * u;
		const by = withBody ? v.y + v.h * (tight ? 0.5 : 0.545) : v.H - bh;
		const bw = Math.min(v.w, (tight ? 820 : 600) * u);
		const size = withBody ? 64 : 72;
		return done(v, [A({ from: 'top' }), art('video-light-a', [0, by, v.W, bh]),
			logo(v, 'top-left'), address(v, 'top-right'),
			stack([v.x, v.y + 68 * u, (withBody ? 940 : 760) * u, by - 40 * u - v.y - 68 * u], [head(v, size, 0, { maxLines: 3 })], { prefer: v.y + (withBody ? 84 : 128 + (v.H / u - 630) / 2) * u, grow: v.w }),
			withBody && stack([v.r - bw, by + bh + 32 * u, bw, v.b + 6 * u - by - bh - 32 * u], [body(v, 24, 0, 0, { maxLines: 4 })], { valign: 'bottom', align: 'left' }),
			c.has('page') && { ...page(v, 'bottom-left'), w: withBody ? Math.max(80 * u, v.w - bw - 32 * u) : page(v, 'bottom-left').w }]);
	}
	const plain = card && !c.has('body');
	const by = v.y + (plain ? 0.62 : 448 / 936) * v.h;
	const bh = 160 * u;
	return done(v, [A({ from: 'top' }), art('video-light-a', [0, by, v.W, bh]),
		logo(v, 'top-left'),
		stack([v.x, v.y + 84 * u, (plain ? 780 : 900) * u, by - 40 * u - v.y - 84 * u], [head(v, plain ? 96 : 72, 0, { maxLines: 3 })], { prefer: v.y + 145.4 * u, grow: v.w }),
		stack([v.r - 400 * u, by + bh + 48 * u, 400 * u, v.b - 6.2 * u - by - bh - 48 * u], [body(v, 24, 0, 0, { maxLines: 8 })], { valign: 'bottom', align: 'left' }),
		address(v, 'bottom-left'),
		c.has('page') && page(v, 'top-right'),
	]);
}

/** The site's corner lights (the sign-in pages' set), in the corners named: tl, tr, bl, br. */
function corners(v, k = 1, which = ['tl', 'br']) {
	const w = Math.min(v.W, v.H) * 0.62 * k;
	const h = w * (468 / 624);
	const at = { tl: [0, 0], tr: [v.W - w, 0], bl: [0, v.H - h], br: [v.W - w, v.H - h] };
	return which.map((c, i) => ({ ...art(`corner-${c}`, [...at[c], w, h]), id: i ? 'light-2' : 'light' }));
}

/** Post, offer: centered copy between the corner lights. */
function offer(c, wideFoot = false) {
	const v = canvas(c, v0(c) === 'wide' ? 64 : 72);
	const u = v.u;
	if (v.shape === 'strip') {
		const s = stripHead(v) * 0.86;
		const tall = v.h > 200;
		const w = Math.min(v.w, 720);
		return done(v, [A(), ...corners(v, 0.9, ['tr', 'bl']),
			logo(v, 'top-left'),
			stack([v.cx - w / 2, v.y, w, v.h], [text('headline', 'display', s, stripLine(s), { align: 'center', maxLines: 2 }), text('price', 'label', Math.max(v.f, s * 0.3), Math.max(v.f, s * 0.3) * 1.43, { gap: s * 0.6, align: 'center', maxLines: 2, color: TEXT_2 }), { type: 'button', slot: 'cta', w: 160, h: tall ? 56 : Math.max(40, v.f * 2), size: Math.max(v.f, tall ? 20 : 14), radius: 8, gap: s * 0.6 }], { align: 'center', valign: 'center' }),
			tall && address(v, 'bottom-right')]);
	}
	const wide = v.shape === 'wide';
	const items = [head(v, 64, 0, { align: 'center', maxLines: wide ? 2 : 3 }), label(v, 'price', 32, { align: 'center' }), key(v, 0, 0, c.has('price') ? 32 : wide ? 56 : 48)];
	if (wide) {
		const h = v.H / u;
		return done(v, [A(), ...corners(v, 0.9, ['tl', 'tr']),
			logo(v, 'bottom-left'), address(v, 'bottom-right'),
			stack([v.W / 2 - 340 * u, v.y, 680 * u, v.h - 60 * u], items, { align: 'center', valign: 'center', prefer: (230 + 128 + (h - 630) / 2) * u, grow: 760 * u })]);
	}
	return done(v, [A(), ...corners(v, 0.8, ['tr', 'bl']),
		logo(v, 'top'),
		stack([v.W / 2 - 340 * u, v.y + 96 * u, 680 * u, v.h - (96 + 72) * u], items, { align: 'center', valign: 'center', prefer: v.y + (483.4 / 936) * v.h }),
		address(v, 'bottom'),
		c.has('page') && page(v, 'bottom-right'),
	]);
}
function v0(c) {
	const r = c.W / c.H;
	return r > 2.4 ? 'strip' : r > 1.2 ? 'wide' : 'tall';
}

// ----- Ads (1080 by 1350) -----

/** The site's hero, as an ad: the head and the lead, its prompt in front of the hero band, three pictures, a button. */
function search(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	const tall = v.h / u;
	const square = v.shape === 'square';
	const bandY = v.y + (square ? 250 : 376) * u + (tall > 1300 ? 40 * u : 0);
	const bandH = (square ? 190 : 240) * u;
	const py = bandY + bandH + 48 * u;
	const ph = Math.min(foot - (square ? 40 : 102) * u - py, 560 * u);
	const gap = 24 * u;
	const pw = (v.w - 2 * gap) / 3;
	return done(v, [AD(v),
		art('ad-band', [0, bandY, v.W, bandH], { edge: 'hard' }),
		logo(v, 'top-left'),
		stack([v.x, v.y + 64 * u, v.w, bandY - 36 * u - v.y - 64 * u], [head(v, square ? 48 : 56, 0, { w: 760 * u, maxLines: 2 }), body(v, 24, 0, 32, { w: 660 * u, maxLines: 2, color: 'white' })], { prefer: v.y + (square ? 72 : 102) * u }),
		{ type: 'search', box: [v.x, bandY + bandH / 2 - 44 * u, v.w, 88 * u], slot: 'prompt', button: 'Search', size: Math.max(v.f, 24 * u), id: 'prompt' },
		...list(3).map((i) => P(i, [v.x + i * (pw + gap), py, pw, ph], { radius: 4 * u })),
		button(v, [v.x, foot, 258 * u, 56 * u], 'bottom-left'),
		address(v, 'bottom-right', 'ad'),
	]);
}

/** Twelve pictures as the walls of a corridor, the site's corridor light at its end. */
function corridor(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const portrait = v.shape === 'portrait';
	const top = portrait ? v.y + 264 * u : v.y + (v.shape === 'square' ? 196 : 300) * u;
	const bottom = portrait ? v.y + 1008 * u : v.b - (v.shape === 'square' ? 176 : 250) * u;
	const ky = (bottom - top) / 744;
	const q = ([x, y]) => [x * (v.W / 1080), top + (y - 328) * ky];
	const lw = 140 * (v.W / 1080);
	const lh = 104 * ky;
	return done(v, [AD(v),
		art('tile-corridor', [470 * (v.W / 1080), top + 320 * ky, lw, lh]),
		...CORRIDOR.map((quad, i) => ({ type: 'panel', quad: quad.map(q), index: i, bleeds: true })),
		logo(v, 'top-left'), address(v, 'top-right', 'ad'),
		stack([v.W / 2 - 350 * u, v.y + 60 * u, 700 * u, top - 24 * u - v.y - 60 * u + 60 * ky * u], [head(v, v.shape === 'square' ? 48 : 56, 0, { align: 'center', maxLines: 2 })], { align: 'center', prefer: v.y + (v.shape === 'square' ? 84 : 104) * u }),
		stack([v.W / 2 - 260 * u, bottom + 16 * u, 520 * u, v.b - 56 * u - 40 * u - bottom - 16 * u], [body(v, 24, 0, 0, { align: 'center', maxLines: 2, color: 'white' })], { align: 'center', valign: c.has('cta') ? 'bottom' : 'center', prefer: portrait ? v.b - 137 * u : undefined, grow: 700 * u }),
		button(v, [v.W / 2 - 129 * u, v.b - 56 * u, 258 * u, 56 * u], 'bottom'),
	]);
}

/** A wide picture in front of the site's hero band, the headline and a line under it. */
function photo(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	if (v.shape === 'wide') {
		const w = v.w * 0.52;
		const box = [v.r - w, v.y, w, v.h];
		const lx = box[0] - 90 * u;
		return done(v, [A({ from: 'left' }),
			art('close-band', [lx, 0, v.W - lx, v.H], { at: [0.6, 0.5] }),
			P(0, box, { id: 'picture', radius: 4 * u }),
			logo(v, 'top-left'),
			stack([v.x, v.y + 68 * u, lx - v.x - 24 * u, foot - 32 * u - v.y - 68 * u], [head(v, 48, 0, { maxLines: 4 }), body(v, 20, 0, 24, { maxLines: 5 })], { valign: 'center' }),
			button(v, [v.x, foot, 220 * u, 56 * u], 'bottom-left', { id: 'cta' }),
			!c.has('cta') && address(v, 'bottom-left'),
		]);
	}
	const square = v.shape === 'square';
	const top = v.y + 92 * u;
	const copy = (square ? 190 : 260) * u + (v.shape === 'story' ? 40 * u : 0);
	const ph = v.shape === 'portrait' ? 640 * u : foot - 40 * u - copy - top;
	const end = top + ph;
	const bh = Math.min(ph * 0.6, 300 * u);
	return done(v, [A({ from: 'top' }),
		art('hero-band', [0, top + ph * 0.55 - bh / 2, v.W, bh]),
		logo(v, 'top-left'),
		P(0, [v.x, top, v.w, ph], { id: 'picture', radius: 4 * u }),
		stack([v.x, end + 54 * u, v.w, foot - 32 * u - end - 54 * u], [head(v, square ? 48 : 56, 0, { w: 600 * u, maxLines: 2 }), body(v, 24, 0, 24, { maxLines: 2 })], { prefer: end + 64 * u, grow: v.w }),
		button(v, [v.x, foot, 258 * u, 56 * u], 'bottom-left'),
		address(v, 'bottom-right', 'label', { top: foot + 21 * u }),
	]);
}

function testimonial(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	const items = [text('quote', 'display', 48 * u, 52 * u, { maxLines: 3 }), text('name', 'medium', 20 * u, 28 * u, { gap: 48 * u, maxLines: 1 }), label(v, 'role', 16)];
	if (v.shape === 'wide') {
		// The portrait on the left, the quote beside it, a light ribbon upright at the right edge.
		const sw = 100 * u;
		const pw = c.pictures ? Math.min(330 * u, (v.h * 464) / 580) : 0;
		const x = pw ? v.x + pw + 64 * u : v.x;
		const f = { ...v, x, r: v.r - sw - 8 * u, w: v.r - sw - 8 * u - x, frame: [v.x, v.y, v.w - sw - 8 * u, v.h] };
		return done(f, [A(),
			art('video-light-b', [v.W - sw, 0, sw, v.H], { turn: true, flip: 'x' }),
			pw && P(0, [v.x, v.y, pw, v.h], { id: 'picture', radius: 4 * u }),
			logo(f, 'top-left'),
			stack([x, v.y + 64 * u, f.w, foot - 32 * u - v.y - 64 * u], items.map((i) => (i.slot === 'quote' ? { ...i, size: 40 * u, leading: 44 * u, maxLines: 5 } : { ...i, gap: i.gap * 0.6 })), { valign: 'center' }),
			button(v, [x, foot, 220 * u, 56 * u], 'bottom-left'),
			address(f, 'bottom-right', 'label', { top: foot + 21 * u }),
		]);
	}
	const square = v.shape === 'square';
	const pics = c.pictures > 0;
	const ph = square ? 340 * u : v.shape === 'story' ? 560 * u : 580 * u;
	const py = v.y + 96 * u;
	const bandY = pics ? py + ph * 0.293 : v.y + 96 * u;
	const bandH = pics ? Math.min(240 * u, ph * 0.414) : square ? 160 * u : 240 * u;
	const end = pics ? py + ph : bandY + bandH;
	return done(v, [A(),
		art(pics ? 'hero-band' : 'video-light-b', [0, bandY, v.W, bandH]),
		logo(v, 'top-left'),
		pics && P(0, [v.x, py, (ph * 464) / 580, ph], { id: 'picture', radius: 4 * u }),
		stack([v.x, end + 48 * u, v.w, foot - 40 * u - end - 48 * u], [{ ...items[0], w: 920 * u, size: (square ? 40 : 48) * u, leading: (square ? 44 : 52) * u }, { ...items[1], gap: (square ? 32 : 48) * u }, items[2]], { prefer: end + (square ? 56 : 72) * u, valign: pics ? 'top' : 'center', ...(pics ? {} : { prefer: undefined }) }),
		button(v, [v.x, foot, 258 * u, 56 * u], 'bottom-left'),
		address(v, 'bottom-right', 'label', { top: foot + 21 * u }),
	]);
}

/** The headline over the site's plan card (#262626, the container corner), the close band above. */
function plan(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const card = (o = {}) => ({ type: 'card', id: 'card', w: 600 * u, pad: 40 * u, padTop: 40 * u, fill: 'card-fill', radius: 4 * u, gap: 48 * u, items: [
		text('plan', 'display', 40 * u, 44 * u, { maxLines: 2 }),
		body(v, 24, 0, 32, { slot: 'price', maxLines: 2, color: 'white' }),
		{ ...body(v, 20, 0, 48, { slot: 'features', maxLines: 2, w: 520 * u, color: 'white' }), type: 'list', itemGap: 16 * u },
		{ ...key(v, 0, 0, 48), w: 520 * u, align: 'center' },
	], ...o });
	const hasCard = c.has('plan') || c.has('price') || c.has('features') || c.has('cta');
	if (v.shape === 'wide') {
		const cw = 520 * u;
		return done(v, [AD(v),
			art('close-band', [0, 0, v.W, v.y + v.h * 0.3 - 40 * u], { at: [0.5, 0.42] }),
			stack([v.x, v.y + v.h * 0.3, hasCard ? v.w - cw - 56 * u : v.w, v.h * 0.7 - 72 * u], [head(v, 64, 0, { maxLines: 4 })], { valign: 'bottom' }),
			hasCard && stack([v.r - cw, v.y, cw, v.h], [card({ w: cw, pad: 32 * u, padTop: 32 * u, gap: 0, items: card().items.map((i) => (i.type === 'button' ? { ...i, w: cw - 64 * u } : i)) })], { valign: 'center' }),
			logo(v, 'bottom-left'),
			!hasCard && address(v, 'bottom-right'),
		]);
	}
	const square = v.shape === 'square';
	const foot = v.b - 28 * u;
	const bottom = foot - 56 * u;
	// The headline starts below the swoosh, where the owner's ads set it (the box starts there, so a rebuild from blocks keeps it clear).
	const top = square ? v.y + 64 * u : v.safe ? v.y + 360 * u : v.y + 280 * u;
	return done(v, [AD(v),
		art('ad-swoosh', [0, square ? -230 * u : 0, v.W, v.W * (1100 / 2160)]),
		stack([v.W / 2 - 380 * u, top, 760 * u, bottom - top], [head(v, 72, 0, { align: 'center', maxLines: square ? 2 : 3, w: 700 * u }), ...(hasCard ? [{ ...card(), gap: 56 * u }] : [])], { align: 'center', prefer: square ? undefined : v.safe ? v.y + 372 * u : v.y + 289 * u, valign: square ? 'center' : 'top' }),
		logo(v, 'bottom-left'), address(v, 'bottom-right', 'ad'),
	]);
}

/** Six pictures and two of the site's light tiles turned in a row, as the site's hero turns its creatives. */
function row(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	const wide = v.shape === 'wide';
	const area = wide ? [v.x + v.w * 0.36, v.y - 24 * u, v.w * 0.64, v.h + 24 * u] : [v.x, v.y + (v.shape === 'portrait' ? 86 : 64) * u, v.w, (v.shape === 'portrait' ? 841 * u : foot - 64 * u - v.y - 64 * u - (v.shape === 'story' ? 60 : 0) * u)];
	const k = Math.min(area[2] / 951.5, area[3] / 840.5);
	const ox = wide ? area[0] + area[2] - 951.5 * k : area[0] + (area[2] - 951.5 * k) / 2;
	const oy = area[1] + (area[3] - 840.5 * k) / (v.shape === 'portrait' ? 1e9 : 2);
	const q = ([x, y]) => [ox + (x - 64) * k, oy + (y - 150) * k];
	const tile = (file, quad, o = {}) => {
		const pts = quad.map(q);
		const xs = pts.map((p) => p[0]);
		const ys = pts.map((p) => p[1]);
		return art(file, [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)], { id: 'pictures', clipQuad: pts, ...o });
	};
	return done(v, [AD(v),
		{ type: 'panel', quad: ROW[0].map(q), index: 0 },
		tile('ad-swoosh', TILES[0], { at: [0.88, 0.35] }),
		{ type: 'panel', quad: ROW[1].map(q), index: 1 }, { type: 'panel', quad: ROW[2].map(q), index: 2 },
		tile('ad-swoosh', TILES[1], { at: [0.2, 0.3] }),
		...[3, 4, 5].map((i) => ({ type: 'panel', quad: ROW[i].map(q), index: i })),
		logo(v, 'top-left'),
		wide
			? stack([v.x, v.y + 68 * u, v.w * 0.33, v.b - v.y - 68 * u], [head(v, 44, 0, { maxLines: 5 }), key(v, 0, 0, 40)], { valign: 'top' })
			: stack([v.x, oy + 840.5 * k + 24 * u, 440 * u, v.b - oy - 840.5 * k - 24 * u], [head(v, 48, 0, { maxLines: 2 })], { valign: 'bottom', prefer: v.b - 0.2 * u, grow: c.has('cta') ? (v.shape === 'portrait' ? 480 : 440) * u : v.w }),
		!wide && button(v, [v.r - 241 * u, foot, 241 * u, 56 * u], 'bottom-right'),
	]);
}

// ----- Banners (1500 by 500, 1584 by 396, 1128 by 191) -----

function tagline(c, pictures) {
	const v = canvas(c, 64);
	const strip = v.shape === 'strip';
	const s = strip ? stripHead(v) * (pictures || v.H < 300 ? 1 : 1.5) : 72 * v.u;
	const n = pictures ? 6 : 0;
	if (strip) {
		const figma = v.W === 1500 && v.H === 500 ? [96, 12, 120] : v.W === 1584 && v.H === 396 ? [104, 16, 130] : undefined;
		const h = v.safe ? v.safe.h : v.H;
		const [pw, gap, ph] = figma ?? [h * 0.23, h * 0.03, h * 0.2875];
		const row = n * pw + (n - 1) * gap;
		const space = v.w - row - 24;
		const tw = Math.min(pictures ? space : v.w * 0.5, v.H < 300 ? s * 15.2 : pictures ? s * 8.04 : s * 10);
		const py = v.safe ? v.safe.y + (h - ph) / 2 : v.H / 2 - ph / 2;
		const reach = pictures ? v.x + row + 8 : v.r - Math.max(tw, v.w * 0.5) - 32;
		return done(v, [A({ from: 'right' }), art('close-band', [0, 0, reach, v.H], { at: [0.42, 0.5] }),
			stack([v.r - tw, v.y, tw, v.h], [text('headline', 'display', s, stripLine(s), { maxLines: v.H < 300 ? 1 : 2 })], { align: 'right', valign: 'center', grow: pictures ? space : v.w * 0.5, prefer: v.safe ? undefined : v.H / 2 }),
			...list(n).map((i) => P(i, [v.x + (pw + gap) * i, py, pw, ph], { radius: 4 * Math.min(1, v.u) }))]);
	}
	const u = v.u;
	const gap = 12 * u;
	const pw = (v.w - 5 * gap) / 6;
	const ph = pw * 1.25;
	const wide = v.shape === 'wide';
	const py = wide ? v.b - ph : v.cy + 40 * u;
	const tw = Math.min(v.w * 0.5, 560 * u);
	// Without pictures the close band runs across the foot, at its own proportions, under the tagline.
	const bandH = v.W * (880 / 3280);
	return done(v, [A({ from: 'right' }), n ? art('close-band', [0, py - ph * 0.6, v.W, ph * 2.2]) : art('close-band', [0, v.H - bandH, v.W, bandH]),
		logo(v, 'top-right'),
		...list(n).map((i) => P(i, [v.x + (pw + gap) * i, py, pw, ph], { radius: 4 * u })),
		n ? stack([v.r - Math.min(v.w, 760 * u), v.y + 60 * u, Math.min(v.w, 760 * u), py - ph * 0.6 - 40 * u - v.y - 60 * u], [text('headline', 'display', s, s + 4 * u, { maxLines: 3 })], { align: 'right', valign: 'bottom' })
			: stack([v.r - tw, v.y + 80 * u, tw, v.H - bandH - 32 * u - v.y - 80 * u], [text('headline', 'display', s, s + 4 * u, { maxLines: 4 })], { align: 'right', valign: wide ? 'bottom' : 'center' }),
	]);
}

function creatives(c) {
	const v = canvas(c, 64);
	const strip = v.shape === 'strip';
	const figma = v.W === 1500 && strip ? [120, 16, 150] : v.W === 1584 && strip ? [104, 16, 130] : undefined;
	const h = v.safe ? v.safe.h : v.H;
	const [pw, gap, ph] = figma ?? (strip ? [h * 0.27, h * 0.036, h * 0.34] : (() => { const g = 14 * v.u; const w = (v.w - 5 * g) / 6; return [w, g, w * 1.25]; })());
	const w = 6 * pw + 5 * gap;
	const x = Math.max(v.W / 2 - w / 2, strip ? v.x : 0);
	const y = (v.safe ? v.safe.y + v.safe.h / 2 : v.H / 2) - ph / 2;
	return done(v, [A({ strength: 'hero' }), art('close-band', [0, 0, v.W, v.H]), ...list(6).map((i) => P(i, [Math.min(x, v.r - w) + (pw + gap) * i, y, pw, ph], { radius: 4 * Math.min(1, v.u) }))]);
}

// ----- Logo and avatar -----

const mark = (share, ratio, lockup = 'mark') => (c) => {
	const k = Math.min(c.W / share[0], c.H / share[1]);
	const w = ratio[0] * k;
	const h = ratio[1] * k;
	return { layers: [{ type: 'logo', lockup, color: '$mark', box: [(c.W - w) / 2, (c.H - h) / 2, w, h], align: 'center', required: true }], frame: [c.W * 0.08, c.H * 0.08, c.W * 0.84, c.H * 0.84], unit: Math.min(c.W, c.H) / 1080 };
};

// ----- Story -----

/** The story derived from Post, offer: the corner lights, copy and button in the lower part of the safe area. */
function story(c) {
	const v = canvas(c, 64);
	if (v.shape === 'wide' || v.shape === 'strip') return offer(c);
	const u = v.u;
	const foot = v.b - 28 * u;
	return done(v, [A({ from: 'top', strength: 'hero' }), ...corners(v, 1.3, ['tl']),
		stack([v.x, v.y + v.h * 0.36, 760 * u, foot - 64 * u - v.y - v.h * 0.36], [head(v, 72, 0, { maxLines: 3 }), body(v, 24, 0, 40, { maxLines: 3 }), key(v, 0, 0, 48)], { valign: 'bottom' }),
		logo(v, 'bottom-left'), address(v, 'bottom-right'),
		c.has('page') && page(v, 'top-right'),
	]);
}

// ----- The site's Open Graph card -----

/** The site's own Open Graph card (spyglass.zip: src/app/tokens.css --og-*, public/og/*.png): the lockup top left (152
 * of 1200), the page in capitals top right, a row of up to five pictures (124x156, 152x188, 192x240, 152x188, 124x156,
 * 12 apart, from x 344, centered on y 264), the headline at the foot left in Funnel Display (72/76, stepping down as the
 * site's title sizes do), the ASCII texture behind, and the brand band across the top corner (the site bakes its lights as images and
 * runs them in from the right edge; the renderer draws the heat map unmirrored, so it enters from the top). Wide frames only; the
 * other shapes take the band card. */
function ogSite(c) {
	const v0 = canvas(c, 60);
	if (v0.shape !== 'wide') return band(c, true);
	const u = v0.u;
	const ox = (v0.W - 1200 * u) / 2;
	const oy = (v0.H - 630 * u) / 2;
	const v = { ...v0, m: 60 * u, x: ox + 60 * u, y: oy + 60 * u, w: 1080 * u, h: 510 * u, r: ox + 1140 * u, b: oy + 570 * u, frame: [ox + 60 * u, oy + 60 * u, 1080 * u, 510 * u] };
	v.cx = v.x + v.w / 2;
	const sizes = [[124, 156], [152, 188], [192, 240], [152, 188], [124, 156]];
	// Only pictures that were passed make the row: without them (even with --sample) the card is the lockup, the page and
	// the headline, never empty boxes.
	const n = Math.max(0, Math.min(5, c.real ?? c.pictures ?? 0));
	const pick = n === 5 ? [0, 1, 2, 3, 4] : n === 4 ? [0, 1, 2, 3] : n === 3 ? [1, 2, 3] : n === 2 ? [1, 2] : n === 1 ? [2] : [];
	const row = pick.reduce((sum, i) => sum + sizes[i][0], 0) + Math.max(0, pick.length - 1) * 12;
	let x = ox + (1136 - row) * u;
	const photos = pick.map((s, i) => {
		const [w, h] = sizes[s];
		const box = [x, oy + (264 - h / 2) * u, w * u, h * u];
		x += (w + 12) * u;
		return P(i, box, { id: `picture-${i + 1}`, radius: 4 * u });
	});
	const lockup = { ...logo(v, 'top-left'), box: [v.x, v.y, 152 * u, (152 * u * 28) / 183] };
	return done(v, [A(),
		// The site's own share-card light (public/og/pitch-light.png), at the card's height against its right edge.
		{ type: 'art', id: 'light', file: 'og-light', box: [ox + 313 * u, oy, 887 * u, 630 * u] },
		lockup,
		c.has('page') && { ...page(v, 'top-right'), top: v.y + ((152 * 28) / 183 / 2 - 4) * u },
		...photos,
		stack([v.x, oy + (n ? 300 : 140) * u, 680 * u, v.b - oy - (n ? 300 : 140) * u], [head(v, 72, 0, { maxLines: 3 })], { valign: 'bottom' }),
	]);
}

export const LAYOUTS = {
	'post-creative-ring': ring,
	'post-agents': agents,
	'post-any-brand': grid,
	'post-every-market': strips,
	'post-know-what-changed': (c) => band(c),
	'post-offer': (c) => offer(c),
	'ad-search-bar': search,
	'ad-corridor': corridor,
	'ad-photo': photo,
	'ad-testimonial': testimonial,
	'ad-creator-plan': plan,
	'ad-creative-row': row,
	'banner-tagline': (c) => tagline(c, false),
	'banner-creative-row': creatives,
	'banner-tagline-creatives': (c) => tagline(c, true),
	avatar: mark([400, 400], [200, 100]),
	'logo-background': mark([600, 600], [240, 119]),
	'logo-background-3d': mark([600, 600], [321, 240], 'mark-3d'),
	'logo-primary': mark([1920, 1080], [480, 239]),
	og: (c) => band(c, true),
	'og-offer': (c) => offer(c, true),
	'og-site': ogSite,
	story,
	'story-offer': plan,
};
