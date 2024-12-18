import type { BrowserType } from 'npm:playwright';
import type { NativeCommand } from '../deno/native-command.ts';

export interface BrowserLauncherOptions {
  separateBrowserPort?: number;
  separateBrowserPath?: string;
}

export class BrowserLauncher {
  constructor(
    private readonly browserType: Pick<BrowserType, 'launch'>,
    private readonly nativeCommand: NativeCommand = (
      command: string,
      options?: Deno.CommandOptions,
    ) => new Deno.Command(command, options),
  ) {
  }

  async launch(options?: BrowserLauncherOptions): Promise<void> {
    this.assertSeparateBrowserOptionsAllOrNothing(options);
    this.spawnSeparateBrowser(options);
    await this.browserType.launch();
  }

  assertSeparateBrowserOptionsAllOrNothing(
    options: BrowserLauncherOptions | undefined,
  ) {
    if (!options?.separateBrowserPort != !options?.separateBrowserPath) {
      throw new Error(
        'separateBrowserPort must be used with separateBrowserPath',
      );
    }
  }

  spawnSeparateBrowser(options?: BrowserLauncherOptions) {
    if (!options?.separateBrowserPort) return;

    const _command = this.nativeCommand(options.separateBrowserPath!, {
      args: [
        `--remote-debugging-port=${options.separateBrowserPort}`,
      ],
    });
  }
}
