'use client'
import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { DropdownMenu } from '@/react/components/ui/DropdownMenu'
import { MenuItem } from '@/react/components/ui/MenuItem'
import { cn } from '@/react/lib/cn'

// shadcn's data table in the brand: a table people filter, sort and page through. Over it, a dropdown per filter
// (radio rows, the trigger saying what is picked) and a way to clear them; heads in DM Sans Medium capitals, muted,
// that sort when they can (aria-sort; the arrow shows the order, a faint pair where it could); 40px rows on hairlines
// that take the #171717 fill under the pointer; numbers right-aligned in tabular figures; the whole in a hairline box
// with the 8px corner that scrolls sideways on its own, so a phone never scrolls the page. Under it, where the page is
// and Previous and Next. Filters and sort go back to the first page. Cells render the value (numbers in en-US), or
// `cell[key]({ row, value })`. Nothing matching shows one line with a way to clear the filters (`empty` replaces it).
export type DataColumn = { key: string, label: string, align?: 'left' | 'right', sortable?: boolean, muted?: boolean }
export type DataFilter = { key: string, label: string, options: string[], any?: string }
export interface DataTableProps<Row extends Record<string, unknown>> {
  /** The columns: key, label, align, sortable, muted. */
  columns: DataColumn[]
  rows: Row[]
  /** The field that tells rows apart. */
  rowKey: string
  /** The table's name for assistive tech. */
  label: string
  /** A dropdown per filter: key, label, options, and what "any" reads as. */
  filters?: DataFilter[]
  /** Rows per page. */
  pageSize?: number
  /** How a column's cells render, by key. */
  cell?: Partial<Record<string, (slot: { row: Row, value: unknown }) => ReactNode>>
  /** In place of the line shown when nothing matches. */
  empty?: ReactNode
  className?: string
}

const display = (v: unknown) => (typeof v === 'number' ? v.toLocaleString('en-US') : String(v ?? ''))
export const FILTER = 'inline-flex h-control-sm cursor-pointer items-center gap-1.5 rounded-control border border-edge-strong bg-surface px-3 type-ui text-fg transition-[border-color] duration-150 ease-standard hover:border-action-secondary-edge-hover aria-expanded:border-edge-focus max-md:h-control-touch'
export const SORT = '-mx-1 inline-flex cursor-pointer items-center gap-1 rounded-ds-sm px-1 uppercase transition-[color] duration-150 ease-standard hover:text-fg'

export function DataTable<Row extends Record<string, unknown>>({ columns, rows, rowKey, label, filters = [], pageSize = 5, cell = {}, empty, className }: DataTableProps<Row>) {
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [sort, setSort] = useState<{ key: string, dir: 'ascending' | 'descending' } | null>(null)
  const [page, setPage] = useState(0)

  const filtered = rows.filter(r => filters.every(f => !picked[f.key] || String(r[f.key]) === picked[f.key]))
  const sorted = (() => {
    if (!sort) return filtered
    const sign = sort.dir === 'ascending' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const x = a[sort.key]
      const y = b[sort.key]
      return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)))
    })
  })()
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const at = Math.min(page, pages - 1)
  const visible = sorted.slice(at * pageSize, at * pageSize + pageSize)
  const anyOn = Object.values(picked).some(Boolean)

  function pick(next: Record<string, string>) {
    setPicked(next)
    setPage(0)
  }
  function toggleSort(key: string) {
    setSort(s => (s?.key !== key ? { key, dir: 'ascending' } : s.dir === 'ascending' ? { key, dir: 'descending' } : null))
    setPage(0)
  }

  return (
    <div data-ds="data-table" className={cn('flex min-w-0 flex-col gap-3', className)}>
      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(f => (
            <DropdownMenu key={f.key} label={f.label} width="200px" triggerClass={FILTER} trigger={<><span>{`${f.label}: ${picked[f.key] || (f.any ?? 'Any')}`}</span><ChevronDown size={16} strokeWidth={1.5} className="text-fg-muted" aria-hidden="true" /></>}>
              {['', ...f.options].map(o => (
                <MenuItem key={o || 'any'} role="menuitemradio" aria-checked={(picked[f.key] ?? '') === o} onSelect={() => pick({ ...picked, [f.key]: o })}>
                  <span className="min-w-0 flex-1 truncate">{o || (f.any ?? 'Any')}</span>
                  {(picked[f.key] ?? '') === o && <Check size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />}
                </MenuItem>
              ))}
            </DropdownMenu>
          ))}
          {anyOn && <Button variant="ghost" size="sm" onClick={() => pick({})}>Clear filters</Button>}
        </div>
      )}
      <div className="overflow-x-auto rounded-container border border-edge" role="region" aria-label={label} tabIndex={0}>
        <table className="w-full border-collapse type-ui">
          <thead>
            <tr>
              {columns.map(c => (
                <th key={c.key} scope="col" className={cn('h-10 border-b border-edge px-3 type-label whitespace-nowrap text-fg-muted', c.align === 'right' ? 'text-right' : 'text-left')} aria-sort={sort?.key === c.key ? sort.dir : c.sortable ? 'none' : undefined}>
                  {c.sortable
                    ? (
                        <button type="button" className={cn(SORT, c.align === 'right' && 'flex-row-reverse')} onClick={() => toggleSort(c.key)}>
                          {c.label}
                          {sort?.key === c.key && sort.dir === 'ascending'
                            ? <ArrowUp size={14} strokeWidth={1.5} className="text-fg" aria-hidden="true" />
                            : sort?.key === c.key
                              ? <ArrowDown size={14} strokeWidth={1.5} className="text-fg" aria-hidden="true" />
                              : <ArrowUpDown size={14} strokeWidth={1.5} className="text-fg-faint" aria-hidden="true" />}
                        </button>
                      )
                    : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(r => (
              <tr key={String(r[rowKey])} className="transition-[background-color] duration-150 ease-standard hover:bg-surface-raised">
                {columns.map(c => (
                  <td key={c.key} className={cn('h-row border-b border-edge px-3 py-1 [tr:last-child>&]:border-b-0', c.align === 'right' && 'text-right tabular-nums', c.muted && 'whitespace-nowrap text-fg-muted')}>
                    {cell[c.key] ? cell[c.key]!({ row: r, value: r[c.key] }) : display(r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
            {!visible.length && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-6 text-center text-fg-muted">
                  {empty ?? <>Nothing matches these filters. <button type="button" className="cursor-pointer font-medium text-fg underline-offset-4 hover:underline" onClick={() => pick({})}>Clear filters</button></>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {sorted.length > pageSize && (
        <div className="flex items-center justify-between gap-3">
          <span className="type-caption text-fg-muted tabular-nums" aria-live="polite">{`${at * pageSize + 1} to ${at * pageSize + visible.length} of ${sorted.length}`}</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={at === 0} onClick={() => setPage(at - 1)}>Previous</Button>
            <Button variant="secondary" size="sm" disabled={at >= pages - 1} onClick={() => setPage(at + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
