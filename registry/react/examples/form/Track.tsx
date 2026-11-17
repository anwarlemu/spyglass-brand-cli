'use client'
import { useState } from 'react'
import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Form } from '@/react/components/ui/Form'
import { Input } from '@/react/components/ui/Input'
import { NativeSelect } from '@/react/components/ui/NativeSelect'
import { useForm } from '@/react/hooks/useForm'
// Tracking a new brand: a name, its site and where it advertises. Send it empty to see the errors; a name of "Acme"
// shows the server's answer.

export default function Track() {
  const [added, setAdded] = useState('')
  const { values, set, errors, sending, failure, touch, submit, reset } = useForm(
    { brand: '', site: '', platform: 'meta' },
    {
      brand: v => (!String(v).trim() ? 'Name the brand to track.' : undefined),
      site: v => (!String(v).trim() ? 'Add the brand\'s site.' : !/^[\w-]+(\.[\w-]+)+$/.test(String(v).trim()) ? 'Use a domain, such as acme.com.' : undefined),
    },
  )
  function send() {
    void submit(async (v) => {
      await new Promise(resolve => setTimeout(resolve, 600))
      if (v.brand.trim().toLowerCase() === 'acme') throw new Error('Acme is already on your list.')
      setAdded(v.brand.trim())
    })
  }
  return (
    <div className="w-100 max-w-full">
      {!added
        ? (
            <Form
              label="Track a brand"
              failure={failure}
              onSubmit={send}
              actions={(
                <>
                  <Button variant="ghost" onClick={reset}>Clear</Button>
                  <Button type="submit" disabled={sending}>{sending ? 'Adding' : 'Start tracking'}</Button>
                </>
              )}
            >
              <Field label="Brand" description="The name as it shows on its ads." error={errors.brand}>
                {({ id, describedBy, invalid }) => <Input id={id} value={values.brand} onChange={e => set('brand', e.target.value)} invalid={invalid} aria-describedby={describedBy} autoComplete="off" placeholder="Acme Studio" onBlur={() => touch('brand')} />}
              </Field>
              <Field label="Site" error={errors.site}>
                {({ id, describedBy, invalid }) => <Input id={id} value={values.site} onChange={e => set('site', e.target.value)} invalid={invalid} aria-describedby={describedBy} autoComplete="off" placeholder="acme.com" onBlur={() => touch('site')} />}
              </Field>
              <Field label="Platform">
                {({ id }) => (
                  <NativeSelect id={id} value={values.platform} onChange={e => set('platform', e.target.value)}>
                    <option value="meta">Meta</option><option value="tiktok">TikTok</option><option value="all">Every platform</option>
                  </NativeSelect>
                )}
              </Field>
            </Form>
          )
        : (
            <div className="flex flex-col items-start gap-4 rounded-container bg-surface-raised p-6" role="status">
              <p className="type-ui text-fg">Tracking {added}. New ads show up within a day.</p>
              <Button variant="secondary" onClick={() => { setAdded(''); reset() }}>Track another</Button>
            </div>
          )}
    </div>
  )
}
