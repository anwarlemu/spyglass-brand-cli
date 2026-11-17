import { NativeSelect } from '@/react/components/ui/NativeSelect'
// The three sizes, matching the input's and the button's.

export default function Sizes() {
  return (
    <div className="flex w-64 max-w-full flex-col gap-3">
      <NativeSelect size="sm" aria-label="Sort, small" defaultValue="spend"><option value="spend">Sort by spend</option><option value="new">Newest first</option></NativeSelect>
      <NativeSelect size="md" aria-label="Sort, medium" defaultValue="spend"><option value="spend">Sort by spend</option><option value="new">Newest first</option></NativeSelect>
      <NativeSelect size="lg" aria-label="Sort, large" defaultValue="spend"><option value="spend">Sort by spend</option><option value="new">Newest first</option></NativeSelect>
    </div>
  )
}
