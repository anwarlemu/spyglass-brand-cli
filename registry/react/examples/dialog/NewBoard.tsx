'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Dialog } from '@/react/components/ui/Dialog'
import { Input } from '@/react/components/ui/Input'
// A new board in a short form: the button opens it on the Name field, Enter creates it, Escape or the scrim closes it.

export default function NewBoard() {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('Boards keep the creatives you save.')
  return (
    <div className="flex min-h-96 flex-col items-center justify-center gap-3">
      <Button onClick={() => setOpen(true)}>New board</Button>
      <p className="type-caption text-fg-muted" aria-live="polite">{note}</p>
      <Dialog open={open} onOpenChange={setOpen} title="New board" description="Save creatives to it from any search.">
        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            const name = new FormData(e.currentTarget).get('name') || 'Untitled board'
            setNote(`Created ${name}.`)
            setOpen(false)
          }}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="new-board-name" className="type-label text-fg-soft">Name</label>
            <Input id="new-board-name" name="name" placeholder="Acme summer ads" />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Create board</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
