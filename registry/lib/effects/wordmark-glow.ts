// The site's wordmark glow (effect/WordmarkGlow): over an area with a 20px dot grid, a mouse lights the dots near it
// (260px) in the spectrum, a conic sweep centred above the wordmark, and over the big wordmark lights its letters the
// same way; the light eases after the pointer (masks moving over 480ms) and leaves when it does. The area holds
// [data-glow-dots] and [data-glow-word] with [data-glow-letters] inside (found in `root`, a shadow root for the element). Only for a fine pointer without reduced motion.
type Layers = { position: string; size: string; after: { position: string; size: string }[] };

const px = (el: Element, name: string, fallback: number) => parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;

export function startWordmarkGlow(area: HTMLElement, root: ParentNode = area): () => void {
    const dots = root.querySelector<HTMLElement>("[data-glow-dots]");
    const word = root.querySelector<HTMLElement>("[data-glow-word]");
    const letters = word?.querySelector<HTMLElement>("[data-glow-letters]");
    if (!dots || !word || !letters) return () => {};
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return () => {};
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

    const radius = px(area, "--ds-glow-radius", 260);
    const centre = px(area, "--ds-glow-centre", 0.375);
    const offset = getComputedStyle(area).getPropertyValue("--ds-glow-dot-offset").trim() || "4px";
    const size = `${2 * radius}px ${2 * radius}px`;

    let raf = 0;
    let x = 0;
    let y = 0;
    let overWord = false;
    let wordLit = false;
    let areaLit = false;

    const place = (el: HTMLElement, layers: Layers, box: DOMRect, on: boolean) => {
      const lx = x - box.left;
      const ly = y - box.top;
      const at = on ? `${lx - radius}px ${ly - radius}px` : `${lx}px ${ly}px`;
      el.style.maskPosition = [layers.position, ...layers.after.map((l) => l.position), at].join(", ");
      el.style.maskSize = [layers.size, ...layers.after.map((l) => l.size), on ? size : "0px 0px"].join(", ");
    };
    const dotLayers: Layers = {
      position: `${offset} ${offset}`,
      size: "var(--ds-glow-dot-pitch) var(--ds-glow-dot-pitch)",
      after: [{ position: "0 0", size: "100% 100%" }],
    };
    const letterLayers: Layers = { position: "0 0", size: "100% 100%", after: [] };

    const frame = () => {
      raf = 0;
      const a = area.getBoundingClientRect();
      const w = word.getBoundingClientRect();
      dots.style.setProperty(
        "--glow-at",
        `${w.left - a.left + w.width / 2}px ${w.top - a.top + w.height / 2 - centre * w.width}px`,
      );
      areaLit = true;
      place(dots, dotLayers, a, true);
      if (overWord || wordLit) {
        place(letters, letterLayers, w, overWord);
        wordLit = overWord;
      }
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      overWord = e.composedPath().includes(word);
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const leave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cancelAnimationFrame(raf);
      raf = 0;
      x = e.clientX;
      y = e.clientY;
      if (areaLit) place(dots, dotLayers, area.getBoundingClientRect(), false);
      if (wordLit) place(letters, letterLayers, word.getBoundingClientRect(), false);
      areaLit = false;
      wordLit = false;
      overWord = false;
    };

    area.addEventListener("pointermove", move, { passive: true });
    area.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
    };
}
