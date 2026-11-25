// The use case wheel (site v2/V2UseCases: UseCaseWheel, skillsMotion.ts, ringLight.ts), framework-free so both flavors
// run the same motion. Two arcs of creatives open from the pill at the foot of an ellipse and climb around the headline;
// each change brings a new pair in at the bottom, scaled up from 0.4 and faded in, pushes the others one slot up the
// ring (each later by the stagger, turning away and sinking back as they rise) and sends the top pair off into the
// distance. The labels turn like a drum through the pill: the current one sits in the pill beside the arrow link,
// the next below and the one before above at half strength. It advances every 2.4s while it is on screen, pauses
// under the pointer or keyboard focus, and a click or a hover on another label turns to it. With reduced motion the
// pictures stand still at their slots and change by a crossfade, and nothing advances by itself.

import type { ImageSlot } from '@/lib/image'

/** A creative in the ring: the user's image, or an Acme placeholder (the creative card's brand, caption and tone). */
export interface WheelPicture extends ImageSlot {
  /** The image's width over its height: a narrower image fills the card's height, a wider one its width. */
  ratio?: number
  brand?: string
  caption?: string
  tone?: 1 | 2 | 3 | 4
}

/** One audience on the wheel: its label, a line for assistive tech, the link and three pairs of creatives. */
export interface WheelItem {
  key: string
  label: string
  line: string
  href: string
  linkLabel: string
  pairs: [WheelPicture, WheelPicture][]
}

const pic = (brand: string, tone: 1 | 2 | 3 | 4): WheelPicture => ({ brand, tone })
const pairs = (a: string, b: string, t: number): [WheelPicture, WheelPicture][] => [
  [pic(a, ((t % 4) + 1) as 1), pic(b, (((t + 2) % 4) + 1) as 1)],
  [pic(a, (((t + 1) % 4) + 1) as 1), pic(b, (((t + 3) % 4) + 1) as 1)],
  [pic(a, (((t + 3) % 4) + 1) as 1), pic(b, ((t % 4) + 1) as 1)],
]

export const useCaseWheelContent: { headline: string; items: WheelItem[] } = {
  headline: 'Built for every marketing team',
  items: [
    { key: 'performance', label: 'Performance marketers', line: 'The ads that are winning in any category, and why.', href: '/use-cases/paid-media', linkLabel: 'See Paid ads', pairs: pairs('Acme', 'Acme Air', 0) },
    { key: 'creative', label: 'Creative strategists', line: 'Which hooks, angles and formats are winning.', href: '/use-cases/creative-research', linkLabel: 'See Creative research', pairs: pairs('Acme Labs', 'Acme Goods', 1) },
    { key: 'social', label: 'Social teams', line: 'The posts that move an audience, across every platform.', href: '/use-cases/organic-social', linkLabel: 'See Organic media', pairs: pairs('Acme Studio', 'Acme & Co', 2) },
    { key: 'brand', label: 'Brand teams', line: 'Everything a brand does, in one place.', href: '/use-cases/360-degree-research', linkLabel: 'See 360-degree research', pairs: pairs('Acme', 'Acme Studio', 3) },
    { key: 'partnerships', label: 'Partnerships teams', line: 'The creators a brand works with, and the ones it should.', href: '/use-cases/creators', linkLabel: 'See Creator sourcing', pairs: pairs('Acme Goods', 'Acme Labs', 0) },
    { key: 'agencies', label: 'Agencies', line: "Every client's ads, posts and creators, one API.", href: '/use-cases', linkLabel: 'See all use cases', pairs: pairs('Acme & Co', 'Acme Air', 1) },
  ],
}

/** Where a label rests before the engine places it: in the pill, below it or above it. */
export function wheelRest(index: number, active: number, count: number) {
  const c = (index - active + count) % count
  return c === 0 ? 'pill' : c === 1 ? 'below' : 'above'
}

/** The longest label (it sizes the pill's hidden text, so every label fits). */
export const wheelLongest = (items: WheelItem[]) => items.reduce((a, b) => (b.label.length > a.length ? b.label : a), '')

/** A narrower picture fills the card's height, a wider one its width (the card is 3:4). */
export const wheelFit = (p: WheelPicture) => (p.ratio === undefined ? 'fill' : p.ratio < 3 / 4 ? 'tall' : 'wide')

// ----- Motion -----

export interface WheelElements {
  section: HTMLElement
  stage: HTMLElement
  head: HTMLElement
  queue: HTMLElement
  pill: HTMLElement
  pillText: HTMLElement
  focusBox: HTMLElement
  labels: HTMLElement[]
  twins: HTMLElement[]
  pictures: HTMLElement[][][]
}

type Bezier = (x: number) => number

