'use client'
import { Fragment, useState } from 'react'
import { Bookmark, Compass, Folder, Search, Settings, Store, Users } from 'lucide-react'
import { Logo } from '@/react/components/visuals/Logo'
import { Sidebar } from '@/react/components/ui/Sidebar'
import { SidebarLabel } from '@/react/components/ui/SidebarLabel'
import { SidebarLink } from '@/react/components/ui/SidebarLink'
// The app's rail: the logo and the fold button at the top, a label over each group, the page you are on in White, and
// the account at the foot. Fold it to icons with the button.
const groups = [
  { label: 'Discover', links: [{ label: 'Search', icon: Search }, { label: 'Explore', icon: Compass }, { label: 'Brands', icon: Store, status: '12' }, { label: 'Creators', icon: Users, status: '8' }] },
  { label: 'Boards', links: [{ label: 'Acme hooks', icon: Folder, status: '24' }, { label: 'UGC ideas', icon: Folder, status: '9' }, { label: 'Saved', icon: Bookmark }] },
]

export default function App() {
  const [picked, setPicked] = useState('Search')
  return (
    <div className="flex h-120 overflow-hidden rounded-container border border-edge">
      <Sidebar
        label="App"
        collapsible
        head={<Logo height={20} />}
        foot={(
          <div className="flex flex-col gap-0.5">
            <SidebarLink href="#" icon={Settings} onClick={(e) => e.preventDefault()}>Settings</SidebarLink>
            <div className="flex flex-col px-3 pt-2">
              <span className="type-ui-strong text-fg">Acme Studio</span>
              <span className="type-caption text-fg-muted">Creator plan</span>
            </div>
          </div>
        )}
      >
        {groups.map((group) => (
          <Fragment key={group.label}>
            <SidebarLabel>{group.label}</SidebarLabel>
            {group.links.map((link: { label: string, icon: typeof Search, status?: string }) => (
              <SidebarLink key={link.label} href="#" icon={link.icon} status={link.status} active={picked === link.label} onClick={(e) => { e.preventDefault(); setPicked(link.label) }}>{link.label}</SidebarLink>
            ))}
          </Fragment>
        ))}
      </Sidebar>
      <div className="hidden min-w-0 flex-1 flex-col gap-2 p-8 md:flex">
        <h2 className="type-heading-3 text-fg">{picked}</h2>
        <p className="type-ui text-fg-muted">The only creative search engine.</p>
      </div>
    </div>
  )
}
