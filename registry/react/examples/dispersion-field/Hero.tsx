import { DispersionField } from '@/react/components/visuals/DispersionField'
// The hero composition behind a headline, drawn as one fixed frame (`still`); without it the light drifts and a mouse
// brings a lens.

export default function Hero() {
  return (
    <section className="relative isolate flex h-[560px] flex-col items-center justify-center gap-4 overflow-clip bg-surface px-6 text-center">
      <DispersionField composition="hero" seed={0} still className="absolute inset-0 -z-1 size-full" />
      <h2 className="max-w-2xl type-hero text-fg">The only creative search engine.</h2>
    </section>
  )
}
