import { describe, it } from 'jsr:@std/testing/bdd';
import type { BrowserType } from 'rebrowser-playwright-core';
import { expect, fn } from '@std/expect';

import { getSpy } from '../../test/get-spy.ts';
import {
  PlaywrightBrowserLauncher,
  type PlaywrightImplementation,
} from './playwright-browser-launcher.ts';
import { BROWSER_EXECUTABLE_PATH } from '../../env/env-keys.ts';

const browserExecutablePath = Deno.env.get(BROWSER_EXECUTABLE_PATH);

function getMockBrowserType() {
  return {
    launch: getSpy<BrowserType, BrowserType['launch']>(),
  };
}

const defaultBrowserLauncherArgs = {
  mockPlaywrightImplementation: getMockBrowserType(),
};

function setup({
  mockPlaywrightImplementation,
}: {
  mockPlaywrightImplementation?: PlaywrightImplementation;
} = defaultBrowserLauncherArgs) {
  return new PlaywrightBrowserLauncher(
    mockPlaywrightImplementation as PlaywrightImplementation ??
      defaultBrowserLauncherArgs.mockPlaywrightImplementation,
  );
}

describe('PlaywrightBrowserLauncher', () => {
  it('should launch browser', async () => {
    const mockPlaywrightImplementation = { launch: fn() };
    const launcher = setup({
      mockPlaywrightImplementation:
        mockPlaywrightImplementation as PlaywrightImplementation,
    });

    await launcher.launch();

    expect(mockPlaywrightImplementation.launch).toHaveBeenCalledTimes(1);
  });

  it('should launch browser with defaults', async () => {
    const mockPlaywrightImplementation = { launch: fn() };
    const launcher = setup({
      mockPlaywrightImplementation:
        mockPlaywrightImplementation as PlaywrightImplementation,
    });

    await launcher.launch();

    expect(mockPlaywrightImplementation.launch).toHaveBeenCalledWith({
      args: [
        '--disable-blink-features=AutomationControlled',
      ],
      executablePath: browserExecutablePath,
      headless: false,
    });
  });

  it('should launch browser with headless: true', async () => {
    const mockPlaywrightImplementation = { launch: fn() };
    const launcher = setup({
      mockPlaywrightImplementation:
        mockPlaywrightImplementation as PlaywrightImplementation,
    });

    await launcher.launch({ headless: true });

    expect(mockPlaywrightImplementation.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: true,
      }),
    );
  });

  it('should launch browser with headless: false', async () => {
    const mockPlaywrightImplementation = { launch: fn() };
    const launcher = setup({
      mockPlaywrightImplementation:
        mockPlaywrightImplementation as PlaywrightImplementation,
    });

    await launcher.launch({ headless: false });

    expect(mockPlaywrightImplementation.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: false,
      }),
    );
  });

  it('should pass all other options to launch', async () => {
    const mockPlaywrightImplementation = { launch: fn() };
    const launcher = setup({
      mockPlaywrightImplementation:
        mockPlaywrightImplementation as PlaywrightImplementation,
    });

    await launcher.launch({ headless: false, slowMo: 100 });

    expect(mockPlaywrightImplementation.launch).toHaveBeenCalledWith(
      expect.objectContaining({
        headless: false,
      }),
    );
  });
});
