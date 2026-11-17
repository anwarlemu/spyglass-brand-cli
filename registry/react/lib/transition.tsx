'use client'
import { Children, cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode, type Ref } from 'react'
import { flushSync } from 'react-dom'

// Vue's <Transition> and <TransitionGroup> for the React flavor, with the same class names, so a Vue item's CSS
// (.ds-pop-enter-from, .ds-toast-leave-active, .ds-toast-move...) works unchanged:
//
//   <Transition show={open} name="ds-pop">{<div ... />}</Transition>
//   <TransitionGroup name="ds-toast">{toasts.map((t) => <p key={t.id} ... />)}</TransitionGroup>
//
// Entering: <name>-enter-from and -enter-active, then a frame later -enter-to in place of -enter-from, until the
// transition ends. Leaving: the same with -leave-*, and the element stays until it has, then goes in the same task its
// classes come off (flushSync), so it never shows again for a frame. A group also moves the others with <name>-move
// (FLIP), measured once the entering and leaving children have their classes, as Vue's are. `css={false}` skips the classes (Vue's :css="false"); `duration` is Vue's explicit duration
// in ms, a number or { enter, leave }. The child must take a ref (a DOM element) and className.
type Duration = number | { enter: number, leave: number }
type Phase = 'enter' | 'leave'

const ms = (d: Duration | undefined, phase: Phase) => (d === undefined ? undefined : typeof d === 'number' ? d : d[phase])

/** Runs one Vue transition phase on an element and resolves when it has ended. */
export function runTransition(el: HTMLElement, name: string, phase: Phase, duration?: Duration): Promise<void> {
  const from = `${name}-${phase}-from`
  const active = `${name}-${phase}-active`
  const to = `${name}-${phase}-to`
  el.classList.add(from, active)
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      el.classList.remove(from, active, to)
      el.removeEventListener('transitionend', onEnd)
      el.removeEventListener('animationend', onEnd)
      resolve()
    }
    const onEnd = (event: Event) => { if (event.target === el) finish() }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.classList.remove(from)
      el.classList.add(to)
      const explicit = ms(duration, phase)
      if (explicit !== undefined) return void setTimeout(finish, explicit)
      // The longest transition or animation on it, as Vue reads it; none means done now.
      const cs = getComputedStyle(el)
      const longest = (durations: string, delays: string) => {
        const d = durations.split(',').map(s => Number.parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))
        const l = delays.split(',').map(s => Number.parseFloat(s) * (s.trim().endsWith('ms') ? 1 : 1000))
        return Math.max(0, ...d.map((x, i) => x + (l[i % l.length] || 0)))
      }
      const total = Math.max(longest(cs.transitionDuration, cs.transitionDelay), longest(cs.animationDuration, cs.animationDelay))
      if (!total) return finish()
      el.addEventListener('transitionend', onEnd)
      el.addEventListener('animationend', onEnd)
      setTimeout(finish, total + 50)
    }))
  })
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T) => {
    for (const r of refs) {
      if (typeof r === 'function') r(node)
      else if (r) (r as { current: T }).current = node
    }
  }
}
type Child = ReactElement<{ ref?: Ref<HTMLElement>, className?: string }>

export interface TransitionProps { show: boolean, name: string, css?: boolean, duration?: Duration, appear?: boolean, children: ReactNode }

/** Vue's <Transition> around one element: it enters when `show` turns true and leaves before it unmounts. */
export function Transition({ show, name, css = true, duration, appear, children }: TransitionProps) {
  // Whether the element is in the page: from the render where `show` turns true until its leave has ended.
  const [present, setPresent] = useState(show)
  const el = useRef<HTMLElement | null>(null)
  const was = useRef<boolean | null>(null)
  const last = useRef<ReactNode>(children)
  if (show) last.current = children
  if (show && !present) setPresent(true)
  useLayoutEffect(() => {
    const before = was.current
    was.current = show
    const node = el.current
    if (before === show) return
    if (show) {
      if (node && css && (before !== null || appear)) void runTransition(node, name, 'enter', duration)
    }
    // Gone in the same task its leave classes come off, as Vue removes it, so no frame shows it whole again.
    else if (node && css && before) void runTransition(node, name, 'leave', duration).then(() => { if (!was.current) flushSync(() => setPresent(false)) })
    else setPresent(false)
  }, [show]) // eslint-disable-line react-hooks/exhaustive-deps
  const child = (show ? children : last.current) as Child
  if (!(show || present) || !isValidElement(child)) return null
  return cloneElement(child, { ref: mergeRefs(child.props.ref, (n: HTMLElement | null) => { el.current = n }) })
}

