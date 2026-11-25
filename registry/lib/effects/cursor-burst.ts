// The site's cursor burst (effect/CursorBurst): throwing the mouse and stopping sends out a small burst of light chips
// (Blue, Green, Red) and ASCII characters around the stop, fading in 640ms, never over text or pictures. A fixed canvas
// behind the page. Started only for a fine pointer without reduced motion.
import { glyphInk, lightChannels } from "@/lib/effects/ink";
const GLYPH_RAMP = " .:-=+*#";
const GLYPH_SIZE = 13.333;
const CELL = { w: 8, h: 16 };
const GLYPH_BASELINE = 12;
const FALLBACK_FONT = "ui-monospace, SFMono-Regular, Menlo, monospace";

const MAX_DPR = 2;
const POOL = 12;
const GRID = 4;
const TELEPORT = 240;
const LENS_SPLIT = 0.5;

const SPEED_WINDOW = 24;
const FAST_SPEED = 1.0;
const FULL_SPEED = 3;
const STILL_SPEED = 0.12;
const DECEL_WINDOW = 200;
const STOP_IDLE = 40;
const MIN_THROW = 64;
const BURST_GAP = 350;
const OPEN_DWELL = 120;
const CLEAR = 40;
const CHIPS_MIN = 6;
const CHIPS_MAX = 10;
const SPREAD = 12;
const TAIL = 12;
const GLYPH_CHANCE = 0.5;
const HOLD = 120;
const LIFE = 640;
const LIFE_EARLY = 120;
const CUT = 120;

const CONTENT =
  "p,h1,h2,h3,h4,h5,h6,li,dt,dd,a,button,input,textarea,select,label,img,picture,figure,figcaption,blockquote,code,pre,summary,td,th,video,canvas,svg,iframe,[role=button],[role=link],[role=tab],[role=switch],[role=slider],[role=checkbox],[role=radio],[contenteditable]";
const VISUALS = "img,picture,video,canvas,svg,iframe,figure";

type Sprite = { image: HTMLCanvasElement };

type Chip = {
  on: boolean;
  x: number;
  y: number;
  life: number;
  alpha: number;
  sprite: Sprite | null;
};

function chipSprite(side: number, dDevice: number): Sprite {
  const image = document.createElement("canvas");
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
  return { image };
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
    return { image };
  });
}

const snap = (v: number, step: number) => Math.round(v / step) * step;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const surfaces = new WeakMap<Element, boolean>();
function isSurface(el: Element) {
  let known = surfaces.get(el);
  if (known === undefined) {
    const bg = getComputedStyle(el).backgroundColor;
    known = !(bg === "transparent" || /^rgba\(.*,\s*0\)$/.test(bg));
    surfaces.set(el, known);
  }
  return known;
}

const verdicts = new WeakMap<Element, boolean>();
function isContent(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  let verdict = verdicts.get(target);
  if (verdict === undefined) {
    verdict = target.closest(CONTENT) !== null;
    for (
      let el: Element | null = target;
      !verdict && el && el !== document.body && el !== document.documentElement;
    ) {
      verdict = isSurface(el);
      el = el.parentElement;
    }
    verdicts.set(target, verdict);
  }
  if (verdict) return true;
  for (const node of target.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
  }
  return false;
}

