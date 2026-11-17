import { Tabs } from '@/react/components/ui/Tabs'
// What to search: a segmented control over the panel for each kind of creative.

export default function Segmented() {
  return (
    <Tabs
      className="w-96 max-w-full"
      label="Creative type"
      options={[{ value: 'ads', label: 'Ads' }, { value: 'posts', label: 'Posts' }, { value: 'products', label: 'Product shots' }]}
      defaultValue="ads"
      panels={{
        ads: <div className="rounded-container bg-surface-raised p-6"><p className="type-ui-strong text-fg">Ads</p><p className="mt-1 type-ui text-fg-muted">Paid creative from every brand you track.</p></div>,
        posts: <div className="rounded-container bg-surface-raised p-6"><p className="type-ui-strong text-fg">Posts</p><p className="mt-1 type-ui text-fg-muted">Organic posts and creator content.</p></div>,
        products: <div className="rounded-container bg-surface-raised p-6"><p className="type-ui-strong text-fg">Product shots</p><p className="mt-1 type-ui text-fg-muted">Stills of the product, as posted.</p></div>,
      }}
    />
  )
}
