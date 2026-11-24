import { UseCaseHero } from '@/react/components/site/UseCaseHero'
import { useCaseBuildHeroContent } from '@/lib/use-case-hero'
// The build your own hero: a team's own library of running shoe ads, re-sorting itself every few seconds.

export default function Build() {
  return <UseCaseHero content={useCaseBuildHeroContent} visual="build" />
}
