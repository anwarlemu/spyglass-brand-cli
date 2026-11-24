// The image layouts, as functions of the canvas. Each one gives the layout of the Figma page "8. Brand assets" (file
// Qx2i6GhXZD1V4O7RE7hYQi) at that layout's own frame, number for number, and flows the same parts by the same rules at
// the other sizes: 64px margins on ads and 72px on posts (1080 canvas), the lockup in a corner or centered at the top,
// Funnel Display headlines, the light in from an edge or through its window, pictures on Black. image.json holds each
// template's name, source, copy slots and sizes; this file holds only positions.
//
// Text tops are the top of the capitals. A stack closes up around the copy that is there and steps down together when it
// is long. Lights: b is the Light B layer (x, y, width, height in its window), shift the step to Light G and Light R.
//
// layout(c) gets { W, H, size (the size id), has(slot), pictures (how many, placeholders included), real (how many were passed), safe, keepOut } and returns
// { layers, frame, unit }.

const A = (o = {}) => ({ type: 'ascii', ...o });
const scaled = (b, k, dx = 0, dy = 0) => [b[0] * k + dx, b[1] * k + dy, b[2] * k, b[3] * k];
const L = (b, shift, window, o = {}) => (window ? { type: 'light', window, b, shift, ...o } : { type: 'light', b, shift, ...o });
/** A full-frame light drawn for a w0 by h0 frame, covering another frame from the center. */
const cover = (b, shift, [w0, h0], c, o = {}) => {
	const k = Math.max(c.W / w0, c.H / h0);
	return L(scaled(b, k, (c.W - w0 * k) / 2, (c.H - h0 * k) / 2), shift * k, undefined, o);
};
/** A light in a window drawn for a 1080 canvas, at k times. */
const win = (b, shift, window, k = window[2] / 1080, o = {}) => L(scaled(b, k), shift * k, window, o);
const P = (index, box, o = {}) => ({ type: 'photo', index, box, ...o });
const text = (slot, face, size, leading, o = {}) => ({ type: 'text', slot, face, size, leading, ...o });
const stack = (box, items, o = {}) => ({ type: 'stack', box, items, ...o });
const list = (n) => Array.from({ length: n }, (_, i) => i);

const BAND = [-1331, -30, 2913.3, 1821.3]; // Post, headline over a band (966:4489)
const CORNER = [-533, -33, 1725.57, 1112.77]; // Post, offer (966:4421)
const FIELD = [-929, -39, 2465.1, 1541.1]; // Ad, plan offer (966:4541)
const CORRIDOR = [[[-60,328],[140,452],[140,948],[-60,1072]],[[170,470.6],[257.4,524.8],[257.4,875.2],[170,929.4]],[[272,533.8],[320.9,564.2],[320.9,835.8],[272,866.2]],[[330,569.8],[361.2,589.1],[361.2,810.9],[330,830.2]],[[368,593.4],[389.7,606.8],[389.7,793.2],[368,806.6]],[[394,609.5],[409.9,619.3],[409.9,780.7],[394,790.5]],[[940,452],[1140,328],[1140,1072],[940,948]],[[823,524.5],[910.4,470.4],[910.4,929.6],[823,875.5]],[[759,564.2],[807.9,533.9],[807.9,866.1],[759,835.8]],[[719,589],[750.2,569.7],[750.2,830.3],[719,811]],[[691,606.4],[712.7,592.9],[712.7,807.1],[691,793.6]],[[670,619.4],[685.9,609.5],[685.9,790.5],[670,780.6]]];
const ROW = [[[817,150],[1015.5,209.5],[1015.5,414.4],[817,480.5]],[[602,296],[800.5,355.5],[800.5,560.4],[602,626.5]],[[494,369],[692.5,428.5],[692.5,633.4],[494,699.5]],[[279,514],[477.5,573.5],[477.5,778.4],[279,844.5]],[[172,587],[370.5,646.5],[370.5,851.4],[172,917.5]],[[64,660],[262.5,719.5],[262.5,924.4],[64,990.5]]];
const TILES = [[[709.4,223.4],[908.9,283],[908.9,488.5],[709.4,554.8]],[[387.8,441.8],[587.4,501.5],[587.4,707],[387.8,773.3]]];
// The banners' "Background light" is a vector the exports do not include (its proportions are not the heat map's), so
// these windows onto the brand heat map were chosen by fitting each against its reference render: the light flowing in
// from the left edge behind the tagline, and a diagonal behind the row of creatives.
const BG = { tx: [-20,-661,2913,1821], tl: [-16,-523,2307,1442], tc: [-10,-330,1457,911], rx: [-250,-510,4661,2914], rl: [-198,-404,3692,2308], rc: [-96,-195,1781,1113] };

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
/** The address: body type on ads, a label on posts. */
function address(v, corner, kind = 'body', o = {}) {
	const k = v.shape === 'strip' ? Math.max(0.8, v.safe ? v.u : Math.min(1, v.u)) : v.u;
	const size = Math.max(v.f, kind === 'label' ? 14 * k : 20 * k);
	const w = Math.min(400 * k, v.w / 2);
	const left = corner.endsWith('left');
	const right = corner.endsWith('right');
	const cap = size * 0.7;
	const x = left ? v.x : right ? v.r - w : v.cx - w / 2;
	const top = corner.startsWith('top') ? v.y + (ROW_H * k - cap) / 2 - 2 * k : kind === 'label' ? v.b - 2 * k - cap : v.b - (ROW_H * k + cap) / 2 - 2 * k;
	return { type: 'text', slot: 'url', face: kind === 'label' ? 'label' : 'body', size, leading: kind === 'label' ? size : size * 1.3, x, top, w, align: left ? 'left' : right ? 'right' : 'center', maxLines: 1, min: Math.max(v.f, size * 0.8), corner, ...o };
}
/** A carousel's page number, set as the address is. */
const page = (v, corner, kind = 'label') => ({ ...address(v, corner, kind), slot: 'page', id: 'page' });
const button = (v, box, corner, o = {}) => ({ type: 'button', slot: 'cta', box, size: Math.max(v.f, 20 * v.u), radius: 10 * v.u, corner, align: corner?.endsWith('left') ? 'left' : corner?.endsWith('right') ? 'right' : 'center', ...o });
const key = (v, w, h, gap, o = {}) => ({ type: 'button', slot: 'cta', w: w * v.u, h: h * v.u, size: Math.max(v.f, 20 * v.u), radius: 10 * v.u, gap: gap * v.u, ...o });
/** Display type at 1080-canvas numbers. */
const head = (v, size, leading, o = {}) => text(o.slot ?? 'headline', 'display', size * v.u, leading * v.u, { gap: 0, ...o });
const body = (v, size, leading, gap, o = {}) => {
	const px = Math.max(v.f, size * v.u);
	return text(o.slot ?? 'body', 'body', px, (leading / size) * px, { gap: gap * v.u, ...o });
};
const label = (v, slot, gap, o = {}) => {
	const px = Math.max(v.f, 14 * v.u);
	return text(slot, 'label', px, px * 1.4, { gap: gap * v.u, maxLines: 2, ...o });
};

