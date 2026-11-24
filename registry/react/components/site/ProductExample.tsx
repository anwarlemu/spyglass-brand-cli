import { CodeBlock } from '@/react/components/site/CodeBlock'
import { Code } from '@/react/components/site/Code'
import { CreativeCard, type CreativeItem } from '@/react/components/site/CreativeCard'
import type { CodeTab } from '@/lib/code'
import { cn } from '@/react/lib/cn'

// The site's product example (pages/Products/Example): one request and what comes back. A row of specs (the endpoint,
// the MCP tool, the rate limit: a muted label beside its value in the code face), then the request as the code block
// (MCP, REST, Python tabs and the copy button) beside the response from 1024, the request staying in view as the page
// scrolls: a #262626 panel with the 8px corner, a 56px head ("Response" and the 200 status, muted, in the code face)
// over the JSON scrolling across and fading at its edge. Under it, optionally, the creatives it returned, three across
// at 3:4 with a line each. Nothing moves but the code block's tab line.
export interface ProductExampleSpec { label: string; value: string }

export interface ProductExampleProps {
  /** The question the request answers, read by assistive tech in the section's heading. */
  question: string
  /** The request, one tab each. */
  tabs: CodeTab[]
  /** The JSON that comes back. */
  response: string
  specs?: ProductExampleSpec[]
  /** The creatives it returned, each with a line under it. */
  media?: { label: string; items: (CreativeItem & { meta: string })[] }
  heading?: string
  codeLabel?: string
  responseLabel?: string
  status?: string
  copy?: { label: string; copiedLabel: string; name: string }
  /** Prefix for ids. */
  id?: string
  className?: string
}

const WRAP = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function ProductExample({
  question,
  tabs,
  response,
  specs = [],
  media,
  heading = 'Request and response',
  codeLabel = 'Request',
  responseLabel = 'Response',
  status = '200',
  copy = { label: 'Copy', copiedLabel: 'Copied', name: 'Copy the request' },
  id = 'product',
  className,
}: ProductExampleProps) {
  return (
    <section data-ds="product-example" id={`${id}-example`} aria-labelledby={`${id}-example-heading`} className={cn('pb-(--ds-layout-section) text-fg', className)}>
      <div className={WRAP}>
        <h2 id={`${id}-example-heading`} className="sr-only">{heading}: {question}</h2>
        {specs.length > 0 && (
          <dl className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
            {specs.map((s) => (
              <div key={s.label} className="flex min-w-0 items-baseline gap-2 type-ui">
                <dt className="flex-none type-label text-fg-muted">{s.label}</dt>
                <dd className="min-w-0 type-code wrap-anywhere">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-2">
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--ds-size-header)+var(--ds-space-2xl))]"><CodeBlock tabs={tabs} label={codeLabel} copy={copy} /></div>
          <div className="flex min-w-0 flex-col gap-8">
            <div className="flex min-w-0 flex-col rounded-panel bg-surface-raised">
              <div className="relative flex h-control-lg flex-none items-center justify-between border-b border-edge-surface px-4 type-ui-strong md:px-6">
                <span>{responseLabel}</span>
                <span className="type-code font-normal text-fg-muted">{status}</span>
              </div>
              <div tabIndex={0} role="region" aria-label={responseLabel} className="fade-x min-w-0 overflow-x-auto rounded-b-panel p-4 outline-offset-[-2px] md:p-6">
                <div className="w-max pr-12"><Code source={response} language="json" /></div>
              </div>
            </div>
            {media && (
              <figure className="m-0 flex flex-col gap-3">
                <figcaption className="type-label text-fg-muted">{media.label}</figcaption>
                <ul role="list" className="m-0 grid list-none grid-cols-3 gap-4 p-0">
                  {media.items.map(({ meta, ...c }, i) => (
                    <li key={`${c.brand ?? ''}-${i}`} className="flex min-w-0 flex-col gap-2">
                      <CreativeCard {...c} ratio="3/4" className="w-full" />
                      <span className="type-ui text-pretty text-fg-soft">{meta}</span>
                    </li>
                  ))}
                </ul>
              </figure>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductExample
