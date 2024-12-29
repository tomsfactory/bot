import type {
  Browser,
  LaunchOptions,
  PuppeteerNode,
} from 'rebrowser-puppeteer-core';
import puppeteer from 'rebrowser-puppeteer-core';

/**
 * Options for BrowserLauncher
 */
export interface BrowserLauncherOptions extends LaunchOptions {
  /**
   * The location on disk of the puppeteer compatible browser to launch
   */
  separateBrowserPath?: string;
}

/**
 * A pick of the BrowserType interface that only includes the launch and connect methods. Connect is added to the BrowserType because Typescript can't handle the method overload.
 */
export type BrowserTypeForLauncher = Pick<PuppeteerNode, 'launch'>;

/**
 * A class that launches a puppeteer browser.
 */
export class BrowserLauncher {
  /**
   * Constructs a new BrowserLauncher.
   *
   * @param browserType The browser type to launch.
   * @example
   * ```ts
   * import { BrowserLauncher } from '@tomsfactory/bot/puppeteer';
   *
   * const launcher = new BrowserLauncher();
   * await launcher.launch();
   * ```
   */
  constructor(
    private readonly browserType: BrowserTypeForLauncher = puppeteer,
  ) {
  }

  /**
   * Launches the browser.
   *
   * @param options Options for launching the browser.
   */
  launch(options?: BrowserLauncherOptions): Promise<Browser> {
    return this.browserType.launch({
      executablePath: options?.separateBrowserPath ?? '/usr/bin/google-chrome',
      headless: false,
      defaultViewport: null,
      args: [
        // navigator.webdriver = true indicates that browser is automated. Use --disable-blink-features=AutomationControlled switch for Chrome. See https://bot-detector.rebrowser.net/
        '--disable-blink-features=AutomationControlled',
      ],
      ...options,
    });
  }
}
