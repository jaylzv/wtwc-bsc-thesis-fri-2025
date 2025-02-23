import { chromium, firefox, webkit, BrowserContext } from "@playwright/test";
import path from "path";

// Functions

/**
 * Launches a browser instance based on the specified browser type.
 *
 * @param {BrowserType} browser - The type of browser to launch. Must be one of the values from `BrowsersEnum`.
 * @returns {Promise<BrowserContext>} - A promise that resolves to the launched `BrowserContext` instance.
 *
 * @example
 * ```typescript
 * const browserContext = await launchBrowserInstance(BrowsersEnum.CHROMIUM);
 * ```
 */
const launchBrowserInstance = async (
  browser: BrowsersType,
  extensionPaths: string = ""
): Promise<BrowserContext> => {
  // TODO: headless: false for now.. Probably update in future. Or add argument in npm script.
  // TODO: Add multiple channels? msedge, chrome, etc..?

  const browserInstance = await {
    [BrowsersEnum.CHROMIUM]: chromium,
    [BrowsersEnum.FIREFOX]: firefox,
    [BrowsersEnum.WEBKIT]: webkit,
  }[browser].launch({
    headless: false,
    args:
      browser === BrowsersEnum.CHROMIUM
        ? [
            `--disable-extensions-except=${extensionPaths}`,
            `--load-extension=${extensionPaths}`,
          ]
        : [],
  });

  const context = await browserInstance.newContext({ locale: "en-GB" });
  return context;
};

export { launchBrowserInstance };

// Constants and types
export enum BrowsersEnum {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
}
export type BrowsersType = `${BrowsersEnum}`;
export const BROWSERS_NAMES: BrowsersType[] = Object.values(BrowsersEnum);
