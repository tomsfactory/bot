export type DenoCommand = Pick<Deno.Command, 'output'>;

export type NativeCommand = (
  command: string,
  options?: Deno.CommandOptions,
) => Pick<DenoCommand, 'output'>;
