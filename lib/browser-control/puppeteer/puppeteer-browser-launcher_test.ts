import { describe, it } from 'jsr:@std/testing/bdd';
import type { PuppeteerNode } from 'rebrowser-puppeteer-core';
import { expect, fn } from '@std/expect';

import { getSpy } from '../../test/get-spy.ts';
import {
  PuppeteerBrowserLauncher,
  type PuppeteerImplementation,
} from './puppeteer-browser-launcher.ts';
import { BROWSER_EXECUTABLE_PATH } from '../../env/env-keys.ts';

const browserExecutablePath = Deno.env.get(BROWSER_EXECUTABLE_PATH);

function getMockBrowserType() {
  return {
    launch: getSpy<PuppeteerNode, PuppeteerNode['launch']>(),
  };
}

const defaultBrowserLauncherArgs = {
  mockPuppeteerImplementation: getMockBrowserType(),
};

function setup({
  mockPuppeteerImplementation,
}: {
  mockPuppeteerImplementation?: PuppeteerImplementation;
} = defaultBrowserLauncherArgs) {
  return new PuppeteerBrowserLauncher(
    mockPuppeteerImplementation as PuppeteerImplementation ??
      defaultBrowserLauncherArgs.mockPuppeteerImplementation,
  );
}

describe('PuppeteerBrowserLauncher', () => {
  it('should launch browser', async () => {
    const mockPuppeteerImplementation = { launch: fn() };
    const launcher = setup({
      mockPuppeteerImplementation:
        mockPuppeteerImplementation as PuppeteerImplementation,
    });

    await launcher.launch();

    expect(mockPuppeteerImplementation.launch).toHaveBeenCalledTimes(1);
  });

  it('should launch browser with defaults', async () => {
    const mockPuppeteerImplementation = { launch: fn() };
    const launcher = setup({
      mockPuppeteerImplementation:
        mockPuppeteerImplementation as PuppeteerImplementation,
    });

    await launcher.launch();

    expect(mockPuppeteerImplementation.launch).toHaveBeenCalledWith({
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
      defaultViewport: null,
      executablePath: browserExecutablePath,
      headless: false,
    });
  });

  it('should launch browser with headless: true', async () => {
    const mockPuppeteerImplementation = { launch: fn() };
    const launcher = setup({
      mockPuppeteerImplementation:
        mockPuppeteerImplementation as PuppeteerImplementation,
    });

    await launcher.launch({ headless: true });

    expect(mockPuppeteerImplementation.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: true,
      }),
    );
  });

  it('should launch browser with headless: false', async () => {
    const mockPuppeteerImplementation = { launch: fn() };
    const launcher = setup({
      mockPuppeteerImplementation:
        mockPuppeteerImplementation as PuppeteerImplementation,
    });

    await launcher.launch({ headless: false });

    expect(mockPuppeteerImplementation.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: false,
      }),
    );
  });

  it('should pass all other options to launch', async () => {
    const mockPuppeteerImplementation = { launch: fn() };
    const launcher = setup({
      mockPuppeteerImplementation:
        mockPuppeteerImplementation as PuppeteerImplementation,
    });

    await launcher.launch({ headless: false, slowMo: 100 });

    expect(mockPuppeteerImplementation.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: false,
      }),
    );
  });
});
