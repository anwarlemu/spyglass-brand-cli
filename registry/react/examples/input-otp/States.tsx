import { InputOtp } from '@/react/components/ui/InputOtp'
// A code that was wrong, and one that can't be changed while it is checked.

export default function States() {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex flex-col items-start gap-3">
        <InputOtp label="Wrong code" defaultValue="481920" invalid />
        <p className="type-caption text-fg-danger">That code has expired. Send a new one.</p>
      </div>
      <InputOtp label="Code being checked" defaultValue="2741" length={4} disabled />
    </div>
  )
}
