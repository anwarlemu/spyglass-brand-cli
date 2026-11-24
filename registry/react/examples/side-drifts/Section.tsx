import { SideDrifts } from '@/react/components/visuals/SideDrifts'
// A full-width section with drifts at both sides (shown from 1440 wide): the left one at the top, the right one lower.

export default function Section() {
  return (
    <section className="relative isolate flex min-h-[640px] flex-col items-center justify-center gap-4 overflow-clip bg-surface px-6 text-center">
      <SideDrifts left="top" right="bottom" />
      <h2 className="type-heading-2 text-fg">How it works</h2>
      <p className="max-w-xl type-body text-fg-muted">Ask in plain words. Acme's library answers with the ads that fit, ranked by how long they ran.</p>
    </section>
  )
}
