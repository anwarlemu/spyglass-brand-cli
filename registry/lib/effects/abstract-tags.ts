// The tag field drawing (abstract/tags): a field of characters resolves into tags, one at a time.
import { SETTLE } from "@/lib/effects/abstract-motion";
import { CELL_H, CELL_W, RAMP, clamp01, hash, noise, type Draw } from "@/lib/effects/abstract";

export type Tag = { label: string; value: string };

const STEP = 1000 / 30;
const LEAD = 800;

type Timing = {
  tag: number;
  gather: number;
  decode: number;
  hold: number;
  close: number;
  out: number;
  loop: number;
};
const timing = (ms: (n: string) => number, count: number): Timing => {
  const tag = ms("--dur-abstract-tag-step") || 2000;
  const gather = ms("--dur-abstract-gather") || 400;
  const decode = ms("--dur-abstract-decode") || 600;
  const hold = ms("--dur-loop-step") || 2600;
  const close = ms("--dur-abstract-line") || 267;
  const out = LEAD + (count - 1) * tag + gather + decode + hold;
  const loop = out + (count - 1) * 2 * STEP + 4 * STEP + close + 200;
  return { tag, gather, decode, hold, close, out, loop };
};

export const tagMoments = (ms: (n: string) => number, count: number) => {
  const T = timing(ms, count);
  return {
    start: LEAD - 200,
    middle: LEAD + T.tag + T.gather + T.decode * 0.5,
    settled: T.out - T.hold / 2,
  };
};

function layout(cols: number, rows: number, widths: number[]) {
  const spots = [
    { c: 2, r: Math.round(rows * 0.18) },
    { c: cols - 2 - widths[1], r: Math.round(rows * 0.45) },
    { c: 4, r: Math.round(rows * 0.72) },
  ];
  return widths.map((wc, i) => {
    const s = spots[i % spots.length];
    const c = Math.max(1, Math.min(cols - wc - 1, s.c));
    return { c, r: Math.min(rows - 3, s.r), wc, hc: 2 };
  });
}

export function makeDrawTags(tags: Tag[]): Draw {
  return (ctx, t, { w, h, tokens, glyph }) => {
    const T = timing(tokens.ms, tags.length);
    const pad = tokens.px(w >= 360 ? "--space-24" : "--space-16");
    const cols = Math.floor((w - pad * 2) / CELL_W);
    const rows = Math.floor((h - pad * 2) / CELL_H);
    const x0 = Math.round((w - cols * CELL_W) / 2);
    const y0 = Math.round((h - rows * CELL_H) / 2);
    const lt = t % T.loop;
    const frame = Math.floor(t / STEP);
    const drift = (tokens.ms("--search-drift") || 8) / CELL_W;

    ctx.font = `${tokens.px("--caption-size")}px ${tokens.body}`;
    const parts = tags.map((g) => {
      const label = ctx.measureText(g.label).width;
      const value = ctx.measureText(g.value).width;
      return { label, value, width: label + 8 + value };
    });
    const boxes = layout(
      cols,
      rows,
      parts.map((p) => Math.ceil((p.width + 24) / CELL_W)),
    );

    const states = tags.map((_, i) => {
      const s = LEAD + i * T.tag;
      const cutIn = s + T.gather;
      const outAt = T.out + (tags.length - 1 - i) * 2 * STEP;
      const gone = outAt + 4 * STEP;
      const gather = lt < s ? 0 : lt < cutIn ? clamp01((lt - s) / T.gather) : 0;
      const on = lt >= cutIn && lt < gone;
      const fIn = Math.floor((lt - cutIn) / STEP);
      const fOut = Math.floor((gone - lt) / STEP);
      const scale = !on
        ? 1
        : lt < outAt
          ? SETTLE[Math.min(fIn, SETTLE.length - 1)]
          : SETTLE[Math.max(0, fOut)];
      const decoded = clamp01((lt - cutIn) / T.decode);
      const closing = lt >= gone ? clamp01((lt - gone) / T.close) : 1;
      return { gather, on, scale, decoded, closing, cleared: on };
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v =
          noise(c * 0.12 + (t / 1000) * drift * 0.12, r * 0.24, 0) * 0.7 +
          noise(c * 0.41, r * 0.7, frame % 2) * 0.3;
        let level = Math.min(7, Math.floor(v ** 1.8 * 9));
        let alpha = 0.35;
        for (let i = 0; i < boxes.length; i++) {
          const b = boxes[i];
          if (c < b.c - 1 || c > b.c + b.wc || r < b.r - 1 || r > b.r + b.hc) continue;
          const st = states[i];
          const seed = hash(c, r, i);
          if (st.cleared) level = 0;
          else if (st.gather > 0) {
            if (seed < st.gather) {
              level = 6 + (seed > 0.5 ? 1 : 0);
              alpha = 0.35 + 0.65 * st.gather;
            }
          } else if (st.closing < 1 && seed > st.closing) level = 0;
        }
        if (level > 0) glyph(level, x0 + c * CELL_W, y0 + r * CELL_H, alpha);
      }
    }

    ctx.globalAlpha = 1;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    boxes.forEach((b, i) => {
      const st = states[i];
      if (!st.on) return;
      const bw = b.wc * CELL_W;
      const bh = b.hc * CELL_H;
      const cx = x0 + b.c * CELL_W + bw / 2;
      const cy = y0 + b.r * CELL_H + bh / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(st.scale, st.scale);
      ctx.translate(-bw / 2, -bh / 2);
      ctx.fillStyle = tokens.bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, bw, bh, tokens.px("--radius-m"));
      ctx.fill();
      ctx.strokeStyle = tokens.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(0.5, 0.5, bw - 1, bh - 1, tokens.px("--radius-m"));
      ctx.stroke();

      const text = `${tags[i].label} ${tags[i].value}`;
      const shown = Math.floor(text.length * st.decoded);
      const p = parts[i];
      const left = (bw - p.width) / 2;
      let x = left;
      for (let k = 0; k < text.length; k++) {
        const ch = text[k];
        const isLabel = k < tags[i].label.length;
        const advance = k === tags[i].label.length ? 8 : ctx.measureText(ch).width;
        if (ch !== " ") {
          if (k < shown) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = isLabel ? tokens.text3 : tokens.text;
            ctx.fillText(ch, x, bh / 2);
          } else if (k < shown + 6) {
            const level = 1 + Math.floor(hash(k, frame, i) * (RAMP.length - 1));
            glyph(level, x, bh / 2 - CELL_H / 2, 0.6);
          }
        }
        x += advance;
      }
      ctx.restore();
    });
  };
}

export const tagLoop = (ms: (n: string) => number, count: number) => timing(ms, count).loop;
