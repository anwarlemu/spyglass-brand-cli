import { PageClose } from '@/react/components/site/PageClose'
// A White and a quiet button, without the texture.

export default function Buttons() {
  return <PageClose id="start" lines={['Start building', 'with Acme today']} note="Free to try. No card required." control={null} texture={false} />
}
