import { Accordion } from '@/react/components/ui/Accordion'
import { AccordionItem } from '@/react/components/ui/AccordionItem'
// Several rows open at once, for filters a person compares side by side; the last is not available yet.

export default function Multiple() {
  return (
    <Accordion multiple defaultValue={['format', 'platform']} className="w-120 max-w-full">
      <AccordionItem value="format" title="Format">Video, carousel, static image.</AccordionItem>
      <AccordionItem value="platform" title="Platform">Meta, TikTok, YouTube.</AccordionItem>
      <AccordionItem value="spend" title="Estimated spend" disabled>Coming soon.</AccordionItem>
    </Accordion>
  )
}
