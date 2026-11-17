import { Search } from 'lucide-react'
import { InputGroup } from '@/react/components/ui/InputGroup'
// The three sizes, matching the input's, and one that says what is wrong.

export default function Sizes() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-3">
      <InputGroup size="sm" aria-label="Search, small" placeholder="Search" start={<Search size={16} strokeWidth={1.5} aria-hidden="true" />} />
      <InputGroup size="md" aria-label="Search, medium" placeholder="Search" start={<Search size={16} strokeWidth={1.5} aria-hidden="true" />} />
      <InputGroup size="lg" aria-label="Search, large" placeholder="Search" start={<Search size={16} strokeWidth={1.5} aria-hidden="true" />} />
      <InputGroup aria-label="Board link, taken" defaultValue="acme" start="spyglass.so/b/" invalid />
    </div>
  )
}
