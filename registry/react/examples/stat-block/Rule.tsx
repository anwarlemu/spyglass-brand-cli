import { StatBlock } from '@/react/components/blocks/StatBlock'
// The figures the assets state, each under a hairline.

const stats = [
  { value: '4', label: 'Networks in one index: Meta, TikTok, Instagram and YouTube.' },
  { value: '1 min', label: 'To add any brand or creator.' },
  { value: 'Unlimited', label: 'Team seats on the Creator plan.' },
  { value: '$10', label: 'For your first month, then $20/month.' },
]

export default function Rule() {
  return <StatBlock title="Every creative in one place." stats={stats} />
}
