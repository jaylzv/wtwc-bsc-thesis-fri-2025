import { Page } from "@playwright/test";

/**
 * Logs the CLI help instructions to the console.
 */
const logCLIHelp = (): void => {
  console.log(`
    Usage: npm run main -- [options]
    
    Options:
      -a, --all                Run all tests
      -t, --tests              Specify tests to run (comma-separated)
      -b, --browsers           Specify browsers to use (comma-separated)
      -s, --search-engines     Specify search engines to use (comma-separated)
      -e, --extensions         Specify extensions to use (comma-separated)
      -w, --websites           Specify websites to test (comma-separated)
      -d, --debug              Enable debug mode

    Examples:
      npm run main -- -a
      # Runs all tests with default settings.

      npm run main -- -t fingerprinting,link_decorating -b chrome,firefox
      # Runs fingerprinting and link decorating tests on Chrome and Firefox.

      npm run main -- -t bounce_tracking -s google,bing
      # Runs bounce tracking test using Google and Bing search engines.

      npm run main -- -b chrome -e uBlockOrigin,AdblockPlus
      # Runs all tests on Chrome with uBlockOrigin and AdblockPlus extensions.

      npm run main -- -s google -w example.com,anotherexample.com
      # Runs all tests using Google search engine on specified websites.

      npm run main -- -t fingerprinting -d
      # Runs fingerprinting test with debug mode enabled.

    Note:
      If some arguments are not included, all of the values for that arg are tested by default.
  `);
};

/**
 * Navigates to the specified URL and waits for the page to load completely.
 * 
 * @param {Page} page - The Playwright Page object.
 * @param {string} url - The URL to navigate to.
 * @returns {Promise<void>} A promise that resolves when the navigation is complete.
 */
const properlyNavigateToURL = async (
  page: Page,
  url: string
): Promise<void> => {
  await page.goto(url);
  await page.waitForLoadState("load");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // TODO: Deprecated.
};

export { logCLIHelp, properlyNavigateToURL };
