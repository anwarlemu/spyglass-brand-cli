import { PageHead } from '@/react/components/site/PageHead'
// A centered head over two lines, the texture fading in from the right edge from 1024.

export default function Centre() {
  return <PageHead id="pricing" lines={['Simple pricing,', 'for every team']} lead="Start free. Pay as you grow, and cancel anytime." align="centre" />
}
