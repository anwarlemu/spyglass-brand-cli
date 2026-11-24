// The archive rows drawing (abstract/archive): a brand's records as rows of characters, today at the top; new days
// arrive and older ones sink and pack toward the foot.
import { CELL_H, CELL_W, bezier, clamp01, hash, noise, type Draw } from "@/lib/effects/abstract";

const BASE = 400;
const BURST = 4;
const FULL = 5;
const MARKS: [number, string][] = [
  [0, "Today"],
  [7, "1 week"],
  [30, "1 month"],
  [365, "1 year"],
];

type Timing = { step: number; line: number; glide: number; hold: number; cycle: number };
const timing = (ms: (n: string) => number): Timing => {
  const step = ms("--dur-abstract-line-step") || 433;
  const line = ms("--dur-abstract-line") || 267;
  const glide = ms("--dur-abstract-glide") || 400;
  const hold = ms("--dur-loop-step") || 2600;
  return { step, line, glide, hold, cycle: step * BURST + hold };
};

function cell(k: number, c: number) {
  const run = noise(c * 0.21 + k * 3.7, k * 0.53, 1);
  if (run < 0.48) return hash(k, c, 3) > 0.93 ? 1 : 0;
  const inside = noise(c * 0.7, k * 1.3, 2);
  return Math.min(7, 3 + Math.floor(inside * 5));
}

export const archiveMoments = (ms: (n: string) => number) => {
  const { step, cycle } = timing(ms);
  return {
    start: cycle,
    middle: cycle + step * 2 + 200,
    settled: cycle + step * BURST + 1200,
  };
};

export const drawArchive: Draw = (ctx, t, { w, h, tokens, glyph }) => {
  const { step, line, glide, cycle } = timing(tokens.ms);
  const pad = tokens.px(w >= 360 ? "--space-24" : "--space-16");
  const gutter = tokens.px("--space-64") + tokens.px("--space-8");
  const cols = Math.floor((w - pad * 2 - gutter) / CELL_W);
  const x0 = w - pad - cols * CELL_W;
  const top = pad;
  const H = h - pad * 2;
  const full = FULL * CELL_H;
  const Hc = H - full;
  const K = Hc / CELL_H;
  const y = (age: number) =>
    top + (age <= FULL ? age * CELL_H : full + (Hc * (age - FULL)) / (age - FULL + K));
  const pitchAt = (age: number) => (age <= FULL ? CELL_H : (Hc * K) / ((age - FULL + K) * (age - FULL + K)));

  const n = Math.floor(t / cycle);
  const into = t - n * cycle;
  const arrived = Math.min(BURST, Math.floor(into / step) + 1);
  const newest = BASE + n * BURST + arrived - 1;
  const since = into - (arrived - 1) * step;
  const burstOver = into >= BURST * step;
  const glideP = burstOver ? 1 : bezier(tokens.easeOut, clamp01(since / glide));
  const typed = burstOver ? 1 : clamp01((since - (glide - line)) / line);

  let lastY = -Infinity;
  for (let i = 0; i < 4000; i++) {
    const k = newest - i;
    const age = i === 0 ? 0 : i - 1 + glideP;
    const ry = y(age);
    if (ry > top + H) break;
    const pitch = pitchAt(age);
    if (pitch < 0.1) break;
    const dots = pitch < 12;
    if (dots && ry - lastY < 4) continue;
    lastY = ry;
    const alpha = 0.35 + 0.65 * (1 - clamp01(age / 10)) ** 2 - 0.12 * clamp01((ry - top - full) / Hc);
    const shown = i === 0 ? Math.floor(cols * typed) : cols;
    for (let c = 0; c < shown; c++) {
      const base = cell(k, c);
      if (!base) continue;
      if (dots) {
        glyph(1, x0 + c * CELL_W, Math.round(ry) - 11, alpha);
        continue;
      }
      const level = Math.max(1, base - Math.floor(age / 2));
      glyph(level, x0 + c * CELL_W, Math.round(ry) - CELL_H / 2, alpha);
    }
  }

  for (let yy = lastY + 4, j = 0; yy <= top + H; yy += 4, j++) {
    for (let c = 0; c < cols; c++) {
      if (hash(c, Math.round(yy), 7) > 0.42) continue;
      glyph(1, x0 + c * CELL_W, Math.round(yy) - 11, 0.22);
    }
  }

  ctx.globalAlpha = 1;
  ctx.font = `${tokens.px("--caption-size")}px ${tokens.body}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const [age, label] of MARKS) {
    ctx.fillStyle = age === 0 ? tokens.text2 : tokens.text3;
    ctx.fillText(label, x0 - 16, Math.round(y(age)));
  }
};
