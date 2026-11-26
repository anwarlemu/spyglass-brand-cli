export interface Story {
  company: string
  /** The company's mark; without one the company is set as text. */
  logo?: StoryMark
  quote: string
  name: string
  role: string
  /** The person's photo, cropped round; without one, their initials. */
  photo?: string
}
export interface StoryMark {
  src: string
  /** Width over height. */
  ratio: number
  /** Height in px: 16, 20, 24 or 32. */
  height: number
}
export interface StoryCustomer {
  name: string
  src?: string
  ratio?: number
  height?: number
}
/**
 * <spyglass-stories-block>

 */
export declare class StoriesBlock extends HTMLElement {
  sectionId: string;
  headline: string;
  lead: string;
  stories: Story[];
  customers: boolean;
  logos: StoryCustomer[];
  customersLabel: string;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-stories-block': StoriesBlock;
  }
}
