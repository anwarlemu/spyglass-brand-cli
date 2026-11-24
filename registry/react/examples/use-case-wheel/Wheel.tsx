import { UseCaseWheel } from '@/react/components/blocks/UseCaseWheel'
// The wheel with its six audiences and Acme placeholder creatives, held still so it reads at rest (it turns every 2.4s
// with autoplay on).

export default function Wheel() {
  return <UseCaseWheel id="wheel" autoplay={false} />
}
