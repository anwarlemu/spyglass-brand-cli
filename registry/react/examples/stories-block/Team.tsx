import { StoriesBlock } from '@/react/components/blocks/StoriesBlock'
import { storiesContent } from '@/lib/stories'
// A use case page's three stories with its own head and no customer row.

export default function Team() {
  return <StoriesBlock id="stories-team" headline="Creative research, in their words" lead="A head of growth, a founder and a general manager on researching creative." stories={storiesContent.stories.slice(1, 4)} customers={false} />
}
