import { describe, it } from 'jsr:@std/testing/bdd';
import type { PuppeteerNode } from 'rebrowser-puppeteer-core';
import {
  BrowserLauncher,
  type BrowserTypeForLauncher,
} from './browser-launcher.ts';
import { expect, fn } from '@std/expect';

import { getSpy } from '../test/get-spy.ts';

function getMockBrowserType() {
  return {
    launch: getSpy<PuppeteerNode, PuppeteerNode['launch']>(),
  };
}

const defaultBrowserLauncherArgs = {
  mockBrowserType: getMockBrowserType(),
};

function getBrowserLauncher({
  mockBrowserType,
}: {
  mockBrowserType?: BrowserTypeForLauncher;
} = defaultBrowserLauncherArgs) {
  return new BrowserLauncher(
    mockBrowserType as BrowserTypeForLauncher ??
      defaultBrowserLauncherArgs.mockBrowserType,
  );
}

describe('BrowserLauncher', () => {
  it('should launch browser', async () => {
    const mockBrowserType = { launch: fn() };
    const launcher = getBrowserLauncher({
      mockBrowserType: mockBrowserType as BrowserTypeForLauncher,
    });

    await launcher.launch();

    expect(mockBrowserType.launch).toHaveBeenCalledTimes(1);
  });

  it('should launch browser with defaults', async () => {
    const mockBrowserType = { launch: fn() };
    const launcher = getBrowserLauncher({
      mockBrowserType: mockBrowserType as BrowserTypeForLauncher,
    });

    await launcher.launch();

    expect(mockBrowserType.launch).toHaveBeenCalledWith({
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
      defaultViewport: null,
      executablePath: '/usr/bin/google-chrome',
      headless: false,
    });
  });

  it('should launch browser with headless: true', async () => {
    const mockBrowserType = { launch: fn() };
    const launcher = getBrowserLauncher({
      mockBrowserType: mockBrowserType as BrowserTypeForLauncher,
    });

    await launcher.launch({ headless: true });

    expect(mockBrowserType.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: true,
      }),
    );
  });

  it('should launch browser with headless: false', async () => {
    const mockBrowserType = { launch: fn() };
    const launcher = getBrowserLauncher({
      mockBrowserType: mockBrowserType as BrowserTypeForLauncher,
    });

    await launcher.launch({ headless: false });

    expect(mockBrowserType.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: false,
      }),
    );
  });

  it('should pass all other options to launch', async () => {
    const mockBrowserType = { launch: fn() };
    const launcher = getBrowserLauncher({
      mockBrowserType: mockBrowserType as BrowserTypeForLauncher,
    });

    await launcher.launch({ headless: false, slowMo: 100 });

    expect(mockBrowserType.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: false,
      }),
    );
  });
});
