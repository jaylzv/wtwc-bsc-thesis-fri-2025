import { chromium, firefox, webkit, BrowserContext } from "@playwright/test";
import { BrowsersEnum, BrowsersType } from "./types";

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
  headed: boolean,
  extensionPaths: string = ""
): Promise<BrowserContext> => {
  const browserInstance = await {
    [BrowsersEnum.CHROMIUM]: chromium,
    [BrowsersEnum.FIREFOX]: firefox,
    [BrowsersEnum.WEBKIT]: webkit,
  }[browser].launch({
    headless: !headed,
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
