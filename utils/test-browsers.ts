import { chromium, firefox, webkit, Browser } from "@playwright/test";
import { BrowsersEnum, BrowsersType } from "./consts";

/**
 * Launches a browser instance based on the specified browser type.
 *
 * @param {BrowserType} browser - The type of browser to launch. Must be one of the values from `BrowsersEnum`.
 * @returns {Promise<Browser>} - A promise that resolves to the launched `Browser` instance.
 *
 * @example
 * ```typescript
 * const browser = await launchBrowserInstance(BrowsersEnum.CHROMIUM);
 * ```
 */
const launchBrowserInstance = async (
  browser: BrowsersType
): Promise<Browser> => {
  return await {
    [BrowsersEnum.CHROMIUM]: chromium,
    [BrowsersEnum.FIREFOX]: firefox,
    [BrowsersEnum.WEBKIT]: webkit,
  }[browser].launch({ headless: true }); // TODO: headless: true for now.. Probably update in future.
};

/**
 * TODO: Update docs.
 * Launches a browser instance, navigates to a specified URL, waits for a specified timeout, and then closes the browser.
 *
 * @param {BrowsersType} browser - The type of browser to launch.
 * @returns {Promise<void>} - A promise that resolves when the browser instance is closed.
 */
const testBrowser = async (browser: BrowsersType): Promise<void> => {
  console.log(`Launching ${browser} browser instance...`);
  const browserInstance = await launchBrowserInstance(browser);
  console.log(`Launched ${browser} browser instance.`);
  const page = await browserInstance.newPage();
  await page.goto("https://example.com");
  await browserInstance.close();
};

/**
 * TODO: Update docs.
 * Tests all supported browsers sequentially.
 *
 * This function will run tests on the following browsers:
 * - Chromium
 * - Firefox
 * - WebKit
 *
 * @returns {Promise<void>} A promise that resolves when all browser tests are complete.
 */
const testAllBrowsers = async (): Promise<void> => {
  await testBrowser(BrowsersEnum.CHROMIUM);
  await testBrowser(BrowsersEnum.FIREFOX);
  await testBrowser(BrowsersEnum.WEBKIT);
};

export default testAllBrowsers;
