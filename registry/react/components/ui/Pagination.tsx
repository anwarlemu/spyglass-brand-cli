'use client'
import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import { useControllable } from '@/react/hooks/useControllable'
import { cn } from '@/react/lib/cn'

// Pages of a long list: Previous and Next around the page numbers, 32px ghost buttons in DM Sans 14px that fill under
// the pointer. The current page sits in a #363636 hairline box in White, the others muted; the first and last pages
// always show, `siblings` pages either side of the current one, and an ellipsis for the rest. On phones Previous and
// Next keep only their chevrons. The page is `page` with `onPageChange` (or `defaultPage` alone), from 1.
export interface PaginationProps {
  /** The page shown, from 1. */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** How many pages. */
  pages: number
  /** Pages shown either side of the current one. */
  siblings?: number
  /** The nav's name for assistive tech. */
  label?: string
  className?: string
}

/** The pages to draw: numbers, and 'gap' where an ellipsis stands for the rest. */
export function pageRange(page: number, pages: number, siblings = 1): (number | 'gap')[] {
  const out: (number | 'gap')[] = []
  const from = Math.max(2, page - siblings)
  const to = Math.min(pages - 1, page + siblings)
  out.push(1)
  if (from > 2) out.push(from === 3 ? 2 : 'gap')
  for (let p = from; p <= to; p++) out.push(p)
  if (to < pages - 1) out.push(to === pages - 2 ? pages - 1 : 'gap')
  if (pages > 1) out.push(pages)
  return out
}

const BASE = 'inline-flex h-control-sm min-w-control-sm cursor-pointer items-center justify-center gap-1.5 rounded-control px-2 type-ui whitespace-nowrap select-none transition-[background-color,color,scale] duration-150 ease-out active:not-disabled:scale-97 motion-reduce:active:not-disabled:scale-100 disabled:cursor-not-allowed disabled:text-fg-faint'
const IDLE = 'text-fg-muted hover:not-disabled:bg-action-ghost-hover hover:not-disabled:text-fg'
const CURRENT = 'border border-edge-strong text-fg'

export function Pagination({ page: given, defaultPage = 1, onPageChange, pages, siblings = 1, label = 'Pages', className }: PaginationProps) {
  const [page, setPage] = useControllable(given, defaultPage, onPageChange)
  const go = (p: number) => setPage(Math.min(pages, Math.max(1, p)))
  return (
    <nav data-ds="pagination" aria-label={label} className={cn('flex justify-center', className)}>
      <ul className="flex items-center gap-1">
        <li>
          <button type="button" className={cn(BASE, IDLE)} aria-label="Go to previous page" disabled={page <= 1} onClick={() => go(page - 1)}>
            <ChevronLeft size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="max-sm:hidden">Previous</span>
          </button>
        </li>
        {pageRange(page, pages, siblings).map((p, i) => (
          <li key={p === 'gap' ? `gap-${i}` : p}>
            {p === 'gap'
              ? <span className="flex size-control-sm items-center justify-center text-fg-muted" aria-hidden="true"><Ellipsis size={16} strokeWidth={1.5} /></span>
              : <button type="button" className={cn(BASE, p === page ? CURRENT : IDLE)} aria-current={p === page ? 'page' : undefined} aria-label={`Page ${p}`} onClick={() => go(p)}>{p}</button>}
          </li>
        ))}
        <li>
          <button type="button" className={cn(BASE, IDLE)} aria-label="Go to next page" disabled={page >= pages} onClick={() => go(page + 1)}>
            <span className="max-sm:hidden">Next</span>
            <ChevronRight size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