export function bezier(x1: number, y1: number, x2: number, y2: number): Bezier {
  const at = (t: number, a: number, b: number) => 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (at(mid, x1, x2) < x) lo = mid
      else hi = mid
    }
    return at((lo + hi) / 2, y1, y2)
  }
}

const toMs = (raw: string, fallback: number) => {
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return fallback
  return raw.endsWith('ms') ? n : raw.endsWith('s') ? n * 1000 : n
}
const curveOf = (raw: string) => raw.match(/-?\d*\.?\d+/g)?.map(Number) ?? [0.85, 0, 0.15, 1]

function readTokens(el: HTMLElement) {
  const css = getComputedStyle(el)
  const v = (name: string) => css.getPropertyValue(name).trim()
  const num = (name: string) => parseFloat(v(name)) || 0
  const c = curveOf(v('--ds-wheel-ease'))
  return {
    ease: bezier(c[0], c[1], c[2], c[3]),
    step: toMs(v('--ds-wheel-every'), 2400),
    move: toMs(v('--ds-wheel-move'), 600),
    fade: toMs(v('--ds-wheel-fade'), 500),
    stagger: toMs(v('--ds-wheel-stagger'), 50),
    fadeLead: toMs(v('--ds-wheel-fade-lead'), 100),
    crossfade: toMs(v('--ds-wheel-crossfade'), 360),
    row: num('--ds-wheel-step'),
    rx: num('--rx'),
    ry: num('--ry'),
    cardW: num('--card-w'),
    cardH: num('--card-h'),
    slots: Math.max(2, Math.round(num('--slots'))),
    clear: num('--ds-wheel-clear'),
    perspective: num('--ds-wheel-perspective') || 1600,
    turn: num('--ds-wheel-turn'),
    depth: num('--ds-wheel-depth'),
    popScale: num('--ds-wheel-pop-scale'),
    exitZ: num('--ds-wheel-exit-z'),
    exitTurn: num('--ds-wheel-exit-turn'),
  }
}

type Box = { left: number; top: number; right: number; bottom: number }
type Gen = { c: number; pair: number; born: number }

const clamp = (min: number, max: number, n: number) => Math.min(max, Math.max(min, n))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const mod = (n: number, m: number) => ((n % m) + m) % m
const PAIRS = 3
const hits = (a: Box, b: Box) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top

export interface WheelOptions {
  onChange: (index: number) => void
  /** Advance by itself while on screen (default true). */
  autoplay?: boolean
}

export type WheelEngine = ReturnType<typeof createWheel>

