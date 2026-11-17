import type { ReactNode } from 'react'
import { cn } from '@/react/lib/cn'

// Rows of one kind of thing, on Black. Heads are labels: DM Sans Medium 12px in capitals with 6% tracking, muted, over
// a #262626 hairline; cells are DM Sans 14px with a hairline between rows, and a row takes the ghost fill under the
// pointer (150ms). Right-aligned cells (class text-right) take tabular figures. A footer row sits on the card's #171717
// fill; a caption goes under the table in muted 12px. `framed` puts it in a hairline box with the brand corner and a
// 16px inset at both ends. It scrolls sideways on its own, so a phone never scrolls the page; with a `label` the
// scroll box is a named region a keyboard can reach. Write the <caption>, <thead>, <tbody> and <tfoot> as children;
// mark a selected row with data-state="selected".
export interface TableProps {
  /** In a hairline box with the brand corner. */
  framed?: boolean
  /** Names the scroll box (a region a keyboard can reach). */
  label?: string
  className?: string
  /** The table's caption, thead, tbody and tfoot. */
  children?: ReactNode
}

export function Table({ framed, label, className, children }: TableProps) {
  return (
    <>
      <style href="ds-table" precedence="ds">{css}</style>
      <div data-ds="table" className={cn('relative w-full overflow-x-auto', framed && 'rounded-container border border-edge', className)} role={label ? 'region' : undefined} aria-label={label} tabIndex={label ? 0 : undefined}>
        <table className="ds-table" data-framed={framed || undefined}>{children}</table>
      </div>
    </>
  )
}

export default Table

const css = `
.ds-table { width: 100%; border-collapse: collapse; caption-side: bottom; color: var(--ds-color-fg); font-family: var(--ds-font-text); font-size: var(--ds-text-ui); line-height: var(--ds-text-ui-leading); }
.ds-table th { height: var(--ds-size-row); padding: 0 var(--ds-space-md); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); color: var(--ds-color-fg-muted); font-size: var(--ds-text-label); line-height: var(--ds-text-label-leading); font-weight: var(--ds-font-weight-medium); letter-spacing: var(--ds-tracking-label); text-transform: uppercase; text-align: left; white-space: nowrap; vertical-align: middle; }
.ds-table td { padding: var(--ds-space-md); border-bottom: var(--ds-border-hairline) solid var(--ds-color-edge); vertical-align: middle; }
.ds-table :is(th, td).text-right { text-align: right; font-variant-numeric: tabular-nums; }
.ds-table tbody tr:last-child td { border-bottom: 0; }
.ds-table tbody tr { transition: background-color var(--ds-duration-micro) var(--ds-easing-standard); }
@media (hover: hover) and (pointer: fine) { .ds-table tbody tr:hover { background: var(--ds-color-action-ghost-hover); } }
.ds-table tbody tr[data-state="selected"] { background: var(--ds-color-surface-subtle); }
.ds-table tfoot td { border-top: var(--ds-border-hairline) solid var(--ds-color-edge); border-bottom: 0; background: var(--ds-color-surface-raised); font-weight: var(--ds-font-weight-medium); }
.ds-table caption { margin-top: var(--ds-space-lg); color: var(--ds-color-fg-muted); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); text-align: left; }
.ds-table[data-framed] :is(th, td):first-child { padding-left: var(--ds-space-lg); }
.ds-table[data-framed] :is(th, td):last-child { padding-right: var(--ds-space-lg); }
.ds-table[data-framed] caption { padding: 0 var(--ds-space-lg) var(--ds-space-lg); }
`
