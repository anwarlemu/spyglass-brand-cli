// The brand graph drawing (abstract/graph): the brand in the middle, linked to clusters of its records, and those
// records linked to each other.
import { FRAMES, PRESS, PRESS_FROM, PROGRESS, SCALE, TWIST } from "@/lib/effects/abstract-motion";
import { bezier, clamp01, hash, type Bezier, type Draw } from "@/lib/effects/abstract";

export type Cluster = { label: string; angle: number; count: number };

const STEP = 1000 / 60;
const OPEN = 137;
const PROXY = 0.075;
const RADIUS = 295.83;

const LINKS: [[number, number], [number, number]][] = [
  [
    [0, 4],
    [1, 0],
  ],
  [
    [0, 0],
    [2, 4],
  ],
  [
    [2, 0],
    [3, 3],
  ],
  [
    [3, 0],
    [1, 3],
  ],
];

type Timing = { hold: number; stagger: number; draw: number; loop: number; ease: Bezier };
const timing = (ms: (n: string) => number, ease: Bezier): Timing => {
  const hold = ms("--dur-loop-step") || 2600;
  const stagger = ms("--dur-proof-stagger") || 70;
  const draw = ms("--dur-proof-swap") || 600;
  return { hold, stagger, draw, loop: FRAMES * STEP + hold, ease };
};

function frameAt(t: number, T: Timing) {
  const lt = t % T.loop;
  const openAt = OPEN * STEP;
  if (lt < openAt) return { f: Math.floor(lt / STEP), held: 0 };
  if (lt < openAt + T.hold) return { f: OPEN, held: lt - openAt };
  return { f: Math.min(FRAMES - 1, Math.floor((lt - T.hold) / STEP)), held: T.hold };
}

export const graphMoments = (ms: (n: string) => number) => {
  const hold = ms("--dur-loop-step") || 2600;
  return {
    start: 40 * STEP,
    middle: OPEN * STEP + 300,
    settled: OPEN * STEP + hold - 300,
  };
};

