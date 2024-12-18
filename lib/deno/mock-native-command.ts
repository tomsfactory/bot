import { spy } from 'jsr:@std/testing/mock';
import type { DenoCommand } from './native-command.ts';

export function getMockDenoCommand(
  mockResponse: string = '',
): Pick<DenoCommand, 'output'> {
  return {
    output: spy(() =>
      Promise.resolve({
        code: 0,
        success: true,
        signal: null,
        stdout: new TextEncoder().encode(mockResponse),
        stderr: new Uint8Array(),
      })
    ),
  };
}
//
// export function getMockNativeCommand() {
//   return spy<
//     DenoCommand,
//     [string, Deno.CommandOptions?],
//     DenoCommand
//   >(() => mockDenoCommand);
// }
