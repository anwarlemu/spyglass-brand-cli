'use client'
import { useRef } from 'react'
import { Button } from '@/react/components/ui/Button'
import { toast, Toaster } from '@/react/components/ui/Sonner'
// Press Save: a note rises in the corner, with Undo. Press it quickly and they stack, three at most; point at the stack
// to spread it out and hold their time.

export default function Board() {
  const count = useRef(23)
  function save() {
    count.current += 1
    toast('Saved to board', { description: `Acme hooks now has ${count.current} creatives.`, action: { label: 'Undo' } })
  }
  return (
    <div className="flex min-h-72 flex-wrap items-start justify-center gap-2">
      <Button onClick={save}>Save to board</Button>
      <Button variant="secondary" onClick={() => toast('Brand added', { description: 'New ads from Acme Studio show up here every day.' })}>Track brand</Button>
      <Toaster />
    </div>
  )
}
