import { Input } from '@/react/components/ui/Input'
import { Label } from '@/react/components/ui/Label'
// Labels over the fields they name, one with a note that it can stay empty.

export default function Fields() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="label-email">Work email</Label>
        <Input id="label-email" type="email" placeholder="you@acme.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="label-team" hint="Optional">Team name</Label>
        <Input id="label-team" placeholder="Acme growth" />
      </div>
    </div>
  )
}
