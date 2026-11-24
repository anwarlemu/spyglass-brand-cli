import { Button } from '@/react/components/ui/Button'
import { Field } from '@/react/components/ui/Field'
import { Input } from '@/react/components/ui/Input'
import { Switch } from '@/react/components/ui/Switch'
import { Logo } from '@/react/components/visuals/Logo'
import { settingsContent, type SettingsContent } from '@/lib/pages/settings'
import { cn } from '@/react/lib/cn'

// Settings in the site's look: the same side rail as the dashboard, then sections on #262626 cards: the profile fields
// and the notification switches (each row a 14/20 Medium label, a #A3A3A3 line and the switch), and the one White button
// to save. The form posts to `action`; the app wires it. The rail sits on top on phones.
export interface SettingsPageProps {
  content?: SettingsContent
  action?: string
  className?: string
}

const LINK = 'flex h-control-xs items-center rounded-control px-3 type-ui text-fg-soft transition-[color,background-color] duration-160 ease-out hover:bg-surface-raised hover:text-fg aria-[current=page]:bg-surface-raised aria-[current=page]:text-fg'

export function SettingsPage({ content: c = settingsContent, action, className }: SettingsPageProps) {
  return (
    <div data-ds="settings-page" className={cn('grid min-h-dvh grid-cols-[minmax(0,1fr)] bg-surface text-fg lg:grid-cols-[256px_minmax(0,1fr)]', className)}>
      <aside className="flex min-w-0 flex-col gap-6 border-b border-edge bg-surface-subtle p-4 lg:border-r lg:border-b-0">
        <a href="/" aria-label="Home" className="self-start rounded-control px-2 py-2"><Logo height={20} /></a>
        <nav aria-label="Settings">
          <ul role="list" className="m-0 flex list-none gap-1 overflow-x-auto p-0 fade-x lg:flex-col">
            {c.nav.map((n) => <li key={n.href} className="shrink-0"><a href={n.href} aria-current={n.current ? 'page' : undefined} className={LINK}>{n.label}</a></li>)}
          </ul>
        </nav>
      </aside>
      <main className="grid max-w-200 content-start gap-8 p-6 lg:p-10">
        <h1 className="type-heading-2">{c.title}</h1>
        <form action={action} method="post" className="grid gap-6">
          <section className="grid gap-5 rounded-container bg-surface-raised p-6">
            <h2 className="type-heading-3">{c.profile.title}</h2>
            <Field label={c.profile.name.label}>{({ id }) => <Input id={id} name="name" autoComplete="name" defaultValue={c.profile.name.value} />}</Field>
            <Field label={c.profile.email.label}>{({ id }) => <Input id={id} name="email" type="email" autoComplete="email" defaultValue={c.profile.email.value} />}</Field>
          </section>
          <section className="grid gap-5 rounded-container bg-surface-raised p-6">
            <h2 className="type-heading-3">{c.notifications.title}</h2>
            <ul role="list" className="m-0 grid list-none gap-5 p-0">
              {c.notifications.items.map((n) => (
                <li key={n.label} className="flex items-start justify-between gap-6">
                  <span className="grid gap-1">
                    <span className="type-ui-strong text-fg">{n.label}</span>
                    <span className="type-ui text-fg-muted">{n.description}</span>
                  </span>
                  <Switch label={n.label} defaultChecked={n.on} />
                </li>
              ))}
            </ul>
          </section>
          <Button type="submit" className="justify-self-start">{c.save}</Button>
        </form>
      </main>
    </div>
  )
}

export default SettingsPage
