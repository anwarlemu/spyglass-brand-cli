'use client'
import { useId, useState } from 'react'
import { Segmented } from '@/react/components/site/Segmented'
import { cn } from '@/react/lib/cn'

// The site's plan comparison (pages/Pricing CompareTable.tsx, Pricing.module.css .compare*): one table per group, its
// head sticking under the page header while the group scrolls (the title in Funnel Display 32/36, 40/44 from 1024, and
// the plans' names 20/24, fading out over its last 48px), then a row per line: the name in DM Sans 16/24 White, each
// plan's cell a value in #A3A3A3, a White 24px disc with a Black check when included, or nothing. Rows ruled apart by
// #363636 hairlines, 16px in; 96px between groups (64 on phones). A name with a `tip` takes a dotted underline and
// shows the tip above it on hover (after 80ms) or focus, rising 4px over 160ms; with `href` it is a link. `soon` adds
// the small Soon tag. On phones the table shows one plan at a time, picked with the segmented switch in each head.
export type CompareCell = true | '' | string

export interface CompareRow {
  label: string
  /** A short explanation, shown above the name on hover or focus. */
  tip?: string
  /** Makes the name a link. */
  href?: string
  /** Adds the Soon tag. */
  soon?: boolean
  /** One per plan: true (included), '' (not included) or a value. */
  cells: CompareCell[]
}

export interface CompareGroup {
  title: string
  rows: CompareRow[]
}

export interface ComparePlan {
  key: string
  name: string
}

export interface CompareTableProps {
  plans: ComparePlan[]
  groups: CompareGroup[]
  /** The plan shown first on phones (a plan's key). */
  defaultPlan?: string
  /** The words for assistive tech and the tag. */
  labels?: { soon?: string, included?: string, notIncluded?: string, pick?: string }
  className?: string
}

const LABELS = { soon: 'Soon', included: 'Included', notIncluded: 'Not included', pick: 'Plan' }

function Name({ row, soon }: { row: CompareRow, soon: string }) {
  const tipId = useId()
  const tag = row.soon ? <span className="ds-compare-soon rounded-ds-sm bg-surface-subtle px-2 py-1 text-fg-soft">{soon}</span> : null
  const term = 'ds-compare-link type-body text-fg'
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {row.tip ? (
        <span className="ds-compare-term relative">
          {row.href
            ? <a className={term} href={row.href} aria-describedby={tipId}>{row.label}</a>
            : <button type="button" className={cn(term, 'cursor-default border-0 bg-transparent p-0 text-start')} aria-describedby={tipId}>{row.label}</button>}
          <span id={tipId} role="tooltip" className="ds-compare-tip pointer-events-none absolute bottom-[calc(100%+var(--ds-space-sm))] left-0 w-max rounded-panel bg-surface-subtle px-4 py-3 type-ui text-fg shadow-[inset_0_0_0_var(--ds-border-hairline)_var(--ds-color-edge)]">{row.tip}</span>
        </span>
      ) : <span className="type-body text-fg">{row.label}</span>}
      {tag}
    </span>
  )
}

