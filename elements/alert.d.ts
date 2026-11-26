export type AlertVariant = 'default' | 'destructive'
/**
 * <spyglass-alert>
 * @slot (default) The line under the subject.
 * @slot icon A 16px Lucide icon.
 * @slot action A button at the end.
 */
export declare class Alert extends HTMLElement {
  heading: string;
  variant: AlertVariant;
  alertRole: "alert" | "status";
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-alert': Alert;
  }
}
