import { Separator } from '@/react/components/ui/Separator'
// A board's title over a hairline, and its links split by short vertical lines.

export default function Profile() {
  return (
    <div className="flex w-80 max-w-full flex-col">
      <div className="flex flex-col gap-1">
        <p className="type-ui-strong text-fg">Acme hooks</p>
        <p className="type-caption text-fg-muted">48 creatives from 12 brands.</p>
      </div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 type-ui text-fg-soft">
        <span>Ads</span>
        <Separator orientation="vertical" />
        <span>Posts</span>
        <Separator orientation="vertical" />
        <span>Product shots</span>
      </div>
    </div>
  )
}
