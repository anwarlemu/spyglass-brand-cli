'use client'

import { SiteHeader } from '@/react/components/site/SiteHeader'
import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
import { UseCaseHero } from '@/react/components/site/UseCaseHero'
import { ConnectMenu } from '@/react/components/site/ConnectMenu'
import { ProofBlock } from '@/react/components/site/ProofBlock'
import { ScrollStory } from '@/react/components/blocks/ScrollStory'
import { StoriesBlock } from '@/react/components/blocks/StoriesBlock'
import { UseCaseWheel } from '@/react/components/blocks/UseCaseWheel'
import { FaqBlock } from '@/react/components/blocks/FaqBlock'
import { PageClose } from '@/react/components/site/PageClose'
import { SiteFooter } from '@/react/components/blocks/SiteFooter'
import { DispersionField } from '@/react/components/visuals/DispersionField'
import type { ChatContent, BuildContent } from '@/lib/use-case-hero'
import { useCaseContent, type UseCaseContent } from '@/lib/pages/use-case'
import { cn } from '@/react/lib/cn'

// A use case's page as the site sets it (app/use-cases/[slug], pages/UseCasesPage/UseCaseDetail): the header, the
// hero (the name, the line, the connect menu with a quiet button and the chat answering beside them, or the build
// visual), the proof line over the marquee of marks, the scroll story with its two buttons, the stories in three cards
// (Acme's, with initials), the wheel of audiences with the light around its ring, the FAQ with the docs button, the
// closing section and the footer. `content` replaces the copy (lib/pages/use-case.ts); `visual`, `chat` and `build` go
// to the hero; `still` holds the wheel and its light (for a still preview).
export interface UseCasePageProps {
  content?: UseCaseContent
  visual?: 'chat' | 'build'
  chat?: ChatContent
  build?: BuildContent
  /** Hold the wheel and its light still. */
  still?: boolean
  className?: string
}

const CONTAINER = 'mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter)'

export function UseCasePage({ content: c = useCaseContent, visual = 'chat', chat, build, still = false, className }: UseCasePageProps) {
  return (
    <div data-ds="use-case-page" className={cn('isolate bg-surface text-fg', className)}>
      <AsciiTrail mode="page" />
      <SiteHeader links={c.chrome.header.nav} secondary={c.chrome.header.secondary} cta={c.chrome.header.cta} />
      <main id="main">
        <UseCaseHero content={c.hero} visual={visual} chat={chat} build={build} control={c.control === 'mcp' ? <ConnectMenu /> : undefined} />
        <ProofBlock id={`${c.slug}-proof`} title={c.proof} />
        <ScrollStory preset={c.story.preset} actions={c.story.actions} />
        <StoriesBlock id={`${c.slug}-stories`} headline={c.stories.headline} lead={c.stories.lead} stories={c.stories.items} customers={false} />
        <UseCaseWheel id="v2-use-cases" autoplay={!still} light={(ripple) => <DispersionField composition="ring" seed={5} ripple={ripple} still={still} className="relative size-full" />} />
        <div className={cn(CONTAINER, 'py-(--ds-layout-section)')}>
          <FaqBlock id={`${c.slug}-faq`} title={c.faq.headline} body={c.faq.lead} action={c.faq.docs} items={c.faq.items} />
        </div>
        <PageClose />
      </main>
      <SiteFooter columns={c.chrome.footer.columns} legal={c.chrome.footer.legal} />
    </div>
  )
}

export default UseCasePage
