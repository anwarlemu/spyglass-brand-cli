// The dispersion field's compositions (effect/layout): where the blobs of light sit for each composition (hero, close,
// band, frame, logo, crown, works, ring, horizon, wordmark, run), from the canvas size and the blur step. Pure numbers.
export type Composition =
  "hero" | "close" | "band" | "frame" | "logo" | "crown" | "works" | "ring" | "horizon" | "wordmark" | "run";

export type Blob = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot?: number;
  light?: boolean;
  tri?: number;
  union?: number;
  bend?: number;
};

export type Wave = { angle: number; length: number; amp: number };

export type Layout = {
  ground: "black" | "light";
  blobs: Blob[];
  blend: number;
  wander: number;
  waves: Wave[];
  ghost: { dx: number; dy: number; reach: number } | null;
  asciiOpacity?: number;
  calm: [number, number, number, number];
  feather: number;
  gust?: { right: number; bottom: number };
  band?: [number, number];
  hollow?: number;
  tint?: number;
  ice?: [number, number, number];
  spread?: number;
  tempo?: number;
  breathe?: number;
  spine?: Spine;
  lens?: Lens;
  crest?: Crest;
};

export type Crest = {
  top: number;
  width: number;
  low: number;
  high: number;
  idle: number;
  speed: number;
  start: number;
  period: number;
  rise: number;
  settle: number;
  follow: number;
};

export type Tune = (name: string) => number | undefined;

export type Lens = {
  radius: number;
  zoom: number;
  widen: number;
  calm: number;
  follow: number;
  ease: number;
  carry: number;
  light?: { radius: number; union: number };
};

export type Spine = {
  blob: number;
  span: number;
  at: number;
  offsets: number[];
  halves: number[];
  slope: number;
  slide: number;
};

const waves = (unit: number, strength = 1): Wave[] => [
  { angle: 0.35, length: 0.95 * unit, amp: 0.05 * unit * strength },
  { angle: 1.75, length: 0.62 * unit, amp: 0.034 * unit * strength },
  { angle: 2.8, length: 0.43 * unit, amp: 0.02 * unit * strength },
  { angle: 4.2, length: 0.31 * unit, amp: 0.011 * unit * strength },
];

function worksLeft(W: number, H: number, d: number, warp: Wave[]) {
  const COMPOSER = 640;
  const CLEAR = 64;
  if (W < 1200) return null;
  const bend = 0.4;
  const out = 4 * d + bend * warp.reduce((sum, w) => sum + w.amp, 0);
  const reach = Math.min(0.11 * W, (W - COMPOSER) / 2 - CLEAR - 3 * d);
  if (reach < 4 * d) return null;
  const rx = Math.max(reach, (reach + out) / 2);
  const ry = 0.085 * H;
  const y = 0.3 * H;
  const blob: Blob = { x: reach - rx, y, rx, ry, rot: 0.06, union: d, bend };
  return { blob, gust: { right: reach + 6 * d, bottom: y + ry + 6 * d } };
}

