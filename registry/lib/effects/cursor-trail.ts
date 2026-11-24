// The site's cursor trail (effect/CursorTrail): a quick flick of the mouse throws a dashed trail of the brand light
// (Blue, Green, Red, split like the lens) with a few ASCII characters along the path, fading in 320 to 560ms; it stays
// closed over text, controls and pictures. A fixed canvas behind the page (plus-lighter). The component starts it only
// for a fine pointer without reduced motion; forced colours hide it.
import { glyphInk, lightChannels } from "@/lib/effects/ink";
const GLYPH_RAMP = " .:-=+*#";
const GLYPH_SIZE = 13.333;
const CELL = { w: 8, h: 16 };
const GLYPH_BASELINE = 12;
const FALLBACK_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";

const MAX_DPR = 2;
const POOL = 16;
const GRID = 4;
const TELEPORT = 400;
const PATH_POINTS = 48;
const LENS_SPLIT = 0.5;

const SPEED_TAU = 24;
const FLICK_SPEED = 0.9;
const FLICK_FULL = 3.5;
const FLICK_RUN = 40;
const REARM = 0.5;
const DASH_GAP = 220;
const DASH_MIN = 6;
const DASH_MAX = 12;
const DASH_LEN = 176;
const DASH_LEAD = 32;
const SCATTER = 8;
const LIFE_MIN = 320;
const LIFE_MAX = 560;
const GLYPH_CHANCE = 0.35;
const GATE_FADE = 120;
const OPEN_HOLD = 120;
const TEXT_PAD = 24;
const IMAGE_PAD = 16;

const CLOSED =
  "p,h1,h2,h3,h4,h5,h6,li,dt,dd,a,button,input,textarea,select,label,img,picture,figure,blockquote,code,pre," +
  "[role=button],figcaption,summary,td,th,video,svg,[contenteditable],header,nav";
const IMAGES = "img,picture,figure,video,svg";
const HERO = 'section[aria-labelledby="hero-title"]';

type Sprite = { image: HTMLCanvasElement; w: number; h: number };
type Box = { l: number; t: number; r: number; b: number };

type Chip = {
  on: boolean;
  x: number;
  y: number;
  born: number;
  life: number;
  alpha: number;
  sprite: Sprite | null;
};

function chipSprite(size: number, dDevice: number, dpr: number): Sprite {
  const image = document.createElement("canvas");
  const side = Math.round(size * dpr);
  image.width = side + 2 * dDevice;
  image.height = side;
  const ctx = image.getContext("2d");
  if (ctx) {
    ctx.globalCompositeOperation = "lighter";
    for (const channel of lightChannels()) {
      ctx.fillStyle = channel.fill;
      ctx.fillRect(channel.step * dDevice, 0, side, side);
    }
  }
  return { image, w: image.width / dpr, h: image.height / dpr };
}

