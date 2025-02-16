import { BrowsersType, BROWSERS_NAMES, SEARCH_ENGINES_URLS } from "./consts";
import { launchBrowserInstance } from "./browsers-utils";
import { navigateToSearchEngine } from "./search-engines-utils";

const testFingerprinting = async () => {
  for (const browserName of BROWSERS_NAMES) {
    console.log(`Launching browser ${browserName} instance...`);
    const browserInstance = await launchBrowserInstance(browserName);
    console.log(`Launched ${browserName} browser instance.`);
    const page = await browserInstance.newPage();

    for (const searchEngineUrl of SEARCH_ENGINES_URLS) {
      console.log(`Navigating to search engine ${searchEngineUrl}...`);
      await navigateToSearchEngine(searchEngineUrl, page);
      console.log(`Navigated to ${searchEngineUrl}.`);
      await page.waitForTimeout(3000);
    }

    console.log(`Closing browser ${browserName} instance...`);
    await browserInstance.close();
  }
};

const testBounceTracking = async () => {};

const testLinkDecorating = async () => {};

export { testFingerprinting, testBounceTracking, testLinkDecorating };
