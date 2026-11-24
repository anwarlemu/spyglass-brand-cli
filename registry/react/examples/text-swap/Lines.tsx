import { Sentences } from '@/react/components/ui/Sentences'
// Sentences: on a phone each sentence wraps as a whole; wider, the copy reads as one paragraph.

export default function Lines() {
  return (
    <p className="max-w-xl type-body-lg text-fg-soft">
      <Sentences text="Ask in plain words. Acme's library answers with the ads that fit. Every one ranked by how long it ran." />
    </p>
  )
}
