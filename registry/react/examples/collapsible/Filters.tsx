import { Checkbox } from '@/react/components/ui/Checkbox'
import { Collapsible } from '@/react/components/ui/Collapsible'
// More filters, tucked under the search until a person asks for them.

export default function Filters() {
  return (
    <div className="w-100 max-w-full rounded-container bg-surface-raised px-4 py-2">
      <Collapsible trigger="More filters">
        <div className="flex flex-col pb-2">
          <Checkbox label="Still running" defaultChecked />
          <Checkbox label="Has a voiceover" />
          <Checkbox label="Under 30 seconds" />
        </div>
      </Collapsible>
    </div>
  )
}
