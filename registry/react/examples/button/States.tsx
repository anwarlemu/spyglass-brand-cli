import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/react/components/ui/Button'
// Disabled is a dark fill with a gray label, never faded; a link looks like the button it stands for.

export default function States() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Start Creator for 50% off</Button>
      <Button variant="secondary" disabled>Explore the product</Button>
      <Button href="#pricing" variant="secondary">See pricing <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden="true" /></Button>
    </div>
  )
}
