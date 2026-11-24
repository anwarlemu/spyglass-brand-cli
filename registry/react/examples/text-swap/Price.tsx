'use client'
import { useState } from 'react'
import { TextSwap } from '@/react/components/ui/TextSwap'
// A plan's price that swaps with the billing period: the amount and the unit each rise out as the new ones rise in.

export default function Price() {
  const [yearly, setYearly] = useState(false)
  const pick = 'h-8 rounded-ds-sm px-3 type-ui text-fg-muted transition-[background-color,color] duration-160 ease-standard aria-pressed:bg-surface-subtle aria-pressed:text-fg'
  return (
    <div className="flex flex-col items-start gap-8">
      <div role="group" aria-label="Billing" className="flex gap-1 rounded-control bg-surface-raised p-1">
        <button type="button" aria-pressed={!yearly} onClick={() => setYearly(false)} className={pick}>Monthly</button>
        <button type="button" aria-pressed={yearly} onClick={() => setYearly(true)} className={pick}>Yearly</button>
      </div>
      <p className="flex flex-wrap items-baseline gap-x-2 text-fg">
        <TextSwap className="font-heading text-heading-3" text={yearly ? '$16' : '$20'} />
        <TextSwap className="type-ui text-fg-muted" text={yearly ? '/month, billed yearly' : '/month'} tag={yearly ? 'Save 20%' : undefined} />
      </p>
    </div>
  )
}
