import { ToggleGroup } from '@/react/components/ui/ToggleGroup'
// Which formats to show: several can stay on. And a size for the grid: one at most.

export default function Formats() {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col items-start gap-2">
        <p className="type-label text-fg-soft">Formats</p>
        <ToggleGroup label="Formats" multiple defaultValue={['Video', 'Image']} options={['Video', 'Image', 'Carousel', { value: 'Story', label: 'Story', disabled: true }]} />
      </div>
      <div className="flex flex-col items-start gap-2">
        <p className="type-label text-fg-soft">Grid</p>
        <ToggleGroup label="Grid" size="sm" defaultValue="Medium" options={['Small', 'Medium', 'Large']} />
      </div>
    </div>
  )
}
