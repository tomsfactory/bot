/**
 * A utility type that makes all properties of an object type `T` optional recursively.
 * This allows for nested optional properties, transforming arrays of objects, and deep
 * structures into equivalent structures where all properties are optional at every level.
 *
 * @template T The type that will be transformed into a recursive partial.
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[]
    : T[P] extends object | undefined ? RecursivePartial<T[P]>
    : T[P];
};