function wordmarkLayout(W: number, H: number, d: number, tune: Tune): Layout {
  const rx = 1.6 * W;
  const ry = 2.2 * H;
  const top = 0.56 * H;
  const warp = waves(0.6 * W, 0.45);
  const rise = 4.6 / (tune("--dur-footer-crest-in") ?? 0.8);
  const settle = 6.64 / (tune("--dur-footer-crest-out") ?? 1.2);
  const follow = 6.64 / (tune("--dur-footer-crest-follow") ?? 0.3);
  const width = Math.max((tune("--footer-crest-width") ?? 0.07) * W, 2.1 * d);
  const low = (tune("--footer-crest-low") ?? 0.1) * H;
  const high = (tune("--footer-crest-high") ?? 0.36) * H;
  const crest: Crest = {
    top,
    width,
    low,
    high,
    idle: low + (high - low) * (tune("--footer-crest-idle") ?? 0.5),
    speed: W / (tune("--dur-footer-wave-pass") ?? 7.8),
    start: 0.25 * W,
    period: Math.max(W, 7 * width),
    rise,
    settle,
    follow,
  };
  return {
    ground: "black",
    blobs: [{ x: 0.5 * W, y: top + ry, rx, ry, rot: -0.05, bend: 1 }],
    blend: 3 * d,
    wander: 0.04 * H,
    waves: warp,
    ghost: null,
    asciiOpacity: 0,
    calm: [0, 0, 0, 0],
    feather: 1,
    lens: {
      radius: Math.max(2.4 * crest.width, 6 * d),
      zoom: 0.06,
      widen: 0.4,
      calm: 0.5,
      follow: crest.follow,
      ease: rise,
      carry: 0,
    },
    crest,
    spread: tune("--footer-wave-spread") ?? 1,
    hollow: tune("--footer-wave-hollow") ?? 0,
    tint: tune("--footer-wave-tint") ?? 1,
    ice: [
      1 - (1 - 211 / 255) / (1 - 55 / 255),
      1 - (1 - 222 / 255) / (1 - 55 / 255),
      1 - (1 - 231 / 255) / (1 - 55 / 255),
    ],
  };
}

function runLayout(W: number, H: number, d: number, tune: Tune): Layout {
  const enter = tune("--ent-run-enter") ?? 0.3;
  const depth = tune("--ent-run-depth") ?? 0.2;
  const rise = tune("--ent-run-rise") ?? 0.356;
  const card = tune("--ent-run-card") ?? 0.161;
  const stageH = Math.min(H, tune("--ent-run-stage-h") ?? H);
  const offY = tune("--ent-run-offset-y") ?? 0;
  const m = Math.min(W, H);
  const warp = waves(1.4 * m, 0.25);
  const wander = 0.01 * m;
  const meander = warp.reduce((sum, w) => sum + w.amp, 0) + wander;
  let rot = -Math.atan(rise);
  const tipX = W * (0.5 + enter) - 0.02 * W;
  const tipY = H - stageH / 2 + offY * stageH - (enter - 0.02) * W * rise;
  const rx = Math.max(0.42 * W, 6 * d, 1.6 * card * W);
  const cardHalf = (card * W * (1 + Math.tan((14.8 * Math.PI) / 180))) / 2;
  const at = Math.min(0.9, Math.max(0.1, (depth + 0.02 - card / 2) / (rx / W)));
  let ry = Math.max(3.2 * d, (cardHalf + 1.5 * d + meander) / Math.sqrt(1 - (1 - at) * (1 - at)));
  const margin = 4 * d + meander + 0.12 * 240;
  const reach = () => Math.hypot(rx * Math.sin(rot), ry * Math.cos(rot));
  const top = () => tipY + rx * Math.sin(rot) - reach();
  const bottom = () => tipY + rx * Math.sin(rot) + reach();
  while (top() < margin && rot < -0.01) rot *= 0.8;
  while ((top() < margin || bottom() > H - margin) && ry > 3.2 * d) ry *= 0.95;
  return {
    ground: "black",
    blobs: [{ x: tipX + rx * Math.cos(rot), y: tipY + rx * Math.sin(rot), rx, ry, rot }],
    blend: Math.max(0.14 * m, 4.5 * d),
    wander,
    waves: warp,
    ghost: null,
    calm: [0, 0, 0, 0],
    feather: 96,
  };
}