/** A headline size for a strip: 56 at 500px tall, 48 at 396, 28 at 191, as the Figma banners. */
const stripHead = (v) => {
	const h = v.safe ? v.safe.h * 1.55 : v.H;
	const pts = [[120, 20], [191, 28], [396, 48], [500, 56], [900, 92]];
	for (let i = 1; i < pts.length; i++) if (h <= pts[i][0]) return pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * (h - pts[i - 1][0])) / (pts[i][0] - pts[i - 1][0]);
	return 92;
};
const done = (v, layers) => ({ layers: layers.filter(Boolean), frame: v.frame, unit: v.shape === 'strip' ? Math.max(0.62, v.u) : v.u });

// ----- Posts (1080 by 1080) -----

function ring(c) {
	const v = canvas(c, 72);
	const sx = v.W / 1080;
	const sy = v.safe ? (v.safe.h + 60) / 1080 : v.H / 1080;
	const k = Math.min(1.35, Math.min(sx, sy) * (v.shape === 'wide' ? 1.3 : 1));
	const oy = v.safe ? v.safe.y - 30 : 0;
	const at = ([x, y, w, h]) => [(x + w / 2) * sx - (w * k) / 2, oy + (y + h / 2) * sy - (h * k) / 2, w * k, h * k];
	const light = (b, shift, w) => L(scaled(b, k), shift * k, at(w), { id: 'pictures', fixed: true, bleeds: false });
	const lw = 261 * Math.min(k * 1.15, 1.4);
	return done(v, [A(),
		{ type: 'logo', lockup: 'horizontal', color: 'white', box: [v.W / 2 - lw / 2 + 0.9 * k, oy + (540.364 * sy) - (lw * 40) / 261 / 2, lw, (lw * 40) / 261], align: 'center' },
		light([-612.655, -288.655, 752.487, 470.43], 11.417, [294.545, 155.127, 111.927, 145.309]),
		P(0, at([155, 287, 112, 146])),
		light([-644.072, -365.237, 858.099, 536.456], 13.019, [96.218, 475.2, 127.636, 127.636]),
		P(1, at([131, 663, 160, 114])), P(2, at([286, 788, 128, 128])),
		light([-622.473, -88.364, 752.487, 470.43], 11.416, [483.055, 826.691, 111.927, 145.309]),
		P(3, at([650, 795, 160, 114])), P(4, at([813, 647, 112, 146])),
		light([-691.2, -353.455, 858.099, 536.456], 13.019, [856.145, 475.2, 127.636, 127.636]),
		P(5, at([789, 303, 160, 114])), P(6, at([674, 155, 112, 146])), P(7, at([476, 116, 128, 128])),
	]);
}

function agents(c) {
	const v = canvas(c, 64);
	const words = c.has('headline');
	const wide = v.shape === 'wide';
	const u = v.u;
	// The picture between the lockup's row and the headline, 480 by 624 on the square.
	const top = v.y + (wide ? 60 : 139) * u;
	const foot = v.b - (words ? (wide ? 118 : 189) * u : wide ? 0 : 40 * u);
	const ph = foot - top;
	const pw = Math.min((ph * 480) / 624, v.w);
	const photo = [v.W / 2 - pw / 2, top, pw, ph];
	const bh = (200.291 / 1080) * (v.safe ? v.W : v.H);
	const by = photo[1] + (ph * 211.327) / 624;
	const k = v.W / 1080;
	return done(v, [A(),
		L(scaled([-251.345, -111.927, 2860.331, 1788.186], k), 43.397 * k, [0, by, v.W, bh], { fixed: true }),
		P(0, photo, { id: 'picture' }),
		logo(v, 'top'),
		stack([v.W / 2 - (516 * u) / 2, foot + (wide ? 28 : 48) * u, 516 * u, v.b + (v.safe || wide ? 0 : 24) * u - foot - (wide ? 28 : 48) * u], [head(v, wide ? 40 : 44, wide ? 44 : 48, { align: 'center', maxLines: 2 })], { align: 'center', valign: 'top', prefer: foot + (wide ? 34 : 111) * u, grow: Math.min(900 * u, v.w) }),
		c.has('page') && page(v, 'top-right'),
	]);
}

