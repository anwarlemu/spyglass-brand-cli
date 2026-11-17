import { Tabs } from '@/react/components/ui/Tabs'
// A board's sections as line tabs, one of them not ready yet.

export default function Line() {
  return (
    <Tabs
      className="w-full max-w-lg"
      variant="line"
      label="Board sections"
      options={[{ value: 'creatives', label: 'Creatives' }, { value: 'brands', label: 'Brands' }, { value: 'notes', label: 'Notes' }, { value: 'export', label: 'Export', disabled: true }]}
      defaultValue="creatives"
      panels={{
        creatives: <p className="type-ui text-fg-muted">48 creatives, newest first.</p>,
        brands: <p className="type-ui text-fg-muted">12 brands on this board.</p>,
        notes: <p className="type-ui text-fg-muted">No notes yet.</p>,
      }}
    />
  )
}
