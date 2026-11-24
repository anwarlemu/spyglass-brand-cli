'use client'
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// The site header's phone menu (site/Header MenuSheet): a 48px button with two 24px bars that cross into an X; the
// sheet is a modal dialog over the whole window, Black, revealed downward from the bar (clip-path, 240ms in, 160ms
// out) with the lockup, the key and the close button in the bar, the links scrolling in the middle (fading at their
// edges) and the foot pinned under a hairline. Focus moves into it (to the close button from the keyboard) and stays in
// it (Tab wraps); Escape or the close button closes it and gives focus back to the menu button; following a link closes
// it; the page under it does not scroll. Reduced motion: it appears and leaves at once.
export const BAR = 'relative mx-auto flex h-16 w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] items-center justify-between px-(--ds-layout-gutter) lg:h-header'
const MENU_BUTTON = 'ds-menu-button grid size-12 flex-none cursor-pointer place-items-center rounded-control -me-3 text-fg outline-offset-[calc(-1*var(--ds-space-xs))]'

export interface MenuSheetProps {
  /** The menu button's and the dialog's name. */
  label?: string
  closeLabel?: string
  /** The lockup link in the sheet's bar. */
  brand?: ReactNode
  /** Beside the close button (the key). */
  action?: ReactNode
  /** Pinned at the foot (sign in, the key). */
  foot?: ReactNode
  children?: ReactNode
  /** The width it closes and hides at (1280 or 1024; the header shows its links from there). */
  until?: number
  className?: string
}

function lock(dialog: HTMLDialogElement) {
  const root = document.documentElement
  const bar = window.innerWidth - root.clientWidth
  root.style.overflow = 'hidden'
  root.style.paddingRight = `${bar}px`
  dialog.style.setProperty('--scrollbar-w', `${bar}px`)
}
function unlock(dialog: HTMLDialogElement | null) {
  const root = document.documentElement
  root.style.overflow = ''
  root.style.paddingRight = ''
  dialog?.style.removeProperty('--scrollbar-w')
}

function Glyph() {
  return (
    <span aria-hidden="true" className="ds-menu-glyph relative block h-3 w-6">
      <span /><span />
    </span>
  )
}

export function MenuSheet({ label = 'Menu', closeLabel = 'Close menu', brand, action, foot, children, until = 1280, className }: MenuSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const followed = useRef(false)
  const [open, setOpen] = useState(false)
  const id = useId()

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    followed.current = false
    lock(dialog)
    dialog.showModal()
    if (e.detail === 0) closeRef.current?.focus()
    else dialog.focus()
    setOpen(true)
  }
  const closeMenu = () => {
    unlock(dialogRef.current)
    dialogRef.current?.close()
  }
  const onClose = () => {
    unlock(dialogRef.current)
    setOpen(false)
    if (!followed.current) triggerRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClick = (e: globalThis.MouseEvent) => {
      if (!(e.target as Element).closest('a')) return
      followed.current = true
      unlock(dialog)
      dialog.close()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const stops = [...dialog.querySelectorAll<HTMLElement>('a[href], button')].filter((el) => el.getClientRects().length > 0 && !el.closest('[inert]'))
      const first = stops[0]
      const last = stops[stops.length - 1]
      if (!first || !last) return
      if (document.activeElement === dialog) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    const wide = window.matchMedia(`(min-width: ${until}px)`)
    const onWide = () => { if (wide.matches && dialog.open) closeMenu() }
    dialog.addEventListener('click', onClick)
    dialog.addEventListener('keydown', onKeyDown)
    wide.addEventListener('change', onWide)
    return () => {
      dialog.removeEventListener('click', onClick)
      dialog.removeEventListener('keydown', onKeyDown)
      wide.removeEventListener('change', onWide)
      unlock(dialog)
    }
  }, [until])

  return (
    <div data-ds="menu-sheet" className={cn('contents', until === 1024 ? 'lg:hidden' : 'xl:hidden', className)}>
      <style href="ds-menu-sheet" precedence="ds">{css}</style>
      <button ref={triggerRef} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={openMenu} className={MENU_BUTTON}>
        <span className="sr-only">{label}</span>
        <Glyph />
      </button>
      <dialog ref={dialogRef} id={id} aria-label={label} tabIndex={-1} onClose={onClose} className="ds-sheet fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-surface p-0 pe-(--scrollbar-w,0) text-fg outline-none">
        <div className="flex h-full flex-col">
          <div className={cn(BAR, 'flex-none after:absolute after:inset-x-0 after:bottom-0 after:border-t after:border-edge')}>
            {brand}
            <div className="flex min-w-0 flex-[0_1_auto] items-center gap-1 md:gap-2">
              {action}
              <button ref={closeRef} type="button" onClick={closeMenu} className={MENU_BUTTON}>
                <span className="sr-only">{closeLabel}</span>
                <Glyph />
              </button>
            </div>
          </div>
          <div className="fade-y flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">{children}</div>
          <div className="relative mx-auto flex w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] flex-none flex-col gap-2 px-(--ds-layout-gutter) pt-4 pb-[max(var(--ds-space-lg),env(safe-area-inset-bottom))] before:absolute before:inset-x-0 before:top-0 before:border-t before:border-edge">{foot}</div>
        </div>
      </dialog>
    </div>
  )
}

export default MenuSheet

const css = `
.ds-menu-glyph { transition: transform var(--ds-duration-press) var(--ds-easing-out); }
.ds-menu-button:active .ds-menu-glyph { transform: scale(0.9); }
.ds-menu-glyph > span { position: absolute; inset-inline: 0; top: calc(50% - var(--ds-stroke) / 2); height: 0; border-top: var(--ds-stroke) solid currentColor; transition: transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-menu-glyph > span:first-child { transform: translateY(calc(-1 * var(--ds-space-xs))) rotate(0deg); }
.ds-menu-glyph > span:last-child { transform: translateY(var(--ds-space-xs)) rotate(0deg); }
.ds-sheet {
  --sheet-bar: var(--ds-header-bar-phone);
  clip-path: inset(0 0 calc(100% - var(--sheet-bar)) 0);
  transition: clip-path var(--ds-duration-micro) var(--ds-easing-out), display var(--ds-duration-micro) allow-discrete, overlay var(--ds-duration-micro) allow-discrete;
}
.ds-sheet[open] { clip-path: inset(0 0 0 0); transition-duration: var(--ds-duration-enter); }
.ds-sheet::backdrop { background: transparent; }
.ds-sheet[open] .ds-menu-glyph > span { transition-duration: var(--ds-duration-enter); }
.ds-sheet[open] .ds-menu-glyph > span:first-child { transform: translateY(0) rotate(45deg); }
.ds-sheet[open] .ds-menu-glyph > span:last-child { transform: translateY(0) rotate(-45deg); }
@starting-style {
  .ds-sheet[open] { clip-path: inset(0 0 calc(100% - var(--sheet-bar)) 0); }
  .ds-sheet[open] .ds-menu-glyph > span:first-child { transform: translateY(calc(-1 * var(--ds-space-xs))) rotate(0deg); }
  .ds-sheet[open] .ds-menu-glyph > span:last-child { transform: translateY(var(--ds-space-xs)) rotate(0deg); }
}
@media (min-width: 1024px) { .ds-sheet { --sheet-bar: var(--ds-size-header); } }
@media (prefers-reduced-motion: reduce) {
  .ds-sheet, .ds-sheet[open], .ds-menu-glyph, .ds-menu-glyph > span, .ds-sheet[open] .ds-menu-glyph > span { transition: none; }
}
`
