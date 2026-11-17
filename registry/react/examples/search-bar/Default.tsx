'use client'
import { useState } from 'react'
import { SearchBar } from '@/react/components/product/SearchBar'
// A search with the ad's prompt; the last query shows under it.

export default function Default() {
  const [last, setLast] = useState('')
  return (
    <div className="mx-auto flex w-full max-w-238 flex-col gap-3">
      <SearchBar defaultValue="Show me UGC ads for skincare brands using before/after hooks" onSearch={setLast} label="Search creatives" />
      <p className="type-caption text-fg-muted" aria-live="polite">{last ? `Searching: ${last}` : 'Ask in words. Enter searches.'}</p>
    </div>
  )
}
