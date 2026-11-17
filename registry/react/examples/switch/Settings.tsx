import { Switch } from '@/react/components/ui/Switch'
// Notification settings: each row says what the switch does, one on, one off, and one the plan locks.

const rows = [
  { title: 'Weekly digest', text: 'New ads from the brands you track, every Monday.', on: true },
  { title: 'New creative alerts', text: 'An email the day a tracked brand launches an ad.', on: false },
  { title: 'Share outside Acme', text: 'Available on the Team plan.', on: false, locked: true },
]

export default function Settings() {
  return (
    <div className="flex w-120 max-w-full flex-col divide-y divide-edge rounded-container bg-surface-raised px-6">
      {rows.map((r) => (
        <div key={r.title} className="flex items-center justify-between gap-6 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="type-ui-strong text-fg">{r.title}</p>
            <p className="type-caption text-fg-muted">{r.text}</p>
          </div>
          <Switch label={r.title} defaultChecked={r.on} disabled={r.locked} />
        </div>
      ))}
    </div>
  )
}
