import { SiteHeader } from '@/react/components/site/SiteHeader'
// The minimal header for a checkout or a sign-in flow: the lockup and the one button.

export default function Minimal() {
  return <SiteHeader variant="minimal" homeHref="#home" cta={{ label: 'Talk to us', href: '#contact' }} className="w-full" />
}
