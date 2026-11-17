import { Text } from '@/react/components/ui/Text'
// shadcn's typography page in the brand: headings, a lead, paragraphs, a quote, a list and inline code, each a step of
// the scale.

export default function Article() {
  return (
    <article className="flex max-w-2xl flex-col">
      <Text variant="label">Field notes</Text>
      <Text variant="h1" className="mt-4">How Acme found its best hook.</Text>
      <Text variant="lead" className="mt-4">Three weeks, one board and every ad in its category.</Text>
      <Text variant="p" className="mt-6">Acme searched for the creative its rivals ran longest. Long runs mean an ad pays for itself, so the board filled with the ones worth studying.</Text>
      <Text variant="h2" className="mt-10">What the board showed</Text>
      <Text variant="p" className="mt-4">The ads that lasted opened on the product in a hand, not on a logo. They said the price in the first line.</Text>
      <Text variant="blockquote" className="mt-6">The first second sells the next ten.</Text>
      <Text variant="h3" className="mt-10">What Acme changed</Text>
      <ul className="mt-4 flex list-disc flex-col gap-2 pl-6 type-body text-fg">
        <li>Open on the product, in use.</li>
        <li>Say the offer in the first line.</li>
        <li>Cut every ad to under fifteen seconds.</li>
      </ul>
      <Text variant="h4" className="mt-10">Try it on your category</Text>
      <Text variant="p" className="mt-4">Save a search to a board named <Text variant="code" as="code">acme-hooks</Text> and check it each week.</Text>
      <Text variant="large" className="mt-6">$10 for your first month, then $20/month.</Text>
      <Text variant="small" className="mt-2">Acme Studio plan</Text>
      <Text variant="muted" className="mt-1">Billed monthly.</Text>
    </article>
  )
}
