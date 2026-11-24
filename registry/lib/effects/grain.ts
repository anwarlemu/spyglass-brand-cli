// The site's light grain (effect/LightImage/grain): an ASCII grain drawn on a canvas around a light picture, where the
// light falls off into Black. Characters from " .:-=+*#" (Geist Mono, 8 by 16 cells, Bayer dithered) at the texture's
// 0.35, reaching --ds-light-grain-reach (64px) from the light, and under the pointer's lens --ds-light-grain-lens
// (192px). Deterministic: the same picture draws the same grain. The lens runs only for a fine pointer without
// reduced motion; `still` keeps it off.
import { LENS } from "@/lib/effects/lens";

const CELL_W = 8;
const CELL_H = 16;
const RAMP = " .:-=+*#";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const STEP = 4;
const CLEAR = 20;
const CLOSE = 40;
const PIXEL_BUDGET = 4e6;
const MAX_DPR = 2;

type Grid = { w: number; h: number; data: Float32Array };

const px = (el: Element, name: string, fallback: number) => {
  const v = parseFloat(getComputedStyle(el).getPropertyValue(name));
  return Number.isFinite(v) && v > 0 ? v : fallback;
};

function blur(src: Grid, radius: number): Grid {
  const { w, h } = src;
  const a = Float32Array.from(src.data);
  const b = new Float32Array(w * h);
  const r = Math.max(1, Math.round(radius));
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < h; y++) {
      let sum = 0;
      const row = y * w;
      for (let x = -r; x <= r; x++) sum += a[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[row + x] = sum / (2 * r + 1);
        sum += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let y = -r; y <= r; y++) sum += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = sum / (2 * r + 1);
        sum += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  return { w, h, data: a };
}

function spreadLine(
  src: Float32Array,
  out: Float32Array,
  start: number,
  stride: number,
  n: number,
  r: number,
  grow: boolean,
  queue: Int32Array,
) {
  let head = 0;
  let tail = 0;
  const beats = (a: number, b: number) => (grow ? a >= b : a <= b);
  let next = 0;
  for (let i = 0; i < n; i++) {
    const hi = Math.min(n - 1, i + r);
    for (; next <= hi; next++) {
      const v = src[start + next * stride];
      while (tail > head && beats(v, src[start + queue[tail - 1] * stride])) tail--;
      queue[tail++] = next;
    }
    while (queue[head] < i - r) head++;
    out[start + i * stride] = src[start + queue[head] * stride];
  }
}

function spread(src: Float32Array, w: number, h: number, r: number, grow: boolean) {
  const mid = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const queue = new Int32Array(Math.max(w, h));
  for (let y = 0; y < h; y++) spreadLine(src, mid, y * w, 1, w, r, grow, queue);
  for (let x = 0; x < w; x++) spreadLine(mid, out, x, w, h, r, grow, queue);
  return out;
}

function close(src: Grid, r: number): Grid {
  const lit = src.data.map((v) => (v > 0.2 ? 1 : 0));
  return { w: src.w, h: src.h, data: spread(spread(lit, src.w, src.h, r, true), src.w, src.h, r, false) };
}

function sample(g: Grid, x: number, y: number) {
  const gx = Math.min(g.w - 1, Math.max(0, x / STEP));
  const gy = Math.min(g.h - 1, Math.max(0, y / STEP));
  const x0 = Math.floor(gx);
  const y0 = Math.floor(gy);
  const x1 = Math.min(g.w - 1, x0 + 1);
  const y1 = Math.min(g.h - 1, y0 + 1);
  const fx = gx - x0;
  const fy = gy - y0;
  const top = g.data[y0 * g.w + x0] * (1 - fx) + g.data[y0 * g.w + x1] * fx;
  const bottom = g.data[y1 * g.w + x0] * (1 - fx) + g.data[y1 * g.w + x1] * fx;
  return top * (1 - fy) + bottom * fy;
}

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let fx = x - ix;
  let fy = y - iy;
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy) + (hash(ix + 1, iy) - hash(ix, iy)) * fx;
  const b = hash(ix, iy + 1) + (hash(ix + 1, iy + 1) - hash(ix, iy + 1)) * fx;
  return a + (b - a) * fy;
}
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function rotationOf(box: HTMLElement) {
  const style = getComputedStyle(box);
  const rotate = style.rotate;
  if (rotate && rotate !== "none") {
    const deg = parseFloat(rotate.split(" ").pop() || "0");
    if (Number.isFinite(deg)) return (deg * Math.PI) / 180;
  }
  if (style.transform && style.transform !== "none") {
    const m = new DOMMatrixReadOnly(style.transform);
    return Math.atan2(m.b, m.a);
  }
  return 0;
}

