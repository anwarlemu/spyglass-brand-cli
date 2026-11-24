import { UseCaseAnswer } from '@/react/components/site/UseCaseAnswer'
import { useCaseAnswerApi } from '@/lib/use-case-answer'
// One API request and its answer: the request as code, the rows with their figures in the mono face's column heads.

export default function Api() {
  return <div className="mx-auto max-w-200 p-4 md:p-8"><UseCaseAnswer example={useCaseAnswerApi} /></div>
}
