import { launchBrowserInstance, BROWSERS_NAMES } from "./browsers";
import {
  explicitlyDenyCookies,
  navigateToSearchEngine,
  SEARCH_ENGINES,
} from "./search-engines";
import { EXTENSION_PATHS, EXTENSION_COMBINATIONS } from "./extensions";

const testFingerprinting = async () => {
  for (const browserName of BROWSERS_NAMES) {
    console.log(`Launching browser ${browserName} instance...`);

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
      }

      console.log(`Closing browser ${browserName} instance...`);
      await browserInstance.browser()!.close();
    }
  }
};

const testBounceTracking = async () => {};

const testLinkDecorating = async () => {};

export { testFingerprinting, testBounceTracking, testLinkDecorating };
