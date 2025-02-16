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
export const launchBrowserInstance = async (
  browser: BrowsersType
): Promise<Browser> => {
  return await {
    [BrowsersEnum.CHROMIUM]: chromium,
    [BrowsersEnum.FIREFOX]: firefox,
    [BrowsersEnum.WEBKIT]: webkit,
  }[browser].launch({ headless: false }); // TODO: headless: false for now.. Probably update in future.
};
