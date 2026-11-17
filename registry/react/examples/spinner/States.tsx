import { Button } from '@/react/components/ui/Button'
import { Spinner } from '@/react/components/ui/Spinner'
// A search running: the spinner beside its line, in a busy button, and at the larger size on its own.

export default function States() {
  return (
    <div className="flex flex-col items-start gap-6">
      <div className="flex items-center gap-3 type-ui text-fg-soft">
        <Spinner label="Searching" />
        <span>Searching for Acme hooks.</span>
      </div>
      <Button variant="secondary" disabled><Spinner label="Saving" />Saving</Button>
      <Spinner size="md" label="Loading boards" />
    </div>
  )
}
