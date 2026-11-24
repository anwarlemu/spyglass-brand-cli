'use client'
import { ScrollStory } from '@/react/components/blocks/ScrollStory'
import { storyActions } from '@/lib/pages/scroll-stories'
// The scroll story as the site's use-case pages set it, with Acme's copy: the pages behind the ads, a browser window as the focal piece. Pinned from 1024; stacked below it or with reduced motion.

export default function Landing() {
  return <ScrollStory preset="landing" actions={storyActions} />
}
