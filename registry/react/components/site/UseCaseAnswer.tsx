import { CreativeCard } from '@/react/components/site/CreativeCard'
import { useCaseAnswerCallsLabel, useCaseAnswerChat, type AnswerExample } from '@/lib/use-case-answer'
import { cn } from '@/react/lib/cn'

// The site's use case answer (pages/UseCasesPage/UseCaseAnswer): one question and the answer that came back, on the
// raised panel. In chat mode the question sits in a bubble at the right; in api mode the request shows as code (it
// scrolls sideways, fading at its edges). Then the status, the lead, a table of rows (a creative, a title with its
// detail, a figure), a note and the tools called. Nothing moves.
export interface UseCaseAnswerProps {
  example?: AnswerExample
  /** The label before the calls ("Called"). */
  callsLabel?: string
  className?: string
}

export function UseCaseAnswer({ example: e = useCaseAnswerChat, callsLabel = useCaseAnswerCallsLabel, className }: UseCaseAnswerProps) {
  const api = e.mode === 'api'
  const [itemLabel, figureLabel] = e.columns
  const hasFigure = e.rows.some((r) => r.figure)
  const last = e.rows.length - 1
  return (
    <div data-ds="use-case-answer" data-mode={e.mode} className={cn('flex flex-col gap-6 rounded-panel bg-surface-raised p-4 text-fg md:gap-8 md:p-8', className)}>
      {api && e.request ? (
        <pre tabIndex={0} className="fade-x m-0 overflow-x-auto rounded-ds-sm bg-surface p-4 font-code type-ui text-fg-soft md:p-6"><code>{e.request}</code></pre>
      ) : (
        <p className="max-w-[88%] self-end rounded-ds-lg bg-surface-inset px-4 py-3 type-body text-pretty">
          {e.mention ? <><span className="font-medium">{e.mention}</span> </> : null}
          {e.question}
        </p>
      )}
      <div className="flex flex-col gap-4">
        <p className="type-ui text-fg-muted">{e.status}</p>
        {e.lead ? <p className="type-body font-medium text-pretty">{e.lead}</p> : null}
        <table className="w-full border-collapse type-body">
          <thead>
            <tr>
              <th scope="col" colSpan={2} className={cn('border-b border-edge-surface pb-2 text-left type-ui font-regular text-fg-muted', api && 'font-code')}>{itemLabel}</th>
              {hasFigure ? <th scope="col" className={cn('border-b border-edge-surface pb-2 pl-4 text-right type-ui font-regular whitespace-nowrap text-fg-muted', api && 'font-code')}>{figureLabel}</th> : null}
            </tr>
          </thead>
          <tbody>
            {e.rows.map((row, i) => {
              const cell = i === last ? 'pt-3 align-top' : 'border-b border-edge-surface py-3 align-top'
              return (
                <tr key={row.title}>
                  <td className={cn(cell, 'w-16 pr-4')}>
                    {row.creative ? <CreativeCard src={row.creative.src} alt={row.creative.alt ?? ''} fit={row.creative.fit} position={row.creative.position} brand={row.creative.brand} tone={row.creative.tone} ratio="4/5" className="w-12" /> : null}
                  </td>
                  <td className={cell}>
                    <span className="block font-medium">{row.title}</span>
                    <span className="mt-1 block type-ui text-pretty text-fg-soft">{row.detail}</span>
                  </td>
                  {hasFigure ? <td className={cn(cell, 'pl-4 text-right type-body-lg whitespace-nowrap tabular-nums')}>{row.figure}</td> : null}
                </tr>
              )
            })}
          </tbody>
        </table>
        {e.note ? <p className="border-t border-edge-surface pt-4 type-ui text-pretty text-fg-soft">{e.note}</p> : null}
        <p className="flex flex-wrap items-center gap-2 type-ui">
          <span className="text-fg-muted">{callsLabel}</span>
          {e.calls.map((call) => <code key={call} className="rounded-ds-sm bg-surface-inset px-2 py-1 font-code text-fg">{call}</code>)}
        </p>
      </div>
    </div>
  )
}

export default UseCaseAnswer
