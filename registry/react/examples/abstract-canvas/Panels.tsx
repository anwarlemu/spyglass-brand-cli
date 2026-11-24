import { AbstractCanvas } from '@/react/components/visuals/AbstractCanvas'
// The three drawings side by side, each held at its settled moment (`freeze`); without it they loop while on screen.

export default function Panels() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <AbstractCanvas kind="archive" freeze="settled" />
      <AbstractCanvas kind="tags" freeze="settled" />
      <AbstractCanvas kind="graph" brand="Acme" freeze="settled" />
    </div>
  )
}
