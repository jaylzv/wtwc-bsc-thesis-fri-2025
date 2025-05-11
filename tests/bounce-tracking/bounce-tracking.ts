import { Page } from "@playwright/test";
import {
  completelyWaitForPageLoad,
  navigateToWebsiteThroughSearchEngine,
} from "../../utils/general-utils";
import { TestOptionsType } from "../../utils/types";
import {
  AnchorHrefEnum,
  loadingSelector,
  CookiesType,
  LocalStorageType,
  DisplayResultsType,
} from "./consts";

import chalk from "chalk";
import Table from "cli-table3";

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
 * Initializes and retrieves the initial cookies and localStorage state from a Playwright page
 * @param {Page} page - The Playwright Page instance to get storage state from
 * @returns {Promise<{initialCookies: CookiesType, initialLocalStorage: LocalStorageType}>} Object containing initial cookies and localStorage values
 * @throws {Error} When unable to access storage state (caught internally)
 */
const initializeInitialValues = async (
  page: Page
): Promise<{
  initialCookies: CookiesType;
  initialLocalStorage: LocalStorageType;
}> => {
  const initialStorage = await page.context().storageState();
  let initialCookies: CookiesType;
  let initialLocalStorage: LocalStorageType;

  try {
    initialCookies = initialStorage.cookies;
    initialLocalStorage = initialStorage.origins[0].localStorage;
  } catch (error) {
    initialCookies = [];
    initialLocalStorage = [];

    console.error(chalk.red("\nError initializing initial values:", error));
    console.log(chalk.yellow("Setting initial values to empty arrays."));
    console.log(
      chalk.yellow(
        "This usually happens when the Search Engine doesn't require denial of cookies, thus no local storage is set.\n"
      )
    );
  }

  return { initialCookies, initialLocalStorage };
};

/**
 * Resets the browser's storage state by clearing cookies, permissions, local storage, and session storage.
 * 
 * @param {Page} page - The Playwright Page object representing the current browser page
 * @returns {Promise<void>} A Promise that resolves when all storage clearing operations are complete
 * 
 * @remarks
 * This function performs the following cleanup operations:
 * - Clears all cookies from the browser context
 * - Resets all permission grants
 * - Clears the localStorage
 * - Clears the sessionStorage
 */
const resetStorageAndCookies = async (page: Page): Promise<void> => {
  await page.context().clearCookies();
  await page.context().clearPermissions();
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.evaluate(() => {
    sessionStorage.clear();
  });

  console.log(chalk.blue("\nReset cookies and local storage.\n"));
}

/**
 * Displays the results of the bounce tracking test in the console.
 *
 * @param {DisplayResultsType} results - The results of the bounce tracking test, including initial and final cookies and local storage.
 * @returns {void}
 */
const displayResults = (results: DisplayResultsType): void => {
  const {
    currentArgs,
    initialCookies,
    initialLocalStorage,
    finalCookies,
    finalLocalStorage,
  } = results;

  console.log(chalk.bold.magenta("\n🔄 Results for 'Bounce Tracking' test:"));

  // Browser and Extensions Info Table
  const summaryTable = new Table({
    head: [chalk.cyan("Category"), chalk.cyan("Details")],
    colWidths: [25, 60],
    wordWrap: true,
  });

  summaryTable.push(
    ["Browser", currentArgs.browser],
    [
      "Extensions",
      currentArgs.extensions.length
        ? currentArgs.extensions.join(", ")
        : "None",
    ]
  );

  console.log(summaryTable.toString());

  // Function to format cookies and local storage
  const formatTable = (title: string, data: any[]) => {
    console.log(chalk.bold.yellow(`\n📌 ${title}:`));

    if (data.length === 0) {
      console.log(chalk.gray("No data available."));
      return;
    }

    const table = new Table({
      head: [
        chalk.cyan("Name"),
        chalk.cyan("Value"),
        chalk.cyan("Domain / Key"),
      ],
      colWidths: [30, 50, 40],
      wordWrap: true,
    });

    const longValues: { name: string; value: string }[] = [];

    data.forEach((item) => {
      if (item.value.length > 50) {
        table.push([
          chalk.green(item.name),
          chalk.gray(item.value.slice(0, 50) + "..."),
          item.domain || item.key || "-",
        ]);
        longValues.push({ name: item.name, value: item.value });
      } else {
        table.push([
          chalk.green(item.name),
          item.value,
          item.domain || item.key || "-",
        ]);
      }
    });

    console.log(table.toString());

    // Print full values separately
    if (longValues.length > 0) {
      console.log(chalk.bold.blue("\n📌 Full Values:"));
      longValues.forEach(({ name, value }) => {
        console.log(`${chalk.green(name)}: ${chalk.white(value)}\n`);
      });
    }
  };

  // Display cookies and local storage before and after the test
  formatTable("Initial Cookies", initialCookies);
  formatTable("Initial Local Storage", initialLocalStorage);
  formatTable("Final Cookies", finalCookies);
  formatTable("Final Local Storage", finalLocalStorage);
};

/**
 * Tests bounce tracking by navigating to a website, performing redirects, and displaying the results.
 * This function captures the initial and final states of cookies and local storage to determine the impact of bounce tracking.
 *
 * @param {TestOptionsType} testOptions - The options for the test, including the Playwright page and current arguments.
 * @returns {Promise<void>} - A promise that resolves when the test has completed and the results have been displayed.
 */
const testBounceTracking = async (
  testOptions: TestOptionsType
): Promise<void> => {
  console.log("Testing bounce tracking...");

  const { page, currentArgs } = testOptions;
  const { searchEngine } = currentArgs;
  const mainWebsiteURL = "https://bounce-tracking-demo.glitch.me/";

  console.log('Navigating to "Bounce Tracking" demo website...');
  await navigateToWebsiteThroughSearchEngine(
    page,
    searchEngine,
    mainWebsiteURL
  );
  await waitForBounceTrackingPageToLoad(page);

  await resetStorageAndCookies(page);  

  const { initialCookies, initialLocalStorage } = await initializeInitialValues(
    page
  );

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
