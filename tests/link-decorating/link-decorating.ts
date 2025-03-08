import { Page } from "@playwright/test";
import { CurrentArgumentsType, TestOptionsType } from "../../types";
import { LINK_DECORATORS, LinkDecoratorType } from "./types";

/**
 * Formats and logs a message to the console with a specified color.
 *
 * @param {string} color - The color code for the log message.
 * @param {string} key - The key or label for the log message.
 * @param {string} [value] - The optional value to be logged alongside the key.
 */
const formatLog = (color: string, key: string, value?: string) => {
  console.log(color, key, "\x1b[0m", value ?? "");
};

/**
 * Displays formatted results in the console for the 'Link Decorating' test.
 *
 * @param {CurrentArgumentsType} currentArgs - The current arguments including search engine, browser, and extensions.
 * @param {number} linkCleanlinessScore - The cleanliness score of the link.
 */
const displayFormattedResultsInConsole = (
  currentArgs: CurrentArgumentsType,
  linkCleanlinessScore: number
): void => {
  const { searchEngine, browser, extensions } = currentArgs;

  formatLog("\x1b[35m", "\nResults for 'Link Decorating' test:");
  console.log("-----------------------------------------");
  formatLog("\x1b[36m", "- Browser:", browser);
  formatLog("\x1b[36m", "- Search engine:", searchEngine);
  formatLog("\x1b[36m", "- Extensions:", extensions.join(", "));
  console.log("-----------------------------------------");
  formatLog(
    "\x1b[34m",
    "Actual link cleanliness score: ",
    linkCleanlinessScore.toString()
  );
  formatLog(
    "\x1b[31m",
    "Maximum cleanliness score: ",
    LINK_DECORATORS.length.toString()
  );
  formatLog("\x1b[32m", "Minimum cleanliness: ", "0");
};

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

  // TODO: We can also add non-tracking parameters to better examine behavior.
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
 * @param {CurrentArgumentsType} currentArgs - The current arguments including search engine, browser, and extensions.
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

// TODO: PARKED FOR NOW BECAUSE OF BOT CHECKERS.
// const navigateToTemplateURLThroughSearchEngine = async (
//   page: Page,
//   searchEngine: SearchEngineType
// ): Promise<void> => {
//   // TODO: UPDATE
//   switch (searchEngine) {
//     case SearchEngineEnum.GOOGLE:
//       const googleSearchInput = await page.locator("textarea").first();
//       await googleSearchInput.fill("example.com");
//       await googleSearchInput.press("Enter");

//       const firstLink = await page.locator("h3.LC20lb.MBeuO.DKV0Md").first();
//       await firstLink.click();

//       await page.waitForTimeout(1000); // TODO: Find smarter solution.
//       await page.waitForLoadState("load");
//       await page.waitForLoadState("domcontentloaded");
//       await page.waitForLoadState("networkidle"); // TODO: Deprecated.

//       // TODO: Remove. Debugging for now.
//       await new Promise(() => {});

//       break;
//     case SearchEngineEnum.BING:
//       break;
//     case SearchEngineEnum.STARTPAGE:
//       break;
//     case SearchEngineEnum.DUCKDUCKGO:
//       break;
//     case SearchEngineEnum.YAHOO:
//       break;
//     case SearchEngineEnum.BRAVE:
//       break;
//     case SearchEngineEnum.MOJEEK:
//       break;
//     case SearchEngineEnum.QWANT:
//       break;
//     default:
//       console.error(`Unknown search engine: ${searchEngine}`);
//       break;
//   }
// };

const testLinkDecorating = async (
  testOptions: TestOptionsType
): Promise<void> => {
  const { page, currentArgs } = testOptions;

  const templateUrl: string = "https://example.com";
  const decoratedUrl: string = decorateLink(templateUrl, LINK_DECORATORS);

  await page.goto(decoratedUrl);
  await page.waitForLoadState("load");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // TODO: Deprecated.

  displayResults(page, currentArgs);
};

export { testLinkDecorating };
