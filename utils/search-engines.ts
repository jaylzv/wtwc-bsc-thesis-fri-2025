import { Page } from "@playwright/test";

// Functions

/**
 * Extracts the URL for a given search engine.
 *
 * @param {SearchEngineType} searchEngine - The search engine identifier.
 * @returns {string} - The URL of the specified search engine.
 *
 * @remarks
 * The URL for Brave search engine is manually adjusted to "https://search.brave.com/".
 * For other search engines, the URL is generated in the format "https://www.{searchEngine}.com/".
 */
const extractUrlFromSearchEngine = (searchEngine: SearchEngineType): string => {
  return searchEngine === "search.brave"
    ? "https://search.brave.com/"
    : `https://www.${searchEngine}.com/`;
};

/**
 * Rejects cookies by clicking a button with the specified text selector on the given page.
 *
 * @param {Page} page - The Page object representing the browser page.
 * @param {string} textSelector - The exact text of the button to reject cookies.
 * @param {SearchEngineType} searchEngine - The type of search engine being used.
 * @returns {Promise<void>} - A promise that resolves when the cookies have been rejected.
 */
const rejectCookiesForSearchEngine = async (
  page: Page,
  textSelector: string,
  searchEngine: SearchEngineType
): Promise<void> => {
  const rejectCookiesButton = await page.getByText(textSelector, {
    exact: true,
  });

  const matchesFound = await rejectCookiesButton.count();

  if (matchesFound > 1) {
    // TODO: Isolated use case for yahoo. Update/clean up somehow?
    await rejectCookiesButton.last().waitFor({ state: "attached" });
    await rejectCookiesButton.last().scrollIntoViewIfNeeded();
    await rejectCookiesButton
      .last()
      .waitFor({ state: "visible", timeout: 5000 });
    await rejectCookiesButton.last().click();
  } else {
    await rejectCookiesButton.waitFor({ state: "attached" });
    await rejectCookiesButton.scrollIntoViewIfNeeded();
    await rejectCookiesButton.waitFor({ state: "visible", timeout: 5000 });
    await rejectCookiesButton.click();
  }

  console.log(`Rejected cookies for ${searchEngine}.`);
};

/**
 * Navigates to the specified search engine URL.
 *
 * @param {Page} page - The Playwright `Page` object to use for navigation.
 * @param {SearchEngineType} searchEngine - Search engine to navigate to.
 * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
 */
const navigateToSearchEngine = async (
  page: Page,
  searchEngine: SearchEngineType
): Promise<void> => {
  const searchEngineUrl = extractUrlFromSearchEngine(searchEngine);
  await page.goto(searchEngineUrl);
};

/**
 * Explicitly denies cookies after initial navigation to search engine.
 * Each search engine displays and handles cookies differently.
 *
 * @param {Page} page - The Playwright `Page` object to use for navigation.
 * @param {SearchEngineType} searchEngine - Search engine to navigate to and deny cookies.
 * @returns {Promise<void>} - A promise that resolves when the cookies are denied.
 */
const explicitlyDenyCookies = async (
  page: Page,
  searchEngine: SearchEngineType
): Promise<void> => {
  const textSelectorForSearchEngine = {
    google: "Reject all",
    bing: "Reject",
    yahoo: "Zavrni vse", // TODO: Context en-GB is problematic for Yahoo.
  };

  if (
    searchEngine === "google" ||
    searchEngine === "bing" ||
    searchEngine === "yahoo"
  ) {
    await rejectCookiesForSearchEngine(
      page,
      textSelectorForSearchEngine[searchEngine],
      searchEngine
    );
  } else {
    console.log(`${searchEngine} does not require cookie consent.`);
  }
};

export { navigateToSearchEngine, explicitlyDenyCookies };

// Constants and types
export enum SearchEngineEnum {
  GOOGLE = "google",
  BING = "bing",
  STARTPAGE = "startpage",
  DUCKDUCKGO = "duckduckgo",
  YAHOO = "yahoo",
  BRAVE = "search.brave",
  MOJEEK = "mojeek",
  QWANT = "qwant",
}
export type SearchEngineType = `${SearchEngineEnum}`;
export const SEARCH_ENGINES: SearchEngineType[] =
  Object.values(SearchEngineEnum);
