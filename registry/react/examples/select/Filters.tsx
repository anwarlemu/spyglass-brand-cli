import { Select } from '@/react/components/ui/Select'
// Two filters for a search: a platform to pick (a placeholder until then) and the order, already chosen.
const platforms = [
  { value: 'meta', label: 'Meta' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'linkedin', label: 'LinkedIn', disabled: true },
]
const orders = [
  { value: 'newest', label: 'Newest first' },
  { value: 'longest', label: 'Longest running' },
  { value: 'saved', label: 'Most saved' },
]

export default function Filters() {
  return (
    <div className="flex min-h-72 w-72 max-w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="select-platform" className="type-label text-fg-soft">Platform</label>
        <Select id="select-platform" label="Platform" name="platform" options={platforms} placeholder="Any platform" />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="select-order" className="type-label text-fg-soft">Sort by</label>
        <Select id="select-order" label="Sort by" name="order" options={orders} defaultValue="longest" />
        <p className="type-caption text-fg-muted">Ads that run longer are the ones that work.</p>
      </div>
    </div>
  )
}
