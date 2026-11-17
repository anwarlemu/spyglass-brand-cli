'use client'
import { Toast } from '@/react/components/ui/Toast'
// Two notes as they read on their own: one with something to do, one that only says what happened.

export default function Notes() {
  return (
    <div className="flex w-90 max-w-full flex-col gap-3">
      <Toast title="Saved to board" description="Acme hooks now has 24 creatives." action={{ label: 'Undo' }} onDismiss={() => {}} />
      <Toast title="Brand added" description="New ads from Acme Studio show up here every day." onDismiss={() => {}} />
    </div>
  )
}
