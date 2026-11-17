import { Button } from '@/react/components/ui/Button'
import { Card } from '@/react/components/ui/Card'
// The plan card from the Creator plan ad: the plan, its price, what it includes and the one action.

export default function Plan() {
  return (
    <Card
      className="w-150 max-w-full"
      title="Creator"
      description="$10 for your first month, then $20/month"
      actions={<Button className="w-full">Start Creator for 50% off</Button>}
    >
      <ul className="flex flex-col gap-2 type-ui text-fg">
        <li>AI-powered research across brands, creators, ads, and campaigns</li>
        <li>Unlimited board swipe files, alerts, and tracked brands</li>
        <li>Unlimited team seats</li>
      </ul>
    </Card>
  )
}
