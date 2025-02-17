import { Page } from "@playwright/test";
import { SearchEngineUrlType } from "./consts";

/**
 * Navigates to the specified search engine URL.
 *
 * @param {SearchEngineUrlType} searchEngineUrl - The URL of the search engine to navigate to.
 * @param {Page} page - The Playwright `Page` object to use for navigation.
 * @returns {Promise<void>} - A promise that resolves when the navigation is complete.
 */
export const navigateToSearchEngine = async (
  searchEngineUrl: SearchEngineUrlType,
  page: Page
): Promise<void> => {
  await page.goto(searchEngineUrl);
};
