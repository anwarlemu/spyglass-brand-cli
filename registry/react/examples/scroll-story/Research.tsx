'use client'
import { ScrollStory } from '@/react/components/blocks/ScrollStory'
import { storyActions } from '@/lib/pages/scroll-stories'
// The scroll story as the site's use-case pages set it, with Acme's copy: a category's ads grouped by hook, one taken apart, the trend tracker. Pinned from 1024; stacked below it or with reduced motion.

export default function Research() {
  return <ScrollStory preset="research" actions={storyActions} />
}
