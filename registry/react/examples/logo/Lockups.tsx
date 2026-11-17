import { Logo } from '@/react/components/visuals/Logo'
// Every lockup in White on Black, the primary background.

export default function Lockups() {
  return (
    <div className="grid items-center gap-8 sm:grid-cols-2">
      <Logo variant="horizontal" height={40} />
      <Logo variant="vertical" height={96} />
      <Logo variant="mark" height={40} label="Spyglass logomark" />
      <Logo variant="wordmark" height={40} />
      <Logo variant="horizontal-3d" height={48} />
      <Logo variant="vertical-3d" height={96} />
      <Logo variant="mark-3d" height={48} label="Spyglass 3D logomark" />
    </div>
  )
}
