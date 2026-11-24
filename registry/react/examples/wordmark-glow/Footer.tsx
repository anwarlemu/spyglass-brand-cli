import { WordmarkGlow } from '@/react/components/visuals/WordmarkGlow'
// The footer's other look: the wordmark over its dot grid, a card pulled up over the descender. Point at the dots and
// the letters (768 wide and up) and they light in the spectrum.

export default function Footer() {
  return (
    <WordmarkGlow className="mx-auto w-full max-w-[calc(var(--ds-layout-content)+2*var(--ds-layout-gutter))] px-(--ds-layout-gutter) pt-16 pb-8">
      <div className="relative z-1 -mt-[2.54%] rounded-panel border border-edge bg-surface-raised p-12 max-md:p-6">
        <p className="type-body text-fg-soft">Acme's footer links sit here.</p>
      </div>
    </WordmarkGlow>
  )
}
