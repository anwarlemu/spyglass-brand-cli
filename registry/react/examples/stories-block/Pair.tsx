import { StoriesBlock } from '@/react/components/blocks/StoriesBlock'
import { storiesContent } from '@/lib/stories'
// Two stories sit in the middle of the row.

export default function Pair() {
  return <StoriesBlock id="stories-pair" headline="Built by a team that ships" lead="A head of growth and a founder on the team behind the API." stories={storiesContent.stories.slice(1, 3)} customers={false} />
}
