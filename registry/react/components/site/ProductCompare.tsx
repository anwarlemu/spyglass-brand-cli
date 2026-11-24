import type { ReactNode } from 'react'
import { Logo } from '@/react/components/visuals/Logo'
import { cn } from '@/react/lib/cn'

// The site's product comparison (pages/Products/ProductCompare): the section head (the page head type, a lead 24px
// under it; centered on phones), then a table of what the product does against two other ways of doing it. Rows ruled by
// #363636 hairlines, the label in 16/24 White, three columns of 160px (88 on phones) with a check or a cross in #A3A3A3
// (the last column, ours, in White with the logomark beside its name and its checks White) or a few words in 14/20
// #A3A3A3. On phones each row is the label over its three cells. Nothing moves.
export type CompareCell = 'yes' | 'no' | (string & {})

export interface CompareRow {
  label: string
  /** One cell per column: "yes", "no" or a few words. */
  cells: CompareCell[]
}

export interface ProductCompareProps {
  headline?: string
  lead?: string
  /** The column names; the last is yours and gets the mark. */
  columns?: string[]
  rows: CompareRow[]
  /** The mark beside the last column's name (the logomark by default). */
  mark?: ReactNode
  /** Read for the check and the cross. */
  yes?: string
  no?: string
  /** Prefix for the heading id. */
  id?: string
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

function Mark({ value, ours, yes, no }: { value: string; ours: boolean; yes: string; no: string }) {
  if (value === 'yes' || value === 'no') {
    const on = value === 'yes'
    return (
      <span className={cn('inline-grid size-6 place-items-center', on ? (ours ? 'text-fg' : 'text-fg-soft') : 'text-fg-muted')}>
        <svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" focusable="false">
          <path d={on ? 'M3.5 8.5 6.5 11.5 12.5 4.5' : 'M4.5 4.5l7 7M11.5 4.5l-7 7'} fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="sr-only">{on ? yes : no}</span>
      </span>
    )
  }
  return <span className="type-caption text-balance text-fg-muted md:type-ui">{value}</span>
}

export function ProductCompare({
  headline = 'See the difference',
  lead = 'Ad libraries show what is live. Scrapers hand you raw pages. Spyglass keeps the whole record, ready to ask.',
  columns = ['Ad libraries', 'Scrapers', 'Spyglass'],
  rows,
  mark,
  yes = 'Yes',
  no = 'No',
  id = 'product',
  className,
}: ProductCompareProps) {
  const last = columns.length - 1
  const heads = columns.map((c, i) => (
    <th key={c} scope="col" className={cn('w-22 pb-4 text-center align-top type-caption md:w-40 md:align-bottom md:type-ui', i === last ? 'font-medium text-fg' : 'font-normal text-fg-muted')}>
      {i === last ? <span className="inline-flex items-center gap-2">{mark ?? <Logo variant="mark" height={12} label="" className="flex-none" />}{c}</span> : c}
    </th>
  ))
  const cells = (row: CompareRow, phone: boolean) => row.cells.map((cell, i) => (
    <td key={columns[i] ?? i} className={cn('text-center', phone ? 'pt-3 pb-4 align-top' : 'py-4 align-middle')}>
      <Mark value={cell} ours={i === last} yes={yes} no={no} />
    </td>
  ))
  return (
    <section data-ds="product-compare" aria-labelledby={`${id}-compare-heading`} className={cn('py-(--ds-layout-section) text-fg', className)}>
      <div className={WRAP}>
        <header className="mb-12 flex flex-col items-center text-center md:items-start md:text-left lg:mb-16">
          <h2 id={`${id}-compare-heading`} className="type-section">{headline}</h2>
          {lead && <p className="mt-6 max-w-(--ds-layout-measure) type-body-lg text-fg-soft">{lead}</p>}
        </header>
        <table className="hidden w-full table-fixed border-collapse md:table">
          <thead><tr><td />{heads}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-edge last:border-b">
                <th scope="row" className="py-5 pr-4 text-left type-body font-normal text-pretty text-fg">{row.label}</th>
                {cells(row, false)}
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full table-fixed border-collapse md:hidden">
          <thead><tr>{heads}</tr></thead>
          {rows.map((row) => (
            <tbody key={row.label} className="border-t border-edge last:border-b">
              <tr><th scope="rowgroup" colSpan={columns.length} className="pt-4 text-left type-ui font-normal text-pretty text-fg">{row.label}</th></tr>
              <tr>{cells(row, true)}</tr>
            </tbody>
          ))}
        </table>
      </div>
    </section>
  )
}

export default ProductCompare
