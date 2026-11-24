import { LightImage } from '@/react/components/visuals/LightImage'
// The pricing light with its mask: move a mouse over it (768 wide and up) and a lens magnifies the light and widens its
// colour split. On touch, narrow screens and with reduced motion it stays the picture.

export default function Lens() {
  return (
    <section className="relative isolate h-[520px] overflow-clip bg-surface">
      <LightImage art="pricing" className="absolute top-0 left-1/2 aspect-[2640/1400] w-[980px] -translate-x-1/2 [mask-image:linear-gradient(to_right,transparent,var(--ds-color-black)_40%)]" />
    </section>
  )
}
