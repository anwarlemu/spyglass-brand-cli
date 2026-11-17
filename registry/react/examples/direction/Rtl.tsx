import { Badge } from '@/react/components/ui/Badge'
import { Breadcrumb } from '@/react/components/ui/Breadcrumb'
import { Direction } from '@/react/components/ui/Direction'
// The same card read left to right and right to left: logical spacing and the breadcrumb follow; code stays left to
// right.

function Sample() {
  return (
    <div className="flex flex-col gap-3 rounded-container bg-surface-raised p-6">
      <Breadcrumb items={[{ label: 'Boards', href: '#boards' }, { label: 'Acme skincare' }]} />
      <div className="flex items-center gap-2">
        <Badge variant="outline" dot="green">Running</Badge>
        <span className="type-ui text-fg-muted">since March</span>
      </div>
      <code className="self-start rounded-ds-sm bg-surface px-2 py-1 type-code text-fg-muted">board_8f2k1</code>
    </div>
  )
}

export default function Rtl() {
  return (
    <div className="grid w-200 max-w-full grid-cols-2 gap-4 max-sm:grid-cols-1">
      <Direction dir="ltr"><Sample /></Direction>
      <Direction dir="rtl"><Sample /></Direction>
    </div>
  )
}
