import { FooterBlock } from '@/react/components/blocks/FooterBlock'
// A website's footer band with its links and a legal line, for Acme.

const links = [{label: 'Product', href: '/product'}, {label: 'Pricing', href: '/pricing'}, {label: 'About', href: '/about'}, {label: 'Contact', href: '/contact'}, {label: 'Terms', href: '/legal'}]

export default function Site() {
  return <FooterBlock domain="acme.com" note="© 2026 Acme Inc." links={links} />
}
