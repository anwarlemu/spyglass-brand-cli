import { Pagination } from '@/react/components/ui/Pagination'
// The pages under a board's results: twelve pages, the second one open.

export default function Results() {
  return <Pagination pages={12} defaultPage={2} label="Board pages" />
}
