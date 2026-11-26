export interface AnswerExample {
	/** chat (a question in a bubble) or api (the request as code). */
	mode: 'chat' | 'api'
	mention?: string
	question: string
	/** The request, shown in api mode. */
	request?: string
	/** "Worked for 5s", "200 OK in 412ms". */
	status: string
	lead?: string
	/** The item column and, when the rows have figures, the figure column. */
	columns: [string, string?]
	rows: AnswerRow[]
	note?: string
	/** The tools or endpoints called. */
	calls: string[]
}
export interface AnswerRow {
	title: string
	detail: string
	/** The figure on the right ("71", "84 days"). */
	figure?: string
	/** A creative beside the row: the user's own image (`src`), or a neutral placeholder. */
	creative?: ImageSlot & { brand?: string; tone?: 1 | 2 | 3 | 4 }
}
export interface ImageSlot {
	/** The image. */
	src?: string
	/** What it shows; empty when it is decoration. */
	alt?: string
	/** How it fills its box (object-fit); cover by default. */
	fit?: ImageFit
	/** Where it is anchored in its box (object-position), for example "50% 20%" or "top". */
	position?: string
}
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
/**
 * <spyglass-use-case-answer>

 */
export declare class UseCaseAnswer extends HTMLElement {
  example: AnswerExample;
  callsLabel: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-use-case-answer': UseCaseAnswer;
  }
}
