'use client'
import { ScrollStory } from '@/react/components/blocks/ScrollStory'
import { storyActions } from '@/lib/pages/scroll-stories'
// The scroll story as the site's use-case pages set it, with Acme's copy: a brand's comments ranked and read, the thread word for word. Pinned from 1024; stacked below it or with reduced motion.

export default function Sentiment() {
  return <ScrollStory preset="sentiment" actions={storyActions} />
}