function grid(c) {
	const v = canvas(c, 72);
	const u = v.u;
	const wide = v.shape === 'wide';
	const words = c.has('headline');
	const gap = 8 * u;
	if (wide) {
		// The grid on the right over the light, the words on the left.
		const cell = (v.h - 2 * gap) / 3;
		const gx = v.r - 3 * cell - 2 * gap;
		const at = (i) => [gx + (i % 3) * (cell + gap), v.y + Math.floor(i / 3) * (cell + gap), cell, cell];
		const k = cell / 200;
		return done(v, [A(),
			win([-453, -30, 2913.3, 1821.3], 44.2, [gx - 2 * cell * 0.5, 0, v.W - gx + cell, v.H * 0.54], (v.W - gx + cell) / 1080, { fixed: true }),
			...cells(at, k),
			logo(v, 'top-left'),
			stack([v.x, v.y + 80 * u, gx - v.x - 2 * cell * 0.5 - 24 * u, v.h - 130 * u], [head(v, 44, 48, { maxLines: 4 })], { valign: 'center', prefer: v.cy }),
			address(v, 'bottom-left', 'label'),
			c.has('page') && page(v, 'top-right'),
		]);
	}
	const story = v.shape === 'story';
	const side = Math.min(v.w, (v.shape === 'square' ? 616 : 760) * u);
	const cell = (side - 2 * gap) / 3;
	const k = cell / 200;
	const gx = v.W / 2 - side / 2;
	const gy = v.shape === 'square' ? v.y + 104 * u : v.y + (words ? 128 : 160) * u;
	const at = (i) => [gx + (i % 3) * (cell + gap), gy + Math.floor(i / 3) * (cell + gap), cell, cell];
	const lh = gy + 410 * k;
	const foot = gy + side;
	return done(v, [A(),
		// On the taller frames the light is a band behind the lockup and the top of the grid.
		L(scaled([-453, -30, 2913.3, 1821.3], v.W / 1080), (44.2 * v.W) / 1080, [0, story ? gy - 178 * u : -2 * u, v.W, story ? lh - gy + 178 * u : v.shape === 'square' ? 586 * u : lh], { fixed: true }),
		...cells(at, k),
		// The lockup stands on the light's pale mass: the approved Black on pale, where White has no contrast.
		logo(v, 'top', { tone: 'auto' }),
		stack([v.W / 2 - (529 * u) / 2, foot + 40 * u, 529 * u, v.b - 40 * u - foot - 40 * u], [head(v, 44, 48, { align: 'center', maxLines: 2 })], { align: 'center', prefer: foot + (story ? 96 : 64) * u, grow: Math.min(900 * u, v.w) }),
		address(v, 'bottom', 'label'),
		c.has('page') && page(v, 'bottom-right'),
	]);
	function cells(at2, k2) {
		const tile = at2(4);
		const first = at2(0);
		return [
			{ type: 'split', index: 0, box: first, shift: 8 * k2, bleed: 12 * k2 },
			L(scaled([-1754, -1180, 2241, 1401], k2), 34 * k2, first, { id: 'pictures', fixed: true, bleeds: false }),
			...[1, 2, 3].map((i) => P(i, at2(i))),
			L(scaled([-157, -92, 2689.2, 1681.2], k2), 40.8 * k2, tile, { id: 'pictures', fixed: true, bleeds: false }),
			...[4, 5, 6, 7].map((i) => P(i, at2(i + 1))),
		];
	}
}

function strips(c) {
	const v = canvas(c, 72);
	const u = v.u;
	const strip = v.shape === 'strip';
	const sw = strip ? Math.min(v.W * 0.09, 130) : v.shape === 'wide' ? 130 * u : 160 * u;
	const k = v.H / 1080;
	const kk = Math.max(k, sw / 160);
	const lights = [
		L(scaled([-134, -160, 2241, 1401], kk), 34 * kk, [0, 0, sw, v.H]),
		L(scaled([-2014, -160, 2241, 1401], kk), 34 * kk, [v.W - sw, 0, sw, v.H]),
	];
	if (strip) {
		const s = stripHead(v);
		const x = Math.max(v.x, sw + v.m);
		const w = Math.min(v.r, v.W - sw - v.m) - x;
		const tall = v.h > 200;
		const f = { ...v, x, w, r: x + w, logoX: sw + v.m, frame: [x, v.y, w, v.h] };
		return done(f, [A(), ...lights, logo({ ...f }, 'top-left'),
			stack([x, v.y + ROW_H * (v.safe ? 1.4 : 1) + (tall ? 28 : 12), w, v.h - ROW_H * (v.safe ? 1.4 : 1) - (tall ? 28 : 12)], [text('headline', 'display', s, s * 1.07, { maxLines: 3 }), text('body', 'body', Math.max(v.f, s * 0.44), Math.max(v.f, s * 0.44) * 1.36, { gap: s * 0.6, maxLines: 3 })], { valign: 'center' }),
			tall && address({ ...f }, 'top-right')]);
	}
	const x = sw + v.m;
	const f = { ...v, x, w: v.W - 2 * x, r: v.W - x, frame: [x, v.y, v.W - 2 * x, v.h] };
	return done(f, [A(), ...lights,
		logo(f, 'top-left'),
		stack([x, v.y + 84 * u, f.w, v.h - (84 + 56) * u], [head(v, 56, 60, { maxLines: 4 }), body(v, 27, 38, 62.3, { w: v.shape === 'wide' ? f.w : Math.max(560 * u, f.w - 56 * u), maxLines: 4 })], { prefer: v.shape === 'square' ? v.y + 312.2 * u : undefined, valign: v.shape === 'square' ? 'top' : 'center' }),
		address(f, 'bottom-left', 'label'),
		c.has('page') && page(f, 'bottom-right'),
	]);
}

