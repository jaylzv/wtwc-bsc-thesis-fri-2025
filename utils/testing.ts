import { BROWSERS_NAMES, SEARCH_ENGINES } from "./consts";
import { launchBrowserInstance } from "./browsers-utils";
import {
  explicitlyDenyCookies,
  navigateToSearchEngine,
} from "./search-engines-utils";

const testFingerprinting = async () => {
  for (const browserName of BROWSERS_NAMES) {
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
    }

    console.log(`Closing browser ${browserName} instance...`);
    await browserInstance.browser()!.close();
  }
};

const testBounceTracking = async () => {};

const testLinkDecorating = async () => {};

export { testFingerprinting, testBounceTracking, testLinkDecorating };
