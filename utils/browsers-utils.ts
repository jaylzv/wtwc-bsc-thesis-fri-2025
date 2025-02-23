import { chromium, firefox, webkit, BrowserContext } from "@playwright/test";
import { BrowsersEnum, BrowsersType } from "./consts";

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
export const launchBrowserInstance = async (
  browser: BrowsersType,
  extensionPath: string = ""
): Promise<BrowserContext> => {
  // TODO: headless: false for now.. Probably update in future. Or add argument in npm script.
  // TODO: Add multiple channels? msedge, chrome, etc..?
  const browserInstance = await {
    [BrowsersEnum.CHROMIUM]: chromium,
    [BrowsersEnum.FIREFOX]: firefox,
    [BrowsersEnum.WEBKIT]: webkit,
  }[browser].launch({
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const context = await browserInstance.newContext({ locale: "en-GB" });
  return context;
};
