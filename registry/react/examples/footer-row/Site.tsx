import { FooterRow } from '@/react/components/site/FooterRow'
// A website footer: the pages between the lockup and the domain.

const links = [
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Changelog', href: '#changelog' },
  { label: 'Blog', href: '#blog' },
  { label: 'Terms', href: '#terms' },
]

export default function Site() {
  return <FooterRow domain="spyglass.so" homeHref="#home" links={links} />
}
