import { Page } from "@playwright/test";
import {
  TestCombinationType,
  TestOptionsType,
  TestType,
  TestEnum,
  ArgumentsType,
} from "../types";
import { testLinkDecorating, testFingerprinting, testBounceTracking } from "./";
import { launchBrowserInstance } from "../utils/browsers/utils";
import {
  explicitlyDenyCookies,
  navigateToSearchEngine,
} from "../utils/search-engines/utils";
import {
  EXTENSION_PATHS,
  EXTENSION_COMBINATIONS,
} from "../utils/extensions/types";

// TODO: Extensions probably faulty right now, fix later.

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
    case TestEnum.LINK_DECORATING:
      await testLinkDecorating(testOptions);
      break;
    case TestEnum.FINGERPRINTING:
      await testFingerprinting(testOptions);
      break;
    case TestEnum.BOUNCE_TRACKING:
      await testBounceTracking(testOptions);
      break;
    default:
      console.error("Testing for this is not supported.");
      break;
  }
};

const testAllScenarios = async (test: TestType, args: ArgumentsType) => {
  const { browsers, searchEngines, extensions, websites } = args;

  for (const browser of browsers) {
    console.log(`Launching browser ${browser} instance...`);

    if (browser === "chromium") {
      // Extensions in Playwright are only supported in Chromium.
      for (const extensionCombination of EXTENSION_COMBINATIONS) {
        let extensionPaths: string[] = [];

        console.log(`Extension combination: ${extensionCombination}`);

        for (const extension of extensionCombination)
          if (extensions.includes(extension))
            extensionPaths.push(EXTENSION_PATHS.get(extension)!);

        const browserInstance = await launchBrowserInstance(
          browser,
          extensionPaths.join(",")
        );
        const page = await browserInstance.newPage();
        console.log(`Launched ${browser} browser instance.`);

        for (const searchEngine of searchEngines) {
          await navigateToSearchEngine(page, searchEngine);
          await explicitlyDenyCookies(page, searchEngine);
          await page.waitForTimeout(1000);
          console.log(`Navigated to ${searchEngine}.`);

          const testCombination = {
            browser,
            searchEngine,
            extensionsCombination: extensionCombination as string[],
          };

          await testScenario(page, test, testCombination);
        }

        console.log(`Closing browser ${browser} instance...`);
        await browserInstance.browser()!.close();
      }
    } else {
      // Extensions are not supported in Firefox and WebKit.
      const browserInstance = await launchBrowserInstance(browser);
      const page = await browserInstance.newPage();
      console.log(`Launched ${browser} browser instance.`);

      for (const searchEngine of searchEngines) {
        await navigateToSearchEngine(page, searchEngine);
        await explicitlyDenyCookies(page, searchEngine);
        await page.waitForTimeout(1000);
        console.log(`Navigated to ${searchEngine}.`);

        const testCombination = {
          browser: browser,
          searchEngine: searchEngine,
        };

        await testScenario(page, test, testCombination);
      }

      console.log(`Closing browser ${browser} instance...`);
      await browserInstance.browser()!.close();
    }
  }
};

export { testAllScenarios };
