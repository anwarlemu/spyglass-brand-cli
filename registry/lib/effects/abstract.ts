// The site's abstract canvases (abstract/useAbstractCanvas): ASCII drawings on a 2D canvas in the brand's tokens,
// painted at a fixed frame rate while on screen and asleep off it; with reduced motion one settled frame, and `freeze`
// holds a chosen moment (start, middle or settled). Shared by both flavors.

export const CELL_W = 8;
export const CELL_H = 16;
export const RAMP = " .:-=+*#";

export type Tokens = {
  text: string;
  text2: string;
  text3: string;
  line: string;
  lineStrong: string;
  surface: string;
  bg: string;
  mono: string;
  body: string;
  easeLoop: Bezier;
  easeOut: Bezier;
  ms: (name: string) => number;
  px: (name: string) => number;
  bez: (name: string, fallback: Bezier) => Bezier;
};

export type Env = {
  w: number;
  h: number;
  dpr: number;
  tokens: Tokens;
  glyph: (level: number, x: number, y: number, alpha: number) => void;
};

export type Draw = (ctx: CanvasRenderingContext2D, t: number, env: Env) => void;

export type Bezier = [number, number, number, number];

export function bezier([x1, y1, x2, y2]: Bezier, p: number) {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const x = (s: number) => ((ax * s + bx) * s + cx) * s;
  let s = p;
  for (let i = 0; i < 6; i++) {
    const d = (3 * ax * s + 2 * bx) * s + cx;
    if (Math.abs(d) < 1e-6) break;
    s -= (x(s) - p) / d;
  }
  if (s < 0 || s > 1 || Math.abs(x(s) - p) > 1e-4) {
    let lo = 0;
    let hi = 1;
    s = p;
    for (let i = 0; i < 24; i++) {
      if (x(s) < p) lo = s;
      else hi = s;
      s = (lo + hi) / 2;
    }
  }
  return ((ay * s + by) * s + cy) * s;
}

const parseBezier = (raw: string, fallback: Bezier): Bezier => {
  const m = raw.match(/cubic-bezier\(([^)]+)\)/);
  if (!m) return fallback;
  const n = m[1].split(",").map(Number);
  return n.length === 4 && n.every(Number.isFinite) ? (n as Bezier) : fallback;
};

// The site's names the drawings ask for, read as the library's tokens.
const NAMES: Record<string, string> = {
  "--text": "--ds-color-fg",
  "--text-2": "--ds-color-fg-soft",
  "--text-3": "--ds-color-fg-muted",
  "--line": "--ds-color-edge",
  "--line-strong": "--ds-color-edge-strong",
  "--surface": "--ds-color-surface-raised",
  "--bg": "--ds-color-surface",
  "--font-ascii": "--ds-font-ascii",
  "--font-body": "--ds-font-text",
  "--ease-loop": "--ds-easing-loop",
  "--ease-out": "--ds-easing-out",
  "--caption-size": "--ds-text-caption",
  "--radius-m": "--ds-radius-panel",
  "--space-8": "--ds-space-sm",
  "--space-16": "--ds-space-lg",
  "--space-24": "--ds-space-xl",
  "--space-64": "--ds-space-4xl",
  "--search-drift": "--ds-abstract-drift",
  "--dur-abstract-line": "--ds-abstract-line",
  "--dur-abstract-line-step": "--ds-abstract-line-step",
  "--dur-abstract-glide": "--ds-abstract-glide",
  "--dur-abstract-gather": "--ds-abstract-gather",
  "--dur-abstract-decode": "--ds-abstract-decode",
  "--dur-abstract-tag-step": "--ds-abstract-tag-step",
  "--dur-loop-step": "--ds-abstract-loop-step",
  "--dur-proof-stagger": "--ds-abstract-stagger",
  "--dur-proof-swap": "--ds-abstract-swap",
  "--ease-proof": "--ds-abstract-ease",
};

function readTokens(el: Element): Tokens {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(NAMES[name] ?? name).trim();
  return {
    text: v("--text"),
    text2: v("--text-2"),
    text3: v("--text-3"),
    line: v("--line"),
    lineStrong: v("--line-strong"),
    surface: v("--surface"),
    bg: v("--bg"),
    mono: v("--font-ascii") || "monospace",
    body: v("--font-body") || "sans-serif",
    easeLoop: parseBezier(v("--ease-loop"), [0.4, 0, 0.2, 1]),
    easeOut: parseBezier(v("--ease-out"), [0.22, 1, 0.36, 1]),
    ms: (name: string) => {
      const raw = v(name);
      const n = parseFloat(raw) || 0;
      return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : n;
    },
    px: (name: string) => parseFloat(v(name)) || 0,
    bez: (name: string, fallback: Bezier) => parseBezier(v(name), fallback),
  };
}

