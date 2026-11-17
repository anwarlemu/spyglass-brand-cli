'use client'
import { useState } from 'react'
import { Combobox } from '@/react/components/ui/Combobox'
// Pick a category to search in: type to narrow the list, arrows to move, Enter to pick. Counts are creatives tracked.
const categories = [
  { value: 'skincare', label: 'Skincare', hint: '12.4k' },
  { value: 'supplements', label: 'Supplements', hint: '8.1k' },
  { value: 'apparel', label: 'Apparel', hint: '6.9k' },
  { value: 'beverages', label: 'Beverages', hint: '5.2k' },
  { value: 'fitness', label: 'Fitness', hint: '4.7k' },
  { value: 'home', label: 'Home', hint: '3.3k' },
  { value: 'pets', label: 'Pets', hint: '2.8k' },
]

export default function Category() {
  const [picked, setPicked] = useState('')
  return (
    <div className="flex h-96 w-72 max-w-full flex-col gap-2">
      <label htmlFor="combobox-category" className="type-label text-fg-soft">Category</label>
      <Combobox id="combobox-category" value={picked} onValueChange={(v) => setPicked(String(v))} options={categories} label="Category" placeholder="Choose a category" filterLabel="Filter categories" matchWidth />
      <p className="type-caption text-fg-muted" aria-live="polite">{picked ? `Searching ${categories.find((c) => c.value === picked)?.label} creatives.` : 'Search one category at a time.'}</p>
    </div>
  )
}
