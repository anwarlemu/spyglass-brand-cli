import { Badge } from '@/react/components/ui/Badge'
// The four variants, and the dots a creative's status takes.

export default function Variants() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge>New</Badge>
        <Badge variant="secondary">Video</Badge>
        <Badge variant="outline">Carousel</Badge>
        <Badge variant="destructive">Paused</Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="outline" dot="green">Running</Badge>
        <Badge variant="outline" dot="yellow">Testing</Badge>
        <Badge variant="outline" dot="red">Ended</Badge>
      </div>
    </div>
  )
}
