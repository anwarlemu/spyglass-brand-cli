import { Input } from '@/react/components/ui/Input'
// sm, md and lg, matching the buttons beside them.

export default function Sizes() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-3">
      <Input size="sm" aria-label="Board name, small" placeholder="Acme launch board" />
      <Input size="md" aria-label="Board name" placeholder="Acme launch board" />
      <Input size="lg" aria-label="Board name, large" placeholder="Acme launch board" />
    </div>
  )
}
