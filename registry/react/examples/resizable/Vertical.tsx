import { Resizable } from '@/react/components/ui/Resizable'
// A search over its notes, one above the other; the bare hairline is the handle.

export default function Vertical() {
  return (
    <Resizable
      direction="vertical"
      className="h-72 w-full max-w-md rounded-container border border-edge"
      label="Resize results and notes"
      defaultValue={60}
      first={<div className="p-4"><p className="type-label text-fg-soft">Results</p><p className="mt-2 type-ui text-fg">36 creatives match Acme hooks.</p></div>}
      second={<div className="p-4"><p className="type-label text-fg-soft">Notes</p><p className="mt-2 type-ui text-fg-muted">Open on the product, in use.</p></div>}
    />
  )
}