export interface TransitionGroupProps { name: string, children: ReactNode }

/** Vue's <TransitionGroup>: keyed children enter and leave as <Transition> does, and the rest move with <name>-move. */
export function TransitionGroup({ name, children }: TransitionGroupProps) {
  const nodes = useRef(new Map<string, HTMLElement>())
  const rects = useRef(new Map<string, DOMRect>())
  const seen = useRef(new Set<string>())
  const firstRender = useRef(true)
  const current = Children.toArray(children).filter(isValidElement) as Child[]
  const [leaving, setLeaving] = useState<Map<string, { child: Child, index: number }>>(new Map())
  const prev = useRef<Child[]>([])

  // Children that went away stay, leaving, where they were.
  const keys = new Set(current.map(c => c.key!))
  const gone = prev.current.filter(c => !keys.has(c.key!) && !leaving.has(c.key!))
  if (gone.length) {
    const next = new Map(leaving)
    for (const c of gone) next.set(c.key!, { child: c, index: prev.current.indexOf(c) })
    setLeaving(next)
  }
  prev.current = current
  const list = [...current]
  for (const [key, { child, index }] of leaving) if (!keys.has(key)) list.splice(Math.min(index, list.length), 0, child)

  // Before the DOM changes: where every child is now (for the move).
  for (const [key, node] of nodes.current) rects.current.set(key, node.getBoundingClientRect())

  useLayoutEffect(() => {
    // First every entering and leaving child takes its classes, so the measures for the move below see each as Vue does
    // (an entering one at its enter-from, a leaving one out of the flow): measuring first would fix an entering child's
    // style as it is, fully shown, and its transition would start from the end.
    const entered = new Set<string>()
    for (const c of list) {
      const key = c.key!
      const node = nodes.current.get(key)
      if (!node) continue
      if (leaving.has(key)) {
        if (!node.classList.contains(`${name}-leave-active`)) {
          // Gone in the same task its leave classes come off, so no frame shows it whole again.
          void runTransition(node, name, 'leave').then(() => flushSync(() => setLeaving((m) => {
            const n = new Map(m)
            n.delete(key)
            return n
          })))
        }
        continue
      }
      if (!seen.current.has(key)) {
        seen.current.add(key)
        entered.add(key)
        if (!firstRender.current) void runTransition(node, name, 'enter')
      }
    }
    // Then the move: from where each stayed child was to where it is.
    for (const c of list) {
      const key = c.key!
      const node = nodes.current.get(key)
      if (!node || leaving.has(key) || entered.has(key)) continue
      const before = rects.current.get(key)
      if (!before) continue
      const after = node.getBoundingClientRect()
      if (before.left !== after.left || before.top !== after.top) {
        node.style.transitionDuration = '0s'
        node.style.transform = `translate(${before.left - after.left}px, ${before.top - after.top}px)`
        void node.offsetWidth
        node.classList.add(`${name}-move`)
        node.style.transitionDuration = ''
        node.style.transform = ''
        const end = () => {
          node.classList.remove(`${name}-move`)
          node.removeEventListener('transitionend', end)
        }
        node.addEventListener('transitionend', end)
      }
    }
    firstRender.current = false
    for (const key of [...seen.current]) if (!list.some(c => c.key === key)) seen.current.delete(key)
  })

  return (
    <>
      {list.map(c => cloneElement(c, {
        key: c.key,
        ref: mergeRefs(c.props.ref, (n: HTMLElement | null) => {
          if (n) nodes.current.set(c.key!, n)
          else nodes.current.delete(c.key!)
        }),
      }))}
    </>
  )
}
