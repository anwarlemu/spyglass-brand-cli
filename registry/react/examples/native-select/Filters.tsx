import { NativeSelect } from '@/react/components/ui/NativeSelect'
// Two filters over a search: where the ads ran and how long ago.

export default function Filters() {
  return (
    <div className="grid w-full max-w-120 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor="native-select-platform" className="type-label text-fg-soft">Platform</label>
        <NativeSelect id="native-select-platform" name="platform" defaultValue="meta">
          <option value="all">All platforms</option>
          <option value="meta">Meta</option>
          <option value="tiktok">TikTok</option>
          <option value="youtube">YouTube</option>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="native-select-range" className="type-label text-fg-soft">Running for</label>
        <NativeSelect id="native-select-range" name="range" defaultValue="30">
          <option value="7">Over 7 days</option>
          <option value="30">Over 30 days</option>
          <option value="90">Over 90 days</option>
        </NativeSelect>
      </div>
    </div>
  )
}
