import { SiteHeader } from '@/react/components/site/SiteHeader'
// The header with the pages, a sign-in and the main action.

const links = [
  { label: 'Product', href: '#product', current: true },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' },
  { label: 'Blog', href: '#blog' },
]

export default function Default() {
  return <SiteHeader homeHref="#home" links={links} secondary={{ label: 'Sign in', href: '#sign-in' }} cta={{ label: 'Get 50% off', href: '#pricing' }} />
}
