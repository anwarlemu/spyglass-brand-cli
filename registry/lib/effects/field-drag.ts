// The dispersion field's drag (effect/drag): cards moving over the field push and stir its light, a damped spring per
// 16px cell, and a gust where they enter. The page supplies where its cards are through a DragSource.
export type DragSource = {
  now: () => number;
  rects: (ms: number, out: Float32Array) => number;
  pace?: () => number;
};

export type GustZone = { right: number; bottom: number };

const CELL = 16;
const MAX_SLOTS = 32;
const STEP = 1 / 60;
const CARRY = 6;
const OMEGA = 2.6;
const ZETA = 1;
const REACH = 0.3;
const STILL_SPEED = 30;
const STIR_SPEED = 2400;
const STIR_FADE = 0.45;
const REACH_X = 24;
const REACH_Y = 112;
const REPLAY = 6;

const GUST_SPEED = STIR_SPEED;
const GUST = 1170;
const GUST_RISE = 160;
const GUST_X = 64;
const GUST_OMEGA = 5.6;
const GUST_ZETA = 0.32;
const GUST_SPREAD = 0.3;
const GUST_RANGE = 96;
const GUST_FEATHER = 96;

export type Drag = {
  resize: (width: number, height: number, zone?: GustZone | null) => void;
  sync: () => boolean;
  data: () => Uint8Array;
  cols: () => number;
  rows: () => number;
  range: () => number;
  idle: () => boolean;
  carrying: () => boolean;
  gusting: () => boolean;
  gustRange: () => number;
};

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const window1 = (lo: number, hi: number, reach: number, x: number) =>
  x < lo ? smooth(lo - reach, lo, x) : x > hi ? 1 - smooth(hi, hi + reach, x) : 1;

const EDGE = 0.35;
const bell = (lo: number, hi: number, reach: number, y: number) => {
  if (y < lo) return EDGE * smooth(lo - reach, lo, y);
  if (y > hi) return EDGE * (1 - smooth(hi, hi + reach, y));
  const t = (2 * (y - lo)) / (hi - lo) - 1;
  return EDGE + (1 - EDGE) * (1 - t * t);
};

