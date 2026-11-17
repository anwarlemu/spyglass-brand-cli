import { Input } from '@/react/components/ui/Input'
// A labeled field with a line of help under it.

export default function Field() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-2">
      <label htmlFor="track-brand" className="type-label text-fg-soft">Brand or creator</label>
      <Input id="track-brand" name="brand" placeholder="Acme" />
      <p className="type-caption text-fg-muted">Add any brand or creator in under a minute.</p>
    </div>
  )
}
