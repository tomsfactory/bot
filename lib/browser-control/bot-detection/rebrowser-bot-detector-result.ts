/**
 * @internal
 */
export interface RebrowserBotDetectorResult {
  /**
   * The type of result detection.
   */
  type: string;

  /**
   * -1 means good, 0 means neutral, 1 means failed.
   */
  rating: number;

  /**
   * A description of the result.
   */
  note: string;
}