/** Post, headline over a band, and the Open Graph card derived from it. */
function band(c, card = false) {
	const v = canvas(c, card && (c.W / c.H) > 1.2 ? 64 : 72);
	const u = v.u;
	const k = v.W / 1080;
	if (v.shape === 'strip') {
		const s = stripHead(v);
		const tall = v.h > 200;
		const bh = Math.round((v.safe ? v.safe.h : v.H) * (tall ? 0.26 : 0.22));
		// In a safe area the band crosses the whole canvas, at the foot of the part everyone sees.
		const by = v.safe ? v.safe.y + v.safe.h - bh : v.H - bh;
		const top = v.y + (tall ? ROW_H * (v.safe ? 1.4 : 1) + 28 : ROW_H * 0.8 + 8);
		return done(v, [A(), L(scaled(BAND, k), 44.2 * k, [0, by, v.W, bh]),
			logo(v, 'top-left'),
			stack([v.r - Math.min(v.w, 900), top, Math.min(v.w, 900), by - (tall ? 28 : 12) - top], [text('headline', 'display', s, s * 1.05, { maxLines: 2 }), text('body', 'body', Math.max(v.f, s * 0.42), Math.max(v.f, s * 0.42) * 1.36, { gap: s * 0.5, maxLines: 2 })], { valign: 'center', align: 'right', grow: v.w }),
			address(v, 'top-right')]);
	}
	if (v.shape === 'wide') {
		const withBody = c.has('body');
		const tight = v.f > 24;
		const bh = withBody ? (tight ? 84 : 112) * u : 178 * u;
		const by = withBody ? v.y + v.h * (tight ? 0.5 : 0.545) : v.H - bh;
		const bw = Math.min(v.w, (tight ? 820 : 600) * u);
		const size = withBody ? 64 : 72;
		return done(v, [A(), L(scaled(BAND, k), 44.2 * k, [0, by, v.W, bh]),
			logo(v, 'top-left'), address(v, 'top-right'),
			stack([v.x, v.y + 68 * u, (withBody ? 940 : 760) * u, by - 40 * u - v.y - 68 * u], [head(v, size, size * 1.07, { maxLines: 3 })], { prefer: v.y + (withBody ? 84 : 128 + (v.H / u - 630) / 2) * u, grow: v.w }),
			withBody && stack([v.r - bw, by + bh + 32 * u, bw, v.b + 6 * u - by - bh - 32 * u], [body(v, 24, 31, 0, { maxLines: 4 })], { valign: 'bottom', align: 'left' }),
			c.has('page') && page(v, 'bottom-left')]);
	}
	// Without a paragraph the band sits lower and the headline takes the room, as on the Open Graph card.
	const plain = card && !c.has('body');
	const by = v.y + (plain ? 0.62 : 448 / 936) * v.h;
	const bh = 160 * u;
	return done(v, [A(), L(scaled(BAND, k), 44.2 * k, [0, by, v.W, bh]),
		logo(v, 'top-left'),
		stack([v.x, v.y + 84 * u, (plain ? 780 : 900) * u, by - 40 * u - v.y - 84 * u], [head(v, plain ? 88 : 72, plain ? 94 : 78, { maxLines: 3 })], { prefer: v.y + 145.4 * u, grow: v.w }),
		stack([v.r - 386 * u, by + bh + 48 * u, 386 * u, v.b - 6.2 * u - by - bh - 48 * u], [body(v, 24, 31, 0, { maxLines: 8 })], { valign: 'bottom', align: 'left' }),
		address(v, 'bottom-left', 'label'),
		c.has('page') && page(v, 'top-right'),
	]);
}

/** Post, offer: the corner light around centered copy. */
function offer(c, wideFoot = false) {
	const v = canvas(c, v0(c) === 'wide' ? 64 : 72);
	const u = v.u;
	if (v.shape === 'strip') {
		const s = stripHead(v) * 0.86;
		const tall = v.h > 200;
		const w = Math.min(v.w, 720);
		const k = Math.max(v.H / 630, (v.W / 1200) * 0.62) * 1.15;
		return done(v, [A(), L(scaled([-592.2, -36.7, 1917.3, 1236.4], k, v.W - 1200 * k, (v.H - 630 * k) / 2), 29.1 * k),
			logo(v, 'top-left'),
			stack([v.cx - w / 2, v.y, w, v.h], [text('headline', 'display', s, s * 1.08, { align: 'center', maxLines: 2 }), text('price', 'label', Math.max(v.f, s * 0.3), Math.max(v.f, s * 0.3) * 1.4, { gap: s * 0.6, align: 'center', maxLines: 2 }), { type: 'button', slot: 'cta', w: tall ? 260 : 180, h: tall ? 52 : Math.max(36, v.f * 2), size: Math.max(v.f, tall ? 19 : 15), radius: 10, gap: s * 0.6 }], { align: 'center', valign: 'center' }),
			tall && address(v, 'bottom-right')]);
	}
	const wide = v.shape === 'wide';
	const items = [head(v, 64, 72, { align: 'center', maxLines: wide ? 2 : 3 }), label(v, 'price', 44.4, { align: 'center' }), key(v, 320, wide ? 56 : 64, c.has('price') ? 34 : wide ? 70 : 60)];
	if (wide) {
		const h = v.H / u;
		return done(v, [A(), L(scaled([-592.2, -36.7, 1917.3, 1236.4], (v.H / 630), (v.W - 1200 * (v.H / 630)) / 2, 0), 29.1 * (v.H / 630)),
			logo(v, 'bottom-left'), address(v, 'bottom-right'),
			stack([v.W / 2 - 340 * u, v.y, 680 * u, v.h - 60 * u], items, { align: 'center', valign: 'center', prefer: (230 + 128 + (h - 630) / 2) * u, grow: 760 * u })]);
	}
	return done(v, [A(), v.shape === 'square' ? L(scaled(CORNER, u), 26.18 * u) : cover(CORNER, 26.18, [1080, 1080], v),
		logo(v, 'top'),
		stack([v.W / 2 - 340 * u, v.y + 96 * u, 680 * u, v.h - (96 + 72) * u], items, { align: 'center', valign: 'center', prefer: v.y + (483.4 / 936) * v.h }),
		address(v, 'bottom', 'label'),
		c.has('page') && page(v, 'bottom-right'),
	]);
}
function v0(c) {
	const r = c.W / c.H;
	return r > 2.4 ? 'strip' : r > 1.2 ? 'wide' : 'tall';
}

