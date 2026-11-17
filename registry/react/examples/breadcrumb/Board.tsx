import { Breadcrumb } from '@/react/components/ui/Breadcrumb'
// A creative inside a board, with the way back.

export default function Board() {
  return (
    <Breadcrumb
      className="max-w-full"
      items={[
        { label: 'Boards', href: '#boards' },
        { label: 'Acme skincare', href: '#acme-skincare' },
        { label: 'Summer UGC, before and after hook' },
      ]}
    />
  )
}
