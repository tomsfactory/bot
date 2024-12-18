import { spy } from 'jsr:@std/testing/mock';

export function getSpy<
  Self = unknown,
  // deno-lint-ignore no-explicit-any
  Method extends (...args: any[]) => any = (...args: any[]) => any,
>(
  implementation?: (
    this: Self,
    ...args: Parameters<Method>
  ) => ReturnType<Method>,
) {
  if (implementation === undefined) {
    return spy<Self, Parameters<Method>, ReturnType<Method>>();
  }

  return spy<Self, Parameters<Method>, ReturnType<Method>>(implementation);
}
