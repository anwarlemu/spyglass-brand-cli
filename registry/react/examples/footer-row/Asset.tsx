import { FooterRow } from '@/react/components/site/FooterRow'
// As the ads end: the lockup and the domain, and the posts' capitals.

export default function Asset() {
  return (
    <div className="grid gap-10">
      <FooterRow domain="spyglass.so" />
      <FooterRow domain="spyglass.so" caps />
    </div>
  )
}
