'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Dialog } from '@/react/components/ui/Dialog'
// An offer with its buttons in the foot: the White primary for the one action, secondary for the way out.

export default function Plan() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-h-96 items-center justify-center">
      <Button variant="secondary" onClick={() => setOpen(true)}>See the Creator plan</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Creator"
        description="$10 for your first month, then $20/month."
        foot={<><Button variant="secondary" onClick={() => setOpen(false)}>Not now</Button><Button onClick={() => setOpen(false)}>Start Creator for 50% off</Button></>}
      >
        <ul className="flex list-disc flex-col gap-2 pl-5 type-ui text-fg-soft">
          <li>Search every ad by what it says and shows.</li>
          <li>Track any brand or creator.</li>
          <li>Unlimited boards.</li>
        </ul>
      </Dialog>
    </div>
  )
}
