export type LineSeries = { label: string, points: Array<{ t: number, v: number }> }
/**
 * <spyglass-line-chart>

 */
export declare class LineChart extends HTMLElement {
  heading: string;
  series: LineSeries[];
  format: (value: number) => string;
  formatAxis: (value: number) => string;
  formatTime: (t: number) => string;
  bare: boolean;
}
declare global {
  interface HTMLElementTagNameMap {
    'spyglass-line-chart': LineChart;
  }
}