export function startGrain(
  box: HTMLElement,
  canvas: HTMLCanvasElement,
  picture: string,
  width: number,
  height: number,
  still = false,
): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let sharp: Grid | null = null;
  let cells: Float32Array = new Float32Array(0);
  const FIELDS = 7;
  let count = 0;
  let atlas: HTMLCanvasElement | null = null;
  let dpr = 1;
  let opacity = 0.35;
  let cancelled = false;
  let near = false;
  let raf = 0;
  let last = 0;
  const lens = { x: 0, y: 0, on: 0 };
  const target = { x: 0, y: 0, on: 0 };
  const client = { x: 0, y: 0, known: false };
  const live = () => !still && finePointer.matches && !reduce.matches;

  const buildAtlas = (family: string) => {
    const a = document.createElement("canvas");
    a.width = Math.ceil(CELL_W * RAMP.length * dpr);
    a.height = Math.ceil(CELL_H * dpr);
    const c = a.getContext("2d");
    if (!c) return null;
    c.scale(dpr, dpr);
    c.font = `13.333px ${family}`;
    c.textBaseline = "top";
    c.fillStyle = "#fff";
    for (let i = 1; i < RAMP.length; i++) c.fillText(RAMP[i], i * CELL_W, 0);
    return a;
  };

  const layout = () => {
    if (!sharp) return;
    const k = box.offsetWidth / width;
    if (!(k > 0)) return;
    const boxW = box.offsetWidth;
    const boxH = box.offsetHeight;
    const theta = rotationOf(box);
    const reach = px(canvas, "--ds-light-grain-reach", 64);
    const lensReach = px(canvas, "--ds-light-grain-lens", 192);
    opacity = px(canvas, "--ds-ascii-opacity", 0.35);
    const margin = Math.ceil(lensReach + boxH * Math.abs(Math.sin(theta)));
    const cw = boxW + 2 * margin;
    const ch = boxH + 2 * margin;
    const origin = getComputedStyle(box).transformOrigin.split(" ").map(parseFloat);
    const ox = Number.isFinite(origin[0]) ? origin[0] : boxW / 2;
    const oy = Number.isFinite(origin[1]) ? origin[1] : boxH / 2;
    canvas.style.left = `${-margin}px`;
    canvas.style.top = `${-margin}px`;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    canvas.style.transformOrigin = `${ox + margin}px ${oy + margin}px`;
    canvas.style.rotate = theta ? `${-theta}rad` : "";
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR, Math.sqrt(PIXEL_BUDGET / (cw * ch)));
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    const family = getComputedStyle(canvas).getPropertyValue("--ds-font-ascii").trim() || "monospace";
    atlas = buildAtlas(family);

    const nearGrid = blur(sharp, reach / 2 / k / STEP);
    const farGrid = blur(sharp, lensReach / 2 / k / STEP);
    const bodyGrid = blur(sharp, CLEAR / k / STEP);
    const inside = close(sharp, Math.max(1, Math.round(CLOSE / k / STEP)));

    const cols = Math.ceil(cw / CELL_W);
    const rows = Math.ceil(ch / CELL_H);
    const cos = Math.cos(-theta);
    const sin = Math.sin(-theta);
    const out = new Float32Array(cols * rows * FIELDS);
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const qx = c * CELL_W + CELL_W / 2;
        const qy = r * CELL_H + CELL_H / 2;
        const dx = qx - margin - ox;
        const dy = qy - margin - oy;
        const lx = ox + cos * dx - sin * dy;
        const ly = oy + sin * dx + cos * dy;
        const pxp = lx / k;
        const pyp = ly / k;
        if (pxp < 0 || pyp < 0 || pxp > width || pyp > height) continue;
        const s = sample(sharp, pxp, pyp);
        const onBlack =
          (1 - smooth(0.02, 0.1, s)) *
          (1 - smooth(0.1, 0.24, sample(bodyGrid, pxp, pyp))) *
          (1 - smooth(0.2, 0.6, sample(inside, pxp, pyp)));
        if (onBlack <= 0) continue;
        const a = sample(nearGrid, pxp, pyp);
        const b = sample(farGrid, pxp, pyp);
        if (Math.max(a, b) < 0.004) continue;
        const cloud = smooth(0.28, 0.68, 0.75 * noise(c / 22, r / 4) + 0.25 * noise(c / 6 + 7.3, r / 1.5));
        const o = n * FIELDS;
        out[o] = c * CELL_W;
        out[o + 1] = r * CELL_H;
        out[o + 2] = a;
        out[o + 3] = b;
        out[o + 4] = cloud;
        out[o + 5] = onBlack;
        out[o + 6] = BAYER[(r % 4) * 4 + (c % 4)];
        n++;
      }
    }
    cells = out;
    count = n;
    draw();
  };

  const draw = () => {
    if (!atlas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = opacity;
    const r2 = LENS.radius * LENS.radius;
    const sw = CELL_W * dpr;
    const sh = CELL_H * dpr;
    for (let i = 0; i < count; i++) {
      const o = i * FIELDS;
      const x = cells[o];
      const y = cells[o + 1];
      let l = 0;
      if (lens.on > 0) {
        const ddx = x + CELL_W / 2 - lens.x;
        const ddy = y + CELL_H / 2 - lens.y;
        const f = 1 - Math.min((ddx * ddx + ddy * ddy) / r2, 1);
        l = lens.on * f * f;
      }
      const fall = cells[o + 2] + (cells[o + 3] - cells[o + 2]) * l;
      const cloud = cells[o + 4] + (1 - cells[o + 4]) * 0.6 * l;
      const v = Math.min(1, 3 * fall) * cloud * cells[o + 5];
      const idx = Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1) + cells[o + 6]));
      if (idx < 1) continue;
      ctx.drawImage(atlas, idx * sw, 0, sw, sh, x, y, CELL_W, CELL_H);
    }
    ctx.globalAlpha = 1;
  };

  const aim = () => {
    if (!near || !client.known || !live()) return;
    const rect = canvas.getBoundingClientRect();
    const x = client.x - rect.left;
    const y = client.y - rect.top;
    const inside =
      x > -LENS.reach && y > -LENS.reach && x < rect.width + LENS.reach && y < rect.height + LENS.reach;
    if (inside && target.on === 0 && lens.on < 0.01) {
      lens.x = x;
      lens.y = y;
    }
    target.x = x;
    target.y = y;
    target.on = inside ? 1 : 0;
    wake();
  };

  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const follow = 1 - Math.exp(-dt * LENS.follow);
    lens.x += (target.x - lens.x) * follow;
    lens.y += (target.y - lens.y) * follow;
    lens.on += (target.on - lens.on) * (1 - Math.exp(-dt * LENS.ease));
    if (target.on === 0 && lens.on < 0.002) lens.on = 0;
    const moving = Math.abs(target.x - lens.x) + Math.abs(target.y - lens.y) > 0.5;
    draw();
    raf =
      moving || (lens.on > 0 && lens.on < 0.998) || (target.on === 0 && lens.on > 0)
        ? requestAnimationFrame(tick)
        : 0;
  };
  const wake = () => {
    if (raf || !near || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const sleep = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const start = async () => {
    const image = new Image();
    image.decoding = "async";
    image.src = picture;
    const family = getComputedStyle(canvas).getPropertyValue("--ds-font-ascii").trim() || "monospace";
    try {
      await Promise.all([image.decode(), document.fonts.load(`13.333px ${family}`)]);
    } catch {
      return;
    }
    if (cancelled) return;
    const w = Math.ceil(width / STEP);
    const h = Math.ceil(height / STEP);
    const small = document.createElement("canvas");
    small.width = w;
    small.height = h;
    const sctx = small.getContext("2d", { willReadFrequently: true });
    if (!sctx) return;
    sctx.imageSmoothingQuality = "high";
    sctx.drawImage(image, 0, 0, w, h);
    const pixels = sctx.getImageData(0, 0, w, h).data;
    const data = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const p = i * 4;
      data[i] = (Math.max(pixels[p], pixels[p + 1], pixels[p + 2]) / 255) * (pixels[p + 3] / 255);
    }
    sharp = { w, h, data };
    layout();
    canvas.setAttribute("data-on", "");
    aim();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    client.x = event.clientX;
    client.y = event.clientY;
    client.known = true;
    aim();
  };
  const onPointerGone = () => {
    client.known = false;
    target.on = 0;
    wake();
  };
  const onVisibility = () => (document.hidden ? sleep() : wake());

  let started = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      near = entry.isIntersecting;
      if (near && !started) {
        started = true;
        void start();
      }
      if (near) aim();
      else {
        sleep();
        if (lens.on > 0) {
          lens.on = 0;
          target.on = 0;
          draw();
        }
      }
    },
    { rootMargin: "200px 0px" },
  );
  io.observe(box);
  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  };
  const resize = new ResizeObserver(onResize);
  resize.observe(box);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", aim, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerGone);
  document.addEventListener("visibilitychange", onVisibility);
  const settle = () => {
    if (live()) return;
    sleep();
    lens.on = 0;
    target.on = 0;
    draw();
  };
  finePointer.addEventListener("change", settle);
  reduce.addEventListener("change", settle);

  return () => {
    cancelled = true;
    sleep();
    window.clearTimeout(resizeTimer);
    io.disconnect();
    resize.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", aim);
    document.documentElement.removeEventListener("pointerleave", onPointerGone);
    document.removeEventListener("visibilitychange", onVisibility);
    finePointer.removeEventListener("change", settle);
    reduce.removeEventListener("change", settle);
    canvas.removeAttribute("data-on");
  };
}
