import { spy } from 'jsr:@std/testing/mock';

/**
 * Returns a mock {@link Deno.Command} that resolves with the given response.
 * @param mockResponse
 */
export function getMockDenoCommand(
  mockResponse: string = '',
): Pick<Deno.Command, 'output'> {
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
