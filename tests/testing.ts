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
import { EXTENSION_PATHS, ExtensionType } from "../utils/extensions/types";

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
  const { browsers, searchEngines, extensions, headed, websites } = args;

  for (const browser of browsers) {
    console.log(`\nLaunching browser ${browser} instance...`);

    let extensionsToInstall: string[] = [];

    if (browser === "chromium") {
      for (const extension of extensions) {
        if (!EXTENSION_PATHS.has(extension as ExtensionType)) {
          console.error(`Extension not found: ${extension}`);
          continue;
        }

        extensionsToInstall.push(
          EXTENSION_PATHS.get(extension as ExtensionType)!
        );
      }
    }

    // Extensions are not supported in Firefox and WebKit.
    const browserInstance = await launchBrowserInstance(
      browser,
      headed,
      extensionsToInstall.join(",")
    );
    const page = await browserInstance.newPage();
    console.log(`Launched ${browser} browser instance.`);

    for (const searchEngine of searchEngines) {
      const currentArgs: CurrentArgumentsType = {
        test,
        browser,
        searchEngine,
        extensions,
        websites,
      };
      await testScenario(page, test, currentArgs);
    }

    console.log(`Closing browser ${browser} instance...`);
    await browserInstance.browser()!.close();
  }
};

export { testAllScenarios };
