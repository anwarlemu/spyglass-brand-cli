import { ResourceListPage } from '@/react/components/pages/ResourceListPage'
import { articlesList } from '@/lib/pages/resources'
// A list with entries: Acme's articles, newest first.

export default function Articles() {
  return <ResourceListPage list={articlesList} />
}