function glyphAtlas(family: string, white: string, dpr: number) {
  const atlas = document.createElement("canvas");
  atlas.width = Math.ceil(CELL_W * RAMP.length * dpr);
  atlas.height = Math.ceil(CELL_H * dpr);
  const a = atlas.getContext("2d");
  if (a) {
    a.scale(dpr, dpr);
    a.fillStyle = white;
    a.font = `13.333px ${family}`;
    a.textAlign = "center";
    a.textBaseline = "alphabetic";
    for (let i = 1; i < RAMP.length; i++) a.fillText(RAMP[i], i * CELL_W + CELL_W / 2, 12);
  }
  return atlas;
}

export type Moment = "start" | "middle" | "settled";
export type Moments = (ms: (name: string) => number) => Record<Moment, number>;

/** Draws `draw` on the canvas at `fps` while it is on screen, or one fixed moment (`freeze`, or `still` with reduced motion). */
export function startAbstractCanvas(
  canvas: HTMLCanvasElement,
  draw: Draw,
  {
    fps,
    moments,
    still = "settled",
    freeze,
  }: {
    fps: number;
    moments: Moments;
    still?: Moment;
    freeze?: Moment;
  },
): () => void {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ctx: CanvasRenderingContext2D | null = null;
    let env: Env | null = null;
    let near = false;
    let onScreen = false;
    let raf = 0;
    let clock = 0;
    let last = 0;
    let lastDraw = -Infinity;
    const frame = 1000 / fps;

    const setup = () => {
      ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const tokens = readTokens(canvas);
      const atlas = glyphAtlas(tokens.mono, tokens.text, dpr);
      const c = ctx;
      env = {
        w,
        h,
        dpr,
        tokens,
        glyph: (level, x, y, alpha) => {
          if (level <= 0 || alpha <= 0) return;
          c.globalAlpha = Math.min(alpha, 1);
          c.drawImage(atlas, level * CELL_W * dpr, 0, CELL_W * dpr, CELL_H * dpr, x, y, CELL_W, CELL_H);
        },
      };
    };

    const paint = (t: number) => {
      if (!ctx || !env) return;
      ctx.setTransform(env.dpr, 0, 0, env.dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, env.w, env.h);
      draw(ctx, t, env);
      ctx.globalAlpha = 1;
    };

    const at = (m: Moment) => (env ? moments(env.tokens.ms)[m] : 0);
    const fixed = () => (freeze !== undefined ? at(freeze) : reduce.matches ? at(still) : null);
    const playing = () => near && onScreen && document.visibilityState === "visible" && fixed() === null;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      clock += Math.min(now - last, 100);
      last = now;
      if (clock - lastDraw < frame - 1) return;
      lastDraw = clock - (clock % frame);
      paint(lastDraw);
    };
    const sync = () => {
      if (playing()) {
        if (!raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const refresh = () => {
      if (!near) return;
      setup();
      const f = fixed();
      paint(f !== null ? f : lastDraw === -Infinity ? 0 : lastDraw);
      sync();
    };

    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        approach.disconnect();
        near = true;
        refresh();
        const t = env?.tokens;
        if (t) {
          Promise.all([
            document.fonts.load(`13.333px ${t.mono}`, RAMP),
            document.fonts.load(`12px ${t.body}`),
          ]).then(
            () => refresh(),
            () => {},
          );
        }
      },
      { rootMargin: "100% 0px" },
    );
    const view = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    let width = canvas.clientWidth;
    let resizeFrame = 0;
    const resize = new ResizeObserver(() => {
      if (canvas.clientWidth === width) return;
      width = canvas.clientWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(refresh);
    });

    approach.observe(canvas);
    view.observe(canvas);
    resize.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    reduce.addEventListener("change", refresh);
    return () => {
      approach.disconnect();
      view.disconnect();
      resize.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeFrame);
      document.removeEventListener("visibilitychange", sync);
      reduce.removeEventListener("change", refresh);
    };
}

export const hash = (a: number, b = 0, c = 0) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

export function noise(x: number, y: number, z = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, z);
  const b = hash(xi + 1, yi, z);
  const c = hash(xi, yi + 1, z);
  const d = hash(xi + 1, yi + 1, z);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
