import { Input } from '@/react/components/ui/Input'
// An invalid field: the hairline turns red and the message says what to do.

export default function Invalid() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-2">
      <label htmlFor="work-email" className="type-label text-fg-soft">Work email</label>
      <Input id="work-email" type="email" defaultValue="team@acme" invalid aria-describedby="work-email-error" />
      <p id="work-email-error" className="type-caption text-fg-danger">Enter an email like team@acme.com.</p>
    </div>
  )
}
