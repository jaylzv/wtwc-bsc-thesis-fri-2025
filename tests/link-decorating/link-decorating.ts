import { Page } from "@playwright/test";
import { CurrentArgumentsType, TestOptionsType } from "../../utils/types";
import { LINK_DECORATORS, LinkDecoratorType } from "./types";
import { displayFormattedResultsInConsole } from "./utils";
import { navigateToWebsiteThroughSearchEngine } from "../../utils/general-utils";

/**
 * Decorates a given URL with specified link decorators.
 *
 * @param {string} url - The URL to be decorated.
 * @param {ReadonlyArray<LinkDecoratorType>} linkDecorators - An array of link decorator types to be appended to the URL.
 * @returns {string} The decorated URL with appended link decorators.
 *
 * @remarks
 * Each link decorator is appended to the URL as a query parameter in the format `key=sample_key_value`.
 * The method currently appends a trailing `&` at the end of the URL.
 *
 * @example
 * ```typescript
 * const url = "http://example.com";
 * const decorators = ["utm_source", "utm_medium"];
 * const decoratedUrl = decorateLink(url, decorators);
 * console.log(decoratedUrl);
 * // Output: "http://example.com?utm_source=sample_utm_source_value&utm_medium=sample_utm_medium_value&"
 * ```
 */
const decorateLink = (
  url: string,
  linkDecorators: ReadonlyArray<LinkDecoratorType>
): string => {
  let urlToDecorate: string = url;
  urlToDecorate += "?";

  for (const linkDecorator of linkDecorators) {
    urlToDecorate += `${linkDecorator}=sample_${linkDecorator}_value&`;
  }

  return urlToDecorate;
};

/**
 * Calculates the cleanliness of a given link after navigation.
 * The cleanliness score is determined by the presence of certain link decorators.
 * The higher the score, the less clean the link is considered to be.
 *
 * @param {string} linkAfterNavigation - The URL of the link after navigation.
 * @returns {number} The cleanliness score of the link. A higher score indicates a less clean link.
 * The maximum (worst) score is the length of LINK_DECORATORS constant. The minimum (best) score is 0.
 */
const calculateLinkCleanlinessScore = (linkAfterNavigation: string): number => {
  let linkCleanliness: number = 0;

  for (const linkDecorator of LINK_DECORATORS) {
    if (linkAfterNavigation.includes(linkDecorator)) {
      linkCleanliness += 1;
    }
  }

  return linkCleanliness;
};

/**
 * Displays the results of the link decorating test.
 *
 * @param {Page} page - The Playwright page object.
 * @param {CurrentArgumentsType} currentArgs - The current arguments including browser and extensions.
 * @returns {Promise<void>} A promise that resolves when the results are displayed.
 */
const displayResults = async (
  page: Page,
  currentArgs: CurrentArgumentsType
): Promise<void> => {
  const linkAfterNavigation: string = await page.url();
  const linkCleanlinessScore: number =
    calculateLinkCleanlinessScore(linkAfterNavigation);

  displayFormattedResultsInConsole(currentArgs, linkCleanlinessScore);
};

/**
 * Tests the link decorating functionality by navigating to a decorated URL and displaying the results.
 * The test checks the cleanliness of the link after navigation.
 * Cleanliness is determined by the presence of certain link decorators.
 * The higher the score, the less clean the link is considered to be.
 * The maximum (worst) score is the length of LINK_DECORATORS constant. The minimum (best) score is 0.
 * The results are displayed in the console.
 *
 * @param {TestOptionsType} testOptions - The test options including the Playwright page object and current arguments.
 * @returns {Promise<void>} A promise that resolves when the test is complete.
 */
const testLinkDecorating = async (
  testOptions: TestOptionsType
): Promise<void> => {
  console.log("\nTesting link decorating...");

  const { page, currentArgs } = testOptions;
  const { searchEngine } = currentArgs;

  const templateURL: string = "https://example.com";
  const decoratedURL: string = decorateLink(templateURL, LINK_DECORATORS);

  await navigateToWebsiteThroughSearchEngine(page, searchEngine, decoratedURL);

  displayResults(page, currentArgs);
};

export { testLinkDecorating };
