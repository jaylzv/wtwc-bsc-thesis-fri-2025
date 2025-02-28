import { Page } from "@playwright/test";
import { TestCombinationType, TestOptionsType, TestType } from "../types";
import { testLinkDecorating, testFingerprinting, testBounceTracking } from "./";

import { launchBrowserInstance } from "../utils/browsers/utils";
import { BROWSERS_NAMES } from "../utils/browsers/types";

import {
  explicitlyDenyCookies,
  navigateToSearchEngine,
} from "../utils/search-engines/utils";
import { SEARCH_ENGINES } from "../utils/search-engines/types";

import {
  EXTENSION_PATHS,
  EXTENSION_COMBINATIONS,
} from "../utils/extensions/types";

const testScenario = async (
  page: Page,
  test: TestType,
  testCombination: TestCombinationType
): Promise<void> => {
  const testOptions: TestOptionsType = {
    page: page,
    testCombination: testCombination,
  };

  switch (test) {
    case "linkDecorating":
      await testLinkDecorating(testOptions);
      break;
    case "fingerprinting":
      await testFingerprinting(testOptions);
      break;
    case "bounceTracking":
      await testBounceTracking(testOptions);
      break;
    default:
      console.error("Testing for this is not supported.");
      break;
  }
};

const testAllScenarios = async (test: TestType) => {
  for (const browserName of BROWSERS_NAMES) {
    console.log(`Launching browser ${browserName} instance...`);

    if (browserName === "chromium") {
      // Extensions in Playwright are only supported in Chromium.
      for (const extensionCombination of EXTENSION_COMBINATIONS) {
        let extensionPaths: string[] = [];
        console.log(`Extension combination: ${extensionCombination}`);
        for (const extension of extensionCombination) {
          extensionPaths.push(EXTENSION_PATHS.get(extension)!);
        }

        const browserInstance = await launchBrowserInstance(
          browserName,
          extensionPaths.join(",")
        );
        console.log("Installed extension combination.");
        console.log(`Launched ${browserName} browser instance.`);

        const page = await browserInstance.newPage();

        for (const searchEngine of SEARCH_ENGINES) {
          console.log(`Navigating to search engine ${searchEngine}...`);
          await navigateToSearchEngine(page, searchEngine);
          console.log(`Navigated to ${searchEngine}.`);

          await explicitlyDenyCookies(page, searchEngine);

          await page.waitForTimeout(1000);

          const testCombination = {
            browser: browserName,
            searchEngine: searchEngine,
            extensionsCombination: extensionCombination as string[],
          };

          await testScenario(page, test, testCombination);
        }

        console.log(`Closing browser ${browserName} instance...`);
        await browserInstance.browser()!.close();
      }
    } else {
      // Extensions are not supported in Firefox and WebKit.
      console.log(`Launching browser ${browserName} instance...`);
      const browserInstance = await launchBrowserInstance(browserName);
      console.log(`Launched ${browserName} browser instance.`);

      const page = await browserInstance.newPage();

      for (const searchEngine of SEARCH_ENGINES) {
        console.log(`Navigating to search engine ${searchEngine}...`);
        await navigateToSearchEngine(page, searchEngine);
        console.log(`Navigated to ${searchEngine}.`);

        await explicitlyDenyCookies(page, searchEngine);

        await page.waitForTimeout(1000);

        const testCombination = {
          browser: browserName,
          searchEngine: searchEngine,
        };

        await testScenario(page, test, testCombination);
      }

      console.log(`Closing browser ${browserName} instance...`);
      await browserInstance.browser()!.close();
    }
  }
};

export { testAllScenarios };
