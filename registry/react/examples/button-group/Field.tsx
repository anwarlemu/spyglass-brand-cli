import { Button } from '@/react/components/ui/Button'
import { ButtonGroup } from '@/react/components/ui/ButtonGroup'
import { Input } from '@/react/components/ui/Input'
// A field with its button, and a stack of secondary buttons.

export default function Field() {
  return (
    <div className="flex w-120 max-w-full flex-col items-center gap-6">
      <ButtonGroup label="Invite" className="w-full">
        <Input aria-label="Email" placeholder="team@acme.com" />
        <Button>Invite</Button>
      </ButtonGroup>
      <ButtonGroup label="Sort" vertical>
        <Button variant="secondary">Newest</Button>
        <Button variant="secondary">Longest running</Button>
        <Button variant="secondary">Most engagement</Button>
      </ButtonGroup>
    </div>
  )
}
