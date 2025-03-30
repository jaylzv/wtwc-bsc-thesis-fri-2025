import { Page } from "@playwright/test";
import { SearchEngineType } from "./types";

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
  const initialRejectCookiesButton = await page.getByText(textSelector, {
    exact: true,
  });

  const matchesFound = await initialRejectCookiesButton.count();

  // Yahoo has multiple buttons with the same text, so we need to handle this case separately.
  const rejectCookiesButton =
    matchesFound > 1
      ? initialRejectCookiesButton.last()
      : initialRejectCookiesButton;

  await rejectCookiesButton.waitFor({ state: "attached", timeout: 5000 });
  await rejectCookiesButton.scrollIntoViewIfNeeded();
  await rejectCookiesButton.waitFor({ state: "visible", timeout: 5000 });
  await rejectCookiesButton.click();

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

  const searchEngineAsksForCookies =
    searchEngine === "google" ||
    searchEngine === "bing" ||
    searchEngine === "yahoo";

  if (searchEngineAsksForCookies) {
    try {
      await rejectCookiesForSearchEngine(
        page,
        textSelectorForSearchEngine[searchEngine],
        searchEngine
      );
    } catch (error) {
      console.error(
        "Something unexpected happened when rejecting cookies for search engine",
        searchEngine
      );
    }
  } else {
    console.log(`${searchEngine} does not require cookie consent.`);
  }
};

export { navigateToSearchEngine, explicitlyDenyCookies };
