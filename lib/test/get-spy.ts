import { type Spy, spy } from '@std/testing/mock';

/**
 * @internal
 * The return type of {@link getSpy}.
 */
export type SpyReturnSpy<
  Self = unknown,
  // deno-lint-ignore no-explicit-any
  Method extends (...args: any[]) => any = (...args: any[]) => any,
> = Spy<
  Self,
  Parameters<Method>,
  ReturnType<Method>
>;

/**
 * Returns a spy function with the types of a known function
 * @param implementation
 * @returns A {@link Spy} function
 *
 * @example
 * ```ts
 * const pageEvaluateSpy = getSpy<Page, Page['evaluate']>();
 * ```
 */
export function getSpy<
  Self = unknown,
  // deno-lint-ignore no-explicit-any
  Method extends (...args: any[]) => any = (...args: any[]) => any,
>(
  implementation?: (
    this: Self,
    ...args: Parameters<Method>
  ) => ReturnType<Method>,
): SpyReturnSpy<Self, Method> {
  if (implementation === undefined) {
    return spy<Self, Parameters<Method>, ReturnType<Method>>();
  }

  return spy<Self, Parameters<Method>, ReturnType<Method>>(implementation);
}
