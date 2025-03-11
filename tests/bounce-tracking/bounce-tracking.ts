import { Page } from "@playwright/test";
import {
  completelyWaitForPageLoad,
  properlyNavigateToURL,
} from "../../utils/general-utils";
import { TestOptionsType } from "../../utils/types";
import {
  AnchorHrefEnum,
  loadingSelector,
  CookiesType,
  LocalStorageType,
  DisplayResultsType,
} from "./consts";

/**
 * Waits for the bounce tracking page to load by waiting for the loading selector to be attached and then waiting for a timeout.
 * This ensures that the page has fully loaded before proceeding with further actions.
 * @param {Page} page - The Playwright page object representing the browser page.
 * @returns {Promise<void>} - A promise that resolves when the page has fully loaded.
 */
const waitForBounceTrackingPageToLoad = async (page: Page): Promise<void> => {
  await page.locator(loadingSelector).waitFor({
    state: "attached",
  });
};

/**
 * Redirects the page by clicking on an anchor element specified by the selector and waits for the page to load.
 * This function ensures that the page has fully loaded after each redirection.
 * @param {Page} page - The Playwright page object representing the browser page.
 * @param {string} anchorHrefSelector - The selector for the anchor element to click, which triggers the redirection.
 * @returns {Promise<void>} - A promise that resolves when the page has fully loaded after the redirection.
 */
const redirect = async (
  page: Page,
  anchorHrefSelector: string
): Promise<void> => {
  await page.locator(anchorHrefSelector).waitFor({ state: "attached" });
  await page.locator(anchorHrefSelector).waitFor({ state: "visible" });
  await page.locator(anchorHrefSelector).click();

  await completelyWaitForPageLoad(page);
  await waitForBounceTrackingPageToLoad(page);
};

/**
 * Displays the results of the bounce tracking test in the console.
 * This includes the initial and final states of cookies and local storage, as well as the browser and extensions used.
 * @param {DisplayResultsType} results - The results of the bounce tracking test, including initial and final cookies and local storage.
 */
const displayResults = (results: DisplayResultsType): void => {
  const {
    currentArgs,
    initialCookies,
    initialLocalStorage,
    finalCookies,
    finalLocalStorage,
  } = results;

  console.log("Results for 'Bounce Tracking' test:");
  console.log("-----------------------------------------");
  console.log("- Browser:", currentArgs.browser);
  console.log("- Extensions:", currentArgs.extensions.join(", "));
  console.log("-----------------------------------------");

  console.log("Initial Cookies:");
  console.table(initialCookies);

  console.log("Initial Local Storage:");
  console.table(initialLocalStorage);

  console.log("Final Cookies:");
  console.table(finalCookies);

  console.log("Final Local Storage:");
  console.table(finalLocalStorage);
};

/**
 * Tests bounce tracking by navigating to a website, performing redirects, and displaying the results.
 * This function captures the initial and final states of cookies and local storage to determine the impact of bounce tracking.
 * @param {TestOptionsType} testOptions - The options for the test, including the Playwright page and current arguments.
 * @returns {Promise<void>} - A promise that resolves when the test has completed and the results have been displayed.
 */
const testBounceTracking = async (
  testOptions: TestOptionsType
): Promise<void> => {
  console.log("Testing bounce tracking...");

  const { page, currentArgs } = testOptions;
  const mainWebsiteURL = "https://bounce-tracking-demo.glitch.me/";

  console.log('Navigating to "Bounce Tracking" demo website...');
  await properlyNavigateToURL(page, mainWebsiteURL);
  await waitForBounceTrackingPageToLoad(page);

  const initialStorage = await page.context().storageState();
  const initialCookies: CookiesType = initialStorage.cookies;
  const initialLocalStorage: LocalStorageType =
    initialStorage.origins[0].localStorage;

  console.log("Performing redirects...");
  console.log("Redirecting to server with cookies...");
  await redirect(page, `//a[@href="${AnchorHrefEnum.SERVER_WITH_COOKIES}"]`);
  console.log("Redirecting to server with local storage...");
  await redirect(
    page,
    `//a[@href="${AnchorHrefEnum.CLIENT_WITH_LOCAL_STORAGE}"]`
  );

  const finalStorage = await page.context().storageState();
  const finalCookies: CookiesType = finalStorage.cookies;
  const finalLocalStorage: LocalStorageType =
    finalStorage.origins[0].localStorage;

  const results: DisplayResultsType = {
    currentArgs,
    initialCookies,
    initialLocalStorage,
    finalCookies,
    finalLocalStorage,
  };

  displayResults(results);
};

export { testBounceTracking };
