import { TestimonialBlock } from '@/react/components/blocks/TestimonialBlock'
// The testimonial ad's arrangement on the card fill, without a headshot.

export default function Card() {
  return <TestimonialBlock card layout="stacked" image={false} quote="This is the only tool that gives me full competitive visibility across every account I manage." name="Acme customer" position="Head of growth, Acme" />
}
