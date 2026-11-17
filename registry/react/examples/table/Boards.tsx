import { Table } from '@/react/components/ui/Table'
// A workspace's boards: what each holds and when it last changed, with a total under them.

const BOARDS = [
  { name: 'Acme hooks', creatives: 48, brands: 12, updated: 'Today' },
  { name: 'Acme summer launch', creatives: 112, brands: 9, updated: 'Yesterday' },
  { name: 'UGC openers', creatives: 36, brands: 21, updated: '3 days ago' },
  { name: 'Price in the first line', creatives: 27, brands: 8, updated: 'Last week' },
]

export default function Boards() {
  return (
    <Table>
      <caption>Boards in the Acme workspace.</caption>
      <thead>
        <tr>
          <th>Board</th>
          <th className="text-right">Creatives</th>
          <th className="text-right">Brands</th>
          <th>Updated</th>
        </tr>
      </thead>
      <tbody>
        {BOARDS.map((b) => (
          <tr key={b.name} data-state={b.name === 'Acme hooks' ? 'selected' : undefined}>
            <td>{b.name}</td>
            <td className="text-right">{b.creatives}</td>
            <td className="text-right">{b.brands}</td>
            <td className="text-fg-muted">{b.updated}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          <td className="text-right">223</td>
          <td className="text-right">50</td>
          <td />
        </tr>
      </tfoot>
    </Table>
  )
}