export function layout(
  composition: Composition,
  W: number,
  H: number,
  d: number,
  tune: Tune = () => undefined,
): Layout {
  if (composition === "wordmark") return wordmarkLayout(W, H, d, tune);
  if (composition === "run") return runLayout(W, H, d, tune);
  const portrait = W / H < 0.9;
  const m = Math.min(W, H);
  const blend = portrait ? 2.5 * d : Math.max(0.14 * m, 4.5 * d);
  const island = (x: number, y: number, size: number, rot: number, ride = false): Blob => {
    const r = Math.max(2.8, Math.min(size, (0.063 * W) / d)) * d;
    return { x: x * W, y: y * H, rx: 1.15 * r, ry: r, rot, tri: 0.6, union: d, bend: ride ? 1 : 0.5 };
  };

  if (composition === "band") {
    const blobs: Blob[] =
      W >= 1100
        ? [
            { x: 0.2 * W, y: 1.1 * H, rx: 2.1 * H, ry: 0.4 * H, rot: -0.62, light: false },
            { x: 0.72 * W, y: -0.15 * H, rx: 1.7 * H, ry: 0.27 * H, rot: 1.02, light: false },
          ]
        : [{ x: -0.3 * W, y: 0.7 * H, rx: 0.52 * W, ry: 2.2 * H, rot: 0.5, light: false }];
    return {
      ground: "light",
      blobs,
      blend: 0.2 * H,
      wander: 0.04 * H,
      waves: waves(2.6 * H, 0.6),
      ghost: null,
      calm: [0, 0, 0, 0],
      feather: 1,
    };
  }

  if (composition === "crown") {
    return {
      ground: "light",
      blobs: portrait
        ? [{ x: 0.5 * W, y: 0.95 * H, rx: 0.95 * W, ry: 0.84 * H, light: false }]
        : [
            { x: 0.48 * W, y: 1.0 * H, rx: 0.8 * W, ry: 0.88 * H, light: false },
            { x: 0.12 * W, y: 0.32 * H, rx: 0.13 * W, ry: 0.16 * H, light: false },
            { x: 0.5 * W, y: 0.27 * H, rx: 0.3 * W, ry: 0.22 * H, light: false },
            { x: 0.87 * W, y: 0.36 * H, rx: 0.11 * W, ry: 0.16 * H, light: false },
            { ...island(0.96, 0.05, 2.9, -0.3), light: false },
            { ...island(0.94, 0.4, 3.0, 0.4), light: true },
          ],
      blend: portrait ? blend : 0.09 * m,
      wander: 0.012 * m,
      waves: waves(1.4 * m, 0.35),
      ghost: { dx: 0.16 * W, dy: 0.1 * H, reach: 0.14 * Math.max(W, H) },
      asciiOpacity: 0.16,
      calm: [0.5 * W, 0.45 * H, 0.34 * W, 0.36 * H],
      feather: 96,
    };
  }

  if (composition === "works") {
    const left = portrait ? null : worksLeft(W, H, d, waves(1.4 * m, 0.5));
    return portrait
      ? {
          ground: "black",
          blobs: [{ x: 1.12 * W, y: 0.66 * H, rx: 0.42 * W, ry: 0.17 * H, rot: 0.08 }],
          blend,
          wander: 0.01 * m,
          waves: waves(1.4 * m, 0.5),
          ghost: { dx: 0.3 * W, dy: 0.04 * H, reach: 0.12 * Math.max(W, H) },
          asciiOpacity: 0.16,
          calm: [0.5 * W, 0.24 * H, 0.5 * W, 0.2 * H],
          feather: 48,
        }
      : {
          ground: "black",
          blobs: [
            { x: 1.1 * W, y: 0.62 * H, rx: 0.24 * W, ry: 0.28 * H, rot: -0.1 },
            ...(left ? [left.blob] : []),
          ],
          blend,
          wander: 0.01 * m,
          waves: waves(1.4 * m, 0.5),
          ghost: { dx: 0.3 * W, dy: -0.12 * H, reach: 0.12 * Math.max(W, H) },
          asciiOpacity: 0.16,
          calm: [0.5 * W, 0.2 * H, 0.5 * W, 0.22 * H],
          feather: 96,
          gust: left?.gust,
        };
  }

  if (composition === "logo") {
    return portrait
      ? {
          ground: "light",
          blobs: [{ x: 0.5 * W, y: 0.5 * H, rx: 0.44 * W, ry: 0.38 * H, rot: 0.1, light: false }],
          blend,
          wander: 0.01 * m,
          waves: waves(1.4 * m, 0.8),
          ghost: { dx: 0.2 * W, dy: 0.1 * H, reach: 2 * d },
          calm: [0.5 * W, 0.47 * H, 0.36 * W, 0.12 * H],
          feather: 48,
        }
      : {
          ground: "light",
          blobs: [
            { x: 0.5 * W, y: 0.58 * H, rx: 0.52 * W, ry: 0.56 * H, rot: 0.03, light: false },
            { x: 0.14 * W, y: -0.02 * H, rx: 0.36 * W, ry: 0.15 * H, rot: 0.12, light: true },
            { x: 1.0 * W, y: 0.14 * H, rx: 0.2 * W, ry: 0.36 * H, rot: -0.15, light: true },
            { x: 0.06 * W, y: 1.02 * H, rx: 0.16 * W, ry: 0.08 * H, rot: 0.1, light: true },
            { ...island(0.86, 0.72, 3.6, 0.2), light: true },
            { ...island(0.22, 0.86, 2.9, -0.5), light: true },
          ],
          blend: 0.18 * m,
          wander: 0.01 * m,
          waves: waves(1.2 * m, 1),
          ghost: { dx: 10 * d, dy: 4 * d, reach: 3 * d },
          calm: [0.5 * W, 0.52 * H, 0.32 * W, 0.26 * H],
          feather: 96,
        };
  }

  if (composition === "frame") {
    return portrait
      ? {
          ground: "light",
          blobs: [
            { x: -3 * d, y: 0.3 * H, rx: 3.4 * d, ry: 0.15 * H, rot: 0.35, light: false },
            { x: W + 3 * d, y: 0.74 * H, rx: 3.4 * d, ry: 0.15 * H, rot: 0.35, light: false },
          ],
          blend,
          wander: 0.01 * m,
          waves: waves(1.6 * m, 0.6),
          ghost: null,
          calm: [0, 0, 0, 0],
          feather: 1,
        }
      : {
          ground: "light",
          blobs: [
            { x: -0.15 * W, y: 0.3 * H, rx: 0.15 * W, ry: 0.2 * H, rot: 0.35, light: false },
            { x: 1.15 * W, y: 0.74 * H, rx: 0.15 * W, ry: 0.2 * H, rot: 0.35, light: false },
          ],
          blend: 0.2 * m,
          wander: 0.01 * m,
          waves: waves(1.4 * m, 0.6),
          ghost: null,
          calm: [0, 0, 0, 0],
          feather: 1,
        };
  }

  const roomy = W >= 560;

  if (composition === "close") {
    return portrait
      ? {
          ground: "black",
          blobs: [
            { x: 0.02 * W, y: -0.03 * H, rx: 0.72 * W, ry: 0.17 * H, rot: 0.22 },
            { x: 1.0 * W, y: 1.03 * H, rx: 0.74 * W, ry: 0.18 * H, rot: 0.22 },
            ...(roomy ? [island(0.3, 0.74, 3.4, 0.5)] : []),
          ],
          blend,
          wander: 0.012 * m,
          waves: waves(1.4 * m),
          ghost: { dx: 0.3 * W, dy: -0.12 * H, reach: 2 * d },
          calm: [0.5 * W, 0.47 * H, 0.42 * W, 0.11 * H],
          feather: 48,
        }
      : {
          ground: "black",
          blobs: [
            { x: 0.06 * W, y: -0.05 * H, rx: 0.3 * W, ry: 0.22 * H, rot: 0.2 },
            { x: 1.05 * W, y: 0.02 * H, rx: 0.21 * W, ry: 0.36 * H, rot: -0.2 },
            { x: 1.07 * W, y: 1.03 * H, rx: 0.2 * W, ry: 0.28 * H, rot: 0.3 },
            { x: -0.04 * W, y: 1.04 * H, rx: 0.22 * W, ry: 0.17 * H, rot: -0.3 },
            island(0.76, 0.69, 3.4, 0.5),
            island(0.14, 0.5, 3.0, -0.4),
          ],
          blend,
          wander: 0.012 * m,
          waves: waves(m),
          ghost: { dx: 9 * d, dy: 3.5 * d, reach: 3 * d },
          calm: [0.5 * W, 0.5 * H, 0.2 * W, 0.18 * H],
          feather: 96,
        };
  }

  return portrait
    ? {
        ground: "black",
        blobs: [
          { x: 1.06 * W, y: -0.04 * H, rx: 0.56 * W, ry: 0.15 * H, rot: -0.25 },
          { x: 0.1 * W, y: 1.06 * H, rx: 1.15 * W, ry: 0.36 * H, rot: 0.3 },
          ...(roomy ? [island(0.7, 0.66, 3.4, 0.5)] : []),
        ],
        blend,
        wander: 0.012 * m,
        waves: waves(1.4 * m),
        ghost: { dx: -0.3 * W, dy: 0.12 * H, reach: 1.5 * d },
        calm: [0.5 * W, 0.36 * H, 0.5 * W, 0.2 * H],
        feather: 48,
      }
    : {
        ground: "black",
        blobs: [
          { x: 1.22 * W, y: 0.53 * H, rx: 0.37 * W, ry: 0.41 * H, rot: -0.1 },
          { x: 0.97 * W, y: 1.05 * H, rx: 0.4 * W, ry: 0.28 * H, rot: -0.04 },
          { x: -0.06 * W, y: 1.07 * H, rx: 0.22 * W, ry: 0.2 * H, rot: -0.3 },
          island(0.71, 0.59, 3.4, -0.35),
          island(0.28, 0.81, 3.0, 2.5, true),
        ],
        blend: 0.26 * m,
        wander: 0.012 * m,
        waves: waves(m),
        ghost: { dx: 14 * d, dy: 4 * d, reach: 3 * d },
        calm: [0.3 * W, 0.38 * H, 0.32 * W, 0.34 * H],
        feather: 96,
      };
}

