/**
 * <spyglass-prompt-card>
 * @fires send With { text } when sent.
 */
export declare class PromptCard extends HTMLElement {
  placeholder: string;
  label: string;
  sendLabel: string;
  worksLabel?: string | undefined;
  works: string[];
  value: string;
  name: string;
  disabled: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-prompt-card': PromptCard;
  }
}
