import { SiteHeader } from '@/react/components/site/SiteHeader'
// The links and menus from 1024, with plain links only.

const links = [{ label: 'Product', href: '#product', current: true }, { label: 'Customers', href: '#customers' }, { label: 'Pricing', href: '#pricing' }, { label: 'Docs', href: '#docs' }]

export default function Centered() {
  return (
    <div className="min-h-40 w-full">
      <SiteHeader variant="centered" homeHref="#home" links={links} cta={{ label: 'Get started', href: '#start' }} />
    </div>
  )
}