// ----- Ads (1080 by 1350) -----

function search(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	const tall = v.h / u;
	// The band with the search bar, the pictures under it; both give way to the frame's height.
	const square = v.shape === 'square';
	const bandY = v.y + (square ? 250 : 376) * u + (tall > 1300 ? 40 * u : 0);
	const bandH = (square ? 190 : 240) * u;
	const py = bandY + bandH + 48 * u;
	const ph = Math.min(foot - (square ? 40 : 102) * u - py, 560 * u);
	const gap = 32 * u;
	const pw = (v.w - 2 * gap) / 3;
	return done(v, [A(),
		win([-239, -127, 2913.3, 1821.3], 44.2, [0, bandY, v.W, bandH], v.W / 1080, { fixed: true }),
		logo(v, 'top-left'),
		stack([v.x, v.y + 64 * u, v.w, bandY - 36 * u - v.y - 64 * u], [head(v, square ? 48 : 56, square ? 52 : 60, { w: 760 * u, maxLines: 2 }), body(v, 24, 32, 44.8, { w: 640 * u, maxLines: 2 })], { prefer: v.y + (square ? 72 : 104) * u }),
		{ type: 'search', box: [v.x, bandY + bandH / 2 - 44 * u, v.w, 88 * u], slot: 'prompt', size: Math.max(v.f, 24 * u), button: 'Search', id: 'prompt' },
		...list(3).map((i) => P(i, [v.x + i * (pw + gap), py, pw, ph])),
		button(v, [v.x, foot, 258 * u, 56 * u], 'bottom-left'),
		address(v, 'bottom-right', 'body', { top: foot + 21 * u }),
	]);
}

function corridor(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const portrait = v.shape === 'portrait';
	// The walls keep their perspective about the light at the corridor's end; a shorter frame lowers them.
	const top = portrait ? v.y + 264 * u : v.y + (v.shape === 'square' ? 196 : 300) * u;
	const bottom = portrait ? v.y + 1008 * u : v.b - (v.shape === 'square' ? 176 : 250) * u;
	const ky = (bottom - top) / 744;
	const q = ([x, y]) => [x * (v.W / 1080), top + (y - 328) * ky];
	const lw = 140 * (v.W / 1080);
	const lh = 104 * ky;
	return done(v, [A(),
		L(scaled([-20, -15, 941.22, 588.42], Math.max(v.W / 1080, ky)), 14.28, [470 * (v.W / 1080), top + 320 * ky, lw, lh], { fixed: true }),
		...CORRIDOR.map((quad, i) => ({ type: 'panel', quad: quad.map(q), index: i, bleeds: true })),
		logo(v, 'top-left'), address(v, 'top-right'),
		stack([v.W / 2 - 350 * u, v.y + 60 * u, 700 * u, top - 24 * u - v.y - 60 * u + 60 * ky * u], [head(v, v.shape === 'square' ? 48 : 56, v.shape === 'square' ? 52 : 60, { align: 'center', maxLines: 2 })], { align: 'center', prefer: v.y + (v.shape === 'square' ? 84 : 104) * u }),
		stack([v.W / 2 - 250 * u, bottom + 16 * u, 499 * u, v.b - 56 * u - 40 * u - bottom - 16 * u], [body(v, 24, 32, 0, { align: 'center', maxLines: 2 })], { align: 'center', valign: c.has('cta') ? 'bottom' : 'center', prefer: portrait ? v.b - 137 * u : undefined, grow: 700 * u }),
		button(v, [v.W / 2 - 129 * u, v.b - 56 * u, 258 * u, 56 * u], 'bottom'),
	]);
}

function photo(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	if (v.shape === 'wide') {
		const w = v.w * 0.52;
		const box = [v.r - w, v.y, w, v.h];
		const lx = box[0] - 90 * u;
		const k = (v.W - lx) / 1080;
		return done(v, [A(),
			L(scaled([-2098.636, -184.092, 3300.382, 2063.291], k), 50.073 * k, [lx, 0, v.W - lx, v.H], { fixed: true }),
			P(0, box, { id: 'picture' }),
			logo(v, 'top-left'),
			stack([v.x, v.y + 68 * u, lx - v.x - 24 * u, foot - 32 * u - v.y - 68 * u], [head(v, 48, 52, { maxLines: 4 }), body(v, 22, 30, 36, { maxLines: 5 })], { valign: 'center' }),
			button(v, [v.x, foot, 220 * u, 56 * u], 'bottom-left', { id: 'cta' }),
			!c.has('cta') && address(v, 'bottom-left'),
		]);
	}
	const square = v.shape === 'square';
	// The picture is 640 of the ad's 1350; the copy under it keeps its own height on the other frames.
	const top = v.y + 92 * u;
	const copy = (square ? 190 : 260) * u + (v.shape === 'story' ? 40 * u : 0);
	const ph = v.shape === 'portrait' ? 640 * u : foot - 40 * u - copy - top;
	const end = top + ph;
	const k = v.W / 1080;
	return done(v, [A(),
		L(scaled([-2098.636, -184.092, 3300.382, 2063.291], k), 50.073 * k, [0, 0, v.W, end + 14 * u], { fixed: true }),
		L(scaled([-3316.091, -493.364, 4400.509, 2751.055], k), 66.764 * k, [0, (end + 14 * u) * 0.518, v.W, (end + 14 * u) * 0.482 + 29.5 * u], { fixed: true }),
		logo(v, 'top-left'),
		P(0, [v.x, top, v.w, ph], { id: 'picture' }),
		stack([v.x, end + 54 * u, v.w, foot - 32 * u - end - 54 * u], [head(v, square ? 48 : 56, square ? 52 : 60, { w: 564 * u, maxLines: 2 }), body(v, 24, 32, square ? 32 : 47, { maxLines: 2 })], { prefer: end + 64 * u, grow: v.w }),
		button(v, [v.x, foot, 258 * u, 56 * u], 'bottom-left'),
		address(v, 'bottom-right', 'body', { top: foot + 21 * u }),
	]);
}

