import { SiteFooter } from '@/react/components/blocks/SiteFooter'
// The site's footer for Acme: six columns, a page that is not live yet, and the legal line.

const columns = [
  { title: 'Products', wide: true, links: [{ label: 'Search', href: '/search' }, { label: 'Archive', href: '/archive' }, { label: 'Insights', href: '/insights' }, { label: 'Alerts' }] },
  { title: 'Use cases', wide: true, links: [{ label: 'Paid ads', href: '/use-cases/paid' }, { label: 'Organic social', href: '/use-cases/organic' }, { label: 'Research', href: '/use-cases/research' }] },
  { title: 'Resources', links: [{ label: 'Docs', href: '/docs' }, { label: 'Blog', href: '/blog' }, { label: 'Templates', href: '/templates' }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
  { title: 'Legal', links: [{ label: 'Terms', href: '/terms' }, { label: 'Privacy', href: '/privacy' }] },
  { title: 'Community', links: [{ label: 'X', href: 'https://x.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }] },
]

export default function Site() {
  return <SiteFooter columns={columns} legal="© 2026 Acme Inc." />
}
