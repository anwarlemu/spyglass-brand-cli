// The site's cursor lens (effect/CursorLens): moving the mouse over empty page reveals a soft circle of ASCII
// characters (112 to 152px, wider when faster) that fades when the pointer stops or reaches text, controls or pictures.
// A fixed canvas behind the page. Started only for a fine pointer without reduced motion.
import { glyphInk } from "@/lib/effects/ink";
const GLYPH_RAMP = " .:-=+*#";
const GLYPH_SIZE = 13.333;
const CELL_W = 8;
const CELL_H = 16;
const GLYPH_BASELINE = 12;
const FALLBACK_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";

const MAX_DPR = 2;
const MAX_CELLS = 1200;
const TELEPORT = 240;
const RECT_TTL = 200;
const SCAN_TTL = 4000;

const RADIUS_MIN = 112;
const RADIUS_MAX = 152;
const SPEED_TAU = 80;
const SPEED_STILL = 0.2;
const SPEED_FULL = 1.4;
const SPEED_CURVE = 1.5;
const STROKE_MIN = 96;
const TURN_MIN = 48;
const TURN_HOLD = 640;
const NEED_TURN = false;
const DENSITY_MIN = 0.6;
const FIELD_SCALE = 96;
const FIELD_FLOOR = 0.2;
const IDLE_MS = 64;
const RISE_MS = 80;
const STOP_FADE_MS = 640;
const CONTENT_FADE_MS = 120;
const CLEAR_HOLD_MS = 150;
const CELL_FADE_MS = 320;
const NEAR = 32;
const CLEAR_IN = 24;
const CLEAR_OUT = 72;

const CONTENT =
  "p,h1,h2,h3,h4,h5,h6,li,dt,dd,a,button,input,textarea,select,label,img,picture,figure,figcaption,blockquote,code,pre,summary,td,th,video,iframe,svg,[role=button],[role=img],[contenteditable],header";

type Cell = {
  key: number;
  i: number;
  j: number;
  g: number;
  a: number;
  pg: number;
  pa: number;
  seen: number;
};

type Sprite = { image: HTMLCanvasElement; w: number; h: number };

type Axis = { dir: number; start: number; peak: number };

function resetAxis(axis: Axis, p: number) {
  axis.dir = 0;
  axis.start = p;
  axis.peak = p;
}

function turned(axis: Axis, p: number) {
  if (axis.dir === 0) {
    if (Math.abs(p - axis.start) >= TURN_MIN) {
      axis.dir = Math.sign(p - axis.start);
      axis.peak = p;
    }
    return false;
  }
  if ((p - axis.peak) * axis.dir > 0) {
    axis.peak = p;
    return false;
  }
  if ((axis.peak - p) * axis.dir < TURN_MIN) return false;
  const stroke = Math.abs(axis.peak - axis.start);
  axis.start = axis.peak;
  axis.peak = p;
  axis.dir = -axis.dir;
  return stroke >= STROKE_MIN;
}

