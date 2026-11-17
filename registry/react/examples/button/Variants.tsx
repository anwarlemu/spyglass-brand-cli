import { Button } from '@/react/components/ui/Button'
// The three variants: the White primary for the one main action, secondary for the rest, ghost for tools.

export default function Variants() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Get 50% off</Button>
      <Button variant="secondary">Explore the product</Button>
      <Button variant="ghost">Compare plans</Button>
    </div>
  )
}
