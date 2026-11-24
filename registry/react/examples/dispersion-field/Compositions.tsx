import { DispersionField, type FieldComposition } from '@/react/components/visuals/DispersionField'
// Each composition as one fixed frame, seeded as the site seeds it.

const SETS: Array<[FieldComposition, number]> = [['hero', 0], ['close', 3], ['band', 0], ['frame', 5], ['logo', 0], ['crown', 0], ['works', 7], ['wordmark', 0], ['run', 0]]

export default function Compositions() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {SETS.map(([c, seed]) => (
        <figure key={c} className="flex flex-col gap-2">
          <div className="relative isolate aspect-[16/10] overflow-clip rounded-container bg-surface">
            <DispersionField composition={c} seed={seed} still className="absolute inset-0 size-full" />
          </div>
          <figcaption className="type-caption text-fg-muted">{c}</figcaption>
        </figure>
      ))}
    </div>
  )
}
