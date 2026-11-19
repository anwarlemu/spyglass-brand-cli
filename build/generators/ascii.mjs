// registry/lib/light-master.ts
var MASTER_BOX = { x: 16.25, y: 16.25, w: 2913.3, h: 1821.3 };

// registry/lib/light.ts
function seeded(seed) {
  let s = (seed | 0) ^ 3107613;
  return () => {
    s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var MASTER_H = MASTER_BOX.h / MASTER_BOX.w;

// registry/lib/ascii.ts
var ASCII_RAMP = " .:-=+*#";
var ASCII_FONT = { size: 13.333, leading: 1.2, advance: 0.6, opacity: 0.35 };
var asciiText = (line) => line.replace(/ /g, "\xA0");
var smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function asciiLines(options) {
  const { cols, rows } = options;
  const seed = Math.trunc(options.seed ?? 0);
  const density = Math.min(1, Math.max(0, options.density ?? 0.5));
  if (!(cols > 0 && rows > 0)) throw new Error("asciiLines needs cols and rows above 0");
  const rnd = seeded(seed * 31337 + 3);
  const count = Math.max(2, Math.round(cols * rows / 1500 * (0.3 + density)));
  const blobs = Array.from({ length: count }, () => ({
    x: rnd() * cols,
    y: rnd() * rows,
    sx: 4 + rnd() * 11,
    sy: 1.5 + rnd() * 3,
    a: 0.65 + rnd() * 0.7,
    tilt: (rnd() - 0.5) * 0.5
  }));
  const grain = (i, j) => {
    let h = Math.imul(i + 1, 374761393) + Math.imul(j + 1, 668265263) + Math.imul(seed + 7, 1442695041);
    h = Math.imul(h ^ h >>> 13, 1274126177);
    return ((h ^ h >>> 16) >>> 0) / 4294967296;
  };
  const lines = [];
  for (let j = 0; j < rows; j++) {
    let line = "";
    for (let i = 0; i < cols; i++) {
      let v = 0;
      for (const b of blobs) {
        const dx = i - b.x;
        const dy = j - b.y + dx * b.tilt * 0.1;
        v += b.a * Math.exp(-(dx * dx / (2 * b.sx * b.sx) + dy * dy / (2 * b.sy * b.sy)));
      }
      let keep = 1;
      for (const r of options.clear ?? []) {
        const dx = Math.max(r.x - i, 0, i - (r.x + r.w));
        const dy = Math.max(r.y - j, 0, j - (r.y + r.h)) * 2;
        keep = Math.min(keep, smooth(0, 6, Math.hypot(dx, dy)));
      }
      v = Math.min(1.2, v) * keep;
      const g = grain(i, j);
      v += (g - 0.5) * 0.3;
      const k = v < 0.2 ? g > 0.994 && keep > 0.9 ? 1 : 0 : Math.min(ASCII_RAMP.length - 1, Math.floor((v - 0.2) / 0.8 * (ASCII_RAMP.length - 1)) + 1);
      line += ASCII_RAMP[k];
    }
    lines.push(line.replace(/\s+$/, ""));
  }
  return lines;
}
function asciiGrid(width, height, size = ASCII_FONT.size) {
  const cw = size * ASCII_FONT.advance;
  const lh = size * ASCII_FONT.leading;
  return { cols: Math.ceil(width / cw), rows: Math.ceil(height / lh), cw, lh };
}
var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var num = (n) => String(Math.round(n * 1e3) / 1e3);
function asciiSvg(options) {
  const size = options.size ?? ASCII_FONT.size;
  const { cols, rows, cw, lh } = asciiGrid(options.width, options.height, size);
  const clear = [...options.clear ?? [], ...(options.clearPx ?? []).map((r) => ({ x: r.x / cw, y: r.y / lh, w: r.w / cw, h: r.h / lh }))];
  const lines = asciiLines({ cols, rows, seed: options.seed, density: options.density, clear });
  const font = options.font ?? "Geist Mono";
  const ground = options.ground ? `<rect width="${num(options.width)}" height="${num(options.height)}" fill="#000000"/>` : "";
  const text = lines.map((l, j) => l.trim() ? `<text x="0" y="${num(j * lh + size * 0.95)}">${esc(asciiText(l))}</text>` : "").join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${num(options.width)}" height="${num(options.height)}" viewBox="0 0 ${num(options.width)} ${num(options.height)}">${ground}<g fill="#FFFFFF" fill-opacity="${ASCII_FONT.opacity}" font-family="${font}, ui-monospace, monospace" font-size="${num(size)}" xml:space="preserve" style="white-space:pre">${text}</g></svg>`;
}
function drawAscii(ctx, lines, size = ASCII_FONT.size, font = "Geist Mono") {
  ctx.save();
  ctx.font = `${size}px "${font}", ui-monospace, monospace`;
  ctx.fillStyle = "#FFFFFF";
  ctx.globalAlpha = ASCII_FONT.opacity;
  ctx.textBaseline = "alphabetic";
  lines.forEach((l, j) => ctx.fillText(l, 0, j * size * ASCII_FONT.leading + size * 0.95));
  ctx.restore();
}
export {
  ASCII_FONT,
  ASCII_RAMP,
  asciiGrid,
  asciiLines,
  asciiSvg,
  asciiText,
  drawAscii
};