export function createWheel(els: WheelElements, opts: WheelOptions) {
  const count = els.labels.length
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const autoplay = opts.autoplay !== false
  let t = readTokens(els.stage)

  let active = 0
  let progress = 0
  let geo = { centre: 0, boxTop: 0, textTop: 0, textLeft: 0, widths: [] as number[], line: 0, boxH: 0 }
  const marks = { hover: null as number | null, focus: null as number | null }
  const rowsFromPill = (i: number) => {
    const c = i - active - progress
    return ((((c + count / 2) % count) + count) % count) - count / 2
  }
  const put = (el: HTMLElement, width: number, c: number, lit = false) => {
    const d = Math.abs(c)
    const p = clamp(0, 1, 1 - d / 0.6)
    const above = geo.boxTop - t.row
    const below = geo.boxTop + 1.5 * t.row
    const y = c < -1 ? above + (c + 1) * t.row : c < 0 ? lerp(above, geo.boxTop, c + 1) : c <= 1 ? lerp(geo.boxTop, below, c) : below + (c - 1) * t.row
    const x = (geo.centre - width / 2) * (1 - p) + geo.textLeft * p
    const top = y * (1 - p) + geo.textTop * p
    el.style.transform = `translate3d(${x}px, ${top}px, 0)`
    el.style.opacity = String(d > 4 ? 0 : lit ? 1 : 0.3 + 0.7 * p)
    return top
  }
  const mark = (box: HTMLElement, index: number | null, tops: number[]) => {
    if (index === null) return box.removeAttribute('data-on')
    box.style.transform = `translate3d(0, ${tops[index] + geo.line / 2 - geo.boxH / 2}px, 0)`
    box.setAttribute('data-on', '')
  }
  const place = () => {
    const tops: number[] = []
    for (let i = 0; i < count; i++) {
      const c = rowsFromPill(i)
      tops[i] = put(els.labels[i], geo.widths[i], c, marks.hover === i)
      put(els.twins[i], geo.widths[i], c < 0 ? c + count : c - count)
    }
    mark(els.focusBox, marks.focus, tops)
  }

  const LUT = 256
  let ring = { cx: 0, cy: 0, start: 0, gap: 0, theta: new Float64Array(LUT + 1), head: { left: 0, top: 0, right: 0, bottom: 0 } as Box, wheel: { left: 0, top: 0, right: 0, bottom: 0 } as Box }
  const point = (s: number, side: number) => {
    const f = clamp(0, 1, s) * LUT
    const i = Math.min(LUT - 1, Math.floor(f))
    const a = lerp(ring.theta[i], ring.theta[i + 1], f - i)
    return { x: ring.cx + side * t.rx * Math.sin(a), y: ring.cy + t.ry * Math.cos(a) }
  }
  const cardBox = (x: number, y: number, grow: number): Box => ({ left: x - t.cardW / 2 - grow, right: x + t.cardW / 2 + grow, top: y - t.cardH / 2 - grow, bottom: y + t.cardH / 2 + grow })
  const measureRing = () => {
    const stage = els.stage.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(els.head)
    const text = range.getBoundingClientRect()
    const pill = els.pill.getBoundingClientRect()
    const rel = (r: Box): Box => ({ left: r.left - stage.left, right: r.right - stage.left, top: r.top - stage.top, bottom: r.bottom - stage.top })
    const head = rel(text)
    const wheel = rel({ left: pill.left, right: pill.right, top: pill.top - t.row, bottom: pill.bottom + t.row })
    const N = 1024
    const len = new Float64Array(N + 1)
    for (let i = 1; i <= N; i++) {
      const a0 = (Math.PI * (i - 1)) / N
      const a1 = (Math.PI * i) / N
      len[i] = len[i - 1] + Math.hypot(t.rx * (Math.sin(a1) - Math.sin(a0)), t.ry * (Math.cos(a1) - Math.cos(a0)))
    }
    const theta = new Float64Array(LUT + 1)
    for (let k = 0, i = 0; k <= LUT; k++) {
      const target = (len[N] * k) / LUT
      while (i < N && len[i + 1] < target) i++
      const seg = len[i + 1] - len[i] || 1
      theta[k] = (Math.PI * (i + clamp(0, 1, (target - len[i]) / seg))) / N
    }
    // Whole pixels, so the creatives land on the same rows whichever way the page rounds the stage.
    ring = { ...ring, cx: Math.round(stage.width / 2), cy: Math.round((head.top + head.bottom) / 2), theta, head, wheel }
    let start = 0
    while (start < 0.5) {
      const p = point(start, -1)
      if (!hits(cardBox(p.x, p.y, t.clear), wheel)) break
      start += 0.002
    }
    ring.start = start
    ring.gap = (1 - start) / t.slots
  }

  const setPicture = (el: HTMLElement, x: number, y: number, z: number, turn: number, scale: number, opacity: number) => {
    const k = (t.perspective - z) / t.perspective
    const px = ring.cx + (x - ring.cx) * k - t.cardW / 2
    const py = ring.cy + (y - ring.cy) * k - t.cardH / 2
    el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, ${z.toFixed(1)}px) rotateY(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`
    el.style.opacity = String(Math.round(opacity * 1000) / 1000)
    el.style.visibility = opacity > 0.001 ? 'visible' : 'hidden'
  }
  const rise = (y: number) => clamp(0, 1, (ring.cy - y) / t.ry)
  const pose = (el: HTMLElement, u: number, side: number, fade: number) => {
    const S = t.slots
    if (u <= 1) {
      const p = point(u * ring.start, side)
      return setPicture(el, p.x, p.y, 0, 0, lerp(t.popScale, 1, u), fade)
    }
    if (u <= S) {
      const p = point(ring.start + (u - 1) * ring.gap, side)
      const h = rise(p.y)
      return setPicture(el, p.x, p.y, -t.depth * h, -side * t.turn * h, 1, 1)
    }
    const e = clamp(0, 1, u - S)
    const last = point(ring.start + (S - 1) * ring.gap, side)
    const hLast = rise(last.y)
    const p = point(ring.start + (u - 1) * ring.gap, side)
    const z = lerp(-t.depth * hLast, t.exitZ, 1 - (1 - e) * (1 - e))
    const turn = -side * lerp(t.turn * hLast, t.exitTurn, e * e)
    setPicture(el, p.x, p.y, z, turn, 1, 1 - e * e)
  }
  const hide = (el: HTMLElement) => {
    el.style.opacity = '0'
    el.style.visibility = 'hidden'
  }

  let gens: Gen[] = []
  let switches = 0
  let nextPair: number[] = []
  const refill = () => {
    gens = []
    nextPair = Array.from({ length: count }, () => 0)
    for (let j = t.slots - 1; j >= 0; j--) {
      const c = mod(active - j, count)
      const pair = mod(Math.floor(-j / count), PAIRS)
      gens.push({ c, pair, born: switches - j })
      nextPair[c] = mod(pair + 1, PAIRS)
    }
  }

  type Change = { from: number; to: number; dir: number; start: number; wheel: number; total: number }
  let change: Change | null = null
  let clock = 0
  let lastStart = Number.NEGATIVE_INFINITY
  let landedClock = 0
  let landedWall = 0
  let pinned = Number.POSITIVE_INFINITY

  const render = () => {
    const shown = new Set<HTMLElement>()
    const at = change ? clock - change.start : Infinity
    if (reduced.matches) {
      const draw = (c: number, opacity: number) =>
        els.pictures[c].forEach((pair, i) => {
          const u = 1 + (i * (t.slots - 1)) / (PAIRS - 1)
          const s = ring.start + (u - 1) * ring.gap
          pair.forEach((el, side) => {
            const p = point(s, side ? 1 : -1)
            setPicture(el, p.x, p.y, 0, 0, 1, opacity)
            shown.add(el)
          })
        })
      if (change) {
        const e = clamp(0, 1, at / t.crossfade)
        draw(change.from, 1 - e)
        draw(change.to, e)
      } else draw(active, 1)
    } else {
      for (const g of gens) {
        const rest = switches - g.born + 1
        let u = rest
        let fade = 1
        if (change) {
          const k = rest - 1
          const local = at - (t.slots - k) * t.stagger
          u = k + t.ease(clamp(0, 1, local / t.move))
          if (k === 0) fade = t.ease(clamp(0, 1, (local - t.fadeLead) / t.fade))
        }
        els.pictures[g.c][g.pair].forEach((el, side) => {
          pose(el, u, side ? 1 : -1, fade)
          shown.add(el)
        })
      }
    }
    for (const group of els.pictures) for (const pair of group) for (const el of pair) if (!shown.has(el)) hide(el)
    if (change && !reduced.matches) {
      progress = change.dir * t.ease(clamp(0, 1, at / change.wheel))
      place()
    }
  }

  let frame = 0
  let last = 0
  let frozen = false
  let busy = false
  let queued: number | null = null
  const land = () => {
    if (!change) return
    landedClock = clock
    landedWall = performance.now()
    active = change.to
    progress = 0
    gens = gens.filter((g) => switches - g.born + 1 <= t.slots)
    change = null
    busy = false
    place()
    render()
    if (queued !== null && !frozen) {
      const next = queued
      queued = null
      go(next)
    }
  }
  const tick = (now: number) => {
    frame = 0
    const dt = now - last
    last = now
    clock += dt > 500 ? 33 : dt
    if (change && clock - change.start >= change.total) land()
    else render()
    if (change && !frozen) frame = requestAnimationFrame(tick)
  }
  const run = () => {
    if (frame || frozen) return
    last = performance.now()
    frame = requestAnimationFrame(tick)
  }

  const begin = (to: number) => {
    const forward = (to - active + count) % count
    const backward = (active - to + count) % count
    const dir = forward <= backward ? forward : -backward
    switches++
    gens.push({ c: to, pair: nextPair[to], born: switches })
    nextPair[to] = mod(nextPair[to] + 1, PAIRS)
    const wheel = Math.min(1.5 * t.move, t.move + 0.2 * t.move * Math.max(0, Math.abs(dir) - 1))
    const total = reduced.matches ? t.crossfade : Math.max(wheel, t.slots * t.stagger + t.move)
    change = { from: active, to, dir, start: clock, wheel, total }
    lastStart = clock
    if (reduced.matches) {
      active = to
      progress = 0
      place()
    }
    opts.onChange(to)
  }
  const go = (to: number) => {
    if (busy || frozen || to === active) return false
    busy = true
    begin(to)
    render()
    run()
    return true
  }

  let inView = false
  let held = false
  let started = false
  let timer = 0
  let due = 0
  let remaining = 0
  const canRun = () => autoplay && inView && !held && !document.hidden && !reduced.matches && !frozen
  const stopTimer = () => {
    if (timer) {
      window.clearTimeout(timer)
      timer = 0
      remaining = Math.max(0, due - performance.now())
    }
  }
  const startTimer = (wait: number) => {
    stopTimer()
    if (!canRun()) {
      remaining = wait
      return
    }
    due = performance.now() + wait
    timer = window.setTimeout(() => {
      timer = 0
      go((active + 1) % count)
      startTimer(t.step)
    }, wait)
  }
  const update = () => {
    if (!canRun()) return stopTimer()
    if (!started) {
      started = true
      go((active + 1) % count)
      startTimer(t.step)
    } else if (!timer) startTimer(remaining || t.step)
  }

  const measureWheel = () => {
    const q = els.queue.getBoundingClientRect()
    const box = els.pill.getBoundingClientRect()
    const text = els.pillText.getBoundingClientRect()
    geo = { centre: q.width / 2, boxTop: box.top - q.top, textTop: text.top - q.top, textLeft: text.left - q.left, widths: els.labels.map((l) => l.offsetWidth), line: text.height, boxH: box.height }
  }
  const layout = () => {
    const slots = t.slots
    t = readTokens(els.stage)
    measureWheel()
    measureRing()
    if (t.slots !== slots) {
      land()
      refill()
    }
    place()
    render()
  }

  const playing = new IntersectionObserver(
    ([entry]) => {
      inView = Boolean(entry?.isIntersecting)
      update()
    },
    { rootMargin: '0px 0px -50% 0px', threshold: 0.05 },
  )
  const onVisibility = () => update()
  const resized = new ResizeObserver(() => layout())
  const onReduced = () => {
    if (change) land()
    stopTimer()
    update()
    render()
  }

  measureWheel()
  measureRing()
  refill()
  place()
  render()
  playing.observe(els.section)
  resized.observe(els.stage)
  resized.observe(els.head)
  document.addEventListener('visibilitychange', onVisibility)
  reduced.addEventListener('change', onReduced)
  document.fonts?.ready.then(layout).catch(() => undefined)

  return {
    /** Turn to a label the pointer rests on (rows other than the pill's). */
    hover: (index: number) => go(index),
    /** Turn to a label that was pressed (queued behind a turn in progress). */
    choose: (index: number) => {
      if (busy) queued = index
      else go(index)
    },
    /** Light a label under the pointer, or draw the focus box around a focused one. */
    mark: (kind: 'hover' | 'focus', index: number | null) => {
      if (marks[kind] === index) return
      marks[kind] = index
      place()
    },
    /** How many rows a label is from the pill. */
    row: (index: number) => Math.round(rowsFromPill(index)),
    /** Pause while the pointer or keyboard focus is in the wheel. */
    hold: (on: boolean) => {
      if (on === held) return
      held = on
      if (on) stopTimer()
      else if (started) startTimer(t.step)
      else update()
    },
    /** Stop the clock at `ms` after the first turn (screenshots, tests). */
    seek: (ms: number) => {
      frozen = true
      stopTimer()
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      queued = null
      change = null
      busy = false
      active = 0
      progress = 0
      switches = 0
      clock = 0
      lastStart = Number.NEGATIVE_INFINITY
      refill()
      const n = Math.max(0, Math.floor(ms / t.step))
      pinned = n > 0 ? ms - n * t.step : Number.POSITIVE_INFINITY
      for (let i = 1; i < n; i++) {
        begin((active + 1) % count)
        land()
      }
      if (n > 0) {
        begin((active + 1) % count)
        busy = true
        const current = change as Change | null
        clock = current ? current.start + (ms - n * t.step) : 0
        if (current && clock - current.start >= current.total) land()
      }
      place()
      render()
    },
    play: () => {
      frozen = false
      if (change) run()
      update()
    },
    geometry: () => ({ cx: ring.cx, cy: ring.cy, start: ring.start, gap: ring.gap, slots: t.slots, rx: t.rx, ry: t.ry, cardW: t.cardW, cardH: t.cardH, head: ring.head, wheel: ring.wheel }),
    /** Milliseconds since the last turn began (the ring light's ripple follows it). */
    since: () => {
      if (frozen) return pinned
      if (change) return clock - change.start
      if (lastStart === Number.NEGATIVE_INFINITY) return Number.POSITIVE_INFINITY
      return landedClock - lastStart + (performance.now() - landedWall)
    },
    frozen: () => frozen,
    destroy: () => {
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      playing.disconnect()
      resized.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', onReduced)
    },
  }
}

// ----- The ring light's ripple -----
// A light layer behind the wheel (the site's dispersion field in its ring composition) can bend with each turn: this
// source simulates a damped spring along the ellipse, pushed by the creatives as they travel, and writes the
// displacement and stir per sample. It is structural: any light that asks for `ring`, `sample` and `frozen` can use it.

export interface WheelRingGeometry { cx: number; cy: number; rx: number; ry: number; cardW: number; cardH: number }

export interface WheelRipple {
  samples: number
  reach: number
  slope: number
  ring: (canvas: HTMLCanvasElement) => WheelRingGeometry | null
  sample: (out: Float32Array) => boolean
  frozen: () => boolean
}

const SAMPLES = 48
const REACH = 0.6
const GUST = 11
const SPREAD = 0.09
const ZETA = 0.55
const STEP = 1000 / 120
const STIR_SPEED = 4
const STIR = 0.35
const REST = 0.004

export function createWheelRipple(engine: { readonly current: WheelEngine | null }, stage: { readonly current: HTMLElement | null }): WheelRipple {
  let times = { move: 600, stagger: 50, spring: 720, ease: bezier(0.85, 0, 0.15, 1) }
  let geo = { start: 0.18, gap: 0.16, slots: 5 }
  const LUT = 128
  let angle = new Float32Array(LUT + 1)
  const uAt = (s: number) => {
    const f = Math.min(1, Math.max(0, s)) * LUT
    const i = Math.min(LUT - 1, Math.floor(f))
    return angle[i] + (angle[i + 1] - angle[i]) * (f - i)
  }
  const measure = (rx: number, ry: number) => {
    const N = 512
    const len = new Float64Array(N + 1)
    for (let i = 1; i <= N; i++) {
      const a0 = (Math.PI * (i - 1)) / N
      const a1 = (Math.PI * i) / N
      len[i] = len[i - 1] + Math.hypot(rx * (Math.sin(a1) - Math.sin(a0)), ry * (Math.cos(a1) - Math.cos(a0)))
    }
    angle = new Float32Array(LUT + 1)
    for (let k = 0, i = 0; k <= LUT; k++) {
      const target = (len[N] * k) / LUT
      while (i < N && len[i + 1] < target) i++
      const seg = len[i + 1] - len[i] || 1
      angle[k] = (i + Math.min(1, Math.max(0, (target - len[i]) / seg))) / N
    }
  }
  measure(1, 1)

  const D = new Float32Array(SAMPLES)
  const V = new Float32Array(SAMPLES)
  const F = new Float32Array(SAMPLES)
  const taper = new Float32Array(SAMPLES)
  for (let i = 0; i < SAMPLES; i++) taper[i] = Math.sin((Math.PI * (i + 0.5)) / SAMPLES) ** 0.5
  let simulated = Number.NaN
  let resting = true

  const gust = (at: number) => {
    F.fill(0)
    const S = geo.slots
    const avg = geo.gap / times.move
    const h = 4
    for (let k = 0; k <= S; k++) {
      const local = at - (S - k) * times.stagger
      if (local <= -h || local >= times.move + h) continue
      const e = times.ease(Math.min(1, Math.max(0, local / times.move)))
      const slope = (times.ease(Math.min(1, (local + h) / times.move)) - times.ease(Math.max(0, (local - h) / times.move))) / (2 * h)
      const span = k === 0 ? geo.start : geo.gap
      const arc = k === 0 ? e * geo.start : geo.start + (k - 1 + e) * geo.gap
      const speed = (span * slope) / avg
      if (speed <= 0) continue
      const u = uAt(arc)
      for (let i = 0; i < SAMPLES; i++) {
        const du = ((i + 0.5) / SAMPLES - u) / SPREAD
        if (du > -3 && du < 3) F[i] += speed * Math.exp(-du * du)
      }
    }
  }
  const step = (at: number) => {
    gust(at)
    const dt = STEP / 1000
    const omega = (2 * Math.PI * 1000) / times.spring
    let busy = false
    for (let i = 0; i < SAMPLES; i++) {
      let v = V[i] + (-GUST * F[i] * taper[i] - omega * omega * D[i] - 2 * ZETA * omega * V[i]) * dt
      const d = Math.max(-REACH, Math.min(REACH, D[i] + v * dt))
      if (Math.abs(d) >= REACH) v = 0
      D[i] = d
      V[i] = v
      if (!busy && (Math.abs(d) > REST || Math.abs(v) > REST * 10 || F[i] > 0)) busy = true
    }
    resting = !busy
  }
  const reset = () => {
    D.fill(0)
    V.fill(0)
    simulated = 0
    resting = false
  }

  return {
    samples: SAMPLES,
    reach: REACH,
    slope: 1 / SPREAD,
    ring: (canvas) => {
      const e = engine.current
      const el = stage.current
      if (!e || !el) return null
      const g = e.geometry()
      const css = getComputedStyle(el)
      const c = curveOf(css.getPropertyValue('--ds-wheel-ease'))
      times = { move: toMs(css.getPropertyValue('--ds-wheel-move').trim(), 600), stagger: toMs(css.getPropertyValue('--ds-wheel-stagger').trim(), 50), spring: toMs(css.getPropertyValue('--ds-wheel-light-spring').trim(), 720), ease: bezier(c[0], c[1], c[2], c[3]) }
      geo = { start: g.start, gap: g.gap, slots: g.slots }
      measure(g.rx, g.ry)
      simulated = Number.NaN
      const s = el.getBoundingClientRect()
      const r = canvas.getBoundingClientRect()
      return { cx: g.cx + s.left - r.left, cy: g.cy + s.top - r.top, rx: g.rx, ry: g.ry, cardW: g.cardW, cardH: g.cardH }
    },
    sample: (out) => {
      const since = engine.current?.since() ?? Number.POSITIVE_INFINITY
      if (!Number.isFinite(since) || since < 0) {
        out.fill(0)
        return false
      }
      if (Number.isNaN(simulated) || since < simulated - STEP) reset()
      if (!resting || since - simulated < times.move * 2) {
        while (simulated + STEP <= since) {
          step(simulated)
          simulated += STEP
          if (resting && simulated > (geo.slots + 1) * times.stagger + times.move) break
        }
      }
      if (resting) {
        out.fill(0)
        return false
      }
      for (let side = 0; side < 2; side++) {
        const gain = side ? 1 : 0.8
        for (let i = 0; i < SAMPLES; i++) {
          out[side * SAMPLES + i] = gain * D[i]
          out[2 * SAMPLES + side * SAMPLES + i] = STIR * Math.min(1, Math.abs(V[i]) / STIR_SPEED)
        }
      }
      return true
    },
    frozen: () => engine.current?.frozen() ?? false,
  }
}

// ----- Styles -----
// The site's V2UseCases.module.css on the brand's tokens, shared by both flavors (the React file renders it in a style
// tag, the element adopts it). The ring's measures step up at 768, 1024 and 1280; under 768 the ring is hidden and the
// heading sits over the drum alone.
export const useCaseWheelCss = `
.ds-wheel-section { position: relative; isolation: isolate; overflow-x: clip; padding-block: var(--ds-layout-section); }
.ds-wheel {
  --rx: var(--ds-wheel-rx); --ry: var(--ds-wheel-ry); --card-w: var(--ds-wheel-card-w); --card-h: var(--ds-wheel-card-h);
  --slots: var(--ds-wheel-slots); --head-w: var(--ds-wheel-head-w);
  --q-line: calc(var(--ds-text-body-lg) * var(--ds-text-body-lg-leading));
  --q-travel: var(--ds-wheel-step);
  --q-pad: var(--ds-space-md);
  --q-height: calc(var(--ds-wheel-step) * 2.5 + var(--q-line));
  --q-box: calc(var(--q-height) + var(--q-travel) * 2);
  --q-fade: calc(var(--q-travel) - var(--q-line));
  --q-pill-h: calc(var(--ds-wheel-send) + var(--q-pad) * 2);
  --cy: calc(var(--card-h) / 2 + var(--ry));
  position: relative;
  height: calc(var(--cy) + var(--ry) + var(--ds-wheel-below));
}
.ds-wheel-light { position: absolute; top: calc(var(--ds-layout-section) * -1); left: 0; z-index: -1; display: block; width: 100%; height: calc(100% + var(--ds-layout-section) * 2); pointer-events: none; }
.ds-wheel-head { position: absolute; top: var(--cy); left: 50%; z-index: 1; width: min(var(--head-w), 100% - var(--ds-layout-gutter) * 2); margin: 0; text-align: center; transform: translate(-50%, -50%); }
.ds-wheel-ring { position: absolute; inset: 0; perspective: var(--ds-wheel-perspective); perspective-origin: 50% var(--cy); pointer-events: none; }
.ds-wheel-picture { position: absolute; top: 0; left: 0; display: grid; place-items: center; width: var(--card-w); height: var(--card-h); opacity: 0; visibility: hidden; backface-visibility: hidden; will-change: transform, opacity; }
.ds-wheel-frame { display: block; overflow: hidden; width: 100%; height: 100%; border-radius: var(--ds-radius-sm); background: var(--ds-color-surface-raised); }
.ds-wheel-frame[data-fit="tall"] { width: auto; }
.ds-wheel-frame[data-fit="wide"] { height: auto; }
.ds-wheel-frame > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.ds-wheel-queue { position: absolute; top: calc(var(--cy) + var(--ry) - var(--q-travel) - var(--ds-wheel-step) - var(--q-pill-h) / 2); left: 50%; z-index: 2; width: var(--ds-wheel-pill-w); height: var(--q-box); transform: translateX(-50%); }
.ds-wheel-mask { position: absolute; inset: 0; z-index: 2; pointer-events: none; mask-image: linear-gradient(to bottom, transparent 0, transparent var(--q-line), var(--ds-color-black) var(--q-travel), var(--ds-color-black) calc(var(--q-travel) + var(--q-height)), transparent calc(var(--q-travel) + var(--q-height) + var(--q-fade)), transparent var(--q-box)); }
.ds-wheel-label { position: absolute; top: 0; left: 0; margin: 0; padding: 0; border: 0; background: none; color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-body-lg); font-weight: var(--ds-font-weight-regular); line-height: var(--q-line); white-space: nowrap; cursor: pointer; pointer-events: auto; will-change: transform, opacity; transition: opacity var(--ds-duration-micro) var(--ds-easing-out); }
.ds-wheel-label[aria-pressed="true"] { cursor: default; }
.ds-wheel-label:focus-visible { outline: none; }
.ds-wheel-label::before { position: absolute; inset: calc((var(--ds-space-3xl) - 100%) / -2) 0; content: ""; }
.ds-wheel-label[data-rest="above"] { opacity: 0.5; transform: translate(calc(var(--ds-wheel-pill-w) / 2 - 50%), var(--q-travel)); }
.ds-wheel-label[data-rest="pill"] { transform: translate(calc(var(--q-pad) + var(--ds-space-sm)), calc(var(--q-travel) + var(--ds-wheel-step) + var(--q-pad) + (var(--ds-wheel-send) - var(--q-line)) / 2)); }
.ds-wheel-label[data-rest="below"] { opacity: 0.5; transform: translate(calc(var(--ds-wheel-pill-w) / 2 - 50%), calc(var(--q-travel) + var(--ds-wheel-step) * 2.5)); }
.ds-wheel-twin { opacity: 0; pointer-events: none; }
.ds-wheel-focus { position: absolute; top: 0; left: 0; z-index: 3; width: 100%; height: var(--q-pill-h); border-radius: var(--ds-radius-panel); opacity: 0; pointer-events: none; outline: 2px solid var(--ds-color-white); outline-offset: 2px; }
.ds-wheel-focus[data-on] { opacity: 1; }
.ds-wheel-pill { position: absolute; top: calc(var(--q-travel) + var(--ds-wheel-step)); left: 0; z-index: 1; display: flex; align-items: center; justify-content: space-between; width: 100%; height: var(--q-pill-h); padding: var(--q-pad); border-radius: var(--ds-radius-panel); background: var(--ds-color-surface-raised); }
.ds-wheel-pill-text { margin-inline: var(--ds-space-sm); font-family: var(--ds-font-text); font-size: var(--ds-text-body-lg); line-height: var(--q-line); white-space: nowrap; visibility: hidden; }
.ds-wheel-send { position: relative; display: grid; flex: none; place-items: center; width: var(--ds-wheel-send); height: var(--ds-wheel-send); border-radius: var(--ds-radius-control); background: var(--ds-color-action-primary); color: var(--ds-color-action-primary-fg); transition: background-color var(--ds-duration-micro) var(--ds-easing-out); }
.ds-wheel-send::before { position: absolute; inset: calc((var(--ds-space-3xl) - var(--ds-wheel-send)) / -2); content: ""; }
.ds-wheel-send svg { fill: none; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
.ds-wheel-send:focus-visible { outline: 2px solid var(--ds-color-white); outline-offset: 2px; }
@media (hover: hover) and (pointer: fine) { .ds-wheel-send:hover { background: var(--ds-color-action-primary-hover); } }
@media (width < 768px) {
  .ds-wheel-section { --ds-wheel-ry: var(--ds-wheel-ry-phone); padding-bottom: calc(var(--ds-layout-section) - var(--ds-space-xl)); }
  .ds-wheel { --cy: calc(var(--ds-text-heading-2) * var(--ds-text-heading-2-leading)); }
  .ds-wheel-head { width: calc(100% - var(--ds-layout-gutter) * 2); }
  .ds-wheel-ring, .ds-wheel-light { display: none; }
}
@media (min-width: 768px) { .ds-wheel { --rx: var(--ds-wheel-rx-md); --ry: var(--ds-wheel-ry-md); --card-w: var(--ds-wheel-card-w-md); --card-h: var(--ds-wheel-card-h-md); --slots: var(--ds-wheel-slots-md); --head-w: var(--ds-wheel-head-w-md); } }
@media (min-width: 1024px) {
  .ds-wheel { --rx: var(--ds-wheel-rx-lg); --ry: var(--ds-wheel-ry-lg); --card-w: var(--ds-wheel-card-w-lg); --card-h: var(--ds-wheel-card-h-lg); --slots: var(--ds-wheel-slots-lg); --head-w: var(--ds-wheel-head-w-lg); }
  .ds-wheel-section[data-light] { padding-top: calc(var(--ds-layout-section) - var(--ds-space-sm)); padding-bottom: calc(var(--ds-layout-section) + var(--ds-space-3xl) - var(--ds-space-xs)); }
}
/* The site's .t-h1: the section head's 44/48 holds until 1280 here (type-section steps to 56 at 1024). */
@media (min-width: 1024px) and (max-width: 1279.98px) { .ds-wheel-head { font-size: var(--ds-text-heading-1); line-height: var(--ds-text-heading-1-leading); } }
@media (min-width: 1280px) { .ds-wheel { --rx: var(--ds-wheel-rx-xl); --ry: var(--ds-wheel-ry-xl); --card-w: var(--ds-wheel-card-w-xl); --card-h: var(--ds-wheel-card-h-xl); --head-w: var(--ds-wheel-head-w-xl); } }
@media (min-width: 1600px) { .ds-wheel-section[data-light] { padding-top: calc(var(--ds-layout-section) + var(--ds-space-xs)); padding-bottom: calc(var(--ds-layout-section) + var(--ds-space-4xl) + var(--ds-space-md)); } }
@media (prefers-reduced-motion: reduce) { .ds-wheel-label { transition: none; } }
`
