'use client'
import { DataTable } from '@/react/components/ui/DataTable'
// A board's creatives on sample data: filter by format and status, sort by days running, spend or impressions, five
// to a page.
const formats = ['Video', 'Carousel', 'Image']
const statuses = ['Active', 'Paused']
const names = ['summer UGC', 'serum launch', 'founder story', 'bundle offer', 'before and after', 'unboxing', 'routine in 30 seconds', 'holiday gift set']
const rows = Array.from({ length: 17 }, (_, i) => ({
  id: `cr-${i + 1}`,
  name: `Acme ${names[i % names.length]!}${i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''}`,
  format: formats[i % 3]!,
  status: statuses[i % 4 === 3 ? 1 : 0]!,
  days: ((i * 17) % 80) + 3,
  spend: ((i * 7919) % 42000) + 1800,
  impressions: ((i * 104729) % 2400000) + 86000,
}))
const columns = [
  { key: 'name', label: 'Creative', sortable: true },
  { key: 'format', label: 'Format' },
  { key: 'status', label: 'Status', muted: true },
  { key: 'days', label: 'Days running', align: 'right' as const, sortable: true },
  { key: 'spend', label: 'Spend', align: 'right' as const, sortable: true },
  { key: 'impressions', label: 'Impressions', align: 'right' as const, sortable: true },
]
const filters = [{ key: 'format', label: 'Format', options: formats }, { key: 'status', label: 'Status', options: statuses }]

export default function Creatives() {
  return (
    <div className="min-h-110 w-full">
      <DataTable columns={columns} rows={rows} rowKey="id" label="Board creatives" filters={filters} cell={{ spend: ({ value }) => `$${Number(value).toLocaleString('en-US')}` }} />
    </div>
  )
}
