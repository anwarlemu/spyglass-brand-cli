import { Brackets } from '@/react/components/visuals/Brackets'
// Brackets locking on to a tile, and a wider pair with longer arms around a figure.

export default function Target() {
  return (
    <div className="flex flex-wrap items-center gap-16">
      <div className="relative size-32 rounded-container bg-surface-raised">
        <Brackets />
      </div>
      <div className="relative px-4 py-2">
        <span className="font-heading text-heading-2 text-fg">1,284 ads</span>
        <Brackets offset={8} arm={12} />
      </div>
    </div>
  )
}
