import { AsciiDrift } from '@/react/components/visuals/AsciiDrift'
// The hero strength: the full texture with a wide core, a column crop down the left side.

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-96 items-center overflow-clip bg-surface px-12">
      <AsciiDrift crop="column" from="left" strength="hero" className="inset-y-0 left-0 w-[40%]" />
      <h2 className="ms-[30%] max-w-md type-heading-1 text-fg">Stop screenshotting at midnight.</h2>
    </section>
  )
}