export type Ring = { cx: number; cy: number; rx: number; ry: number; cardW: number; cardH: number };

export function ringLayout(W: number, H: number, d: number, ring: Ring | null): Layout {
  const m = Math.min(W, H);
  const portrait = W / H < 0.9;
  const r = ring ?? { cx: W / 2, cy: H / 2, rx: 0.3 * W, ry: 0.3 * H, cardW: 0, cardH: 0 };
  const band: [number, number] = [2.5, 3.1];
  const room = (r.cx - r.rx - r.cardW / 2) / W;
  const SMALL = 0.6;
  const SHORT = 0.75;
  const deep = SMALL * (portrait ? 0.1 : Math.min(0.19, 1.1 * room));
  const blobs: Blob[] = [
    { x: W + 0.08 * W, y: 0.71 * H, rx: (deep + 0.08) * W, ry: SHORT * 0.22 * H, rot: -0.18 },
    { x: W + 0.03 * W, y: 0.44 * H, rx: (0.35 * deep + 0.03) * W, ry: SHORT * 0.14 * H, rot: 0.2 },
    { x: -0.04 * W, y: 0.34 * H, rx: (0.3 * deep + 0.04) * W, ry: SHORT * 0.17 * H, rot: 0.15 },
  ];
  return {
    ground: "black",
    blobs,
    blend: Math.max(0.06 * m, 2.5 * d),
    wander: 0.006 * m,
    waves: waves(1.4 * m, 0.4),
    ghost: { dx: 0.12 * W, dy: 0.1 * H, reach: 0.1 * Math.max(W, H) },
    asciiOpacity: 0.16,
    calm: [r.cx, r.cy, r.rx + r.cardW, r.ry + r.cardH],
    feather: 96,
    band,
  };
}

