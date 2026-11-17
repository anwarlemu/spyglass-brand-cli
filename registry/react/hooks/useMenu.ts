'use client'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'

/**
 * A menu button's behavior: it opens on click, arrows move between items (opening the menu on their end of it from the
 * button), Home and End jump, Escape closes and returns focus to the button, Tab and a click outside close it.
 */
export function useMenu(initial = false) {
  const [open, setOpen] = useState(initial)
  const root = useRef<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement | null>(null)
  const pending = useRef<'first' | 'last' | 'none' | null>(null)
  // Each show() renders, so an arrow on the open menu's button still focuses a row (Vue's nextTick runs either way).
  const [, setShown] = useState(0)

  const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([disabled])') ?? [])]

  // After the menu renders: scroll it into view and focus the row asked for (Vue's nextTick).
  useEffect(() => {
    if (!open || !pending.current) return
    const focus = pending.current
    pending.current = null
    // Opened at the fold it would land out of sight, and the button would seem to do nothing.
    items()[0]?.closest('[role="menu"]')?.scrollIntoView({ block: 'nearest' })
    if (focus === 'none') return
    const list = items()
    ;(focus === 'last' ? list.at(-1) : list[0])?.focus()
  })

  const show = useCallback((focus: 'first' | 'last' | 'none' = 'first') => {
    pending.current = focus
    setOpen(true)
    setShown(n => n + 1)
  }, [])
  const close = useCallback((refocus = false) => {
    setOpen(false)
    if (refocus) trigger.current?.focus()
  }, [])
  function toggle() {
    if (open) close()
    else show('none')
  }
  function onTriggerKey(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      show(event.key === 'ArrowDown' ? 'first' : 'last')
    }
    else if (event.key === 'Escape' && open) {
      event.preventDefault()
      close(true)
    }
  }
  function onMenuKey(event: KeyboardEvent) {
    const list = items()
    const at = list.indexOf(document.activeElement as HTMLElement)
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    }
    else if (event.key === 'Tab') {
      close()
    }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      list[(at + step + list.length) % list.length]?.focus()
    }
    else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      ;(event.key === 'Home' ? list[0] : list.at(-1))?.focus()
    }
  }
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [])

  return { open, root, trigger, show, close, toggle, onTriggerKey, onMenuKey }
}
