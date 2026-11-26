import { rasterizeSvg } from './scene.js';
export function lightOf(light, p, grow = 0) {
    const [, , w, h] = p.win;
    const gw = w * grow;
    const gh = h * grow;
    return p.b
        ? light.placedLightGeometry({ width: w + 2 * gw, height: h + 2 * gh, b: { x: p.b[0] + gw, y: p.b[1] + gh, w: p.b[2], h: p.b[3] }, shift: p.shift ?? 34, source: p.source, seed: p.seed })
        : light.lightGeometry({ width: w, height: h, variant: p.variant ?? 'band', seed: p.seed, source: p.source });
}
const cache = new Map();
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export async function lit(light, p, grow = 0) {
    const key = JSON.stringify([p, grow]);
    const hit = cache.get(key);
    if (hit)
        return hit;
    const g = lightOf(light, p, p.b ? grow : 0);
    const gx = p.b ? p.win[2] * grow : 0;
    const gy = p.b ? p.win[3] * grow : 0;
    const w = p.win[2] + 2 * gx;
    const h = p.win[3] + 2 * gy;
    const cell = Math.max(4, Math.max(w, h) / 220);
    const pad = Math.ceil(g.offset * 2 + g.blur * 4) + 24;
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w + 2 * pad}" height="${h + 2 * pad}" viewBox="${-pad} ${-pad} ${w + 2 * pad} ${h + 2 * pad}">${light.lightGeometrySvg(g, { ground: false, blend: 'filter', id: 'lit' })}</svg>`;
    const r = await rasterizeSvg(doc, { scale: 1 / cell, background: '#000000' });
    const ox = pad / cell;
    const oy = pad / cell;
    const cols = Math.max(1, Math.ceil(w / cell));
    const rows = Math.max(1, Math.ceil(h / cell));
    const lum = new Float32Array(cols * rows);
    const on = new Uint8Array(cols * rows);
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            const x = Math.min(r.width - 1, Math.round(ox + i));
            const y = Math.min(r.height - 1, Math.round(oy + j));
            const k = (y * r.width + x) * 4;
            const [R, G, B] = [r.pixels[k] / 255, r.pixels[k + 1] / 255, r.pixels[k + 2] / 255];
            lum[j * cols + i] = 0.2126 * lin(R) + 0.7152 * lin(G) + 0.0722 * lin(B);
            on[j * cols + i] = Math.max(R, G, B) > 0.22 ? 1 : 0;
        }
    }
    // How many cells are lit above and left of each one, so a rectangle is four lookups.
    const sum = new Uint32Array((cols + 1) * (rows + 1));
    for (let j = 0; j < rows; j++) {
        let row = 0;
        for (let i = 0; i < cols; i++) {
            row += on[j * cols + i];
            sum[(j + 1) * (cols + 1) + i + 1] = sum[j * (cols + 1) + i + 1] + row;
        }
    }
    const map = { cell, x0: p.win[0] - gx, y0: p.win[1] - gy, cols, rows, lum, lit: on, sum };
    if (cache.size > 64)
        cache.delete(cache.keys().next().value);
    cache.set(key, map);
    return map;
}
/** The lit part as rectangles (one per run of lit cells in a row of about `step` pixels), inside `bounds`. */
export function litRuns(map, bounds, step) {
    const n = Math.max(1, Math.round(step / map.cell));
    const out = [];
    const [bx, by, bw, bh] = bounds;
    for (let j = 0; j < map.rows; j += n) {
        let start = -1;
        const y = Math.max(by, map.y0 + j * map.cell);
        const y2 = Math.min(by + bh, map.y0 + Math.min(map.rows, j + n) * map.cell);
        if (y2 <= y)
            continue;
        for (let i = 0; i <= map.cols; i += n) {
            let on = false;
            if (i < map.cols)
                for (let dj = 0; dj < n && !on; dj++)
                    for (let di = 0; di < n && !on; di++)
                        if (j + dj < map.rows && i + di < map.cols && map.lit[(j + dj) * map.cols + i + di])
                            on = true;
            if (on && start < 0)
                start = i;
            if (!on && start >= 0) {
                const x = Math.max(bx, map.x0 + start * map.cell);
                const x2 = Math.min(bx + bw, map.x0 + Math.min(i, map.cols) * map.cell);
                if (x2 > x)
                    out.push({ x: round(x), y: round(y), w: round(x2 - x), h: round(y2 - y) });
                start = -1;
            }
        }
    }
    return out;
}
const round = (n) => Math.round(n * 10) / 10;
/** Whether anything lit (or lighter than `maxLum`) is inside a rectangle, with the light moved by (dx, dy) pixels. */
export function touches(map, r, dx = 0, dy = 0, win) {
    let { x, y, w, h } = r;
    if (win) {
        const x2 = Math.min(x + w, win[0] + win[2]);
        const y2 = Math.min(y + h, win[1] + win[3]);
        x = Math.max(x, win[0]);
        y = Math.max(y, win[1]);
        w = x2 - x;
        h = y2 - y;
        if (w <= 0 || h <= 0)
            return false;
    }
    const i0 = Math.max(0, Math.floor((x - dx - map.x0) / map.cell));
    const i1 = Math.min(map.cols - 1, Math.floor((x + w - dx - map.x0) / map.cell));
    const j0 = Math.max(0, Math.floor((y - dy - map.y0) / map.cell));
    const j1 = Math.min(map.rows - 1, Math.floor((y + h - dy - map.y0) / map.cell));
    if (i1 < i0 || j1 < j0)
        return false;
    const n = map.cols + 1;
    const s = map.sum;
    return s[(j1 + 1) * n + i1 + 1] - s[j0 * n + i1 + 1] - s[(j1 + 1) * n + i0] + s[j0 * n + i0] > 0;
}
/** The lightest and darkest the light is inside a rectangle. */
export function range(map, r) {
    let lo = 1;
    let hi = 0;
    const i0 = Math.floor((r.x - map.x0) / map.cell);
    const i1 = Math.floor((r.x + r.w - map.x0) / map.cell);
    const j0 = Math.floor((r.y - map.y0) / map.cell);
    const j1 = Math.floor((r.y + r.h - map.y0) / map.cell);
    for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
            const v = i < 0 || j < 0 || i >= map.cols || j >= map.rows ? 0 : map.lum[j * map.cols + i];
            lo = Math.min(lo, v);
            hi = Math.max(hi, v);
        }
    return [lo, hi];
}
