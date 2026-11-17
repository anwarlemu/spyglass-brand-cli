import { Textarea } from '@/react/components/ui/Textarea'
// A brief for a new board: a few lines about what to collect, with a line of help under it.

export default function Brief() {
  return (
    <div className="flex w-96 max-w-full flex-col gap-2">
      <label htmlFor="textarea-brief" className="type-label text-fg-soft">Board brief</label>
      <Textarea id="textarea-brief" name="brief" placeholder="Hooks that open on the product in the first second." />
      <p className="type-caption text-fg-muted">The team sees this at the top of the board.</p>
    </div>
  )
}
