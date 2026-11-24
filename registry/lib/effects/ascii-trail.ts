// The site's ASCII trail (effect/AsciiTrail/trail): a mouse leaves a short trail of ASCII characters (" .:-=+*#",
// 8 by 16 cells) within --ds-ascii-trail-radius (72px) of the pointer, fading over --ds-ascii-trail-fade (700ms), at
// the texture's 0.35 in the canvas's text colour. Section mode listens on the section; page mode on the window, drawn
// fixed behind the page. Started only for a fine pointer without reduced motion (the components check).
const CELL_W = 8;
const CELL_H = 16;
const RAMP = " .:-=+*#";

const token = (el: Element, name: string) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || 0;
const ms = (el: Element, name: string) => {
  const raw = getComputedStyle(el).getPropertyValue(name).trim();
  const n = parseFloat(raw) || 0;
  return raw.endsWith("ms") ? n : raw.endsWith("s") ? n * 1000 : n;
};

export function startTrail(canvas: HTMLCanvasElement, mode: "section" | "page", section?: HTMLElement | null): () => void {
  const page = mode === "page";
  const host = page ? document.documentElement : (section ?? canvas.parentElement);
  const ctx = canvas.getContext("2d");
  if (!host || !ctx) return () => {};

  const radius = token(canvas, "--ds-ascii-trail-radius") || 72;
  const fade = ms(canvas, "--ds-ascii-trail-fade") || 700;
  const strength = token(canvas, "--ds-ascii-opacity") || 0.35;
  const family = getComputedStyle(canvas).getPropertyValue("--ds-font-ascii").trim() || "monospace";

  const ink = getComputedStyle(canvas).color;
  let cols = 0;
  let rows = 0;
  let heat = new Float32Array(0);
  let seed = new Float32Array(0);
  let raf = 0;
  let last = 0;

  const size = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = page ? window.innerWidth : host.clientWidth;
    const h = page ? window.innerHeight : canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `13.333px ${family}`;
    ctx.textBaseline = "top";
    cols = Math.ceil(w / CELL_W);
    rows = Math.ceil(h / CELL_H);
    heat = new Float32Array(cols * rows);
    seed = new Float32Array(cols * rows).map((_, i) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1);
  };

  const frame = (now: number) => {
    const dt = last ? now - last : 16;
    last = now;
    const keep = Math.exp(-dt / fade);
    ctx.clearRect(0, 0, cols * CELL_W, rows * CELL_H);
    let warm = false;
    for (let i = 0; i < heat.length; i++) {
      const v = heat[i] * keep;
      heat[i] = v < 0.01 ? 0 : v;
      if (!heat[i]) continue;
      warm = true;
      const level = Math.min(RAMP.length - 1, Math.floor((heat[i] * 0.85 + seed[i] * 0.3) * RAMP.length));
      const ch = RAMP[level];
      if (ch === " ") continue;
      ctx.fillStyle = ink;
      ctx.globalAlpha = heat[i] * strength;
      ctx.fillText(ch, (i % cols) * CELL_W, Math.floor(i / cols) * CELL_H);
    }
    ctx.globalAlpha = 1;
    raf = warm ? requestAnimationFrame(frame) : 0;
    if (!warm) last = 0;
  };

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const box = canvas.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;
    if (x < -radius || y < -radius || x > box.width + radius || y > box.height + radius) return;
    const c0 = Math.max(0, Math.floor((x - radius) / CELL_W));
    const c1 = Math.min(cols - 1, Math.ceil((x + radius) / CELL_W));
    const r0 = Math.max(0, Math.floor((y - radius) / CELL_H));
    const r1 = Math.min(rows - 1, Math.ceil((y + radius) / CELL_H));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const d = Math.hypot(c * CELL_W + CELL_W / 2 - x, r * CELL_H + CELL_H / 2 - y) / radius;
        if (d >= 1) continue;
        const i = r * cols + c;
        heat[i] = Math.max(heat[i], (1 - d) * (1 - d));
      }
    }
    if (!raf) raf = requestAnimationFrame(frame);
  };

  size();
  const resize = new ResizeObserver(size);
  if (page) window.addEventListener("resize", size);
  else resize.observe(host);
  const target: EventTarget = page ? window : host;
  target.addEventListener("pointermove", move as EventListener);
  return () => {
    cancelAnimationFrame(raf);
    resize.disconnect();
    window.removeEventListener("resize", size);
    target.removeEventListener("pointermove", move as EventListener);
  };
}
