import { assertSpyCall, assertSpyCalls, Spy } from '@std/testing/mock';
import type { Page } from 'rebrowser-puppeteer-core';
import { Locator } from 'rebrowser-puppeteer-core';
import { describe, it } from '@std/testing/bdd';
import { getSpy } from '../../../test/get-spy.ts';
import { expect } from '@std/expect/expect';
import {
  getByTestId,
  getByText,
  getFirstByTestId,
} from './puppeteer-locator.ts';

interface SetupParams {
  locatorImpl?: (...args: Array<string>) => Locator<Element>;
}

describe('Puppeteer Locator', () => {
  let mockPage: Page;
  let mockLocator: Spy<Page, Array<string>, Locator<Element>> = getSpy<
    Page,
    (...args: Array<string>) => Locator<Element>
  >();

  function setup({ locatorImpl }: SetupParams = {}) {
    mockLocator = getSpy(locatorImpl);
    mockPage = {
      locator: mockLocator,
    } as unknown as Page;
  }

  describe('getByTestId()', () => {
    it('should call with data-testid attr selector', () => {
      const expectedTestId = 'user-menu';
      setup();

      getByTestId(mockPage, expectedTestId);

      assertSpyCalls(mockLocator, 1);
      assertSpyCall(mockLocator, 0, {
        args: [`[data-testid="${expectedTestId}"]`],
      });
    });

    it('should propagate errors from page.locator', () => {
      const expectedError = new Error('test error');
      const locatorImpl = () => {
        throw expectedError;
      };

      setup({ locatorImpl });

      expect(() => getByTestId(mockPage, 'test')).toThrow(expectedError);
    });
  });

  describe('getFirstByTestId()', () => {
    it('should call with data-testid attr selector, :first-of-type', () => {
      const expectedTestId = 'user-edit-button';
      setup();

      getFirstByTestId(mockPage, expectedTestId);

      assertSpyCalls(mockLocator, 1);
      assertSpyCall(mockLocator, 0, {
        args: [`[data-testid="${expectedTestId}"]:first-of-type`],
      });
    });

    it('should propagate errors from page.locator', () => {
      const expectedError = new Error('test error');
      const locatorImpl = () => {
        throw expectedError;
      };

      setup({ locatorImpl });

      expect(() => getFirstByTestId(mockPage, 'test')).toThrow(expectedError);
    });
  });

  describe('getByText()', () => {
    it('should call with only ::p-text if element type is undefined', () => {
      const expectedText = 'Submit';
      setup();

      getByText(mockPage, expectedText);

      assertSpyCalls(mockLocator, 1);
      assertSpyCall(mockLocator, 0, {
        args: [`::-p-text(${expectedText})`],
      });
    });

    it('should call with element type and ::p-text if element type is passed', () => {
      const expectedElementType = 'button';
      const expectedText = 'Submit';
      setup();

      getByText(mockPage, expectedText, expectedElementType);

      assertSpyCalls(mockLocator, 1);
      assertSpyCall(mockLocator, 0, {
        args: [`${expectedElementType} ::-p-text(${expectedText})`],
      });
    });

    it('should propagate errors from page.locator', () => {
      const expectedError = new Error('test error');
      const locatorImpl = () => {
        throw expectedError;
      };

      setup({ locatorImpl });

      expect(() => getByText(mockPage, 'test')).toThrow(expectedError);
    });
  });
});
