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

/**
 * Enters a URL into the search bar of a specified search engine page and submits the search.
 *
 * @param {Page} page - The Playwright Page object representing the current browser page
 * @param {SearchEngineType} searchEngine - The type of search engine being used (google, bing, yahoo, etc.)
 * @param {string} URL - The URL string to be entered into the search bar
 * @returns Promise that resolves when the URL has been entered and search submitted
 *
 */
const enterURLInSearchBar = async (
  page: Page,
  searchEngine: SearchEngineType,
  URL: string
): Promise<void> => {
  // Prevent form submissions from opening new windows
  await page.evaluate(() => {
    const forms = document.querySelectorAll("form");
    forms.forEach((form) => {
      form.setAttribute("target", "_self");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
      });
    });
  });

  switch (searchEngine) {
    case "google":
      await page.getByRole("combobox").fill(URL);
      await page.goto(
        `https://www.google.com/search?q=${encodeURIComponent(URL)}`
      );
      break;
    case "yahoo":
      await page.getByRole("combobox").fill(URL);
      await page.goto(
        `https://search.yahoo.com/search?p=${encodeURIComponent(URL)}`
      );
      break;
    case "duckduckgo":
      await page.getByRole("combobox").fill(URL);
      await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(URL)}`);
      break;
    case "bing":
      await page.locator("#sb_form_q").fill(URL);
      await page.goto(
        `https://www.bing.com/search?q=${encodeURIComponent(URL)}`
      );
      break;
    case "startpage":
      await page.locator("input#q.search-form-input").fill(URL);
      await page.goto(
        `https://www.startpage.com/sp/search?q=${encodeURIComponent(URL)}`
      );
      break;
    case "qwant":
      await page.getByLabel("Enter your search term").fill(URL);
      await page.goto(`https://www.qwant.com/?q=${encodeURIComponent(URL)}`);
      break;
    case "search.brave":
      await page.locator("textarea#searchbox").fill(URL);
      await page.goto(
        `https://search.brave.com/search?q=${encodeURIComponent(URL)}`
      );
      break;
    case "mojeek":
      await page.getByPlaceholder("No Tracking. Just Search...").fill(URL);
      await page.goto(
        `https://www.mojeek.com/search?q=${encodeURIComponent(URL)}`
      );
      break;
    default:
      throw new Error(`Unsupported search engine: ${searchEngine}`);
  }

  await completelyWaitForPageLoad(page);
};

/**
 * Opens a link from search results and navigates to a new page.
 *
 * @param {Page} page - The current Playwright page instance
 * @param {string} websiteURL - The URL substring to match in search results
 * @returns {Promise<Page>} A promise that resolves to the new page after navigation
 * @throws Will throw an error if the link is not found or navigation fails
 * @description This function:
 * 1. Finds a link in search results containing the given URL
 * 2. Clicks the link and waits for new page to open
 * 3. Closes original pages and returns the newly navigated page
 */
const openLinkFromSearchResults = async (
  page: Page,
  websiteURL: string
): Promise<void> => {
  await page.waitForTimeout(1000);

  const navigationPromise = page.waitForNavigation();

  const link = await page.locator(`a[href*="${websiteURL}"]`).first();
  await link.scrollIntoViewIfNeeded();

  // Modify link behavior to prevent new tab/window
  await page.evaluate((selector) => {
    const element = document.querySelector(selector) as HTMLAnchorElement;
    if (element) {
      // Store the original href
      const originalHref = element.href;

      // Prevent default navigation and handle it manually
      element.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          window.location.href = originalHref;
        },
        { capture: true }
      );

      // Remove any attributes that might cause new tab/window
      element.removeAttribute("target");
      element.removeAttribute("rel");
    }
  }, `a[href*="${websiteURL}"]`);

  await link.click();
  await navigationPromise;
  await completelyWaitForPageLoad(page);
};

/**
 * Navigates to a website through a search engine by searching for its URL.
 * This simulates a more natural browsing behavior compared to direct navigation.
 *
 * @param {Page} page - The Playwright Page object to perform actions on
 * @param {SearchEngineType} searchEngine - The search engine to use (e.g., 'google', 'bing')
 * @param {string} websiteURL - The URL of the website to navigate to
 * @returns {Page} A Promise resolving to a new Page object representing the opened website
 */
const navigateToWebsiteThroughSearchEngine = async (
  page: Page,
  searchEngine: SearchEngineType,
  websiteURL: string
): Promise<void> => {
  await navigateToSearchEngine(page, searchEngine);
  await explicitlyDenyCookies(page, searchEngine);

  try {
    await enterURLInSearchBar(page, searchEngine, websiteURL);
    await openLinkFromSearchResults(page, websiteURL);
  } catch (error) {
    console.log(
      `The link ${websiteURL} was not found in search results for ${searchEngine} search engine.`
    );
    console.log(" Trying direct navigation instead...");
    await page.goto(websiteURL);
  }
};

export {
  logCLIHelp,
  completelyWaitForPageLoad,
  waitForSelectorAndClick,
  waitForSelectorByTextAndClick,
  navigateToWebsiteThroughSearchEngine,
};
