import { Resizable } from '@/react/components/ui/Resizable'
// Boards beside the creative that is open, with a grip on the line between them.

export default function Panes() {
  return (
    <Resizable
      className="h-64 w-full max-w-xl rounded-container border border-edge"
      label="Resize boards and creative"
      defaultValue={40}
      withHandle
      first={
        <div className="flex h-full flex-col gap-2 p-4">
          <p className="type-label text-fg-soft">Boards</p>
          <p className="type-ui text-fg">Acme hooks</p>
          <p className="type-ui text-fg-muted">Acme summer launch</p>
          <p className="type-ui text-fg-muted">UGC openers</p>
        </div>
      }
      second={
        <div className="flex h-full flex-col gap-3 p-4">
          <p className="type-label text-fg-soft">Creative</p>
          <div className="flex-1 rounded-control bg-surface-raised" />
          <p className="type-caption text-fg-muted">Acme ad, live for 42 days.</p>
        </div>
      }
    />
  )
}
