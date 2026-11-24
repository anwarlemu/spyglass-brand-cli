import { PageHead } from '@/react/components/site/PageHead'
// A legal page's head: an eyebrow over the title and the lead, no buttons.

export default function Eyebrow() {
  return <PageHead id="terms" eyebrow="Updated May 2026" lines={['Terms of service']} lead="The terms that apply when you use Acme's products." />
}