export function mountBurst(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const pool: Chip[] = Array.from({ length: POOL }, () => ({
    on: false,
    x: 0,
    y: 0,
    life: 0,
    alpha: 0,
    sprite: null,
  }));
  let born = 0;
  let cutAt = 0;

  let dpr = 0;
  let sizeDirty = true;
  let headerBottom = 0;
  let font = FALLBACK_FONT;
  let fontAsked = false;
  const chips = new Map<string, Sprite>();
  let glyphs: Sprite[] = [];

  let boxes: DOMRect[] = [];
  let boxesAt = -Infinity;
  let boxesScrollX = 0;
  let boxesScrollY = 0;
  let shiftX = 0;
  let shiftY = 0;

  let raf = 0;
  let stopTimer = 0;
  let enabled = false;

  const HISTORY = 32;
  let gap = 16;
  const hx = new Float64Array(HISTORY);
  const hy = new Float64Array(HISTORY);
  const ht = new Float64Array(HISTORY);
  let count = 0;
  let newest = -1;

  let armed = false;
  let fastAt = 0;
  let peak = 0;
  let thrown = 0;
  let dirX = 0;
  let dirY = 0;
  let contentAt = -Infinity;
  let lastBurst = -Infinity;

  const chipFor = (size: number, intensity: number) => {
    const side = Math.round(size * dpr);
    const dDevice = Math.max(1, Math.round((size / 4) * (1 + LENS_SPLIT * intensity) * dpr));
    const key = `${side}:${dDevice}`;
    let sprite = chips.get(key);
    if (!sprite) {
      sprite = chipSprite(side, dDevice);
      chips.set(key, sprite);
    }
    return sprite;
  };

  const applySize = () => {
    sizeDirty = false;
    const root = document.documentElement;
    const next = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(root.clientWidth * next);
    canvas.height = Math.round(root.clientHeight * next);
    headerBottom = parseFloat(getComputedStyle(root).getPropertyValue(window.innerWidth < 1024 ? "--ds-header-bar-phone" : "--ds-size-header")) || 0;
    if (next !== dpr) {
      dpr = next;
      chips.clear();
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

  const pictureBoxes = (now: number) => {
    if (now - boxesAt > 400) {
      boxes = [];
      for (const el of document.querySelectorAll(VISUALS)) {
        if (el === canvas) continue;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) boxes.push(r);
      }
      boxesAt = now;
      boxesScrollX = window.scrollX;
      boxesScrollY = window.scrollY;
    }
    shiftX = boxesScrollX - window.scrollX;
    shiftY = boxesScrollY - window.scrollY;
  };

  const nearPicture = (x: number, y: number, margin: number, now: number) => {
    pictureBoxes(now);
    for (const r of boxes) {
      if (
        x > r.left + shiftX - margin &&
        x < r.right + shiftX + margin &&
        y > r.top + shiftY - margin &&
        y < r.bottom + shiftY + margin
      ) {
        return true;
      }
    }
    return false;
  };

  const ring = (n: number, r: number) =>
    Array.from({ length: n }, (_, i) => [
      Math.cos((i * 2 * Math.PI) / n) * r,
      Math.sin((i * 2 * Math.PI) / n) * r,
    ]);
  const RING = [[0, 0], ...ring(6, 0.3), ...ring(10, 0.65), ...ring(16, 1)];
  const isOpen = (x: number, y: number, now: number) => {
    const root = document.documentElement;
    if (
      x < CLEAR ||
      y < headerBottom + CLEAR ||
      x > root.clientWidth - CLEAR ||
      y > root.clientHeight - CLEAR
    ) {
      return false;
    }
    if (nearPicture(x, y, CLEAR, now)) return false;
    for (const [cx, cy] of RING) {
      if (isContent(document.elementFromPoint(x + cx * CLEAR, y + cy * CLEAR))) return false;
    }
    return true;
  };

  const tick = (now: number) => {
    raf = 0;
    if (sizeDirty) applySize();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = "lighter";

    const age = now - born;
    const cut = cutAt ? clamp01(1 - (now - cutAt) / CUT) : 1;
    let alive = 0;
    for (const chip of pool) {
      if (!chip.on || !chip.sprite) continue;
      if (age >= chip.life || cut <= 0) {
        chip.on = false;
        continue;
      }
      alive++;
      const rest = age <= HOLD ? 1 : 1 - (age - HOLD) / (chip.life - HOLD);
      ctx.globalAlpha = chip.alpha * rest * rest * cut;
      ctx.drawImage(chip.sprite.image, chip.x, chip.y);
    }

    if (alive) {
      raf = requestAnimationFrame(tick);
    } else {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      delete canvas.dataset.on;
    }
  };

  const burst = (x: number, y: number, now: number) => {
    lastBurst = now;
    if (sizeDirty) applySize();
    const intensity = clamp01((peak - FAST_SPEED) / (FULL_SPEED - FAST_SPEED));
    const total = CHIPS_MIN + Math.round((CHIPS_MAX - CHIPS_MIN) * intensity);
    const taken = new Set<string>();
    let used = 0;

    const place = (cx: number, cy: number, size: number, alpha: number, life: number) => {
      const gx = snap(cx - size / 2, GRID);
      const gy = snap(cy - size / 2, GRID);
      const key = `${gx}:${gy}`;
      if (taken.has(key)) return false;
      taken.add(key);
      const chip = pool[used++];
      chip.on = true;
      chip.x = Math.round(gx * dpr);
      chip.y = Math.round(gy * dpr);
      chip.sprite = chipFor(size, intensity);
      chip.alpha = alpha;
      chip.life = life;
      return true;
    };

    place(x, y, 8, 1, LIFE);
    for (let tries = 0; used < total && tries < 40; tries++) {
      const across = (Math.random() + Math.random() - 1) * SPREAD;
      const along = (Math.random() + Math.random() - 1) * SPREAD * 0.5 - Math.random() * TAIL;
      const cx = x + dirX * along - dirY * across;
      const cy = y + dirY * along + dirX * across;
      const near = 1 - Math.min(1, Math.hypot(cx - x, cy - y) / (SPREAD + TAIL));
      const size = Math.random() < 0.15 + 0.25 * intensity ? 8 : 4;
      place(cx, cy, size, 0.55 + 0.4 * near, LIFE - LIFE_EARLY * (1 - near));
    }

    if (glyphs.length && used < POOL && Math.random() < GLYPH_CHANCE) {
      const ramp = Math.max(1, Math.min(GLYPH_RAMP.length - 1, Math.floor((0.3 + 0.7 * intensity) * 8)));
      const side = Math.random() < 0.5 ? -1 : 1;
      const gx = snap(x - CELL.w / 2 - dirY * side * (SPREAD + CELL.w), CELL.w);
      const gy = snap(y - CELL.h / 2 + dirX * side * (SPREAD + CELL.w), CELL.h);
      const chip = pool[used++];
      chip.on = true;
      chip.x = Math.round(gx * dpr);
      chip.y = Math.round(gy * dpr);
      chip.sprite = glyphs[ramp];
      chip.alpha = 1;
      chip.life = LIFE - LIFE_EARLY;
    }
    for (let i = used; i < POOL; i++) pool[i].on = false;

    born = performance.now();
    cutAt = 0;
    canvas.dataset.on = "";
    if (!raf) raf = requestAnimationFrame(tick);
  };

  const disarm = () => {
    armed = false;
    peak = 0;
    thrown = 0;
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = 0;
    }
  };

  const stopped = (x: number, y: number, t: number) => {
    const ok = thrown >= MIN_THROW && t - lastBurst >= BURST_GAP && t - contentAt >= OPEN_DWELL;
    disarm();
    if (ok && isOpen(x, y, t)) burst(x, y, t);
  };

  const onStopTimer = () => {
    stopTimer = 0;
    if (!armed || newest < 0 || document.hidden) return;
    if (ht[newest] - fastAt <= DECEL_WINDOW) stopped(hx[newest], hy[newest], ht[newest]);
    else disarm();
  };

  const forget = () => {
    count = 0;
    newest = -1;
    disarm();
  };

  const cutBurst = () => {
    if (raf && !cutAt) cutAt = performance.now();
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || document.hidden) return;
    const x = event.clientX;
    const y = event.clientY;
    const t = event.timeStamp;

    if (isContent(event.target) || nearPicture(x, y, GRID * 2, t)) {
      contentAt = t;
      cutBurst();
    }

    if (event.buttons !== 0) {
      forget();
      return;
    }

    if (newest >= 0) {
      const jump = Math.hypot(x - hx[newest], y - hy[newest]);
      if (jump > TELEPORT) forget();
      else if (jump === 0) return;
      else if (t - ht[newest] < 100) gap += (t - ht[newest] - gap) * 0.2;
    }
    newest = (newest + 1) % HISTORY;
    hx[newest] = x;
    hy[newest] = y;
    ht[newest] = t;
    count = Math.min(count + 1, HISTORY);
    if (count < 2) return;

    let back = (newest - 1 + HISTORY) % HISTORY;
    for (let k = 2; k < count && t - ht[back] < SPEED_WINDOW; k++) back = (back - 1 + HISTORY) % HISTORY;
    const prev = (newest - 1 + HISTORY) % HISTORY;
    const dx = x - hx[back];
    const dy = y - hy[back];
    const speed = Math.hypot(dx, dy) / Math.max(1, t - ht[back]);

    if (speed >= FAST_SPEED) {
      if (!armed && !fontAsked) askFont();
      armed = true;
      fastAt = t;
      peak = Math.max(peak, speed);
      const len = Math.hypot(dx, dy);
      dirX = dx / len;
      dirY = dy / len;
    }
    if (!armed) return;
    if (speed >= FAST_SPEED * 0.5) thrown += Math.hypot(x - hx[prev], y - hy[prev]);

    if (speed <= STILL_SPEED) {
      if (t - fastAt <= DECEL_WINDOW) stopped(x, y, t);
      else disarm();
      return;
    }
    if (speed < FAST_SPEED && t - fastAt > DECEL_WINDOW) {
      disarm();
      return;
    }
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = window.setTimeout(onStopTimer, Math.max(STOP_IDLE, gap * 2.5));
  };

  const clearAll = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    for (const chip of pool) chip.on = false;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    delete canvas.dataset.on;
    forget();
  };

  const onResize = () => {
    sizeDirty = true;
    boxesAt = -Infinity;
  };

  const onScroll = () => {
    cutBurst();
    disarm();
  };

  const onVisibility = () => {
    if (document.hidden) clearAll();
  };

  const listen = (on: boolean) => {
    const root = document.documentElement;
    if (on) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("blur", forget);
      root.addEventListener("pointerleave", forget);
      document.addEventListener("visibilitychange", onVisibility);
    } else {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", forget);
      root.removeEventListener("pointerleave", forget);
      document.removeEventListener("visibilitychange", onVisibility);
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
