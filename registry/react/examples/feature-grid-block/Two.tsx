import { FeatureGridBlock } from '@/react/components/blocks/FeatureGridBlock'
// An Acme team's two reasons, two across under a heading.

const features = [
  { title: 'One board for the team.', body: 'Acme Studio saves every creative it likes to one board the whole team can search.' },
  { title: 'Alerts that matter.', body: 'Acme Studio hears when a tracked brand launches a new ad, the day it goes live.' },
]

export default function Two() {
  return <FeatureGridBlock title="Why Acme Studio uses it." body="Two jobs, done in one place." features={features} columns={2} />
}
