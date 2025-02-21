import { Page } from "@playwright/test";
import { SearchEngineType } from "./consts";

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
  const searchEngineUrl = `https://www.${searchEngine}.com/`;
  await page.goto(searchEngineUrl);
};