export type Anchor = {
  x: number;
  y: number;
  w: number;
  h: number;
  clear?: { left: number; right: number; bottom: number };
  tilt?: number;
  cross?: number;
};

const COVER_LENGTH = 2240;
const COVER_D = 34;
const COVER_CREST = 1115;
// prettier-ignore
const COVER_OUTER: [number, number][] = [
  [0, 53], [52, 46], [61, 47], [75, 53], [128, 85], [150, 93], [171, 97], [336, 103], [514, 122], [570, 125],
  [605, 122], [655, 112], [720, 103], [785, 90], [869, 67], [1024, 14], [1071, 4], [1115, 0], [1161, 1], [1213, 9],
  [1474, 73], [1541, 86], [1602, 92], [1660, 93], [1722, 88], [1802, 97], [1943, 86], [2067, 84], [2098, 80],
  [2152, 63], [2168, 60], [2240, 70],
];
// prettier-ignore
const COVER_INNER: [number, number][] = [
  [0, 93], [76, 87], [137, 106], [165, 112], [274, 117], [341, 123], [398, 131], [497, 151], [540, 155],
  [615, 149], [752, 125], [862, 102], [1032, 57], [1078, 48], [1122, 45], [1173, 46], [1231, 53], [1504, 111],
  [1576, 122], [1640, 127], [1718, 126], [1925, 103], [1990, 100], [2072, 99], [2144, 89], [2240, 99],
];
const COVER_SAMPLES = 512;
const COVER_THICKEN = 1.25;
const ECHO = { thick: 0.42, gap: 1.6 };
const HERO_SOLID = 3.6;

