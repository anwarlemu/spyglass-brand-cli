import { Button } from '@/react/components/ui/Button'
import { Table } from '@/react/components/ui/Table'
// Tracked brands in a hairline frame, each row with its action at the end; it scrolls sideways on a phone.

const BRANDS = [
  { name: 'Acme', ads: 214, added: 'Jan 12' },
  { name: 'Acme Studio', ads: 86, added: 'Feb 3' },
  { name: 'Acme Goods', ads: 39, added: 'Mar 21' },
]

export default function Tracked() {
  return (
    <Table framed label="Tracked brands">
      <thead>
        <tr>
          <th>Brand</th>
          <th className="text-right">Live ads</th>
          <th>Tracked since</th>
          <th><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {BRANDS.map((b) => (
          <tr key={b.name}>
            <td>{b.name}</td>
            <td className="text-right">{b.ads}</td>
            <td className="text-fg-muted">{b.added}</td>
            <td className="text-right"><Button variant="secondary" size="sm">View ads</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
