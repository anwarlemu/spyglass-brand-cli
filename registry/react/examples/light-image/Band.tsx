import { LightImage } from '@/react/components/visuals/LightImage'
// The home hero's band of light across a section, with its ASCII grain where the light falls off.

export default function Band() {
  return (
    <section className="relative isolate flex h-[480px] items-start justify-center overflow-clip bg-surface pt-16">
      <LightImage art="hero-band" className="absolute top-[45%] left-1/2 -z-1 aspect-[2800/696] w-[1600px] -translate-x-1/2 max-md:w-[900px]" />
      <h2 className="type-heading-1 text-fg">The only creative search engine.</h2>
    </section>
  )
}