const coverRing = (() => {
  const at = (line: [number, number][], x: number) => {
    let i = 1;
    while (i < line.length - 1 && line[i][0] < x) i++;
    const [x0, y0] = line[i - 1];
    const [x1, y1] = line[i];
    return y0 + (y1 - y0) * Math.min(1, Math.max(0, (x - x0) / (x1 - x0)));
  };
  const smooth = (values: number[]) => {
    let v = values;
    for (let pass = 0; pass < 3; pass++) {
      const next = v.slice();
      const reach = 5;
      for (let i = 0; i < v.length; i++) {
        let sum = 0;
        for (let k = -reach; k <= reach; k++) sum += v[Math.min(v.length - 1, Math.max(0, i + k))];
        next[i] = sum / (2 * reach + 1);
      }
      v = next;
    }
    return v;
  };
  const xs = Array.from({ length: COVER_SAMPLES }, (_, i) => (i / (COVER_SAMPLES - 1)) * COVER_LENGTH);
  const outer = smooth(xs.map((x) => at(COVER_OUTER, x)));
  const inner = smooth(xs.map((x) => at(COVER_INNER, x)));
  return {
    centre: outer.map((y, i) => (y + inner[i]) / 2),
    half: outer.map((y, i) => (inner[i] - y) / 2),
  };
})();

