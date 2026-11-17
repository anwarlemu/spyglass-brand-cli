import { Toggle } from '@/react/components/ui/Toggle'
// The three sizes, pressed, beside the button's.

export default function Sizes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle size="sm" variant="outline" defaultPressed>Small</Toggle>
      <Toggle size="md" variant="outline" defaultPressed>Medium</Toggle>
      <Toggle size="lg" variant="outline" defaultPressed>Large</Toggle>
    </div>
  )
}
