import { RadioGroup } from '@/react/components/ui/RadioGroup'
// A sort order in a row, over a grid of creatives.

export default function Inline() {
  return (
    <RadioGroup
      label="Sort creatives"
      inline
      defaultValue="spend"
      options={[
        { value: 'spend', label: 'Spend' },
        { value: 'new', label: 'Newest' },
        { value: 'running', label: 'Longest running' },
      ]}
    />
  )
}
