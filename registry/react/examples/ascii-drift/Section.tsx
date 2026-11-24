import { AsciiDrift } from '@/react/components/visuals/AsciiDrift'
// Two crops behind a section: a mass fading in from the top left, a cluster from the bottom right.

export default function Section() {
  return (
    <section className="relative isolate flex min-h-96 flex-col items-center justify-center gap-4 overflow-clip bg-surface px-6 text-center">
      <AsciiDrift crop="mass" from="left" className="top-0 left-0 h-[60%] w-[50%]" />
      <AsciiDrift crop="cluster" from="right" strength="faint" className="right-0 bottom-0 h-[60%] w-[50%]" />
      <h2 className="type-heading-2 text-fg">The only creative search engine.</h2>
      <p className="type-body text-fg-muted">Search every ad Acme ran this year.</p>
    </section>
  )
}
