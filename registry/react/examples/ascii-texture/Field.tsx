import { AsciiTexture } from '@/react/components/visuals/AsciiTexture'
// The texture on its own, at the canvas size.

export default function Field() {
  return <AsciiTexture seed={4} width={1080} height={540} className="w-full rounded-container bg-surface" />
}
