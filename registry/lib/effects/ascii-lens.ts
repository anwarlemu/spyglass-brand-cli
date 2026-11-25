// The site's ASCII lens (effect/AsciiLens): over every ASCII drift and texture on the page, a mouse brings a lens
// (240px) that fills the texture's empty cells near the pointer with more characters, denser where the texture is,
// following on the shared lens ease. Global: one per page, it finds the texture's elements itself (through shadow
// roots) and draws a canvas inside each. Only for a fine pointer without reduced motion.
import { LENS } from "@/lib/effects/lens";
import { ASCII_TEXTURE } from "@/lib/textures";

const SRC = ASCII_TEXTURE;
// A background that draws the texture tile: the tile's data URI (its first characters are enough to know it), or a
// self-hosted copy whose URL names it (the site's /ascii-texture/ match).
const MARK = ASCII_TEXTURE.slice(22, 86);
const TEXTURE_IMAGE = { test: (v: string) => v.includes(MARK) || /ascii-texture/.test(v) };
const NO_REPEAT = /no-repeat/;
const TILE = 1080;
const COLS = 135;
const ROWS = 68;
const RAMP = " .:-=+*#";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const ALPHA = 0.3;
const GAIN = 2.5;
const PIXEL_BUDGET = 4e6;
const MAX_DPR = 2;
const NEAR = 1.5;
const FAR = 4;

type Density = { empty: Uint8Array; near: Float32Array; far: Float32Array };

type Layer = { ox: number; oy: number; size: number; repeat: boolean };

type Texture = {
  el: HTMLElement;
  visible: boolean;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  atlas: HTMLCanvasElement | null;
  dpr: number;
  cw: number;
  ch: number;
  cells: Float32Array;
  count: number;
  w: number;
  h: number;
  lens: { x: number; y: number; on: number };
  target: { x: number; y: number; on: number };
  drawn: boolean;
};

const FIELDS = 5;

function blurWrap(src: Float32Array, r: number) {
  let a = Float32Array.from(src);
  const b = new Float32Array(src.length);
  const k = Math.max(1, Math.round(r));
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        let s = 0;
        for (let i = -k; i <= k; i++) s += a[y * COLS + ((x + i + COLS) % COLS)];
        b[y * COLS + x] = s / (2 * k + 1);
      }
    }
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        let s = 0;
        for (let i = -k; i <= k; i++) s += b[((y + i + ROWS) % ROWS) * COLS + x];
        a[y * COLS + x] = s / (2 * k + 1);
      }
    }
  }
  let max = 0;
  for (const v of a) max = Math.max(max, v);
  if (max > 0) a = a.map((v) => v / max);
  return a;
}

async function readDensity(): Promise<Density | null> {
  const image = new Image();
  image.decoding = "async";
  image.src = SRC;
  try {
    await image.decode();
  } catch {
    return null;
  }
  const w = COLS * 2;
  const h = ROWS * 4;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, w, (h * 67.5) / ROWS);
  const px = ctx.getImageData(0, 0, w, h).data;
  const mean = new Float32Array(COLS * ROWS);
  const empty = new Uint8Array(COLS * ROWS);
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      let sum = 0;
      let peak = 0;
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const v = px[((r * 4 + dy) * w + col * 2 + dx) * 4];
          sum += v;
          peak = Math.max(peak, v);
        }
      }
      mean[r * COLS + col] = sum / 8;
      empty[r * COLS + col] = peak < 6 ? 1 : 0;
    }
  }
  return { empty, near: blurWrap(mean, NEAR), far: blurWrap(mean, FAR) };
}

function offset(token: string, box: number, size: number) {
  const t = token.trim();
  if (t.endsWith("%")) return ((box - size) * parseFloat(t)) / 100;
  if (t === "left" || t === "top") return 0;
  if (t === "right" || t === "bottom") return box - size;
  if (t === "center") return (box - size) / 2;
  return parseFloat(t) || 0;
}

function layersOf(el: HTMLElement, w: number, h: number): Layer[] {
  const s = getComputedStyle(el);
  const images = s.backgroundImage.split(/,(?![^(]*\))/);
  const sizes = s.backgroundSize.split(",");
  const xs = s.backgroundPositionX.split(",");
  const ys = s.backgroundPositionY.split(",");
  const repeats = s.backgroundRepeat.split(",");
  const out: Layer[] = [];
  images.forEach((img, i) => {
    if (!TEXTURE_IMAGE.test(img)) return;
    const size = parseFloat(sizes[i % sizes.length]) || TILE;
    out.push({
      ox: offset(xs[i % xs.length], w, size),
      oy: offset(ys[i % ys.length], h, size),
      size,
      repeat: !NO_REPEAT.test(repeats[i % repeats.length]),
    });
  });
  return out;
}