export function createDrag(source: DragSource): Drag {
  let cols = 1;
  let rows = 1;
  let cw = CELL;
  let ch = CELL;
  let range = 1;
  let D = new Float32Array(1);
  let V = new Float32Array(1);
  let S = new Float32Array(1);
  let bytes = new Uint8Array(4);
  let clock = Number.NaN;
  let still = true;
  const before = new Float32Array(MAX_SLOTS * 4);
  const after = new Float32Array(MAX_SLOTS * 4);
  let wx = new Float32Array(MAX_SLOTS);
  let wy = new Float32Array(MAX_SLOTS);
  const moving = new Int32Array(MAX_SLOTS);
  const speed = new Float32Array(MAX_SLOTS);
  const pull = new Float32Array(MAX_SLOTS);
  let zone: GustZone | null = null;
  let gc = 0;
  let gr = 0;
  let Dy = new Float32Array(0);
  let Vy = new Float32Array(0);
  let SG = new Float32Array(0);
  let zx = new Float32Array(0);
  let zy = new Float32Array(0);
  let omega = new Float32Array(0);
  let gx = new Float32Array(0);
  const force = new Float32Array(MAX_SLOTS);
  const lift = new Float32Array(MAX_SLOTS);
  const top = new Float32Array(MAX_SLOTS);
  const rise = new Float32Array(MAX_SLOTS);
  let calm = true;

  const clear = () => {
    D.fill(0);
    V.fill(0);
    S.fill(0);
    still = true;
  };
  const clearGust = () => {
    Dy.fill(0);
    Vy.fill(0);
    SG.fill(0);
    calm = true;
  };

  const resize = (width: number, height: number, next: GustZone | null = null) => {
    cols = Math.max(1, Math.ceil(width / CELL));
    rows = Math.max(1, Math.ceil(height / CELL));
    cw = width / cols;
    ch = height / rows;
    range = Math.max(1, REACH * width);
    D = new Float32Array(cols * rows);
    V = new Float32Array(cols * rows);
    S = new Float32Array(cols * rows);
    bytes = new Uint8Array(cols * rows * 4);
    wx = new Float32Array(MAX_SLOTS * cols);
    wy = new Float32Array(MAX_SLOTS * rows);
    zone = next;
    gc = zone ? Math.min(cols, Math.ceil(zone.right / cw)) : 0;
    gr = zone ? Math.min(rows, Math.ceil(zone.bottom / ch)) : 0;
    Dy = new Float32Array(gc * gr);
    Vy = new Float32Array(gc * gr);
    SG = new Float32Array(gc * gr);
    zx = new Float32Array(gc);
    zy = new Float32Array(gr);
    omega = new Float32Array(gc);
    gx = new Float32Array(MAX_SLOTS * gc);
    if (zone) {
      for (let i = 0; i < gc; i++) {
        const x = (i + 0.5) * cw;
        zx[i] = 1 - smooth(zone.right - GUST_FEATHER, zone.right, x);
        omega[i] = GUST_OMEGA * (1 + GUST_SPREAD * (0.5 - x / zone.right));
      }
      for (let j = 0; j < gr; j++)
        zy[j] = 1 - smooth(zone.bottom - GUST_FEATHER, zone.bottom, (j + 0.5) * ch);
    }
    clock = Number.NaN;
    clear();
    clearGust();
  };

  const gust = (dt: number, count: number) => {
    if (!zone || (count === 0 && calm)) return;
    const pace = source.pace?.() ?? 1;
    let n = 0;
    for (let m = 0; m < count; m++) {
      const k = moving[m];
      const real = Math.abs(speed[m]) * pace;
      const left = after[k * 4];
      const right = left + after[k * 4 + 2];
      if (left > zone.right + GUST_X) continue;
      for (let i = 0; i < gc; i++) gx[n * gc + i] = window1(left, right, GUST_X, (i + 0.5) * cw);
      force[n] = GUST * pull[m] * (real / GUST_SPEED) ** 1.5;
      lift[n] = pull[m] * Math.min(1, real / STIR_SPEED);
      top[n] = after[k * 4 + 1];
      n += 1;
    }
    if (n === 0 && calm) return;
    const fade = Math.exp(-dt / STIR_FADE);
    let busy = false;
    for (let j = 0; j < gr; j++) {
      const y = (j + 0.5) * ch;
      for (let g = 0; g < n; g++) rise[g] = (y < top[g] ? Math.exp((y - top[g]) / GUST_RISE) : 1) * zy[j];
      for (let i = 0; i < gc; i++) {
        const c = j * gc + i;
        let a = 0;
        let stir = 0;
        for (let g = 0; g < n; g++) {
          const h = gx[g * gc + i] * rise[g] * zx[i];
          a = Math.max(a, h * force[g]);
          stir = Math.max(stir, h * lift[g]);
        }
        const o = omega[i];
        let v = Vy[c] - a * dt;
        v += (-o * o * Dy[c] - 2 * GUST_ZETA * o * v) * dt;
        const d = Math.max(-GUST_RANGE, Math.min(GUST_RANGE, Dy[c] + v * dt));
        Dy[c] = d;
        Vy[c] = v;
        SG[c] = Math.max(stir, SG[c] * fade);
        if (!busy && (Math.abs(d) > 0.25 || Math.abs(v) > 1 || SG[c] > 0.004)) busy = true;
      }
    }
    if (!busy && !calm) clearGust();
    calm = !busy;
  };

  const step = (t0: number, t1: number) => {
    const dt = (t1 - t0) / 1000;
    if (dt <= 0) return;
    const n = Math.min(MAX_SLOTS, source.rects(t0, before), source.rects(t1, after));
    let count = 0;
    for (let k = 0; k < n; k++) {
      const x0 = before[k * 4];
      const x1 = after[k * 4];
      if (Number.isNaN(x0) || Number.isNaN(x1)) continue;
      const u = (x1 - x0) / dt;
      if (Math.abs(u) < STILL_SPEED) continue;
      const left = x1;
      const right = x1 + after[k * 4 + 2];
      const top = after[k * 4 + 1];
      const bottom = top + after[k * 4 + 3];
      for (let i = 0; i < cols; i++) wx[k * cols + i] = window1(left, right, REACH_X, (i + 0.5) * cw);
      for (let j = 0; j < rows; j++) wy[k * rows + j] = bell(top, bottom, REACH_Y, (j + 0.5) * ch);
      moving[count] = k;
      speed[count] = u;
      pull[count] = smooth(STILL_SPEED, 2 * STILL_SPEED, Math.abs(u));
      count += 1;
    }
    gust(dt, count);
    if (count === 0 && still) return;
    const carry = 1 - Math.exp(-CARRY * dt);
    const fade = Math.exp(-dt / STIR_FADE);
    let busy = false;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const c = j * cols + i;
        let w = 0;
        let u = 0;
        for (let m = 0; m < count; m++) {
          const k = moving[m];
          const wk = wx[k * cols + i] * wy[k * rows + j] * pull[m];
          if (wk > w) {
            w = wk;
            u = speed[m];
          }
        }
        if (i < gc && j < gr) w *= 1 - zx[i] * zy[j];
        let v = V[c];
        const rel = u - v;
        if (w > 0 && rel * u > 0) v += carry * w * rel;
        v += (-OMEGA * OMEGA * D[c] - 2 * ZETA * OMEGA * v) * dt;
        let d = D[c] + v * dt;
        if (d > range) {
          d = range;
          v = Math.min(v, 0);
        } else if (d < -range) {
          d = -range;
          v = Math.max(v, 0);
        }
        D[c] = d;
        V[c] = v;
        const stir = w * Math.min(1, Math.abs(u) / STIR_SPEED);
        S[c] = Math.max(stir, S[c] * fade);
        if (!busy && (Math.abs(d) > 0.25 || Math.abs(v) > 1 || S[c] > 0.004)) busy = true;
      }
    }
    if (!busy && !still) clear();
    still = !busy;
  };

  const advance = (to: number) => {
    let t = clock;
    const h = STEP * 1000;
    while (to - t > 1e-6) {
      const next = Math.min(to, t + h);
      step(t, next);
      t = next;
    }
    clock = to;
  };

  const sync = () => {
    const now = source.now();
    if (Number.isNaN(clock) || now < clock || now - clock > 1000) {
      clear();
      clearGust();
      clock = now - REPLAY * 1000;
    }
    if (now > clock) advance(now);
    return !still || !calm;
  };

  const data = () => {
    for (let c = 0; c < D.length; c++) {
      const e = Math.sign(D[c]) * Math.sqrt(Math.abs(D[c]) / range);
      bytes[c * 4] = Math.round((e * 0.5 + 0.5) * 255);
      bytes[c * 4 + 1] = Math.round(S[c] * 255);
      bytes[c * 4 + 2] = 128;
      bytes[c * 4 + 3] = 255;
    }
    for (let j = 0; j < gr; j++) {
      for (let i = 0; i < gc; i++) {
        const g = j * gc + i;
        const c = j * cols + i;
        const e = Math.sign(Dy[g]) * Math.sqrt(Math.abs(Dy[g]) / GUST_RANGE);
        bytes[c * 4 + 2] = 128 + Math.round(e * 127);
        bytes[c * 4 + 1] = Math.max(bytes[c * 4 + 1], Math.round(SG[g] * 255));
      }
    }
    return bytes;
  };

  return {
    resize,
    sync,
    data,
    cols: () => cols,
    rows: () => rows,
    range: () => range,
    idle: () => still && calm,
    carrying: () => !still,
    gusting: () => !calm,
    gustRange: () => GUST_RANGE,
  };
}
