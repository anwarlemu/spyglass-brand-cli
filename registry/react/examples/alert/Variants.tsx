import { CircleAlert, Info } from 'lucide-react'
import { Alert } from '@/react/components/ui/Alert'
import { Button } from '@/react/components/ui/Button'
// A note with the action that goes with it, and a problem in red with the fix.

export default function Variants() {
  return (
    <div className="flex w-160 max-w-full flex-col gap-3">
      <Alert role="status" title="Your first month is $10." icon={<Info size={16} strokeWidth={1.5} />} action={<Button size="sm">Start Creator</Button>}>
        Then $20/month. Cancel any time.
      </Alert>
      <Alert variant="destructive" title="Your payment did not go through." icon={<CircleAlert size={16} strokeWidth={1.5} />} action={<Button size="sm" variant="secondary">Update card</Button>}>
        Update your card to keep Acme's boards.
      </Alert>
      <Alert role="status" title="Search results update every day." icon={<Info size={16} strokeWidth={1.5} />} />
    </div>
  )
}
