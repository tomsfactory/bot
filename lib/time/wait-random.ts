/**
 * Returns a promise that resolves after a random delay between the specified range.
 *
 * @param {number} fromMs - The minimum delay duration in milliseconds.
 * @param {number} toMs - The maximum delay duration in milliseconds.
 * @param {function} randomImpl - A function to generate a random number, defaults to Math.random.
 * @return {Promise<void>} A promise that resolves after the random delay.
 */
export function waitRandom(
  fromMs: number,
  toMs: number,
  randomImpl: typeof Math.random = Math.random,
): Promise<void> {
  const delayMs = fromMs + randomImpl() * (toMs - fromMs);
  return new Promise<void>((resolve) => setTimeout(() => resolve(), delayMs));
}
