import { Checkbox } from '@/react/components/ui/Checkbox'
// Off, on, with a hint, invalid until it is checked, and disabled.

export default function States() {
  return (
    <div className="flex flex-col gap-1">
      <Checkbox label="Email me when a saved search finds new creatives" />
      <Checkbox label="Show ads that are still running" defaultChecked />
      <Checkbox label="Include UGC" hint="Creator videos posted by the brand." defaultChecked />
      <Checkbox label="I agree to the terms" invalid />
      <Checkbox label="Audio ads" hint="Coming soon." disabled />
    </div>
  )
}