export function horizonLayout(W: number, H: number, d: number, anchor: Anchor | null): Layout {
  const fw = anchor?.w ?? Math.min(W - 128, 1152);
  const a: Anchor = anchor ?? { x: (W - fw) / 2, y: H - 160, w: fw, h: (fw * 9) / 16 };
  const scale = d / COVER_D;
  const breathe = 0.1;
  const sigma = d / 5.66;

  const wave = (angle: number, length: number, slope: number, cap: number): Wave => ({
    angle,
    length,
    amp: Math.min((slope * length) / (2 * Math.PI), cap * d),
  });
  const warp = [
    wave(0.2, Math.max(0.6 * W, 420), 0.06, 0.4),
    wave(2.95, Math.max(0.37 * W, 280), 0.05, 0.25),
    wave(0.5, Math.max(0.9 * W, 600), 0.03, 0.3),
    wave(4.4, Math.max(0.23 * W, 180), 0.03, 0.1),
  ];
  const wander = 0.3 * d;
  const slide = 2.5 * d;

  const px = a.x + (a.cross ?? 0.36) * a.w;
  const span = COVER_LENGTH * scale;
  const lean = a.tilt ?? 0.32;
  const crest = (lean < 0.2 ? 0.35 : -0.03) * W;
  const at = Math.min(
    0.95,
    Math.max(0.05, (COVER_CREST + ((px - crest) * Math.hypot(1, lean)) / scale) / COVER_LENGTH),
  );
  const index = at * (COVER_SAMPLES - 1);
  const home = coverRing.centre[Math.round(index)];
  const offsets = coverRing.centre.map((y) => (y - home) * scale);
  const halves = coverRing.half.map((h) => h * scale * COVER_THICKEN * HERO_SOLID);
  const ry = Math.max(...halves);
  let slope = 0;
  const step = span / (COVER_SAMPLES - 1);
  for (let i = 1; i < COVER_SAMPLES; i++) {
    slope = Math.max(
      slope,
      (Math.abs(offsets[i] - offsets[i - 1]) + Math.abs(halves[i] - halves[i - 1])) / step,
    );
  }

  const swing = warp.reduce((sum, w) => sum + w.amp, 0) + wander + slide * slope;
  const reach = (i: number) => swing + halves[i] * (1 + breathe) + 2 * sigma;

  const course = (tilt: number, drop: number) => {
    const turn = Math.atan(tilt);
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    return offsets.map((off, i) => {
      const along = (i / (COVER_SAMPLES - 1) - at) * span;
      return { x: px + along * cos - off * sin, y: a.y + drop + along * sin + off * cos, r: reach(i) / cos };
    });
  };
  const echoOffset = ry * (1 + ECHO.thick) + ECHO.gap * d;
  const echoDrop = 0 * (echoOffset + ry * ECHO.thick - ry);
  const rest = 0.3 * d;
  let tilt = lean;
  let drop = rest;
  for (let tries = 0; tries < 12; tries++) {
    drop = rest;
    if (a.clear) {
      const { left, right, bottom } = a.clear;
      for (const p of course(tilt, rest)) {
        if (p.x > left - p.r && p.x < right + p.r) drop = Math.max(drop, rest + bottom + 16 - (p.y - p.r));
      }
    }
    const seen = (all: { x: number; y: number; r: number }[]) =>
      all.filter((p) => p.x > -p.r && p.x < W + p.r);
    const up = course(tilt, drop);
    const highest = Math.min(
      ...seen(up).map((p) => p.y - p.r),
      up[0].x > 0 ? up[0].y - up[0].x * tilt - up[0].r : Infinity,
    );
    if (highest < 8) drop += 8 - highest;
    const all = course(tilt, drop);
    const last = all[COVER_SAMPLES - 1];
    const lowest = Math.max(
      ...seen(all).map((p) => p.y + p.r + echoDrop),
      last.x < W ? last.y + (W - last.x) * tilt + last.r : -Infinity,
    );
    if (lowest <= H - 8 || tilt < 0.02) break;
    tilt *= 0.85;
  }

  return {
    ground: "black",
    blobs: [{ x: px, y: a.y + drop, rx: span, ry, rot: Math.atan(tilt) }],
    blend: 3 * d,
    wander,
    waves: warp,
    ghost: null,
    asciiOpacity: 0,
    calm: a.clear
      ? [
          (a.clear.left + a.clear.right) / 2,
          a.clear.bottom - H,
          (a.clear.right - a.clear.left) / 2 + 48,
          H + 24,
        ]
      : [W / 2, 0, a.w / 2, 0],
    feather: 48,
    band: [Math.max(2.2, ((ry / d) * (1 + breathe)) / 0.6 + 0.2), 0.66],
    tempo: 3,
    breathe,
    spine: { blob: 0, span, at, offsets, halves: halves.map((h) => h / ry), slope, slide },
  };
}
