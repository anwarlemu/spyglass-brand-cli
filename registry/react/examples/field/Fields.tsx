import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
// A field with a line of help under it, and one that says what is wrong.

export default function Fields() {
  return (
    <div className="flex w-80 max-w-full flex-col gap-6">
      <Field label="Brand or creator" description="Add any brand or creator in under a minute.">
        {({ id, describedBy, invalid }) => <Input id={id} name="brand" placeholder="Acme" aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Work email" error="Use your work email, such as you@acme.com.">
        {({ id, describedBy, invalid }) => <Input id={id} name="email" type="email" defaultValue="acme" aria-describedby={describedBy} invalid={invalid} />}
      </Field>
    </div>
  )
}
