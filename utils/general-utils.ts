import { Page } from "@playwright/test";
import { SearchEngineType } from "./search-engines/types";
import {
  explicitlyDenyCookies,
  navigateToSearchEngine,
} from "./search-engines/utils";

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
 * Waits for a selector to be attached to the DOM, optionally waits for it to become visible,
 * scrolls it into view if needed, and then clicks on it.
 *
 * @param {Page} page - The Playwright `Page` instance to perform actions on.
 * @param {string} selector - The CSS selector of the element to interact with.
 *
 * @returns {Promise<void>} A promise that resolves when the click action is completed.
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

const enterURLInSearchBar = async (
  page: Page,
  searchEngine: SearchEngineType,
  URL: string
): Promise<void> => {
  switch (searchEngine) {
    case "google":
    case "yahoo":
    case "duckduckgo":
      await page.getByRole("combobox").fill(URL);
      await page.keyboard.press("Enter");
      break;
    case "bing":
      await page.locator("#sb_form_q").fill(URL);
      await page.keyboard.press("Enter");
      break;
    case "startpage":
      await page.locator("input#q.search-form-input").fill(URL);
      await page.keyboard.press("Enter");
      break;
    case "qwant":
      await page.getByLabel("Enter your search term").fill(URL);
      await page.keyboard.press("Enter");
      break;
    case "search.brave":
      await page.locator("textarea#searchbox").fill(URL);
      await waitForSelectorAndClick(page, "button#submit-button");
      break;
    case "mojeek":
      await page.getByPlaceholder("No Tracking. Just Search...").fill(URL);
      await page.keyboard.press("Enter"); 
      break;
    default:
      throw new Error(`Unsupported search engine: ${searchEngine}`);
  }
};

/**
 * Navigates to a specified website through a search engine and handles cookie consent.
 *
 * @param {Page} page - The Playwright `Page` instance to perform actions on.
 * @param {SearchEngineType} searchEngine - The search engine to use for navigation.
 * @param {string} websiteURL - The URL of the website to navigate to.
 * @returns {Promise<void>} A promise that resolves when the navigation is complete.
 */
const navigateToWebsiteThroughSearchEngine = async (
  page: Page,
  searchEngine: SearchEngineType,
  websiteURL: string
): Promise<void> => {
  await navigateToSearchEngine(page, searchEngine);
  await explicitlyDenyCookies(page, searchEngine);

  await enterURLInSearchBar(page, searchEngine, websiteURL);
  await page.waitForTimeout(1000);

  const link = await page.locator(`a[href*="${websiteURL}"]`).first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await page.waitForTimeout(1000);

  await completelyWaitForPageLoad(page);
};

export {
  logCLIHelp,
  completelyWaitForPageLoad,
  waitForSelectorAndClick,
  waitForSelectorByTextAndClick,
  navigateToWebsiteThroughSearchEngine,
};
