import { launchBrowserInstance, BROWSERS_NAMES } from "./browsers";
import {
  explicitlyDenyCookies,
  navigateToSearchEngine,
  SEARCH_ENGINES,
} from "./search-engines";
import { EXTENSION_PATHS, EXTENSION_COMBINATIONS } from "./extensions";

const testAllScenarios = async (testScenario: () => Promise<void>) => {
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

          await testScenario();
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

        await testScenario();
      }

      console.log(`Closing browser ${browserName} instance...`);
      await browserInstance.browser()!.close();
    }
  }
};

export default testAllScenarios;
