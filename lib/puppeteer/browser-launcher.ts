import type { BrowserType } from 'npm:playwright';
import type { NativeCommand } from '../deno/native-command.ts';

/**
 * Options for BrowserLauncher
 */
export interface BrowserLauncherOptions {
  /**
   * If this and {@link separateBrowserPath} are set, a separate browser will be launched with the given port.
   */
  separateBrowserPort?: number;

  /**
   * If this and {@link separateBrowserPort} are set, a separate browser at the path specified here will be launched.
   */
  separateBrowserPath?: string;
}

/**
 * A class that launches a playwright browser.
 */
export class BrowserLauncher {
  /**
   * Constructs a new BrowserLauncher.
   *
   * @param browserType The browser type to launch.
   * @param nativeCommand A function that spawns a native command and returns output from the command.
   *
   * @example
   * ```ts
   * import { chromium } from 'npm:playwright';
   * import { BrowserLauncher } from '@tomsfactory/bot/puppeteer';
   *
   * const launcher = new BrowserLauncher(chromium);
   * await launcher.launch();
   * ```
   */
  constructor(
    private readonly browserType: Pick<BrowserType, 'launch'>,
    private readonly nativeCommand: NativeCommand = (
      command: string,
      options?: Deno.CommandOptions,
    ) => new Deno.Command(command, options),
  ) {
  }

  /**
   * Launches the browser.
   *
   * @param options Options for launching the browser.
   */
  async launch(options?: BrowserLauncherOptions): Promise<void> {
    this.assertSeparateBrowserOptionsAllOrNothing(options);
    this.spawnSeparateBrowser(options);
    await this.browserType.launch();
  }

  /** @internal */
  private assertSeparateBrowserOptionsAllOrNothing(
    options: BrowserLauncherOptions | undefined,
  ) {
    if (!options?.separateBrowserPort != !options?.separateBrowserPath) {
      throw new Error(
        'separateBrowserPort must be used with separateBrowserPath',
      );
    }
  }

  /** @internal */
  private spawnSeparateBrowser(options?: BrowserLauncherOptions) {
    if (!options?.separateBrowserPort) return;

    const _command = this.nativeCommand(options.separateBrowserPath!, {
      args: [
        `--remote-debugging-port=${options.separateBrowserPort}`,
      ],
    });
  }
}
