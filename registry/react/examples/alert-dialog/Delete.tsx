'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { AlertDialog } from '@/react/components/ui/AlertDialog'
// Deleting a board asks first: focus starts on Cancel, and only a choice closes it. The line under says what happened.

export default function Delete() {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('Acme summer ads: 48 saved creatives.')
  return (
    <div className="flex min-h-72 flex-col items-center justify-center gap-3">
      <Button variant="secondary" onClick={() => setOpen(true)}>Delete board</Button>
      <p className="type-caption text-fg-muted" aria-live="polite">{note}</p>
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this board?"
        description="Acme summer ads and its 48 saved creatives go away for everyone on the team. This can't be undone."
        action="Delete board"
        onConfirm={() => setNote('Board deleted.')}
        onCancel={() => setNote('Kept the board.')}
      />
    </div>
  )
}
