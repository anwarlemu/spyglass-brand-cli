'use client'
import { useEffect, useRef, type SyntheticEvent, type MouseEvent } from 'react'
import { Command, type CommandItem, type CommandProps } from '@/react/components/ui/Command'
import { useControllable } from '@/react/hooks/useControllable'

// The command menu in a window, 15vh from the top over a Black scrim: Cmd+K (Ctrl+K) opens and closes it from anywhere
// on the page (`shortcut`, null for none), and so can your own button. It opens and closes at once, with no motion,
// because it opens many times a day. Focus starts in the field; Escape or a press on the scrim closes it and focus
// returns to what opened it; running a row closes it. The field is empty each time it opens. `open` with
// `onOpenChange` (or `defaultOpen` alone).
export interface CommandDialogProps extends Omit<CommandProps, 'autoFocus' | 'className'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** The letter that opens it with Cmd or Ctrl; null for no shortcut. */
  shortcut?: string | null
}

export function CommandDialog({ open: openProp, defaultOpen = false, onOpenChange, shortcut = 'k', onSelect, ...command }: CommandDialogProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const dialog = useRef<HTMLDialogElement | null>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const toggle = useRef(() => setOpen(!open))
  toggle.current = () => setOpen(!open)

  useEffect(() => {
    if (!shortcut) return
    function onKey(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === shortcut) {
        event.preventDefault()
        toggle.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [shortcut])

  const mounted = useRef(false)
  useEffect(() => {
    const d = dialog.current
    const first = !mounted.current
    mounted.current = true
    if (!d) return
    if (open) {
      if (d.open) return
      returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      d.showModal()
      d.querySelector<HTMLElement>('[role="combobox"]')?.focus()
    }
    else if (!first) {
      if (d.open) d.close()
      returnTo.current?.focus({ preventScroll: true })
      returnTo.current = null
    }
  }, [open])

  function onCancel(event: SyntheticEvent) {
    event.preventDefault()
    setOpen(false)
  }
  // A press on the scrim lands on the dialog element itself.
  function onDown(event: MouseEvent) {
    if (event.target === dialog.current) setOpen(false)
  }
  function picked(item: CommandItem) {
    onSelect?.(item)
    setOpen(false)
  }
  return (
    <>
      <style href="ds-command-dialog" precedence="ds">{css}</style>
      <dialog data-ds="command-dialog" ref={dialog} className="ds-cmd" aria-label={command.label ?? 'Commands'} onCancel={onCancel} onMouseDown={onDown}>
        {open && <Command {...command} onSelect={picked} />}
      </dialog>
    </>
  )
}

export default CommandDialog

const css = `
/* No transition or animation: it opens and closes at once. */
.ds-cmd { position: fixed; inset: 15vh auto auto 50%; width: min(560px, calc(100vw - 32px)); max-width: none; max-height: none; margin: 0; padding: 0; border: 0; background: transparent; color: var(--ds-color-fg); font-family: var(--ds-font-text); overscroll-behavior: contain; transform: translateX(-50%); }
.ds-cmd::backdrop { background: var(--ds-color-scrim); }
`
