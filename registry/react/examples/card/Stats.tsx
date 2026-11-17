import { Card } from '@/react/components/ui/Card'
// Cards for a dashboard: one number each, with what it counts under it.

export default function Stats() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card title="1,240" description="New Acme creatives this week" />
      <Card title="38" description="Brands tracked by the Acme team" />
      <Card title="6" description="Boards shared with the agency" />
    </div>
  )
}
