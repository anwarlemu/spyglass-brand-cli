'use client'
import { useState } from 'react'
import { InputOtp } from '@/react/components/ui/InputOtp'
// Signing in with a code from email: six digits in two threes, and a line that says when it is checked.

export default function Verify() {
  const [done, setDone] = useState(false)
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="type-label text-fg-soft">Code from your email</p>
      <InputOtp label="Code from your email" split={3} onValueChange={() => setDone(false)} onComplete={() => setDone(true)} />
      <p className="type-caption text-fg-muted" role="status">{done ? 'Checking your code.' : 'We sent it to you@acme.com.'}</p>
    </div>
  )
}
