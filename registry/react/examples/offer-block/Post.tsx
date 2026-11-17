import { OfferBlock } from '@/react/components/blocks/OfferBlock'
// The offer post: the headline, the terms in capitals and one White button.

export default function Post() {
  return <OfferBlock headline="Stop screenshotting at midnight." note="$10 for your first month, then $20/month" cta={{ label: 'Start Creator for 50% off', href: '#pricing' }} />
}
