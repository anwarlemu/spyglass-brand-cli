'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Progress } from '@/react/components/ui/Progress'
// An import with a count, a step that moves it on, and a search with no known end.

export default function Import() {
  const [value, setValue] = useState(40)
  return (
    <div className="flex w-80 max-w-full flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <p className="type-ui text-fg">Importing Acme ads</p>
          <p className="type-caption text-fg-muted tabular-nums">{value}%</p>
        </div>
        <Progress value={value} label="Importing Acme ads" />
        <Button variant="secondary" size="sm" className="self-start" onClick={() => setValue((v) => Math.min(100, v + 20))}>Import more</Button>
      </div>
      <div className="flex flex-col gap-3">
        <p className="type-ui text-fg">Finding new creatives</p>
        <Progress label="Finding new creatives" />
      </div>
    </div>
  )
}
