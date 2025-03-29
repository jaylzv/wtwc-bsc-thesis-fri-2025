import { Page } from "@playwright/test";

/**
 * Logs the CLI help instructions to the console.
 */
const logCLIHelp = (): void => {
  console.log(`
    Usage: npm run main -- [options]
    
    Options:
      -a, --all                Run all tests
      -t, --tests              Specify tests to run (comma-separated)
      -b, --browsers           Specify browsers to use (comma-separated)
      -s, --search-engines     Specify search engines to use (comma-separated)
      -e, --extensions         Specify extensions to use (comma-separated)
      -h, --headless           Enable headless mode (better performance)

    Examples:
      npm run main -- -a
      # Runs all tests with default settings.

      npm run main -- -t fingerprinting,link_decorating -b chrome,firefox
      # Runs fingerprinting and link decorating tests on Chrome and Firefox.

      npm run main -- -t bounce_tracking -s google,bing
      # Runs bounce tracking test using Google and Bing search engines.

      npm run main -- -b chrome -e uBlockOrigin,AdblockPlus
      # Runs all tests on Chrome with uBlockOrigin and AdblockPlus extensions.

    Note:
      If some arguments are not included, all of the values for that arg are tested by default.
  `);
};

/**
 * Waits for the page to completely load by waiting for various load states.
 *
 * @param {Page} page - The Playwright Page object to wait for.
 * @returns {Promise<void>} A promise that resolves when the page has completely loaded.
 *
 * @remarks
 * This function waits for three load states:
 * 1. "load" - The load event is fired when the whole page has loaded, including all dependent resources such as stylesheets and images.
 * 2. "domcontentloaded" - The DOMContentLoaded event is fired when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, images, and subframes to finish loading.
 * 3. "networkidle" - This state is deprecated and should be avoided in future implementations.
 */
const completelyWaitForPageLoad = async (page: Page): Promise<void> => {
  await page.waitForLoadState("load");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // Deprecated, could be removed in future.
};

/**
 * Navigates to the specified URL and waits for the page to load completely.
 *
 * @param {Page} page - The Playwright Page object.
 * @param {string} url - The URL to navigate to.
 * @returns {Promise<void>} A promise that resolves when the navigation is complete.
 */
const properlyNavigateToURL = async (
  page: Page,
  url: string
): Promise<void> => {
  await page.goto(url);
  await completelyWaitForPageLoad(page);
};

/**
 * Waits for a selector to be attached to the DOM, optionally waits for it to become visible,
 * scrolls it into view if needed, and then clicks on it.
 *
 * @param {Page} page - The Playwright `Page` instance to perform actions on.
 * @param {string} selector - The CSS selector of the element to interact with.
 * @param {boolean} shouldWaitForVisible - Optional. If `true`, waits for the element to become visible
 *                               before clicking. Defaults to `false`.
 * @returns {Promise<void>} A promise that resolves when the click action is completed.
 * @throws Will throw an error if the selector is not found, or if the element does not
 *         become visible within the timeout when `shouldWaitForVisible` is `true`.
 */
const waitForSelectorAndClick = async (
  page: Page,
  selector: string
): Promise<void> => {
  const locator = await page.locator(selector);

  await locator.waitFor({ state: "attached", timeout: 5000 });
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: "visible", timeout: 5000 });
  await locator.click();
};

/**
 * Waits for an element containing the specified text to be attached to the DOM,
 * optionally waits for it to become visible, scrolls it into view if needed,
 * and then clicks on it.
 *
 * @param {Page} page - The Playwright `Page` instance to perform actions on.
 * @param {string} text - The exact text content of the element to interact with.
 * @returns {Promise<void>} A promise that resolves when the click action is completed.
 * @throws Will throw an error if the element with the specified text is not found,
 *         or if it does not become visible within the timeout.
 */
const waitForSelectorByTextAndClick = async (
  page: Page,
  text: string
): Promise<void> => {
  const locator = await page.getByText(text, { exact: true });

  await locator.waitFor({ state: "attached", timeout: 5000 });
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: "visible", timeout: 5000 });
  await locator.click();
};

export {
  logCLIHelp,
  completelyWaitForPageLoad,
  properlyNavigateToURL,
  waitForSelectorAndClick,
  waitForSelectorByTextAndClick,
};