function testimonial(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	const items = [text('quote', 'display', 48 * u, 51.4 * u, { maxLines: 3 }), text('name', 'medium', 24 * u, 32 * u, { gap: 62 * u, maxLines: 1 }), label(v, 'role', 23)];
	if (v.shape === 'wide') {
		// The portrait on the left, the quote beside it, a light strip at the right edge.
		const sw = 100 * u;
		const pw = c.pictures ? Math.min(330 * u, (v.h * 464) / 580) : 0;
		const x = pw ? v.x + pw + 64 * u : v.x;
		const f = { ...v, x, r: v.r - sw - 8 * u, w: v.r - sw - 8 * u - x, frame: [v.x, v.y, v.w - sw - 8 * u, v.h] };
		const k = v.H / 1080;
		const kk = Math.max(k, sw / 160);
		return done(f, [A(),
			L(scaled([-2014, -160, 2241, 1401], kk), 34 * kk, [v.W - sw, 0, sw, v.H]),
			pw && P(0, [v.x, v.y, pw, v.h], { id: 'picture' }),
			logo(f, 'top-left'),
			stack([x, v.y + 64 * u, f.w, foot - 32 * u - v.y - 64 * u], items.map((i) => (i.slot === 'quote' ? { ...i, size: 42 * u, leading: 45 * u, maxLines: 5 } : { ...i, gap: i.gap * 0.6 })), { valign: 'center' }),
			button(v, [x, foot, 220 * u, 56 * u], 'bottom-left'),
			address(f, 'bottom-right', 'body', { top: foot + 21 * u }),
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
		win([-1331, 10, 2913.3, 1821.3], 44.2, [0, bandY, v.W, bandH], v.W / 1080, { fixed: true }),
		logo(v, 'top-left'),
		pics && P(0, [v.x, py, (ph * 464) / 580, ph], { id: 'picture' }),
		stack([v.x, end + 48 * u, v.w, foot - 40 * u - end - 48 * u], [{ ...items[0], w: 920 * u, size: (square ? 42 : 48) * u, leading: (square ? 45 : 51.4) * u }, { ...items[1], gap: (square ? 40 : 62) * u }, items[2]], { prefer: end + (square ? 56 : 72) * u, valign: pics ? 'top' : 'center', ...(pics ? {} : { prefer: undefined }) }),
		button(v, [v.x, foot, 258 * u, 56 * u], 'bottom-left'),
		address(v, 'bottom-right', 'body', { top: foot + 21 * u }),
	]);
}

function plan(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const k = v.W / 1080;
	const card = (o = {}) => ({ type: 'card', id: 'card', w: 600 * u, pad: 48 * u, padTop: 48.5 * u, fill: 'card-fill', radius: 10 * u, gap: 64 * u, items: [
		text('plan', 'display', 40 * u, 40 * u, { maxLines: 2 }),
		body(v, 24, 32, 36, { slot: 'price', maxLines: 2 }),
		{ ...body(v, 20, 26, 55.2, { slot: 'features', maxLines: 2, w: 500 * u }), type: 'list', itemGap: 24 * u },
		{ ...key(v, 504, 56, 48), align: 'center' },
	], ...o });
	const hasCard = c.has('plan') || c.has('price') || c.has('features') || c.has('cta');
	if (v.shape === 'wide') {
		const cw = 520 * u;
		return done(v, [A(),
			L(scaled(FIELD, k), 37.4 * k, [0, 0, v.W, v.H * 0.36]),
			stack([v.x, v.y + v.h * 0.3, hasCard ? v.w - cw - 56 * u : v.w, v.h * 0.7 - 72 * u], [head(v, 64, 69, { maxLines: 4 })], { valign: 'bottom' }),
			hasCard && stack([v.r - cw, v.y, cw, v.h], [card({ w: cw, pad: 40 * u, padTop: 40 * u, gap: 0 })], { valign: 'center' }),
			logo(v, 'bottom-left'),
			!hasCard && address(v, 'bottom-right'),
		]);
	}
	const square = v.shape === 'square';
	const foot = v.b - 28 * u;
	const bottom = foot - 56 * u;
	const top = square ? v.y + 64 * u : v.y + 150 * u;
	return done(v, [A(),
		L(scaled(FIELD, k), 37.4 * k, [0, 0, v.W, v.safe ? v.y + 420 * u : 612 * u], {}),
		stack([v.W / 2 - 380 * u, top, 760 * u, bottom - top], [head(v, 72, 77, { align: 'center', maxLines: square ? 2 : 3 }), ...(hasCard ? [card()] : [])], { align: 'center', prefer: square ? undefined : v.safe ? v.y + 372 * u : v.y + 289 * u, valign: square ? 'center' : 'top' }),
		logo(v, 'bottom-left'), address(v, 'bottom-right'),
	]);
}

function row(c) {
	const v = canvas(c, 64);
	const u = v.u;
	const foot = v.b - 56 * u;
	const wide = v.shape === 'wide';
	// The row's own box on the ad: x 64 to 1015.5, y 150 to 990.5.
	const area = wide ? [v.x + v.w * 0.36, v.y - 24 * u, v.w * 0.64, v.h + 24 * u] : [v.x, v.y + (v.shape === 'portrait' ? 86 : 64) * u, v.w, (v.shape === 'portrait' ? 841 * u : foot - 64 * u - v.y - 64 * u - (v.shape === 'story' ? 60 : 0) * u)];
	const k = Math.min(area[2] / 951.5, area[3] / 840.5);
	const ox = wide ? area[0] + area[2] - 951.5 * k : area[0] + (area[2] - 951.5 * k) / 2;
	const oy = area[1] + (area[3] - 840.5 * k) / (v.shape === 'portrait' ? 1e9 : 2);
	const q = ([x, y]) => [ox + (x - 64) * k, oy + (y - 150) * k];
	const tile = (b, w, quad) => ({ ...L(scaled(b, k), 21.533 * k, [...q([w[0], w[1]]), w[2] * k, w[3] * k]), clipQuad: quad.map(q), id: 'pictures', fixed: true, bleeds: false });
	return done(v, [A(),
		{ type: 'panel', quad: ROW[0].map(q), index: 0 },
		tile([-1156.091, -552.273, 1341.639, 1349.849], [709.364, 223.363, 199.56, 331.45], TILES[0]),
		{ type: 'panel', quad: ROW[1].map(q), index: 1 }, { type: 'panel', quad: ROW[2].map(q), index: 2 },
		tile([-1065.274, -576.818, 1341.639, 1349.849], [387.818, 441.818, 199.56, 331.45], TILES[1]),
		...[3, 4, 5].map((i) => ({ type: 'panel', quad: ROW[i].map(q), index: i })),
		logo(v, 'top-left'),
		wide
			? stack([v.x, v.y + 68 * u, v.w * 0.33, foot - 32 * u - v.y - 68 * u], [head(v, 44, 48, { maxLines: 5 })], { valign: 'top' })
			: stack([v.x, oy + 840.5 * k + 24 * u, 468 * u, v.b - oy - 840.5 * k - 24 * u], [head(v, 48, 51.6, { maxLines: 2 })], { valign: 'bottom', prefer: v.b - 0.2 * u, grow: c.has('cta') ? v.w - 290 * u : v.w }),
		wide ? button(v, [v.x, foot, 241 * u, 56 * u], 'bottom-left') : button(v, [v.r - 241 * u, foot, 241 * u, 56 * u], 'bottom-right'),
	]);
}

// ----- Banners (1500 by 500, 1584 by 396, 1128 by 191) -----

/** The light in from the left edge behind a banner, as the Figma's fit. */
function bannerLight(v, which) {
	const id = v.W / v.H > 5 ? 'c' : v.W / v.H > 3.4 ? 'l' : 'x';
	const [w0, h0] = id === 'c' ? [1128, 191] : id === 'l' ? [1584, 396] : [1500, 500];
	const b = BG[which + id];
	if (v.W === w0 && v.H === h0) return L(b, 34);
	// The same window, as tall as this frame.
	const k = v.safe ? Math.max(v.W / w0, v.H / h0) * 0.9 : Math.max(v.H / h0, (v.W / w0) * 0.6);
	return L(scaled(b, k), 34 * k);
}

function tagline(c, pictures) {
	const v = canvas(c, 64);
	const strip = v.shape === 'strip';
	// On a strip without pictures the tagline fills the room first: two lines at half again the banners' size, stepping
	// down only when the words need it (fill before shrinking).
	const s = strip ? stripHead(v) * (pictures || v.H < 300 ? 1 : 1.5) : 72 * v.u;
	const n = pictures ? 6 : 0;
	if (strip) {
		const figma = v.W === 1500 && v.H === 500 ? [96, 12, 120] : v.W === 1584 && v.H === 396 ? [104, 16, 130] : undefined;
		const h = v.safe ? v.safe.h : v.H;
		const [pw, gap, ph] = figma ?? [h * 0.23, h * 0.03, h * 0.2875];
		const row = n * pw + (n - 1) * gap;
		// Six pictures right of the profile picture, then the tagline.
		const space = v.w - row - 24;
		const tw = Math.min(pictures ? space : v.w * 0.62, v.H < 300 ? s * 15.2 : pictures ? s * 8.04 : s * 10);
		const py = v.safe ? v.safe.y + (h - ph) / 2 : v.H / 2 - ph / 2;
		const top = v.y;
		return done(v, [A(), bannerLight(v, 't'),
			stack([v.r - tw, top, tw, v.h], [text('headline', 'display', s, s, { maxLines: v.H < 300 ? 1 : 2 })], { align: 'right', valign: 'center', grow: pictures ? space : v.w, prefer: v.safe ? undefined : v.H / 2 }),
			...list(n).map((i) => P(i, [v.x + (pw + gap) * i, py, pw, ph]))]);
	}
	// On a post: the light in from the left edge, the pictures in a row, the tagline right aligned as on the banners.
	const u = v.u;
	const gap = 12 * u;
	const pw = (v.w - 5 * gap) / 6;
	const ph = pw * 1.25;
	const wide = v.shape === 'wide';
	const py = wide ? v.b - ph : v.cy + 40 * u;
	const k = Math.max(v.H / 1160, (v.W / 1500) * 0.8);
	return done(v, [A(), L(scaled(BG.tx, k), 34 * k),
		logo(v, 'top-right'),
		...list(n).map((i) => P(i, [v.x + (pw + gap) * i, py, pw, ph])),
		n ? stack([v.r - Math.min(v.w, 760 * u), v.y + 60 * u, Math.min(v.w, 760 * u), py - 40 * u - v.y - 60 * u], [text('headline', 'display', s, s * 1.05, { maxLines: 3 })], { align: 'right', valign: 'bottom' })
			: stack([v.r - Math.min(v.w, 640 * u), v.y + 80 * u, Math.min(v.w, 640 * u), v.h - 80 * u], [text('headline', 'display', s, s * 1.05, { maxLines: 4 })], { align: 'right', valign: wide ? 'bottom' : 'center' }),
	]);
}

function creatives(c) {
	const v = canvas(c, 64);
	const strip = v.shape === 'strip';
	const figma = v.W === 1500 && strip ? [120, 16, 150] : v.W === 1584 && strip ? [104, 16, 130] : undefined;
	const h = v.safe ? v.safe.h : v.H;
	const [pw, gap, ph] = figma ?? (strip ? [h * 0.27, h * 0.036, h * 0.34] : (() => { const g = 14 * v.u; const w = (v.w - 5 * g) / 6; return [w, g, w * 1.25]; })());
	const w = 6 * pw + 5 * gap;
	// Centered, or as far right as the profile picture needs.
	const x = Math.max(v.W / 2 - w / 2, strip ? v.x : 0);
	const y = (v.safe ? v.safe.y + v.safe.h / 2 : v.H / 2) - ph / 2;
	const light = strip ? bannerLight(v, 'r') : cover(BG.rx, 34, [1500, 500], v);
	return done(v, [A(), { ...light, fixed: true }, ...list(6).map((i) => P(i, [Math.min(x, v.r - w) + (pw + gap) * i, y, pw, ph]))]);
}

function closeUp(c) {
	const v = canvas(c, 64);
	const f = v.W === 1500 ? [[-1540, -422, 5378.4, 3362.4], 81.6] : v.W === 1584 ? [[-1498, -474, 5378.4, 3362.4], 81.6] : v.W / v.H > 5 ? [scaled([-962, -352, 3585.6, 2241.6], v.W / 1128), (54.4 * v.W) / 1128] : undefined;
	const strip = v.shape === 'strip';
	if (f && c.has('headline') && v.W / v.H > 5) f[0][1] -= v.H * 0.3; // the headline stands under the light
	const light = f && strip ? L(f[0], f[1]) : cover([-1540, -422, 5378.4, 3362.4], 81.6, [1500, 500], v);
	const u = strip ? Math.max(0.8, Math.min(1, v.u)) : v.u;
	const size = Math.max(v.f, 18 * u);
	const s = strip ? stripHead(v) * 0.8 : 56 * v.u;
	const top = v.b - size * 0.72;
	const w = Math.min(v.w, strip ? 700 : 640 * v.u);
	return done(v, [light,
		{ type: 'text', slot: 'url', face: 'body', size, leading: size * 1.33, x: v.r - 300, top, w: 300, align: 'right', maxLines: 1, corner: 'bottom-right' },
		// Over the address, where the light leaves the frame Black.
		stack([v.r - w, v.y, w, top - s * 0.6 - v.y], [text('headline', 'display', s, s * 1.05, { maxLines: v.W / v.H > 5 ? 1 : 2 })], { align: 'right', valign: 'bottom', grow: v.w }),
	]);
}

// ----- Logo and avatar -----

const mark = (share, ratio, lockup = 'mark') => (c) => {
	const k = Math.min(c.W / share[0], c.H / share[1]);
	const w = ratio[0] * k;
	const h = ratio[1] * k;
	return { layers: [{ type: 'logo', lockup, color: '$mark', box: [(c.W - w) / 2, (c.H - h) / 2, w, h], align: 'center', required: true }], frame: [c.W * 0.08, c.H * 0.08, c.W * 0.84, c.H * 0.84], unit: Math.min(c.W, c.H) / 1080 };
};

// ----- Story -----

/** The story derived from Post, offer: the corner light, copy and button in the lower part of the safe area. */
function story(c) {
	const v = canvas(c, 64);
	if (v.shape === 'wide' || v.shape === 'strip') return offer(c);
	const u = v.u;
	const foot = v.b - 28 * u;
	return done(v, [A(), cover(CORNER, 26.18, [1080, 1080], v),
		stack([v.x, v.y + v.h * 0.36, 760 * u, foot - 64 * u - v.y - v.h * 0.36], [head(v, 72, 77, { maxLines: 3 }), body(v, 24, 32, 56, { maxLines: 3 }), key(v, 258, 56, 64)], { valign: 'bottom' }),
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
		return P(i, box, { id: `picture-${i + 1}` });
	});
	const k = (v0.H / 630) * 1.05;
	const lockup = { ...logo(v, 'top-left'), box: [v.x, v.y, 152 * u, (152 * u * 28) / 183] };
	return done(v, [A(),
		L(scaled(BAND, k, v0.W - 500 * k, -200 * k), 44.2 * k),
		lockup,
		c.has('page') && { ...page(v, 'top-right'), top: v.y + ((152 * 28) / 183 / 2 - 4) * u },
		...photos,
		stack([v.x, oy + (n ? 300 : 140) * u, (n ? 680 : 880) * u, v.b - oy - (n ? 300 : 140) * u], [head(v, n ? 72 : 88, n ? 76 : 92, { maxLines: 3 })], { valign: 'bottom' }),
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
	'banner-light-close-up': closeUp,
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
