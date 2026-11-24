import { AsciiTrail } from '@/react/components/visuals/AsciiTrail'
// A section with the trail: move a mouse across it (768 wide and up) and characters follow the pointer, then fade.

export default function Section() {
  return (
    <section className="relative isolate flex h-96 flex-col items-center justify-center gap-4 overflow-clip rounded-container bg-surface px-6 text-center inset-ring inset-ring-edge">
      <AsciiTrail className="inset-0 -z-1 size-full" />
      <h2 className="type-heading-2 text-fg">Move the pointer here.</h2>
      <p className="type-body text-fg-muted">The trail fades in 700ms and stays off on touch and with reduced motion.</p>
    </section>
  )
}
