import { PageHead } from '@/react/components/site/PageHead'
// An inner page's head: the copy on the left, the ASCII drift on the right, a White and a quiet button.

export default function Margin() {
  return <PageHead id="resources" lines={['Resources']} lead="Templates, writing and docs for building on Acme." primary={{ label: 'Get a free API key', href: '#' }} secondary={{ label: 'Read the docs', href: '#' }} />
}
