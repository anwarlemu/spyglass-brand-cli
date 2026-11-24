'use client'
import { useEffect, useRef, useState } from 'react'
import { copyText } from '@/lib/code'
import { cn } from '@/react/lib/cn'

// The site's copy button (sections/Connect CopyButton): a quiet 40px button with a 4px corner, its label in the soft
// gray (White under the pointer); a press puts `text` on the clipboard and the label crosses over to "Copied" (up and
// out, up and in, 160ms) for 2s. If the clipboard is refused, the text in `selectId` is selected instead.
export interface CopyButtonProps {
  text: string
  label?: string
  copiedLabel?: string
  /** Its accessible name. */
  name?: string
  /** The element whose text is selected when copying is refused. */
  selectId?: string
  onCopy?: (text: string) => void
  className?: string
}

export const COPY_BUTTON =
  'ds-copy relative inline-flex h-control-md min-w-20 flex-none cursor-pointer items-center justify-center rounded-ds-sm bg-action-secondary px-4 type-ui-strong whitespace-nowrap text-fg-soft shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-action-secondary-edge)] transition-[background-color,color] duration-160 ease-out select-none before:absolute before:-inset-y-2 before:inset-x-0 hover:bg-action-secondary-hover hover:text-fg data-copied:text-fg'

export function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied', name = 'Copy code', selectId, onCopy, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    const ok = await copyText(text)
    if (!ok) {
      const target = selectId ? document.getElementById(selectId) : null
      if (target) window.getSelection()?.selectAllChildren(target)
      return
    }
    setCopied(true)
    onCopy?.(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span data-ds="copy-button" className="contents">
      <style href="ds-copy-button" precedence="ds">{css}</style>
      <button type="button" aria-label={name} data-copied={copied || undefined} className={cn(COPY_BUTTON, className)} onClick={copy}>
        <span aria-hidden="true" className="grid justify-items-center">
          <span className="ds-copy-idle [grid-area:1/1]">{label}</span>
          <span className="ds-copy-done [grid-area:1/1]">{copiedLabel}</span>
        </span>
      </button>
      <span role="status" className="sr-only">{copied ? copiedLabel : ''}</span>
    </span>
  )
}

export default CopyButton

const css = `
.ds-copy-idle, .ds-copy-done { transition: opacity var(--ds-duration-micro) var(--ds-easing-out), transform var(--ds-duration-micro) var(--ds-easing-out); }
.ds-copy-done { opacity: 0; transform: translateY(var(--ds-space-xs)); }
.ds-copy[data-copied] .ds-copy-idle { opacity: 0; transform: translateY(calc(-1 * var(--ds-space-xs))); }
.ds-copy[data-copied] .ds-copy-done { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .ds-copy-done, .ds-copy[data-copied] .ds-copy-idle { transform: none; }
}
`