export function CompareTable({ plans, groups, defaultPlan, labels, className }: CompareTableProps) {
  const l = { ...LABELS, ...labels }
  const [pick, setPick] = useState(defaultPlan ?? plans[0]?.key)
  const cols = { gridTemplateColumns: `minmax(0, 2fr) repeat(${plans.length}, minmax(0, 1fr))` }
  const row = 'grid items-center gap-x-4 max-md:grid-cols-[minmax(0,1fr)_auto]! md:gap-x-6'
  const shown = (key: string) => (key === pick ? '' : 'max-md:hidden')
  return (
    <div data-ds="compare-table" className={cn('grid text-fg', className)}>
      <style href="ds-compare-table" precedence="ds">{css}</style>
      {groups.map((g) => (
        <table key={g.title} aria-label={g.title} className="block border-collapse pb-16 last:pb-0 md:pb-24">
          <thead className="ds-compare-head sticky top-16 z-2 block py-4 md:pt-6 md:pb-12 lg:top-header">
            <tr className={cn(row, 'max-md:block')} style={cols}>
              <th scope="col" className="p-0 text-start type-heading-2 lg:type-figure">{g.title}</th>
              {plans.map((p) => <th key={p.key} scope="col" className="p-0 text-start type-heading-4 max-md:hidden">{p.name}</th>)}
            </tr>
            <tr className="mt-4 block md:hidden">
              <td className="block p-0" colSpan={plans.length + 1}>
                <Segmented label={l.pick} block value={pick} onValueChange={setPick} options={plans.map((p) => ({ key: p.key, label: p.name }))} />
              </td>
            </tr>
          </thead>
          <tbody className="block">
            {g.rows.map((r) => (
              <tr key={r.label} className={cn(row, 'border-edge py-4 not-first:border-t')} style={cols}>
                <th scope="row" className="min-w-0 p-0 text-start font-normal"><Name row={r} soon={l.soon} /></th>
                {r.cells.map((v, i) => (
                  <td key={plans[i]?.key ?? i} className={cn('p-0 text-start max-md:text-end', shown(plans[i]?.key))}>
                    {v === true ? (
                      <span className="inline-grid size-6 place-items-center rounded-full bg-fg align-middle text-(--ds-color-black)">
                        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-4"><path d="M4 8.5 6.75 11.25 12 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="sr-only">{l.included}</span>
                      </span>
                    ) : v === '' ? <span className="sr-only">{l.notIncluded}</span> : <span className="type-body text-fg-muted tabular-nums">{v}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </div>
  )
}

export default CompareTable

// The head's fade (the site's 48px ramp to the page ground) and the tip's timing: shown on focus at once, on a fine
// pointer's hover after 80ms; leaving, it fades over 160ms before it is hidden.
const css = `
.ds-compare-head {
  --fade: var(--ds-space-3xl);
  background: linear-gradient(to bottom, var(--ds-color-surface) calc(100% - var(--fade)), color-mix(in srgb, var(--ds-color-surface) 85%, transparent) calc(100% - var(--fade) * 0.75), color-mix(in srgb, var(--ds-color-surface) 60%, transparent) calc(100% - var(--fade) * 0.5), color-mix(in srgb, var(--ds-color-surface) 30%, transparent) calc(100% - var(--fade) * 0.25), transparent);
}
.ds-compare-term:hover, .ds-compare-term:focus-within { z-index: 3; }
.ds-compare-soon { font-family: var(--ds-font-text); font-size: var(--ds-text-caption); line-height: var(--ds-text-caption-leading); font-weight: var(--ds-font-weight-medium); }
.ds-compare-link {
  text-decoration: underline dotted var(--ds-color-fg-muted);
  text-decoration-thickness: var(--ds-border-hairline);
  text-underline-offset: var(--ds-space-xs);
  transition: text-decoration-color var(--ds-duration-micro) var(--ds-easing-out);
}
.ds-compare-link:focus-visible { outline: 2px solid var(--ds-color-fg); outline-offset: var(--ds-space-xs); border-radius: var(--ds-radius-sm); }
.ds-compare-tip {
  max-width: min(var(--ds-compare-tip-w), calc(100vw - 2 * var(--ds-layout-gutter)));
  opacity: 0; visibility: hidden; translate: 0 var(--ds-space-xs);
  transition: opacity var(--ds-duration-micro) var(--ds-easing-out), translate var(--ds-duration-micro) var(--ds-easing-out), visibility 0s linear var(--ds-duration-micro);
}
.ds-compare-term:focus-within .ds-compare-tip {
  opacity: 1; visibility: visible; translate: 0 0;
  transition: opacity var(--ds-duration-micro) var(--ds-easing-out), translate var(--ds-duration-micro) var(--ds-easing-out);
}
@media (hover: hover) and (pointer: fine) {
  .ds-compare-link:hover { text-decoration-color: var(--ds-color-fg); }
  .ds-compare-term:hover .ds-compare-tip {
    opacity: 1; visibility: visible; translate: 0 0;
    transition: opacity var(--ds-duration-micro) var(--ds-easing-out) var(--ds-compare-tip-delay), translate var(--ds-duration-micro) var(--ds-easing-out) var(--ds-compare-tip-delay);
  }
}
@media (prefers-reduced-motion: reduce) { .ds-compare-tip { translate: none; } }
`
