import { NavigationMenu } from '@/react/components/ui/NavigationMenu'
import { NavigationMenuItem } from '@/react/components/ui/NavigationMenuItem'
import { NavigationMenuLink } from '@/react/components/ui/NavigationMenuLink'
// The site's top navigation: the product and resources open panels of links, pricing and about are plain links. Point
// at Product, then move to Resources: it switches at once.
const product = [
  { title: 'Search', description: 'Find any ad in seconds, by hook, brand or format.' },
  { title: 'Boards', description: 'Save and share the creatives that work.' },
  { title: 'Brand tracking', description: 'Every new ad from the brands you follow.' },
  { title: 'Creators', description: 'The faces behind the ads that run longest.' },
]
const resources = [
  { title: 'Blog', description: 'What the best ads have in common.' },
  { title: 'Changelog', description: 'New in Spyglass, every week.' },
  { title: 'Help center', description: 'Answers in under a minute.' },
]

export default function Site() {
  return (
    <div className="min-h-80">
      <NavigationMenu label="Site">
        <NavigationMenuItem label="Product" width="440px">
          <div className="grid gap-1 sm:grid-cols-2">
            {product.map((l) => <NavigationMenuLink key={l.title} href="#" title={l.title} description={l.description} />)}
          </div>
        </NavigationMenuItem>
        <NavigationMenuItem label="Resources" width="280px">
          <div className="grid gap-1">
            {resources.map((l) => <NavigationMenuLink key={l.title} href="#" title={l.title} description={l.description} />)}
          </div>
        </NavigationMenuItem>
        <NavigationMenuItem label="Pricing" href="#" />
        <NavigationMenuItem label="About" href="#" />
      </NavigationMenu>
    </div>
  )
}
