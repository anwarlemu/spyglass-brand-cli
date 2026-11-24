import { SiteHeader } from '@/react/components/site/SiteHeader'
// The header as the site sets it: Products, Use cases and Resources open their menus (Acme content), the sign-in and
// the key on the right; the phone sheet below 1280. The space under it leaves room for the menus.

export default function Default() {
  return (
    <div className="min-h-150 w-full">
      <SiteHeader homeHref="#home" />
    </div>
  )
}
