import { Avatar } from '@/react/components/ui/Avatar'
// Initials in three sizes, and a board's members stacked with a Black ring between them.
const members = ['Acme Studio', 'Acme Growth', 'Acme Brand', 'Acme Social']

export default function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <div className="flex items-center gap-3">
        <Avatar name="Acme Studio" size="sm" />
        <Avatar name="Acme Studio" size="md" />
        <Avatar name="Acme Studio" size="lg" />
      </div>
      <div className="flex items-center">
        {members.map((m, i) => <span key={m} className={i ? '-ml-2 inline-flex rounded-full border-2 border-surface' : 'inline-flex rounded-full border-2 border-surface'}><Avatar name={m} /></span>)}
        <span className="ml-3 type-caption text-fg-muted">4 members</span>
      </div>
    </div>
  )
}
