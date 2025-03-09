import { Page } from "@playwright/test";
import {
  TestOptionsType,
  TestType,
  TestEnum,
  ArgumentsType,
  CurrentArgumentsType,
} from "../utils/types";
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
  currentArgs: CurrentArgumentsType
): Promise<void> => {
  const testOptions: TestOptionsType = {
    page,
    currentArgs,
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
  const { browsers, searchEngines, extensions, websites, debug, headless } =
    args;

  for (const browser of browsers) {
    console.log(`Launching browser ${browser} instance...`);

    if (browser === "chromium") {
      // Extensions in Playwright are only supported in Chromium.
      // TODO: THIS DOESN'T WORK IF NO EXTENSIONS ARE PROVIDED.
      for (const extensionCombination of EXTENSION_COMBINATIONS) {
        let extensionPaths: string[] = [];

        console.log(`Extension combination: ${extensionCombination}`);

        for (const extension of extensionCombination)
          if (extensions.includes(extension))
            extensionPaths.push(EXTENSION_PATHS.get(extension)!);

        if (extensionPaths.length === 0) continue;

        const browserInstance = await launchBrowserInstance(
          browser,
          headless,
          extensionPaths.join(",")
        );
        const page = await browserInstance.newPage();
        console.log(`Launched ${browser} browser instance.`);

        for (const searchEngine of searchEngines) {
          await navigateToSearchEngine(page, searchEngine);
          await explicitlyDenyCookies(page, searchEngine);
          await page.waitForTimeout(1000);
          console.log(`Navigated to ${searchEngine}.`);

          const currentArgs: CurrentArgumentsType = {
            test,
            browser,
            searchEngine,
            extensions: extensionCombination as string[], // TODO: Improve
            website: websites[0], // TODO: Check this.
            debug,
          };

          await testScenario(page, test, currentArgs);
        }

        console.log(`Closing browser ${browser} instance...`);
        await browserInstance.browser()!.close();
      }
    } else {
      // Extensions are not supported in Firefox and WebKit.
      const browserInstance = await launchBrowserInstance(browser, headless);
      const page = await browserInstance.newPage();
      console.log(`Launched ${browser} browser instance.`);

      for (const searchEngine of searchEngines) {
        await navigateToSearchEngine(page, searchEngine);
        await explicitlyDenyCookies(page, searchEngine);
        await page.waitForTimeout(1000);
        console.log(`Navigated to ${searchEngine}.`);

        const currentArgs: CurrentArgumentsType = {
          test,
          browser,
          searchEngine,
          extensions: [], // TODO: Check this. Should it be optional and looser readonly type?
          website: websites[0], // TODO: Check this.
          debug, // TODO: Check this.
        };

        await testScenario(page, test, currentArgs);
      }

      console.log(`Closing browser ${browser} instance...`);
      await browserInstance.browser()!.close();
    }
  }
};

export { testAllScenarios };
