import { SiteHeader } from '@/react/components/site/SiteHeader'
// The header as the site sets it: five pages, a sign-in in the links' style and the one White button.

const links = [{"label": "Products", "href": "#products", "current": true}, {"label": "Use cases", "href": "#use-cases"}, {"label": "Enterprise", "href": "#enterprise"}, {"label": "Resources", "href": "#resources"}, {"label": "Pricing", "href": "#pricing"}]

export default function Default() {
  return <SiteHeader homeHref="#home" links={links} secondary={{ label: 'Sign in', href: '#sign-in' }} cta={{ label: 'Get started', href: '#start' }} />
}
