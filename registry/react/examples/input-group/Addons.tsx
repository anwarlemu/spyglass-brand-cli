import { Search } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
import { InputGroup } from '@/react/components/ui/InputGroup'
// An icon, a prefix, a unit and a button, each inside the field's hairline.

export default function Addons() {
  return (
    <div className="flex w-96 max-w-full flex-col gap-4">
      <InputGroup aria-label="Search boards" placeholder="Search boards" start={<Search size={16} strokeWidth={1.5} aria-hidden="true" />} />
      <InputGroup aria-label="Board link" defaultValue="acme-hooks" start="spyglass.so/b/" />
      <InputGroup aria-label="Monthly budget" type="number" defaultValue="20" start="$" end="per month" />
      <InputGroup aria-label="Invite by email" type="email" placeholder="name@acme.com" end={<Button variant="secondary" size="sm">Invite</Button>} />
    </div>
  )
}
