import { Logo } from '@/react/components/visuals/Logo'
// The secondary background: a Black mark on White.

export default function Tones() {
  return (
    <div data-theme="light" className="flex items-center gap-8 rounded-container bg-surface px-10 py-8">
      <Logo variant="horizontal" height={32} />
      <Logo variant="mark" tone="black" height={32} label="Spyglass logomark" />
    </div>
  )
}