function glyphSprites(font: string, dpr: number): Sprite[] {
  return Array.from(GLYPH_RAMP, (char) => {
    const image = document.createElement("canvas");
    image.width = Math.round(CELL_W * dpr);
    image.height = Math.round(CELL_H * dpr);
    const ctx = image.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = glyphInk();
      ctx.font = `${GLYPH_SIZE}px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(char, CELL_W / 2, GLYPH_BASELINE);
    }
    return { image, w: CELL_W, h: CELL_H };
  });
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function texture(i: number, j: number) {
  const x = (i * CELL_W) / FIELD_SCALE;
  const y = (j * CELL_H) / FIELD_SCALE;
  const n = 0.65 * valueNoise(x, y) + 0.35 * valueNoise(x * 2.3 + 17, y * 2.3 + 31);
  return smoothstep(0.25, 0.75, n);
}

function hasOwnText(el: Element) {
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
  }
  return false;
}

function hasSurface(style: CSSStyleDeclaration) {
  if (style.backgroundImage && style.backgroundImage !== "none") return true;
  const color = style.backgroundColor;
  if (!color || color === "transparent") return false;
  if (color.startsWith("rgba(") && /,\s*0\)$/.test(color)) return false;
  if (/\/\s*0\)$/.test(color)) return false;
  return true;
}

function isContent(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target === document.documentElement || target === document.body) return false;
  if (target.closest(CONTENT) || hasOwnText(target)) return true;
  for (let el: Element | null = target; el && el !== document.body; el = el.parentElement) {
    if (hasSurface(getComputedStyle(el))) return true;
  }
  return false;
}

export function mountLens(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let dpr = 0;
  let sizeDirty = true;
  let headerBottom = 0;
  let font = FALLBACK_FONT;
  let fontAsked = false;
  let glyphs: Sprite[] = [];

  const cells = new Map<number, Cell>();
  const free: Cell[] = Array.from({ length: MAX_CELLS }, () => ({
    key: 0,
    i: 0,
    j: 0,
    g: 0,
    a: 0,
    pg: 0,
    pa: 0,
    seen: 0,
  }));
  let gen = 0;

  let candidates: Element[] = [];
  let scannedAt = -Infinity;
  let scanHandle = 0;
  let rectsAt = -Infinity;
  let rects = new Float64Array(0);
  let rectCount = 0;
  const local: number[] = [];

  let raf = 0;
  let lastTick = 0;
  let enabled = false;
  let tracking = false;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let px = 0;
  let py = 0;
  let speed = 0;
  const axisX: Axis = { dir: 0, start: 0, peak: 0 };
  const axisY: Axis = { dir: 0, start: 0, peak: 0 };
  let turnAt = -Infinity;
  let level = 0;
  let lastMoveAt = -Infinity;
  let blockedAt = -Infinity;
  let overContent = false;
  let lastTarget: EventTarget | null = null;
  let dirty = false;
  let shown = 0;

  const applySize = () => {
    sizeDirty = false;
    const next = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(document.documentElement.clientWidth * next);
    canvas.height = Math.round(document.documentElement.clientHeight * next);
    headerBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ds-size-header")) || 0;
    if (next !== dpr) {
      dpr = next;
      glyphs = glyphSprites(font, dpr);
    }
  };

  const askFont = () => {
    fontAsked = true;
    const family = getComputedStyle(canvas).getPropertyValue("--ds-font-ascii").trim();
    if (!family) return;
    document.fonts.load(`${GLYPH_SIZE}px ${family}`, GLYPH_RAMP).then(
      () => {
        if (!enabled) return;
        font = `${family}, ${FALLBACK_FONT}`;
        if (dpr) glyphs = glyphSprites(font, dpr);
      },
      () => {},
    );
  };

  const scan = () => {
    scanHandle = 0;
    scannedAt = performance.now();
    if (!fontAsked) askFont();
    const area = window.innerWidth * window.innerHeight;
    const found: Element[] = [];
    const taken = new Set<Element>();
    const all = document.body.getElementsByTagName("*");
    for (let k = 0; k < all.length; k++) {
      const el = all[k];
      if (el === canvas || el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
      if (el.parentElement && taken.has(el.parentElement)) {
        taken.add(el);
        continue;
      }
      if (el.matches(CONTENT) || hasOwnText(el)) {
        taken.add(el);
        found.push(el);
        continue;
      }
      if (el instanceof SVGElement) continue;
      const style = getComputedStyle(el);
      if (!hasSurface(style)) continue;
      const box = el.getBoundingClientRect();
      if (style.backgroundImage === "none" && box.width * box.height > area * 0.6) continue;
      taken.add(el);
      found.push(el);
    }
    candidates = found;
    rects = new Float64Array(found.length * 4);
    rectsAt = -Infinity;
  };

  const scheduleScan = () => {
    if (scanHandle) return;
    scanHandle =
      "requestIdleCallback" in globalThis
        ? globalThis.requestIdleCallback(scan, { timeout: 500 })
        : window.setTimeout(scan, 120);
  };

  const cancelScan = () => {
    if (!scanHandle) return;
    if ("cancelIdleCallback" in globalThis) globalThis.cancelIdleCallback(scanHandle);
    else window.clearTimeout(scanHandle);
    scanHandle = 0;
  };

  const measure = (now: number) => {
    rectsAt = now;
    const sx = window.scrollX;
    const sy = window.scrollY;
    rectCount = 0;
    for (const el of candidates) {
      if (!el.isConnected) continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      const o = rectCount * 4;
      rects[o] = box.left + sx;
      rects[o + 1] = box.top + sy;
      rects[o + 2] = box.right + sx;
      rects[o + 3] = box.bottom + sy;
      rectCount++;
    }
  };

  const distToRect = (k: number, x: number, y: number) => {
    const o = k * 4;
    const dx = Math.max(rects[o] - x, 0, x - rects[o + 2]);
    const dy = Math.max(rects[o + 1] - y, 0, y - rects[o + 3]);
    return Math.hypot(dx, dy);
  };

  const retarget = (cell: Cell, g: number) => {
    if (cell.g === g) return;
    if (cell.g > 0 && cell.a >= cell.pa) {
      cell.pg = cell.g;
      cell.pa = cell.a;
    }
    cell.g = g;
    cell.a = 0;
  };

  const updateCells = (now: number) => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const cx = px + sx;
    const cy = py + sy;
    const radius = RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * level;
    const gain = DENSITY_MIN + (1 - DENSITY_MIN) * level;

    if (now - rectsAt > RECT_TTL) measure(now);
    local.length = 0;
    const reach = radius + CLEAR_OUT;
    for (let k = 0; k < rectCount; k++) {
      const o = k * 4;
      if (rects[o + 2] < cx - reach || rects[o] > cx + reach) continue;
      if (rects[o + 3] < cy - reach || rects[o + 1] > cy + reach) continue;
      if (distToRect(k, cx, cy) < NEAR) {
        blockedAt = now;
        return false;
      }
      local.push(k);
    }

    gen++;
    const r2max = radius * radius;
    const top = sy + headerBottom;
    const i0 = Math.max(0, Math.floor((cx - radius) / CELL_W));
    const i1 = Math.floor((cx + radius) / CELL_W);
    const j0 = Math.max(0, Math.floor((cy - radius) / CELL_H));
    const j1 = Math.floor((cy + radius) / CELL_H);
    for (let j = j0; j <= j1; j++) {
      if (j * CELL_H < top) continue;
      const y = j * CELL_H + CELL_H / 2;
      for (let i = i0; i <= i1; i++) {
        const x = i * CELL_W + CELL_W / 2;
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        if (d2 >= r2max) continue;
        let v = 1 - d2 / r2max;
        v *= v * gain * (FIELD_FLOOR + (1 - FIELD_FLOOR) * texture(i, j));
        if (v < 1 / GLYPH_RAMP.length) continue;
        for (const k of local) {
          const d = distToRect(k, x, y);
          if (d < CLEAR_OUT) v *= smoothstep(CLEAR_IN, CLEAR_OUT, d);
          if (v === 0) break;
        }
        const g = Math.min(GLYPH_RAMP.length - 1, Math.floor(v * GLYPH_RAMP.length));
        if (g < 1) continue;
        const key = j * 8192 + i;
        let cell = cells.get(key);
        if (!cell) {
          cell = free.pop();
          if (!cell) continue;
          cell.key = key;
          cell.i = i;
          cell.j = j;
          cell.g = 0;
          cell.a = 0;
          cell.pg = 0;
          cell.pa = 0;
          cells.set(key, cell);
        }
        cell.seen = gen;
        retarget(cell, g);
      }
    }
    for (const cell of cells.values()) {
      if (cell.seen !== gen) retarget(cell, 0);
    }
    return true;
  };

  const releaseAll = () => {
    for (const cell of cells.values()) free.push(cell);
    cells.clear();
  };

  const stop = () => {
    raf = 0;
    lastTick = 0;
    shown = 0;
    releaseAll();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    delete canvas.dataset.on;
  };

  const tick = (now: number) => {
    raf = 0;
    const dt = lastTick ? Math.min(64, now - lastTick) : 16;
    lastTick = now;
    if (sizeDirty) applySize();

    let open = !overContent && now - blockedAt >= CLEAR_HOLD_MS;
    if (dirty) {
      dirty = false;
      if (open && level > 0) open = updateCells(now);
    }
    const target = open && now - lastMoveAt < IDLE_MS ? level : 0;
    const live = target > 0;
    if (target > shown) shown = Math.min(target, shown + dt / RISE_MS);
    else shown = Math.max(target, shown - dt / (open ? STOP_FADE_MS : CONTENT_FADE_MS));

    if (shown <= 0 && target <= 0) {
      stop();
      return;
    }

    const step = dt / CELL_FADE_MS;
    for (const cell of cells.values()) {
      if (cell.g > 0 && live) cell.a = Math.min(1, cell.a + step);
      if (cell.pa > 0) cell.pa = Math.max(0, cell.pa - step);
      if (cell.g === 0 && cell.pa === 0) {
        cells.delete(cell.key);
        free.push(cell);
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const sx = window.scrollX;
    const sy = window.scrollY;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    for (const cell of cells.values()) {
      const x = Math.round((cell.i * CELL_W - sx) * dpr) / dpr;
      const y = Math.round((cell.j * CELL_H - sy) * dpr) / dpr;
      if (y < headerBottom || y > h || x < -CELL_W || x > w) continue;
      if (cell.pa > 0) {
        const sprite = glyphs[cell.pg];
        ctx.globalAlpha = shown * cell.pa;
        ctx.drawImage(sprite.image, x, y, sprite.w, sprite.h);
      }
      if (cell.g > 0 && cell.a > 0) {
        const sprite = glyphs[cell.g];
        ctx.globalAlpha = shown * cell.a;
        ctx.drawImage(sprite.image, x, y, sprite.w, sprite.h);
      }
    }

    raf = requestAnimationFrame(tick);
  };

  const disarm = () => {
    resetAxis(axisX, px);
    resetAxis(axisY, py);
    turnAt = -Infinity;
    level = 0;
  };

  const wake = () => {
    if (raf) return;
    canvas.dataset.on = "";
    raf = requestAnimationFrame(tick);
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || document.hidden) return;
    const now = performance.now();
    if (event.target !== lastTarget) {
      lastTarget = event.target;
      overContent = isContent(lastTarget);
    }
    if (overContent) blockedAt = now;
    px = event.clientX;
    py = event.clientY;
    if (!tracking) {
      tracking = true;
      lastX = px;
      lastY = py;
      lastT = event.timeStamp;
      speed = 0;
      disarm();
      return;
    }
    const length = Math.hypot(px - lastX, py - lastY);
    if (length === 0) return;
    const dt = Math.max(1, event.timeStamp - lastT);
    lastX = px;
    lastY = py;
    lastT = event.timeStamp;
    lastMoveAt = now;
    if (length > TELEPORT) {
      speed = 0;
      disarm();
      return;
    }
    speed += (length / dt - speed) * (1 - Math.exp(-dt / SPEED_TAU));
    const open = !overContent && now - blockedAt >= CLEAR_HOLD_MS;
    if (!open) {
      disarm();
    } else {
      const turnX = turned(axisX, px);
      const turnY = turned(axisY, py);
      if (turnX || turnY) turnAt = now;
      const u = clamp01((speed - SPEED_STILL) / (SPEED_FULL - SPEED_STILL));
      level = u > 0 && (!NEED_TURN || now - turnAt < TURN_HOLD) ? u ** SPEED_CURVE : 0;
    }
    if (level > 0) {
      if (!fontAsked) askFont();
      if (now - scannedAt > SCAN_TTL) scheduleScan();
      dirty = true;
      wake();
    } else if (shown > 0) {
      wake();
    }
  };

  const onScroll = () => {
    blockedAt = performance.now();
    lastTarget = null;
    disarm();
    if (shown > 0) wake();
  };

  const onGone = () => {
    tracking = false;
    lastTarget = null;
    blockedAt = performance.now();
    disarm();
    if (shown > 0) wake();
  };

  const clearAll = () => {
    cancelAnimationFrame(raf);
    stop();
    tracking = false;
    disarm();
  };

  const onResize = () => {
    sizeDirty = true;
    rectsAt = -Infinity;
    scannedAt = -Infinity;
  };

  const onVisibility = () => {
    if (document.hidden) clearAll();
  };

  const listen = (on: boolean) => {
    const root = document.documentElement;
    if (on) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("blur", onGone);
      root.addEventListener("pointerleave", onGone);
      document.addEventListener("visibilitychange", onVisibility);
    } else {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", onGone);
      root.removeEventListener("pointerleave", onGone);
      document.removeEventListener("visibilitychange", onVisibility);
    }
  };

  const sync = () => {
    const next = finePointer.matches && !reduceMotion.matches;
    if (next === enabled) return;
    enabled = next;
    if (enabled) {
      applySize();
      scheduleScan();
      listen(true);
    } else {
      listen(false);
      cancelScan();
      clearAll();
    }
  };

  sync();
  finePointer.addEventListener("change", sync);
  reduceMotion.addEventListener("change", sync);

  return () => {
    finePointer.removeEventListener("change", sync);
    reduceMotion.removeEventListener("change", sync);
    if (enabled) listen(false);
    enabled = false;
    cancelScan();
    clearAll();
  };
}
