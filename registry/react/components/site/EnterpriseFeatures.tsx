'use client'
import { useEffect, useRef, type CSSProperties } from 'react'
import { ASCII_TEXTURE } from '@/lib/textures'
import { CHAT_MASK, FEATURE_ORDER, LOGOMARK_MASK, REPORTS_START, enterpriseFeaturesContent, runFeature, type EnterpriseFeaturesContent } from '@/lib/enterprise-features'
import { featuresCss } from '@/lib/enterprise-features-css'
import { featureSketch } from '@/lib/enterprise-features-html'
import { cn } from '@/react/lib/cn'

// The site's enterprise features (pages/Enterprise FeatureGrid and Feature*.tsx): the section head, then eight cards
// (one column, two from 640, three and two from 1024: 2-2-2 / 3-3 / 2-2-2 of six) on #262626 with the 8px corner. Each
// card is a 288px sketch (320 from 1024) over a crop of the ASCII texture, then its title (Funnel Display 20/24) and line
// (16/24 in #D4D4D4), 24px in. The sketches loop while a quarter of each is on screen: the data layer lighting its
// wires, the archive streaming and drafting, agents wired to one control plane, two cursors building a workflow, three
// teams' views, a launch simulator, messages carrying ads to channels, and copies deleted after an answer. Reduced
// motion leaves each at rest. Each sketch is described to screen readers. Pictures and marks come through `content`
// (neutral gradients and first letters by default).
export interface EnterpriseFeaturesProps {
  content?: EnterpriseFeaturesContent
  /** The section's id (the heading is `<id>-heading`). */
  id?: string
  className?: string
}

export function EnterpriseFeatures({ content: c = enterpriseFeaturesContent, id = 'enterprise-features', className }: EnterpriseFeaturesProps) {
  const listRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const demos = [...(listRef.current?.querySelectorAll<HTMLElement>('[data-demo]') ?? [])]
    const stops = demos.map((el, i) => runFeature(el, FEATURE_ORDER[i].key, FEATURE_ORDER[i].key === 'reports' ? REPORTS_START : FEATURE_ORDER[i].start))
    return () => stops.forEach((stop) => stop())
  }, [c])

  return (
    <section id={id} aria-labelledby={`${id}-heading`} data-ds="enterprise-features" className={cn('py-(--ds-layout-section) text-fg', className)} style={{ '--ds-ef-logomark': LOGOMARK_MASK, '--ds-ef-chat': CHAT_MASK } as CSSProperties}>
      <style href="ds-enterprise-features" precedence="ds">{featuresCss}</style>
      <div className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)">
        <h2 id={`${id}-heading`} className="ds-ef-head mb-16 type-section max-md:text-center lg:mb-20">{c.headline}</h2>
        <ul ref={listRef} role="list" className="m-0 grid list-none grid-cols-1 gap-(--ds-ent-feat-gap) p-0 sm:grid-cols-2 lg:grid-cols-6">
          {FEATURE_ORDER.map(({ key, ascii }) => (
            <li key={key} data-feature={key} className="ds-ef-card flex min-w-0 flex-col overflow-clip rounded-panel bg-surface-raised">
              <div className="ds-ef-visual">
                <div aria-hidden="true" className="ds-ef-ascii" data-feature={key} style={{ backgroundImage: `url("${ASCII_TEXTURE}")`, backgroundPosition: ascii }} />
                <div className="ds-ef-demo" data-demo="" data-name={c[key].title}>
                  <div className="ds-ef-canvas" aria-hidden="true" inert dangerouslySetInnerHTML={{ __html: featureSketch(key, c) }} />
                  <p className="sr-only">{c[key].summary}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 px-(--ds-ent-feat-pad) pb-(--ds-ent-feat-pad)">
                <h3 className="m-0 type-heading-4">{c[key].title}</h3>
                <p className="m-0 max-w-measure type-body text-pretty text-fg-soft">{c[key].line}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default EnterpriseFeatures
