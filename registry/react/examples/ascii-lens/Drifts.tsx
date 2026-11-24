import { AsciiLens } from '@/react/components/visuals/AsciiLens'
import { AsciiDrift } from '@/react/components/visuals/AsciiDrift'
// The lens over a section's drifts: move a mouse near them (768 wide and up) and more characters gather by the pointer.

export default function Drifts() {
  return (
    <section className="relative isolate flex h-96 flex-col items-center justify-center gap-4 overflow-clip bg-surface px-6 text-center">
      <AsciiLens />
      <AsciiDrift crop="mass" from="left" className="top-0 left-0 h-full w-[45%]" />
      <AsciiDrift crop="scatter" from="right" className="top-0 right-0 h-full w-[45%]" />
      <h2 className="type-heading-2 text-fg">Point at the texture.</h2>
    </section>
  )
}
