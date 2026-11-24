import { FaqAccordion } from '@/react/components/blocks/FaqAccordion'
import { faqExample } from '@/lib/faq'
// The rows alone, all closed at first.

export default function Rows() {
  return <FaqAccordion items={faqExample} defaultOpen={-1} className="w-full max-w-180" />
}
