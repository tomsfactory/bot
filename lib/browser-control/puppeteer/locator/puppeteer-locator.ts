import { Locator, NodeFor, Page } from 'npm:rebrowser-puppeteer-core@23.10.3';

/**
 * Retrieves a locator for an element based on the specified `data-testid` attribute.
 *
 * @param {Pick<Page, 'locator'>} page - The page object that provides the `locator` method.
 * @param {string} testId - The value of the `data-testid` attribute to locate the element.
 * @return {Locator<NodeFor<`[data-testid="${string}"]`>>} A locator for the element with the provided `data-testid` value.
 */
export function getByTestId(
  page: Pick<Page, 'locator'>,
  testId: string,
): Locator<NodeFor<`[data-testid="${string}"]`>> {
  return page.locator(`[data-testid="${testId}"]`);
}

/**
 * Retrieves the first HTML element matching the specified `data-testid` attribute.
 *
 * @param {Pick<Page, 'locator'>} page - The page object that provides the `locator` method to locate elements.
 * @param {string} testId - The value of the `data-testid` attribute to search for.
 * @return {Locator<NodeFor<`[data-testid="${string}"]`>>} The locator for the first element found with the matching `data-testid` attribute.
 */
export function getFirstByTestId(
  page: Pick<Page, 'locator'>,
  testId: string,
): Locator<NodeFor<`[data-testid="${string}"]`>> {
  return page.locator(`[data-testid="${testId}"]:first-of-type`);
}

/**
 * Finds an element on the page matching the specified text and optional element type.
 *
 * @param {Pick<Page, 'locator'>} page - The page object containing the locator method.
 * @param {string} text - The text to search for within the elements.
 * @param {string} [elementType=''] - Optional. The type of element to narrow the search (e.g., 'div', 'span'). Default is an empty string, which searches all elements.
 * @return {Locator<NodeFor<`${string} ::-p-text(${string})`>>} A Locator pointing to the matching element(s) on the page.
 */
export function getByText(
  page: Pick<Page, 'locator'>,
  text: string,
  elementType: string = '',
): Locator<NodeFor<`${string} ::-p-text(${string})`>> {
  if (!elementType) return page.locator(`::-p-text(${text})`);
  return page.locator(`${elementType} ::-p-text(${text})`);
}
