import { describe, it } from 'jsr:@std/testing/bdd';
import type { BrowserType } from 'npm:playwright';
import { BrowserLauncher } from './browser-launcher.ts';
import { assertSpyCall, assertSpyCalls, spy } from 'jsr:@std/testing/mock';
import { getMockDenoCommand } from '../deno/mock-native-command.ts';
import { assertRejects } from 'https://deno.land/std@0.154.0/testing/asserts.ts';
import { getSpy } from '../test/get-spy.ts';

describe('BrowserLauncher', () => {
  it('should launch browser', async () => {
    const mockBrowserType = {
      launch: getSpy<BrowserType, BrowserType['launch']>(),
    };
    const launcher = new BrowserLauncher(mockBrowserType);

    await launcher.launch();

    assertSpyCalls(mockBrowserType.launch, 1);
  });

  it('should throw if passed separateBrowserPORT but no separateBrowserPATH', () => {
    const mockBrowserType = {
      launch: getSpy<BrowserType, BrowserType['launch']>(),
    };
    const launcher = new BrowserLauncher(mockBrowserType);

    assertRejects(async () => {
      await launcher.launch({ separateBrowserPort: 8080 });
    }, 'separateBrowserPort must be used with separateBrowserPath');
  });

  it('should throw if passed separateBrowserPATH but no separateBrowserPORT', () => {
    const mockBrowserType = {
      launch: getSpy<BrowserType, BrowserType['launch']>(),
    };
    const launcher = new BrowserLauncher(mockBrowserType);

    assertRejects(async () => {
      await launcher.launch({ separateBrowserPath: '/usr/bin/chrome' });
    }, 'separateBrowserPort must be used with separateBrowserPath');
  });

  it('should launch separate browser with separate* args', async () => {
    const expectedPath = '/usr/bin/google-chrome';
    const expectedPort = 8080;
    const mockBrowserType = {
      launch: getSpy<BrowserType, BrowserType['launch']>(),
    };
    const mockDenoCommand = getMockDenoCommand();
    const mockNativeCommand = spy(() => mockDenoCommand);
    const launcher = new BrowserLauncher(mockBrowserType, mockNativeCommand);

    await launcher.launch({
      separateBrowserPort: expectedPort,
      separateBrowserPath: expectedPath,
    });

    assertSpyCall(mockNativeCommand, 0, {
      args: [
        expectedPath,
        {
          args: [`--remote-debugging-port=${expectedPort}`],
        },
      ],
    });
  });
});
