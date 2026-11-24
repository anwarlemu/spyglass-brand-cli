// The site's row fan motion (ui/rowFanMotion): a list of names, each with a set of pictures. Hovering, focusing or
// tapping a row (or, on touch and below 960, scrolling it to the middle) lifts its name and fans its pictures out
// beside it (or below it), the cards travelling between rows on a springy curve; hovering a card opens it with its
// title and meta. Reads its sizes and timings from --fan-* on the root (row-fan.ts sets them from the tokens).
// Reduced motion: no travel or scale, short fades.
type Mode = "first" | "switch" | "place";

type SlotState = {
  el: HTMLElement;
  side: "l" | "r";
  step: number;
  imgs: Map<number, HTMLElement>;
  shown: boolean;
  on: number;
  token: number;
};

type Place = { x: number; y: number; z: number; show: boolean };

const ms = (v: string) => {
  const s = v.trim();
  if (!s) return 0;
  return s.endsWith("ms") ? parseFloat(s) : s.endsWith("s") ? parseFloat(s) * 1000 : parseFloat(s);
};

const reflow = (el: HTMLElement) => void el.offsetWidth;

export function mountRowFan(root: HTMLElement): () => void {
  const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-fan-row]"));
  const anchors = rows.map((r) => r.querySelector<HTMLElement>("[data-fan-anchor]") ?? r);
  const names = rows.map((r) => r.querySelector<HTMLElement>("[data-fan-name]") ?? r);
  const layer = root.querySelector<HTMLElement>("[data-fan-layer]");
  if (!layer || rows.length === 0) return () => {};
  const slots: SlotState[] = Array.from(layer.querySelectorAll<HTMLElement>("[data-fan-slot]")).map((el) => ({
    el,
    side: el.dataset.side === "l" ? "l" : "r",
    step: Number(el.dataset.step) || 0,
    imgs: new Map(
      Array.from(el.querySelectorAll<HTMLElement>("[data-fan-img]")).map((img) => [
        Number(img.dataset.row),
        img,
      ]),
    ),
    shown: false,
    on: -1,
    token: 0,
  }));
  const ctas = Array.from(layer.querySelectorAll<HTMLElement>("[data-fan-cta]"));
  const ctaRow = ctas.map(() => -1);

  const mqTouch = window.matchMedia("(hover: none), (pointer: coarse)");
  const mqNarrow = window.matchMedia("(max-width: 959.98px)");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scrollMode = mqTouch.matches || mqNarrow.matches;
  let reduce = mqReduce.matches;

  let active = -1;
  let cta = -1;
  let openSlot: SlotState | null = null;
  let touchOff: (() => void) | null = null;

  let v = read();
  function read() {
    const cs = getComputedStyle(root);
    const px = (n: string) => parseFloat(cs.getPropertyValue(n)) || 0;
    const t = (n: string) => ms(cs.getPropertyValue(n));
    const e = (n: string) => cs.getPropertyValue(n).trim() || "ease";
    return {
      below: cs.getPropertyValue("--fan-layout").trim() === "below",
      card: px("--fan-card"),
      gap: px("--fan-gap"),
      nameGap: px("--fan-name-gap"),
      belowGap: px("--fan-below-gap"),
      lift: px("--fan-lift"),
      ctaTop: px("--fan-cta-top"),
      ctaRise: px("--fan-cta-rise"),
      ctaSink: px("--fan-cta-sink"),
      enterScale: parseFloat(cs.getPropertyValue("--fan-enter-scale")) || 0,
      exitScale: parseFloat(cs.getPropertyValue("--fan-exit-scale")) || 0,
      pop: t("--fan-dur-pop"),
      exit: t("--fan-dur-exit"),
      travelMin: t("--fan-dur-travel-min"),
      travelMax: t("--fan-dur-travel-max"),
      lift_in: t("--fan-dur-lift"),
      settle: t("--fan-dur-settle"),
      ctaDelay: t("--fan-dur-cta-delay"),
      ctaOut: t("--fan-dur-cta-out"),
      fade: t("--fan-dur-fade"),
      fadeOut: t("--fan-dur-fade-out"),
      easePop: e("--fan-ease-pop"),
      easeTravel: e("--fan-ease-travel"),
      easeLift: e("--fan-ease-lift"),
      easeCtaOut: e("--fan-ease-cta-out"),
      card_on: cs.getPropertyValue("--fan-card-hover").trim() !== "off",
      scrollAlways: cs.getPropertyValue("--fan-scroll").trim() === "always",
      pickNearest: cs.getPropertyValue("--fan-scroll-pick").trim() === "nearest",
    };
  }

  function layout(row: number): Place[] {
    const r = root.getBoundingClientRect();
    const box = (el: HTMLElement) => {
      const b = el.getBoundingClientRect();
      return { l: b.left - r.left, r: b.right - r.left, t: b.top - r.top, b: b.bottom - r.top };
    };
    const own = box(anchors[row]);
    let left = own.l;
    let right = own.r;
    if (!v.below && !scrollMode) {
      const all = anchors.map(box);
      const centre = all.reduce((s, b) => s + (b.l + b.r) / 2, 0) / all.length;
      const half = Math.max(...all.map((b) => b.r - b.l)) / 2;
      left = centre - half;
      right = centre + half;
    }
    const step = v.card + v.gap;
    const vpLeft = -r.left;
    const vpRight = vpLeft + document.documentElement.clientWidth;
    const centreX = (own.l + own.r) / 2;
    const y = v.below ? own.b + v.belowGap : (own.t + own.b) / 2 - v.card / 2;
    return slots.map((s) => {
      const x = v.below
        ? s.side === "l"
          ? centreX - v.gap / 2 - v.card - s.step * step
          : centreX + v.gap / 2 + s.step * step
        : s.side === "l"
          ? left - v.nameGap - v.card - s.step * step
          : right + v.nameGap + s.step * step;
      const inView = x + v.card > vpLeft && x < vpRight;
      return { x: Math.round(x), y: Math.round(y), z: 1000 - s.step, show: inView && s.imgs.has(row) };
    });
  }

  const tf = (p: { x: number; y: number }, scale: number) =>
    `translate3d(${p.x}px, ${p.y}px, 0) scale(${scale})`;

  function setImage(s: SlotState, row: number, animate: boolean) {
    if (s.on === row) return;
    const next = s.imgs.get(row);
    s.token += 1;
    const token = s.token;
    if (!animate || !next) {
      s.el.setAttribute("data-instant", "");
      for (const [r, el] of s.imgs) if (r !== row) el.removeAttribute("data-on");
      next?.setAttribute("data-on", "");
      reflow(s.el);
      s.el.removeAttribute("data-instant");
      s.on = row;
      return;
    }
    s.on = row;
    const img = next.querySelector("img") ?? (next as HTMLImageElement);
    const go = () => {
      if (s.token !== token) return;
      for (const [r, el] of s.imgs) if (r !== row) el.removeAttribute("data-on");
      next.setAttribute("data-on", "");
    };
    const decode = img instanceof HTMLImageElement && img.decode ? img.decode() : Promise.resolve();
    decode.then(go, go);
  }

  function placeSlots(mode: Mode) {
    const places = layout(active);
    const entering = new Set<SlotState>();
    slots.forEach((s, i) => {
      const p = places[i];
      if (p.show && (!s.shown || mode === "first")) {
        s.el.style.transition = "none";
        s.el.style.transform = tf(p, reduce ? 1 : v.enterScale);
        s.el.style.opacity = "0";
        s.el.style.zIndex = String(p.z);
        setImage(s, active, false);
        entering.add(s);
      }
    });
    if (entering.size) reflow(layer!);
    slots.forEach((s, i) => {
      const p = places[i];
      const st = s.el.style;
      if (!p.show) {
        if (s.shown) {
          st.transition = reduce
            ? `opacity ${v.fade}ms ${v.easePop}`
            : `transform ${v.pop}ms ${v.easePop}, opacity ${v.pop}ms ${v.easePop}`;
          if (!reduce) st.transform = tf(currentPlace(s), v.enterScale);
          st.opacity = "0";
        }
        s.shown = false;
        st.pointerEvents = "none";
        return;
      }
      st.zIndex = String(p.z);
      st.pointerEvents = v.card_on && !scrollMode ? "auto" : "none";
      if (entering.has(s)) {
        st.transition = reduce
          ? `opacity ${v.fade}ms ${v.easePop}`
          : `transform ${v.pop}ms ${v.easePop}, opacity ${v.pop}ms ${v.easePop}`;
        st.transform = tf(p, 1);
        st.opacity = "1";
      } else if (mode === "place" || reduce) {
        st.transition = "none";
        st.transform = tf(p, 1);
        st.opacity = "1";
        setImage(s, active, mode !== "place");
      } else {
        const d = Math.round(v.travelMin + Math.random() * (v.travelMax - v.travelMin));
        st.transition = `transform ${d}ms ${v.easeTravel}, opacity ${d}ms ${v.easeTravel}`;
        st.transform = tf(p, 1);
        st.opacity = "1";
        setImage(s, active, true);
      }
      s.el.dataset.x = String(p.x);
      s.el.dataset.y = String(p.y);
      s.shown = true;
    });
  }

  function currentPlace(s: SlotState) {
    return { x: Number(s.el.dataset.x) || 0, y: Number(s.el.dataset.y) || 0 };
  }

  function moveName(i: number, up: boolean) {
    const st = names[i].style;
    st.transition = reduce ? "none" : `transform ${up ? v.lift_in : v.settle}ms ${v.easeLift}`;
    st.transform = up ? `translate3d(0, ${-v.lift}px, 0)` : "translate3d(0, 0, 0)";
  }

  function ctaPlace(i: number, el: HTMLElement) {
    const r = root.getBoundingClientRect();
    const b = anchors[i].getBoundingClientRect();
    return {
      x: Math.round((b.left + b.right) / 2 - r.left - el.offsetWidth / 2),
      y: Math.round(b.bottom - r.top + v.ctaTop),
    };
  }

  function showCta(i: number) {
    if (!ctas.length) return;
    const text = rows[i].dataset.fanCta ?? "";
    let k = cta >= 0 && ctaRow[cta] === i ? cta : cta === 0 ? 1 % ctas.length : 0;
    if (ctaRow[k] === i && k === cta) return;
    const el = ctas[k];
    const label = el.querySelector<HTMLElement>("[data-fan-cta-label]") ?? el;
    label.textContent = text;
    const p = ctaPlace(i, el);
    el.style.transition = "none";
    el.style.transform = `translate3d(${p.x}px, ${p.y + (reduce ? 0 : v.ctaRise)}px, 0)`;
    el.style.opacity = "0";
    reflow(el);
    el.style.transition = reduce
      ? `opacity ${v.fadeOut}ms ${v.easeLift}`
      : `transform ${v.lift_in}ms ${v.easeLift} ${v.ctaDelay}ms, opacity ${v.lift_in}ms ${v.easeLift} ${v.ctaDelay}ms`;
    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    el.style.opacity = "1";
    if (cta >= 0 && cta !== k) hideCta(cta);
    ctaRow[k] = i;
    cta = k;
  }

  function hideCta(k: number) {
    const el = ctas[k];
    const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(el.style.transform);
    const x = m ? Number(m[1]) : 0;
    const y = m ? Number(m[2]) : 0;
    el.style.transition = reduce
      ? `opacity ${v.fade}ms ${v.easeCtaOut}`
      : `transform ${v.ctaOut}ms ${v.easeCtaOut}, opacity ${v.ctaOut}ms ${v.easeCtaOut}`;
    if (!reduce) el.style.transform = `translate3d(${x}px, ${y + v.ctaSink}px, 0)`;
    el.style.opacity = "0";
    ctaRow[k] = -1;
  }

  function openCard(s: SlotState) {
    if (!v.card_on || scrollMode || !s.shown || openSlot === s) return;
    if (openSlot) closeCard(openSlot, true);
    const img = s.imgs.get(s.on);
    const details = s.el.querySelector<HTMLElement>("[data-fan-details]");
    if (!img || !details) return;
    const title = details.querySelector<HTMLElement>("[data-fan-title]");
    const meta = details.querySelector<HTMLElement>("[data-fan-meta]");
    if (title) title.textContent = img.dataset.title ?? "";
    if (meta) {
      meta.textContent = img.dataset.meta ?? "";
      meta.hidden = !img.dataset.meta;
    }
    const pad = parseFloat(getComputedStyle(root).getPropertyValue("--fan-card-pad")) || 0;
    s.el.style.setProperty("--fan-open-h", `${details.offsetTop + details.offsetHeight + pad}px`);
    s.el.removeAttribute("data-fast");
    s.el.setAttribute("data-open", "");
    openSlot = s;
  }

  function closeCard(s: SlotState, fast: boolean) {
    if (fast) s.el.setAttribute("data-fast", "");
    else s.el.removeAttribute("data-fast");
    s.el.removeAttribute("data-open");
    if (openSlot === s) openSlot = null;
  }

  function activate(i: number) {
    if (i === active || i < 0) return;
    if (openSlot) closeCard(openSlot, true);
    const prev = active;
    active = i;
    placeSlots(prev < 0 ? "first" : "switch");
    if (prev >= 0) moveName(prev, false);
    moveName(i, true);
    showCta(i);
    root.dataset.fanActive = String(i);
    rows.forEach((r, k) => (k === i ? r.setAttribute("data-active", "") : r.removeAttribute("data-active")));
  }

  function deactivate() {
    if (active < 0) return;
    if (openSlot) closeCard(openSlot, true);
    moveName(active, false);
    if (cta >= 0) hideCta(cta);
    cta = -1;
    for (const s of slots) {
      if (!s.shown) continue;
      const st = s.el.style;
      st.transition = reduce
        ? `opacity ${v.fadeOut}ms ${v.easePop}`
        : `transform ${v.exit}ms ${v.easePop}, opacity ${v.exit}ms ${v.easePop}`;
      if (!reduce) st.transform = tf(currentPlace(s), v.exitScale);
      st.opacity = "0";
      st.pointerEvents = "none";
      s.shown = false;
    }
    rows[active].removeAttribute("data-active");
    active = -1;
    delete root.dataset.fanActive;
    touchOff?.();
    touchOff = null;
  }

  const rowOf = (t: EventTarget | null) => {
    if (!(t instanceof Element) || layer!.contains(t)) return -1;
    const row = t.closest<HTMLElement>("[data-fan-row]");
    return row ? rows.indexOf(row) : -1;
  };

  let hoverRow = -1;
  let focusRow = -1;
  let tapRow = -1;
  let scrollRow = -1;
  const resolve = () => {
    const i = focusRow >= 0 ? focusRow : hoverRow >= 0 ? hoverRow : tapRow >= 0 ? tapRow : scrollRow;
    if (i >= 0) activate(i);
    else deactivate();
  };
  const scrollDrives = () => scrollMode || v.scrollAlways;

  const onOver = (e: PointerEvent) => {
    if (scrollMode || (e.pointerType !== "mouse" && e.pointerType !== "pen")) return;
    const i = rowOf(e.target);
    if (i >= 0 && i !== hoverRow) {
      hoverRow = i;
      resolve();
    }
  };
  const onLeave = (e: PointerEvent) => {
    if (scrollMode || (e.pointerType !== "mouse" && e.pointerType !== "pen")) return;
    const to = e.relatedTarget;
    if (to instanceof Node && root.contains(to)) return;
    hoverRow = -1;
    resolve();
  };
  const onDown = (e: PointerEvent) => {
    if (scrollMode || e.pointerType !== "touch") return;
    const i = rowOf(e.target);
    if (i < 0) return;
    tapRow = i === active ? -1 : i;
    if (tapRow < 0 && scrollRow === i) scrollRow = -1;
    resolve();
    if (!touchOff && tapRow >= 0) {
      const outside = (ev: PointerEvent) => {
        if (ev.target instanceof Node && root.contains(ev.target)) return;
        tapRow = -1;
        touchOff?.();
        touchOff = null;
        resolve();
      };
      document.addEventListener("pointerdown", outside, { passive: true });
      touchOff = () => document.removeEventListener("pointerdown", outside);
    }
  };
  const onFocusIn = (e: FocusEvent) => {
    const i = rowOf(e.target);
    if (i >= 0) {
      focusRow = i;
      resolve();
    }
  };
  const onFocusOut = (e: FocusEvent) => {
    const to = e.relatedTarget;
    if (to instanceof Node && root.contains(to)) return;
    focusRow = -1;
    if (!scrollMode || v.scrollAlways) resolve();
  };
  const onSlotOver = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const el = (e.target as Element | null)?.closest<HTMLElement>("[data-fan-slot]");
    const s = el ? slots.find((x) => x.el === el) : undefined;
    if (s) openCard(s);
  };
  const onSlotOut = (e: PointerEvent) => {
    if (!openSlot) return;
    const to = e.relatedTarget;
    if (to instanceof Node && openSlot.el.contains(to)) return;
    const from = (e.target as Element | null)?.closest<HTMLElement>("[data-fan-slot]");
    if (from === openSlot.el) closeCard(openSlot, false);
  };

  root.addEventListener("pointerover", onOver);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointerdown", onDown, { passive: true });
  root.addEventListener("focusin", onFocusIn);
  root.addEventListener("focusout", onFocusOut);
  layer.addEventListener("pointerover", onSlotOver);
  layer.addEventListener("pointerout", onSlotOut);

  let frame = 0;
  let listening = false;
  const pick = () => {
    frame = 0;
    if (!scrollDrives()) return;
    const mid = window.innerHeight * 0.5;
    let row = 0;
    if (v.pickNearest) {
      const r = root.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) row = -1;
      else {
        let best = Infinity;
        anchors.forEach((a, i) => {
          const b = a.getBoundingClientRect();
          const d = Math.abs((b.top + b.bottom) / 2 - mid);
          if (d < best) {
            best = d;
            row = i;
          }
        });
      }
    } else {
      anchors.forEach((a, i) => {
        if (a.getBoundingClientRect().top <= mid) row = i;
      });
    }
    if (row === scrollRow && row === active) return;
    scrollRow = row;
    resolve();
  };
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(pick);
  };
  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    if (on) {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    } else {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    }
  };
  let near = false;
  const io = new IntersectionObserver(
    ([entry]) => {
      near = Boolean(entry?.isIntersecting);
      v = read();
      listen(near && scrollDrives());
      if (near && scrollDrives()) pick();
      else if (!near && v.pickNearest && scrollRow >= 0) {
        scrollRow = -1;
        resolve();
      }
    },
    { rootMargin: "20% 0px 20% 0px" },
  );
  io.observe(root);

  const onMode = () => {
    const next = mqTouch.matches || mqNarrow.matches;
    reduce = mqReduce.matches;
    if (next !== scrollMode) {
      scrollMode = next;
      hoverRow = -1;
      tapRow = -1;
      deactivate();
      listen(near && scrollDrives());
      if (near && scrollDrives()) pick();
    }
  };
  mqTouch.addEventListener("change", onMode);
  mqNarrow.addEventListener("change", onMode);
  mqReduce.addEventListener("change", onMode);

  const relayout = () => {
    v = read();
    listen(near && scrollDrives());
    // The styles may arrive after the mount (a framework that inserts its sheet late): pick the row now if scroll drives.
    if (near && scrollDrives() && active < 0) pick();
    if (active < 0) return;
    placeSlots("place");
    const k = cta;
    if (k >= 0) {
      const p = ctaPlace(active, ctas[k]);
      ctas[k].style.transition = "none";
      ctas[k].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    }
  };
  let ro: ResizeObserver | null = null;
  let roFirst = true;
  if (typeof ResizeObserver !== "undefined") {
    ro = new ResizeObserver(() => {
      if (roFirst) {
        roFirst = false;
        return;
      }
      relayout();
    });
    ro.observe(root);
  }
  let alive = true;
  document.fonts?.ready.then(() => alive && relayout());

  return () => {
    alive = false;
    root.removeEventListener("pointerover", onOver);
    root.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("pointerdown", onDown);
    root.removeEventListener("focusin", onFocusIn);
    root.removeEventListener("focusout", onFocusOut);
    layer.removeEventListener("pointerover", onSlotOver);
    layer.removeEventListener("pointerout", onSlotOut);
    mqTouch.removeEventListener("change", onMode);
    mqNarrow.removeEventListener("change", onMode);
    mqReduce.removeEventListener("change", onMode);
    listen(false);
    io.disconnect();
    ro?.disconnect();
    touchOff?.();
  };
}
