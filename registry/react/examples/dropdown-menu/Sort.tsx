'use client'
import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { DropdownMenu } from '@/react/components/ui/DropdownMenu'
import { MenuItem } from '@/react/components/ui/MenuItem'
// One choice from a few: radio rows, the current one checked. The trigger says what is picked.
const orders = ['Newest', 'Longest running', 'Most engagement']

export default function Sort() {
  const [order, setOrder] = useState('Newest')
  return (
    <div className="flex h-56 w-full items-start justify-center pt-2">
      <DropdownMenu label="Sort creatives" width="200px" trigger={<><span>Sort: {order}</span><ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" /></>}>
        {orders.map((o) => (
          <MenuItem key={o} role="menuitemradio" aria-checked={o === order} onSelect={() => setOrder(o)}>
            <span className="min-w-0 flex-1 truncate">{o}</span>
            {o === order && <Check size={16} strokeWidth={1.5} className="shrink-0" aria-hidden="true" />}
          </MenuItem>
        ))}
      </DropdownMenu>
    </div>
  )
}