function glyphSprites(font: string, dpr: number): Sprite[] {
  return Array.from(GLYPH_RAMP, (char) => {
    const image = document.createElement("canvas");
    image.width = Math.round(CELL.w * dpr);
    image.height = Math.round(CELL.h * dpr);
    const ctx = image.getContext("2d");
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.fillStyle = glyphInk();
      ctx.font = `${GLYPH_SIZE}px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(char, CELL.w / 2, GLYPH_BASELINE);
    }
    return { image, w: CELL.w, h: CELL.h };
  });
}

const snap = (v: number, step: number) => Math.round(v / step) * step;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const inside = (box: Box, x: number, y: number) => x >= box.l && x <= box.r && y >= box.t && y <= box.b;

function isClosedTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return true;
  if (target.closest(CLOSED)) return true;
  for (const node of target.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
  }
  return false;
}

export function mountTrail(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const pool: Chip[] = Array.from({ length: POOL }, () => ({
    on: false,
    x: 0,
    y: 0,
    born: 0,
    life: 0,
    alpha: 0,
    sprite: null,
  }));
  let head = 0;
  let alive = 0;

  let dpr = 0;
  let sizeDirty = true;
  let font = FALLBACK_FONT;
  let fontAsked = false;
  const chips = new Map<string, Sprite>();
  let glyphs: Sprite[] = [];

  let hero: Element | null = null;
  let heroBox: Box | null = null;
  let zones: Box[] = [];
  let headerH = 0;
  let zonesDirty = true;
  let observer: ResizeObserver | null = null;

  const pathX = new Float64Array(PATH_POINTS);
  const pathY = new Float64Array(PATH_POINTS);
  let pathHead = 0;
  let pathCount = 0;

  let heroLookedAt = -Infinity;

  let raf = 0;
  let enabled = false;
  let tracking = false;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let lastSX = 0;
  let lastSY = 0;
  let speed = 0;
  let run = 0;
  let armed = true;
  let lastDash = -Infinity;
  let lastTarget: EventTarget | null = null;
  let targetClosed = true;
  let closed = true;
  let closedAt = -Infinity;
  let openSince = Infinity;

  const chipFor = (size: number, intensity: number) => {
    const dDevice = Math.max(1, Math.round((size / 4) * (1 + LENS_SPLIT * intensity) * dpr));
    const key = `${size}:${dDevice}`;
    let sprite = chips.get(key);
    if (!sprite) {
      sprite = chipSprite(size, dDevice, dpr);
      chips.set(key, sprite);
    }
    return sprite;
  };

  const applySize = () => {
    sizeDirty = false;
    const next = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(document.documentElement.clientWidth * next);
    canvas.height = Math.round(document.documentElement.clientHeight * next);
    if (next !== dpr) {
      dpr = next;
      chips.clear();
      glyphs = glyphSprites(font, dpr);
    }
  };

  const markZones = () => {
    zonesDirty = true;
  };

  const measure = () => {
    zonesDirty = false;
    const sx = window.scrollX;
    const sy = window.scrollY;
    const box = (el: Element, pad: number): Box | null => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return null;
      return { l: r.left + sx - pad, t: r.top + sy - pad, r: r.right + sx + pad, b: r.bottom + sy + pad };
    };
    const found = document.querySelector(HERO);
    if (found !== hero) {
      observer?.disconnect();
      hero = found;
      if (hero && observer) {
        observer.observe(hero);
        const block = hero.querySelector("#hero-title")?.parentElement;
        if (block) observer.observe(block);
      }
    }
    heroBox = hero ? box(hero, 0) : null;
    zones = [];
    if (hero) {
      for (const el of hero.querySelectorAll(CLOSED)) {
        const b = box(el, el.matches(IMAGES) ? IMAGE_PAD : TEXT_PAD);
        if (b) zones.push(b);
      }
      const block = hero.querySelector("#hero-title")?.parentElement;
      if (block) {
        for (const el of block.children) {
          const b = box(el, TEXT_PAD);
          if (b) zones.push(b);
        }
      }
    }
    headerH = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  };

  const isOpen = (x: number, y: number) => {
    if (!heroBox || !inside(heroBox, x, y)) return false;
    if (y - window.scrollY < headerH) return false;
    for (const zone of zones) if (inside(zone, x, y)) return false;
    return true;
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

  const clearCanvas = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const tick = (now: number) => {
    raf = 0;
    if (sizeDirty) applySize();
    clearCanvas();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = "lighter";

    const sx = window.scrollX;
    const sy = window.scrollY;
    ctx.save();
    if (heroBox) {
      const top = Math.max(heroBox.t - sy, headerH);
      ctx.beginPath();
      ctx.rect(heroBox.l - sx, top, heroBox.r - heroBox.l, Math.max(0, heroBox.b - sy - top));
      ctx.clip();
    }

    alive = 0;
    const gate = 1 - (now - closedAt) / GATE_FADE;
    for (const chip of pool) {
      if (!chip.on || !chip.sprite) continue;
      const t = Math.max(0, (now - chip.born) / chip.life);
      const cut = chip.born < closedAt ? gate : 1;
      if (t >= 1 || cut <= 0) {
        chip.on = false;
        continue;
      }
      alive++;
      const rest = 1 - t;
      ctx.globalAlpha = chip.alpha * rest * rest * Math.min(1, cut);
      const x = Math.round((chip.x - sx) * dpr) / dpr;
      const y = Math.round((chip.y - sy) * dpr) / dpr;
      ctx.drawImage(chip.sprite.image, x, y, chip.sprite.w, chip.sprite.h);
    }
    ctx.restore();

    if (alive) {
      raf = requestAnimationFrame(tick);
    } else {
      clearCanvas();
      delete canvas.dataset.on;
    }
  };

  const wake = () => {
    if (raf) return;
    canvas.dataset.on = "";
    raf = requestAnimationFrame(tick);
  };

  const take = () => {
    const chip = pool[head];
    head = (head + 1) % POOL;
    return chip;
  };

  const dash = (intensity: number, now: number) => {
    if (!fontAsked) askFont();
    if (sizeDirty) applySize();
    const count = Math.round(DASH_MIN + (DASH_MAX - DASH_MIN) * intensity);
    const targets = Array.from(
      { length: count },
      (_, i) => DASH_LEAD + ((i + Math.random()) / count) * DASH_LEN,
    );
    let next = 0;
    let travelled = 0;
    let tailX = 0;
    let tailY = 0;
    let tailNx = 0;
    let tailNy = 0;
    let placed = 0;
    for (let k = 1; k < pathCount && next < count; k++) {
      const ai = (pathHead - k + PATH_POINTS) % PATH_POINTS;
      const bi = (pathHead - k - 1 + PATH_POINTS) % PATH_POINTS;
      const ax = pathX[ai];
      const ay = pathY[ai];
      const dx = pathX[bi] - ax;
      const dy = pathY[bi] - ay;
      const seg = Math.hypot(dx, dy);
      if (seg === 0) continue;
      const ux = dx / seg;
      const uy = dy / seg;
      while (next < count && targets[next] <= travelled + seg) {
        const s = targets[next] - travelled;
        const f = 1 - (targets[next] - DASH_LEAD) / DASH_LEN;
        next++;
        const side = (Math.random() + Math.random() - 1) * SCATTER;
        const px = ax + ux * s - uy * side;
        const py = ay + uy * s + ux * side;
        if (!isOpen(px, py)) continue;
        const big = Math.random() < 0.2 + 0.3 * intensity;
        const size = big ? 8 : 4;
        const chip = take();
        chip.on = true;
        chip.born = now;
        chip.life = LIFE_MIN + (LIFE_MAX - LIFE_MIN) * f;
        chip.x = snap(px - size / 2, GRID);
        chip.y = snap(py - size / 2, GRID);
        chip.sprite = chipFor(size, intensity);
        chip.alpha = 1;
        tailX = px;
        tailY = py;
        tailNx = -uy;
        tailNy = ux;
        placed++;
      }
      travelled += seg;
    }
    if (!placed) return false;

    const rampIndex = Math.min(GLYPH_RAMP.length - 1, 1 + Math.floor(intensity * (GLYPH_RAMP.length - 1)));
    if (Math.random() < GLYPH_CHANCE && glyphs[rampIndex]) {
      const sign = Math.random() < 0.5 ? -1 : 1;
      const gx = tailX + tailNx * sign * 16;
      const gy = tailY + tailNy * sign * 16;
      if (isOpen(gx, gy)) {
        const chip = take();
        chip.on = true;
        chip.born = now;
        chip.life = LIFE_MIN;
        chip.x = snap(gx - CELL.w / 2, CELL.w);
        chip.y = snap(gy - CELL.h / 2, CELL.h);
        chip.sprite = glyphs[rampIndex];
        chip.alpha = 1;
      }
    }
    return true;
  };

  const close = (now: number) => {
    if (closed) return;
    closed = true;
    closedAt = now;
    if (alive && !raf) wake();
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || document.hidden) return;
    const now = performance.now();
    if (hero && !hero.isConnected) zonesDirty = true;
    if (!hero && now - heroLookedAt > 500) {
      heroLookedAt = now;
      zonesDirty = true;
    }
    if (zonesDirty) measure();
    const sx = window.scrollX;
    const sy = window.scrollY;
    const cx = event.clientX;
    const cy = event.clientY;
    const x = cx + sx;
    const y = cy + sy;

    if (event.target !== lastTarget) {
      lastTarget = event.target;
      targetClosed = isClosedTarget(lastTarget);
    }
    if (targetClosed || !isOpen(x, y)) {
      close(now);
    } else if (closed) {
      closed = false;
      openSince = now;
    }

    if (!tracking || sx !== lastSX || sy !== lastSY) {
      tracking = true;
      lastX = cx;
      lastY = cy;
      lastT = event.timeStamp;
      lastSX = sx;
      lastSY = sy;
      speed = 0;
      run = 0;
      pathCount = 0;
    }
    const dx = cx - lastX;
    const dy = cy - lastY;
    const length = Math.hypot(dx, dy);
    const dt = Math.max(1, event.timeStamp - lastT);
    lastX = cx;
    lastY = cy;
    lastT = event.timeStamp;
    if (length > TELEPORT) {
      speed = 0;
      run = 0;
      pathCount = 0;
    }
    pathX[pathHead] = x;
    pathY[pathHead] = y;
    pathHead = (pathHead + 1) % PATH_POINTS;
    pathCount = Math.min(PATH_POINTS, pathCount + 1);
    if (length === 0 || length > TELEPORT) return;

    speed += (length / dt - speed) * (1 - Math.exp(-dt / SPEED_TAU));
    if (speed < FLICK_SPEED * REARM) armed = true;
    run = speed >= FLICK_SPEED ? run + length : 0;

    if (!armed || run < FLICK_RUN || closed || now - openSince < OPEN_HOLD || now - lastDash < DASH_GAP)
      return;
    armed = false;
    lastDash = now;
    if (dash(clamp01((speed - FLICK_SPEED) / (FLICK_FULL - FLICK_SPEED)), now)) wake();
  };

  const onGone = () => {
    tracking = false;
    close(performance.now());
  };

  const clearAll = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    for (const chip of pool) chip.on = false;
    alive = 0;
    clearCanvas();
    delete canvas.dataset.on;
    tracking = false;
    closed = true;
    closedAt = performance.now();
  };

  const onResize = () => {
    sizeDirty = true;
    zonesDirty = true;
  };

  const onVisibility = () => {
    if (document.hidden) clearAll();
  };

  const listen = (on: boolean) => {
    const root = document.documentElement;
    if (on) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("blur", onGone);
      root.addEventListener("pointerleave", onGone);
      document.addEventListener("visibilitychange", onVisibility);
      observer = new ResizeObserver(markZones);
      hero = null;
      zonesDirty = true;
    } else {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", onGone);
      root.removeEventListener("pointerleave", onGone);
      document.removeEventListener("visibilitychange", onVisibility);
      observer?.disconnect();
      observer = null;
      hero = null;
    }
  };

  const sync = () => {
    const next = finePointer.matches && !reduceMotion.matches;
    if (next === enabled) return;
    enabled = next;
    if (enabled) {
      applySize();
      listen(true);
    } else {
      listen(false);
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
    clearAll();
  };
}
