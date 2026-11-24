import { FaqBlock } from '@/react/components/blocks/FaqBlock'
import { faqExample } from '@/lib/faq'
// The earlier site's arrangement: the head centered over a narrow list.

export default function Stack() {
  return <FaqBlock id="faq-stack" layout="stack" title="Questions, answered" items={faqExample} />
}
