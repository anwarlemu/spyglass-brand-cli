import { StatBlock } from '@/react/components/blocks/StatBlock'
// An Acme team's numbers, on the card fill.

const stats = [
  { value: '128', label: 'Brands tracked' },
  { value: '42', label: 'Boards shared' },
  { value: '9', label: 'Alerts this week' },
  { value: '12', label: 'Seats in use' },
]

export default function Cards() {
  return <StatBlock stats={stats} variant="card" />
}