export function makeDrawGraph(brand: string, clusters: Cluster[]): Draw {
  return (ctx, t, { w, h, tokens, glyph }) => {
    const T = timing(tokens.ms, tokens.bez("--ease-proof", [0, 0, 0.58, 1]));
    const { f, held } = frameAt(t, T);
    const unit = (Math.min(w, h) * PROXY) / 100;
    const cx = w / 2;
    const cy = h / 2;
    const p = PROGRESS[f];
    const scale = SCALE[f];
    const twist = TWIST * (1 - p);
    const R = RADIUS * unit * p;
    const press = f >= PRESS_FROM && f < PRESS_FROM + PRESS.length ? PRESS[f - PRESS_FROM] : 1;
    const DEG = Math.PI / 180;

    const ringR = RADIUS * unit;
    for (const [rr, level, alpha] of [
      [ringR, 2, 0.22],
      [ringR * 0.55, 1, 0.18],
    ] as const) {
      const n = Math.floor((2 * Math.PI * rr) / 10);
      for (let i = 0; i < n; i++) {
        if (hash(i, rr) > 0.7) continue;
        const a = (i / n) * 2 * Math.PI;
        glyph(level, Math.round(cx + Math.cos(a) * rr - 4), Math.round(cy + Math.sin(a) * rr - 10), alpha);
      }
    }

    const hubs = clusters.map((cl) => {
      const a = (cl.angle + twist) * DEG;
      return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
    });
    const recordR = 44 * unit * scale;
    const records = clusters.map((cl, i) =>
      Array.from({ length: cl.count }, (_, k) => {
        const spread = (k - (cl.count - 1) / 2) * 34 + (hash(i, k) - 0.5) * 12;
        const a = (cl.angle + spread) * DEG;
        const d = recordR * (1.6 + hash(k, i, 2) * 1.2);
        return { x: hubs[i].x + Math.cos(a) * d, y: hubs[i].y + Math.sin(a) * d };
      }),
    );
    const out = f > 0 && f < 168;

    ctx.lineWidth = 1;
    if (out) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = tokens.lineStrong;
      ctx.beginPath();
      hubs.forEach((hub, i) => {
        ctx.moveTo(cx, cy);
        ctx.lineTo(hub.x, hub.y);
        for (const r of records[i]) {
          ctx.moveTo(hub.x, hub.y);
          ctx.lineTo(r.x, r.y);
        }
      });
      ctx.stroke();

      LINKS.forEach(([[ca, ra], [cb, rb]], i) => {
        const from = records[ca][ra];
        const to = records[cb][rb];
        if (!from || !to) return;
        const start = i * T.stagger * 4;
        const k = f > OPEN ? 1 : bezier(T.ease, clamp01((held - start) / T.draw));
        if (k <= 0) return;
        const mx = (from.x + to.x) / 2;
        const my = (from.y + to.y) / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const len = Math.hypot(dx, dy);
        const nx = len > 8 ? dx / len : -(to.y - from.y) / Math.hypot(to.x - from.x, to.y - from.y);
        const ny = len > 8 ? dy / len : (to.x - from.x) / Math.hypot(to.x - from.x, to.y - from.y);
        const bow = len > 8 ? R * 0.35 : R * 0.6;
        const qx = mx + nx * bow;
        const qy = my + ny * bow;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = k < 1 && f <= OPEN ? tokens.text : tokens.text3;
        ctx.beginPath();
        const steps = 24;
        for (let s = 0; s <= Math.ceil(steps * k); s++) {
          const u = Math.min(s / steps, k);
          const x = (1 - u) * (1 - u) * from.x + 2 * (1 - u) * u * qx + u * u * to.x;
          const y = (1 - u) * (1 - u) * from.y + 2 * (1 - u) * u * qy + u * u * to.y;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.fillStyle = tokens.text;
      records.forEach((rs) =>
        rs.forEach((r) => {
          ctx.globalAlpha = 0.85;
          ctx.fillRect(Math.round(r.x - 2), Math.round(r.y - 2), 4, 4);
        }),
      );
      hubs.forEach((hub) => {
        ctx.globalAlpha = 1;
        const s = Math.round(8 * scale);
        ctx.fillRect(Math.round(hub.x - s / 2), Math.round(hub.y - s / 2), s, s);
      });

      const labelAlpha = clamp01((p - 0.8) / 0.1);
      if (labelAlpha > 0) {
        ctx.font = `${tokens.px("--caption-size")}px ${tokens.body}`;
        ctx.textBaseline = "middle";
        clusters.forEach((cl, i) => {
          const right = Math.cos(cl.angle * DEG) > 0;
          const below = Math.sin(cl.angle * DEG) > 0;
          ctx.globalAlpha = labelAlpha;
          ctx.fillStyle = tokens.text3;
          ctx.textAlign = right ? "left" : "right";
          const lx = hubs[i].x + Math.cos(cl.angle * DEG) * recordR * 3.6;
          const ly = hubs[i].y + Math.sin(cl.angle * DEG) * recordR * 3.6 + (below ? 8 : -8);
          const pad = tokens.px("--space-16");
          const tw = ctx.measureText(cl.label).width;
          const x = right ? Math.min(lx, w - pad - tw) : Math.max(lx, pad + tw);
          ctx.fillText(cl.label, x, ly);
        });
      }
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = tokens.text;
    const s = 16 * press;
    ctx.fillRect(Math.round(cx - s / 2), Math.round(cy - s / 2), Math.round(s), Math.round(s));
    ctx.font = `${tokens.px("--caption-size")}px ${tokens.body}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = tokens.text2;
    ctx.fillText(brand, cx, cy + 16);
  };
}

export const graphLoop = (ms: (n: string) => number) => FRAMES * STEP + (ms("--dur-loop-step") || 2600);
