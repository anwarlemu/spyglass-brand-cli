export type DayPoint = { day: string, value: number }
/**
 * <spyglass-bar-chart>

 */
export declare class BarChart extends HTMLElement {
  points: DayPoint[];
  label: string;
  height: number;
  lit?: number[] | undefined;
  note?: string | undefined;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-bar-chart': BarChart;
  }
}
