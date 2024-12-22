/**
 * A function that spawns a native command and returns output from the command.
 */
export type NativeCommand = (
  command: string,
  options?: Deno.CommandOptions,
) => Pick<Deno.Command, 'output'>;
