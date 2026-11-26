import { Resvg } from '@resvg/resvg-js';
import { at, blurImg, boxBlurClamped, clamp, drawImg, drawPatch, fill, keepWhere, newImg, placeMask, ramp, rgbOf, roundRectFill, roundRectStroke, seeded, } from './raster.js';
/** The subject's rectangle in the frame, as the shader's subjectRect computes it. */
export function subjectRect(s, aspect) {
    const aw = Math.max(1, s.width - 2 * s.pad);
    const ah = Math.max(1, s.height - 2 * s.pad);
    // The cut is aspect by 1; only its proportions matter.
    const cw = aspect;
    const ch = 1;
    const k = (Math.min(aw / cw, ah / ch) * s.fit) / 100;
    const w = cw * k;
    const h = ch * k;
    return { x: s.width / 2 - w / 2 + (s.offX / 100) * s.width, y: s.height / 2 - h / 2 + (s.offY / 100) * s.height, w, h };
}
function rasterize(svg) {
    const r = new Resvg(svg, { fitTo: { mode: 'original' }, font: { loadSystemFonts: false } }).render();
    return { px: Buffer.from(r.pixels), w: r.width, h: r.height };
}
/** The cut, as the shader's getCut: the subject's shape as a mask and in its own colors, cut to the shape. */
function cut(s, subject, box, place) {
    const inner = `<svg x="${place.x}" y="${place.y}" width="${place.w}" height="${place.h}" viewBox="0 0 ${subject.vw} ${subject.vh}" preserveAspectRatio="none">${subject.body}</svg>`;
    const { px, w, h } = rasterize(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${box.w}" height="${box.h}" viewBox="0 0 ${box.w} ${box.h}">${inner}</svg>`);
    const N = w * h;
    const A = new Float32Array(N);
    // Straight color of each pixel, for keying and the subject in its own colors.
    const straight = (i, c) => (px[i * 4 + 3] ? px[i * 4 + c] / (px[i * 4 + 3] / 255) : 0);
    let mode = s.shape;
    if (mode === 'auto') {
        let t = 0;
        for (let i = 0; i < N; i++)
            if (px[i * 4 + 3] < 250)
                t++;
        mode = t > N * 0.02 ? 'alpha' : 'key';
    }
    if (mode === 'alpha' || mode === 'whole')
        for (let i = 0; i < N; i++)
            A[i] = mode === 'whole' ? 1 : px[i * 4 + 3] / 255;
    else if (mode === 'light' || mode === 'dark') {
        for (let i = 0; i < N; i++) {
            const l = (0.2126 * straight(i, 0) + 0.7152 * straight(i, 1) + 0.0722 * straight(i, 2)) / 255;
            A[i] = clamp(((mode === 'light' ? l : 1 - l) - 0.35) / 0.3, 0, 1) * (px[i * 4 + 3] / 255);
        }
    }
    else {
        // The background is the color around the border; anything near it goes.
        const rs = [], gs = [], bs = [];
        const sample = (X, Y) => { const i = Y * w + X; rs.push(straight(i, 0)); gs.push(straight(i, 1)); bs.push(straight(i, 2)); };
        for (let X = 0; X < w; X += Math.max(1, w >> 6))
            for (const Y of [0, h - 1])
                sample(X, Y);
        for (let Y = 0; Y < h; Y += Math.max(1, h >> 6))
            for (const X of [0, w - 1])
                sample(X, Y);
        const med = (a) => a.sort((u, v) => u - v)[a.length >> 1];
        const br = med(rs), bg = med(gs), bb = med(bs), tol = s.keyTol * 2.2;
        for (let i = 0; i < N; i++) {
            const dd = Math.hypot(straight(i, 0) - br, straight(i, 1) - bg, straight(i, 2) - bb);
            A[i] = clamp((dd - tol) / (tol * 0.8 + 6), 0, 1) * (px[i * 4 + 3] / 255);
        }
    }
    const color = newImg(w, h);
    for (let i = 0; i < N; i++)
        for (let c = 0; c < 3; c++)
            color.d[i * 4 + c] = (straight(i, c) / 255) * A[i];
    for (let i = 0; i < N; i++)
        color.d[i * 4 + 3] = A[i];
    return { mask: { w, h, a: A }, color };
}
/** The shape's inner rim: the mask less a blurred copy of itself (the shader's getRim). */
function rim(m, r) {
    const B = boxBlurClamped(m.a, m.w, m.h, r);
    const a = new Float32Array(m.w * m.h);
    for (let i = 0; i < a.length; i++)
        a[i] = clamp((m.a[i] - B[i]) * 3.2, 0, 1);
    return { w: m.w, h: m.h, a };
}
/** Where an end of the subject is: its first shape in from that side, up to the first clear gap (the shader's getEnd). */
function end(m, side) {
    const { w, h, a } = m;
    const col = new Float32Array(w);
    for (let x = 0; x < w; x++) {
        let s = 0;
        for (let y = 0; y < h; y++)
            s += a[y * w + x];
        col[x] = s;
    }
    const on = (x) => col[x] > h * 0.004;
    let first = -1;
    let last = -1;
    for (let x = 0; x < w; x++)
        if (on(x)) {
            if (first < 0)
                first = x;
            last = x;
        }
    if (first < 0)
        return { x0: 0, x1: w };
    const span = last - first + 1, limit = span * 0.45, minGap = Math.max(2, h * 0.04);
    if (side < 0) {
        let gap = 0;
        for (let x = first; x <= first + limit && x <= last; x++) {
            if (!on(x)) {
                if (++gap >= minGap)
                    return { x0: first, x1: x - gap + 1 };
            }
            else
                gap = 0;
        }
        return { x0: first, x1: Math.round(first + span * 0.25) };
    }
    let gap = 0;
    for (let x = last; x >= last - limit && x >= first; x--) {
        if (!on(x)) {
            if (++gap >= minGap)
                return { x0: x + gap, x1: last + 1 };
        }
        else
            gap = 0;
    }
    return { x0: Math.round(last + 1 - span * 0.25), x1: last + 1 };
}
function cropCols(m, x0, x1) {
    const w = Math.max(1, x1 - x0);
    const a = new Float32Array(w * m.h);
    for (let y = 0; y < m.h; y++)
        for (let x = 0; x < w; x++)
            a[y * w + x] = m.a[y * m.w + x0 + x] ?? 0;
    return { w, h: m.h, a };
}
/** Draws the shader. Returns the picture, the light layer alone and the subject alone (for SVG output). */
/** `keepEdge` draws the subject's red and blue edge even when the subject itself is left out (the SVG draws it over). */
export function drawShader(s, colors, subject, opts = {}) {
    const W = Math.round(s.width);
    const H = Math.round(s.height);
    const x = newImg(W, H);
    if (colors.ground)
        fill(x, colors.ground);
    const light = colors.light;
    const R0 = subjectRect(s, subject.vw / subject.vh);
    // The cut is drawn at whole pixels around the subject's rectangle; copies are centered on it.
    const X0 = Math.floor(R0.x), Y0 = Math.floor(R0.y);
    const R = { x: X0, y: Y0, w: Math.max(1, Math.ceil(R0.x + R0.w) - X0), h: Math.max(1, Math.ceil(R0.y + R0.h) - Y0) };
    const C = cut(s, subject, R, { x: R0.x - X0, y: R0.y - Y0, w: R0.w, h: R0.h });
    const cx = R.x + R.w / 2, cy = R.y + R.h / 2, hs = Math.min(R.h, R.w);
    const mode = light ? 'over' : 'lighter';
    // The glass tile, under everything.
    let tile = null;
    if (s.frame === 'glass') {
        const m = Math.max(R.w, R.h) * 0.1;
        tile = { x: R.x - m, y: R.y - m, w: R.w + 2 * m, h: R.h + 2 * m, r: 0 };
        tile.r = Math.min(tile.w, tile.h) * 0.24;
        const cov = roundRectFill(W, H, tile.x, tile.y, tile.w, tile.h, tile.r);
        const g = newImg(W, H);
        const [c0, c1] = colors.tile;
        for (let j = 0; j < H; j++) {
            const t = clamp((j + 0.5 - tile.y) / tile.h, 0, 1);
            for (let i = 0; i < W; i++) {
                const a = cov[j * W + i];
                const k = (j * W + i) * 4;
                for (let c = 0; c < 3; c++)
                    g.d[k + c] = (c0[c] + (c1[c] - c0[c]) * t) * a;
                g.d[k + 3] = a;
            }
        }
        drawImg(x, g, 1, 'over');
    }
    // The light, on a layer of its own.
    const l = newImg(W, H);
    const put = (src, col, alpha, blur, tx, ty, sx, sy) => {
        const p = placeMask(src, W, H, cx + tx, cy + ty, 0, sx, sy, R.w, R.h, blur > 0.3 ? blur : 0);
        if (p)
            drawPatch(l, p, col, alpha, mode);
    };
    if (s.effect === 'trails') {
        const n = s.copies, step = ((s.length / 100) * R.h) / n, a = (s.angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), soft = s.soft / 100;
        const rimMask = s.rim > 0 ? rim(C.mask, s.rim) : null;
        const sides = s.sides === 'both' ? [-1, 1] : s.sides === 'left' ? [-1] : [1];
        for (const side of sides) {
            const E = end(C.mask, side), ex = R.x + E.x0, ew = E.x1 - E.x0, ecx = ex + ew / 2;
            const m = cropCols(C.mask, E.x0, E.x1), r = rimMask ? cropCols(rimMask, E.x0, E.x1) : null;
            const q = newImg(W, H);
            const one = (src, col, alpha, blur, i, sx, sy) => {
                const p = placeMask(src, W, H, ecx + ca * side * i * step, cy + sa * side * i * step, a, sx, sy, ew, R.h, blur > 0.3 ? blur : 0);
                if (p)
                    drawPatch(q, p, col, alpha, mode);
            };
            for (const pass of ['glow', 'solid']) {
                for (let i = n; i >= 1; i--) {
                    const t = i / n, c = at(colors.trail, t), sx0 = Math.cos((t * s.turn * Math.PI) / 180), sx = Math.abs(sx0) < 0.04 ? 0.04 * Math.sign(sx0 || 1) : sx0, sy = 1 - (t * s.shrink) / 100;
                    if (pass === 'glow') {
                        if (s.glow > 0)
                            one(m, c, (s.glow / 100) * 0.25 * (1 - t * 0.6), R.h * (0.06 + t * 0.12), i, sx, sy);
                        continue;
                    }
                    if (s.fill > 0)
                        one(m, c, (s.fill / 100) * (1 - t * 0.5), R.h * (0.004 + t * t * 0.06 * soft), i, sx, sy);
                    if (r)
                        one(r, c, 0.95 * (1 - t * 0.45), R.h * (0.003 + t * t * 0.035 * soft), i, sx, sy);
                }
            }
            // Keep only what lies past this end, fading in over a short run.
            const ox = side < 0 ? ex : ex + ew, f = R.h * 0.06;
            keepWhere(q, ramp(W, H, ox - ca * side * f * 0.3, cy - sa * side * f * 0.3, ox + ca * side * f, cy + sa * side * f));
            drawImg(l, q, 1, mode);
        }
    }
    else {
        // Split or burst: a few soft copies through the spectrum, added up.
        const K = s.effect === 'split' ? 4 : 7;
        const list = [];
        if (s.effect === 'split')
            for (let i = -K; i <= K; i++)
                list.push([i / K, at(colors.split, i / K)]);
        else
            for (let i = 0; i <= K; i++)
                list.push([i / K, i ? at(colors.trail, i / K) : [1, 1, 1]]);
        const a = (s.splitAngle * Math.PI) / 180, D = s.split, g = (2.6 / list.length) * 2;
        const burstRim = s.effect === 'burst' ? rim(C.mask, 4) : null;
        for (const [t, c] of list) {
            const sc = s.effect === 'burst' ? 1 + (t * s.burst) / 100 : 1;
            if (burstRim && t > 0) {
                put(burstRim, c, 0.95 * (1 - t * 0.4), hs * (0.004 + t * 0.02), 0, 0, sc, sc);
                continue;
            }
            put(C.mask, c, g, hs * (s.effect === 'split' ? 0.012 : 0.01 + t * 0.03), s.effect === 'split' ? Math.cos(a) * D * t : 0, s.effect === 'split' ? Math.sin(a) * D * t : 0, sc, sc);
        }
    }
    // Bloom: the light, blurred, added back.
    if (s.glow > 0 && s.effect !== 'trails')
        drawImg(l, blurImg(l, hs * 0.04), (s.glow / 100) * 0.6, mode);
    let clip;
    if (tile) {
        // In a glass tile the light stays inside it, strongest at its edge.
        clip = roundRectFill(W, H, tile.x, tile.y, tile.w, tile.h, tile.r);
        const band = { w: W, h: H, d: new Float32Array(W * H * 4) };
        const stroke = roundRectStroke(W, H, tile.x, tile.y, tile.w, tile.h, tile.r, Math.min(tile.w, tile.h) * 0.28);
        for (let i = 0; i < W * H; i++)
            band.d[i * 4 + 3] = stroke[i];
        const blurred = blurImg(band, hs * 0.05);
        const keep = new Float32Array(W * H);
        for (let i = 0; i < W * H; i++)
            keep[i] = blurred.d[i * 4 + 3];
        keepWhere(l, keep);
    }
    drawImg(x, l, 1, mode, clip);
    // The subject: a hairline red and blue edge, then itself.
    const subj = newImg(W, H);
    const full = { w: R.w, h: R.h, a: C.mask.a };
    const at0 = (dx, blur) => placeMask(full, W, H, cx + dx, cy, 0, 1, 1, R.w, R.h, blur);
    if ((s.subject !== 'hidden' || opts.keepEdge) && s.edgeSplit > 0 && !light) {
        const o = hs * 0.006 * (0.4 + s.edgeSplit / 100);
        const bl = Math.max(0.3, hs * 0.002);
        const al = Math.min(1, s.edgeSplit / 60);
        const pr = at0(-o, bl);
        const pb = at0(o, bl);
        if (pr)
            drawPatch(x, pr, colors.edge[0], al, 'lighter');
        if (pb)
            drawPatch(x, pb, colors.edge[1], al, 'lighter');
    }
    if (s.subject === 'original') {
        const placed = newImg(W, H);
        for (let j = 0; j < R.h; j++)
            for (let i = 0; i < R.w; i++) {
                const X = R.x + i, Y = R.y + j;
                if (X < 0 || Y < 0 || X >= W || Y >= H)
                    continue;
                for (let c = 0; c < 4; c++)
                    placed.d[(Y * W + X) * 4 + c] = C.color.d[(j * R.w + i) * 4 + c];
            }
        drawImg(x, placed, 1, 'over');
        drawImg(subj, placed, 1, 'over');
    }
    else if (s.subject !== 'hidden') {
        const col = s.subject === 'white' ? colors.white : colors.ink;
        const p = at0(0, tile ? Math.max(0.3, hs * 0.003) : 0);
        if (p) {
            drawPatch(x, p, col, 1, 'over');
            drawPatch(subj, p, col, 1, 'over');
        }
    }
    if (tile) {
        const lw = Math.max(1, tile.w * 0.005);
        const edge = light ? colors.ink : colors.white;
        for (const [gp, a] of [[0, 0.35], [0.05, 0.2], [0.1, 0.1]]) {
            const e = tile.w * gp;
            const st = roundRectStroke(W, H, tile.x - e / 2, tile.y - e / 2, tile.w + e, tile.h + e, tile.r + e / 2, lw);
            drawPatch(x, { x: 0, y: 0, w: W, h: H, a: st }, edge, a, 'over');
        }
    }
    if (s.grain > 0)
        grain(x, s.grain / 100, light, s.seed);
    return { img: x, rect: R0, lightOnly: l, subject: subj };
}
/** The shader's grain: a 256px tile of black and white specks, repeated, from a seeded generator. */
function grain(x, amt, light, seed) {
    const rnd = seeded(seed * 31 + 7);
    const tile = new Float32Array(256 * 256 * 2);
    for (let i = 0; i < 256 * 256; i++) {
        const v = rnd();
        const a = Math.abs(v - 0.5) * 2;
        tile[i * 2] = v > 0.5 ? 1 : 0;
        tile[i * 2 + 1] = Math.round(a * a * 255) / 255;
    }
    const k = amt * (light ? 0.12 : 0.22);
    for (let j = 0; j < x.h; j++)
        for (let i = 0; i < x.w; i++) {
            const t = ((j & 255) * 256 + (i & 255)) * 2;
            const a = tile[t + 1] * k;
            if (a <= 0)
                continue;
            const c = tile[t];
            const p = (j * x.w + i) * 4;
            const ia = 1 - a;
            x.d[p] = c * a + x.d[p] * ia;
            x.d[p + 1] = c * a + x.d[p + 1] * ia;
            x.d[p + 2] = c * a + x.d[p + 2] * ia;
            x.d[p + 3] = a + x.d[p + 3] * ia;
        }
}
export { rgbOf };
