import { Slider } from '@/react/components/ui/Slider'
// The range's ends and middle, and one that can't be changed.

export default function States() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-4">
      <Slider label="Share of video ads" defaultValue={0} />
      <Slider label="Share of image ads" defaultValue={50} />
      <Slider label="Share of new creatives" defaultValue={100} />
      <Slider label="Locked share" defaultValue={40} disabled />
    </div>
  )
}
