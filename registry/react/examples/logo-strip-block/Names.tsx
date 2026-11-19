import { LogoStripBlock } from '@/react/components/blocks/LogoStripBlock'
// Placeholder customers, set as wordmarks: replace them with names you may show.

const names = ['Acme Skin', 'Acme Studio', 'Acme Fit', 'Acme Drinks', 'Acme Motors']

export default function Names() {
  return <LogoStripBlock label="Teams at these brands search with us" names={names} />
}