export function startAsciiLens(): () => void {
  {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return () => {};

    let density: Density | null = null;
    let loading: Promise<void> | null = null;
    let textures: Texture[] = [];
    let path = "";
    let io: IntersectionObserver | null = null;
    let raf = 0;
    let last = 0;
    const client = { x: 0, y: 0, known: false };
    const family = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--ds-font-ascii").trim() || "monospace";

    const scan = () => {
      path = location.pathname;
      for (const t of textures) {
        t.canvas?.remove();
      }
      io?.disconnect();
      const found = new Set<HTMLElement>();
      // Every element that draws the texture tile, through shadow roots (the drifts of the web components).
      const visit = (root: Document | ShadowRoot) => {
        root.querySelectorAll<HTMLElement>('[data-ds="ascii-drift"], [class*="scii"], [class*="drift"], [class*="Drift"], [style*="background"]').forEach((el) => {
          if (TEXTURE_IMAGE.test(getComputedStyle(el).backgroundImage)) found.add(el);
        });
        root.querySelectorAll<HTMLElement>("*").forEach((el) => el.shadowRoot && visit(el.shadowRoot));
      };
      visit(document);
      textures = [...found].map((el) => ({
        el,
        visible: false,
        canvas: null,
        ctx: null,
        atlas: null,
        dpr: 1,
        cw: 8,
        ch: 16,
        cells: new Float32Array(0),
        count: 0,
        w: 0,
        h: 0,
        lens: { x: 0, y: 0, on: 0 },
        target: { x: 0, y: 0, on: 0 },
        drawn: false,
      }));
      const byEl = new Map<Element, Texture>(textures.map((t) => [t.el, t]));
      io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          const t = byEl.get(e.target);
          if (!t) continue;
          t.visible = e.isIntersecting;
          if (!t.visible) {
            t.lens.on = 0;
            t.target.on = 0;
            clear(t);
          }
        }
      });
      textures.forEach((t) => io!.observe(t.el));
    };

    const prepare = (t: Texture) => {
      if (!density) return;
      const w = t.el.offsetWidth;
      const h = t.el.offsetHeight;
      if (!w || !h) return;
      const layers = layersOf(t.el, w, h);
      if (!layers.length) return;
      if (!t.canvas) {
        const c = document.createElement("canvas");
        c.setAttribute("aria-hidden", "true");
        c.style.cssText =
          "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;max-width:none";
        (t.el.shadowRoot ?? t.el).appendChild(c);
        t.canvas = c;
        t.ctx = c.getContext("2d");
      }
      t.w = w;
      t.h = h;
      t.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR, Math.sqrt(PIXEL_BUDGET / (w * h)));
      t.canvas.width = Math.round(w * t.dpr);
      t.canvas.height = Math.round(h * t.dpr);
      const scale = layers[0].size / TILE;
      t.cw = 8 * scale;
      t.ch = 16 * scale;
      const a = document.createElement("canvas");
      a.width = Math.ceil(t.cw * RAMP.length * t.dpr);
      a.height = Math.ceil(t.ch * t.dpr);
      const actx = a.getContext("2d");
      if (actx) {
        actx.scale(t.dpr, t.dpr);
        actx.font = `${13.333 * scale}px ${family()}`;
        actx.textBaseline = "top";
        actx.fillStyle = "#fff";
        for (let i = 1; i < RAMP.length; i++) actx.fillText(RAMP[i], i * t.cw, 0);
      }
      t.atlas = a;
      const out: number[] = [];
      for (const layer of layers) {
        const cw = (8 * layer.size) / TILE;
        const ch = (16 * layer.size) / TILE;
        const tx0 = layer.repeat ? Math.floor(-layer.ox / layer.size) : 0;
        const tx1 = layer.repeat ? Math.ceil((w - layer.ox) / layer.size) : 1;
        const ty0 = layer.repeat ? Math.floor(-layer.oy / layer.size) : 0;
        const ty1 = layer.repeat ? Math.ceil((h - layer.oy) / layer.size) : 1;
        for (let ty = ty0; ty < ty1; ty++) {
          for (let tx = tx0; tx < tx1; tx++) {
            const bx = layer.ox + tx * layer.size;
            const by = layer.oy + ty * layer.size;
            for (let r = 0; r < ROWS; r++) {
              const y = by + r * ch;
              if (y + ch < 0 || y > h || (r === ROWS - 1 && y + ch > by + layer.size)) continue;
              for (let col = 0; col < COLS; col++) {
                const x = bx + col * cw;
                if (x + cw < 0 || x > w) continue;
                const i = r * COLS + col;
                if (!density.empty[i] || density.far[i] < 0.02) continue;
                out.push(x, y, density.near[i], density.far[i], BAYER[(r % 4) * 4 + (col % 4)]);
              }
            }
          }
        }
      }
      const n = out.length / FIELDS;
      const order = Array.from({ length: n }, (_, i) => i).sort(
        (p, q) => out[p * FIELDS + 1] - out[q * FIELDS + 1],
      );
      const cells = new Float32Array(out.length);
      order.forEach((src, dst) => {
        for (let f = 0; f < FIELDS; f++) cells[dst * FIELDS + f] = out[src * FIELDS + f];
      });
      t.cells = cells;
      t.count = n;
    };

    const clear = (t: Texture) => {
      if (!t.ctx || !t.canvas || !t.drawn) return;
      t.ctx.setTransform(1, 0, 0, 1, 0, 0);
      t.ctx.clearRect(0, 0, t.canvas.width, t.canvas.height);
      t.drawn = false;
    };

    const draw = (t: Texture) => {
      const { ctx, atlas } = t;
      if (!ctx || !atlas) return;
      clear(t);
      if (t.lens.on <= 0.002) return;
      ctx.setTransform(t.dpr, 0, 0, t.dpr, 0, 0);
      ctx.globalAlpha = ALPHA;
      const R = LENS.radius;
      const r2 = R * R;
      const y0 = t.lens.y - R - t.ch;
      const y1 = t.lens.y + R;
      let lo = 0;
      let hi = t.count;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (t.cells[mid * FIELDS + 1] < y0) lo = mid + 1;
        else hi = mid;
      }
      const sw = t.cw * t.dpr;
      const sh = t.ch * t.dpr;
      for (let i = lo; i < t.count; i++) {
        const o = i * FIELDS;
        const y = t.cells[o + 1];
        if (y > y1) break;
        const x = t.cells[o];
        const dx = x + t.cw / 2 - t.lens.x;
        const dy = y + t.ch / 2 - t.lens.y;
        const d = dx * dx + dy * dy;
        if (d >= r2) continue;
        const f = 1 - d / r2;
        const l = t.lens.on * f * f;
        const v = Math.min(1, GAIN * l * (t.cells[o + 2] + (t.cells[o + 3] - t.cells[o + 2]) * l));
        const idx = Math.min(RAMP.length - 1, Math.floor(v * (RAMP.length - 1) + t.cells[o + 4]));
        if (idx < 1) continue;
        ctx.drawImage(atlas, idx * sw, 0, sw, sh, x, y, t.cw, t.ch);
        t.drawn = true;
      }
      ctx.globalAlpha = 1;
    };

    const aim = () => {
      if (!client.known || !density) return;
      if (location.pathname !== path) scan();
      let any = false;
      for (const t of textures) {
        if (!t.visible) continue;
        const rect = t.el.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const sx = rect.width / (t.el.offsetWidth || rect.width);
        const sy = rect.height / (t.el.offsetHeight || rect.height);
        const x = (client.x - rect.left) / sx;
        const y = (client.y - rect.top) / sy;
        const R = LENS.radius;
        const inside = x > -R && y > -R && x < rect.width / sx + R && y < rect.height / sy + R;
        if (inside && !t.canvas) prepare(t);
        if (!t.canvas) continue;
        if (inside && t.target.on === 0 && t.lens.on < 0.01) {
          t.lens.x = x;
          t.lens.y = y;
        }
        t.target.x = x;
        t.target.y = y;
        t.target.on = inside ? 1 : 0;
        if (inside || t.lens.on > 0) any = true;
      }
      if (any) wake();
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const follow = 1 - Math.exp(-dt * LENS.follow);
      const ease = 1 - Math.exp(-dt * LENS.ease);
      let busy = false;
      for (const t of textures) {
        if (!t.canvas || !t.visible) continue;
        if (t.target.on === 0 && t.lens.on === 0) continue;
        const moving = Math.abs(t.target.x - t.lens.x) + Math.abs(t.target.y - t.lens.y) > 0.5;
        t.lens.x += (t.target.x - t.lens.x) * follow;
        t.lens.y += (t.target.y - t.lens.y) * follow;
        t.lens.on += (t.target.on - t.lens.on) * ease;
        if (t.target.on === 0 && t.lens.on < 0.002) t.lens.on = 0;
        draw(t);
        if (moving || Math.abs(t.target.on - t.lens.on) > 0.002) busy = true;
      }
      raf = busy ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (raf || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      client.x = event.clientX;
      client.y = event.clientY;
      client.known = true;
      if (!density) {
        loading ??= readDensity().then((d) => {
          density = d;
          if (d) {
            scan();
            requestAnimationFrame(() => requestAnimationFrame(aim));
          }
        });
        return;
      }
      aim();
    };
    const onLeave = () => {
      client.known = false;
      for (const t of textures) t.target.on = 0;
      wake();
    };
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        for (const t of textures) {
          if (t.canvas) prepare(t);
        }
      }, 150);
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const stop = () => {
      if (fine.matches && !reduced.matches) return;
      cancelAnimationFrame(raf);
      raf = 0;
      for (const t of textures) {
        t.lens.on = 0;
        t.target.on = 0;
        clear(t);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", aim, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    fine.addEventListener("change", stop);
    reduced.addEventListener("change", stop);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      io?.disconnect();
      for (const t of textures) t.canvas?.remove();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", aim);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      fine.removeEventListener("change", stop);
      reduced.removeEventListener("change", stop);
    };
  }
}
