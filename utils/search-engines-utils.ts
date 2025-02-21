import { Page } from "@playwright/test";
import { SearchEngineType } from "./consts";

/**
 * Extracts the URL for a given search engine.
 *
 * @param searchEngine - The search engine identifier.
 * @returns The URL of the specified search engine.
 *
 * @remarks
 * The URL for Brave search engine is manually adjusted to "https://search.brave.com/".
 * For other search engines, the URL is generated in the format "https://www.{searchEngine}.com/".
 */
export const extractUrlFromSearchEngine = (
  searchEngine: SearchEngineType
): string => {
  return searchEngine === "search.brave"
    ? "https://search.brave.com/"
    : `https://www.${searchEngine}.com/`;
};

/**
 * Navigates to the specified search engine URL.
 *
 * @param {SearchEngineType} searchEngine - Search engine to navigate to.
 * @param {Page} page - The Playwright `Page` object to use for navigation.
 * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
 */
export const navigateToSearchEngine = async (
  searchEngine: SearchEngineType,
  page: Page
): Promise<void> => {
  const searchEngineUrl = extractUrlFromSearchEngine(searchEngine);
  await page.goto(searchEngineUrl);
};
