import { Combobox } from '@/react/components/ui/Combobox'
// A short list needs no filter: a plain listbox. Typing a letter jumps to the format it starts.
const formats = [
  { value: 'all', label: 'All formats', pinned: true },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'ugc', label: 'UGC' },
]

export default function Format() {
  return (
    <div className="h-72 w-56 max-w-full">
      <Combobox defaultValue="all" options={formats} label="Format" filter={false} matchWidth />
    </div>
  )
}
