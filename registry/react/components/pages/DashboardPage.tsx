import { Button } from '@/react/components/ui/Button'
import { Logo } from '@/react/components/visuals/Logo'
import { dashboardContent, type DashboardContent } from '@/lib/pages/dashboard'
import { cn } from '@/react/lib/cn'

// A product dashboard in the site's look: a side rail on #1A1A1A with the lockup and the sections (14/20 links that fill
// #262626 under the pointer, the current one White on it), and the main area on Black with the title and the one White
// button, four figures on #262626 cards (Funnel Display 40/44 over a #A3A3A3 label), and the latest rows in a hairline
// table on a card. The rail sits on top on phones. Data comes through `content`.
export interface DashboardPageProps {
  content?: DashboardContent
  className?: string
}

const LINK = 'flex h-control-xs items-center rounded-control px-3 type-ui text-fg-soft transition-[color,background-color] duration-160 ease-out hover:bg-surface-raised hover:text-fg aria-[current=page]:bg-surface-raised aria-[current=page]:text-fg'

export function DashboardPage({ content: c = dashboardContent, className }: DashboardPageProps) {
  return (
    <div data-ds="dashboard-page" className={cn('grid min-h-dvh bg-surface text-fg lg:grid-cols-[256px_minmax(0,1fr)]', className)}>
      <aside className="flex flex-col gap-6 border-b border-edge bg-surface-subtle p-4 lg:border-r lg:border-b-0">
        <a href="/" aria-label="Home" className="self-start rounded-control px-2 py-2"><Logo height={20} /></a>
        <nav aria-label="Sections">
          <ul role="list" className="m-0 flex list-none gap-1 overflow-x-auto p-0 max-lg:fade-x lg:flex-col">
            {c.nav.map((n) => <li key={n.href} className="shrink-0"><a href={n.href} aria-current={n.current ? 'page' : undefined} className={LINK}>{n.label}</a></li>)}
          </ul>
        </nav>
      </aside>
      <main className="grid content-start gap-8 p-6 lg:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="type-heading-2">{c.title}</h1>
          <Button href={c.action.href}>{c.action.label}</Button>
        </div>
        <ul role="list" className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {c.stats.map((s) => (
            <li key={s.label} className="grid gap-2 rounded-container bg-surface-raised p-6">
              <span className="type-figure">{s.value}</span>
              <span className="type-ui text-fg-muted">{s.label}</span>
            </li>
          ))}
        </ul>
        <section className="grid gap-4 rounded-container bg-surface-raised p-6">
          <h2 className="type-heading-3">{c.tableTitle}</h2>
          <div className="overflow-x-auto fade-x">
            <table className="w-full border-collapse type-ui">
              <thead>
                <tr>{c.columns.map((col, i) => <th key={col} className={cn('border-b border-edge-surface py-2.5 type-label font-medium text-fg-muted', i === 0 ? 'text-left' : 'text-right')}>{col}</th>)}</tr>
              </thead>
              <tbody>
                {c.rows.map((r) => <tr key={r[0]}>{r.map((cell, i) => <td key={i} className={cn('border-b border-edge-surface py-3', i === 0 ? 'text-left text-fg' : 'text-right tabular-nums text-fg-soft')}>{cell}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
