import { Page } from "@playwright/test";
import {
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  ViewportType,
} from "../types";
import {
  properlyNavigateToURL,
  waitForSelectorAndClick,
  waitForSelectorByTextAndClick,
} from "../../../utils/general-utils";

let deniedCookiesAlready = false; // Can't deny cookies twice on same browser.

/**
 * Retrieves the content language from the whoer.net page.
 *
 * This function locates the content language value by searching for a specific
 * element structure and text content. It ensures the element is properly located
 * and extracts its inner text.
 *
 * @param {Page} page - The Playwright `Page` instance representing the browser page.
 * @returns {Promise<string>} A promise that resolves to the content language as a string.
 *
 * @throws Will throw an error if the content language element cannot be found or is not visible.
 */
const retrieveContentLanguage = async (page: Page): Promise<string> => {
  const contentLanguageParent = await page
    .locator(".card__row", {
      has: page.getByText("JavaScript:"),
    })
    .nth(1);

  const contentLanguage = await contentLanguageParent
    .locator(".card__col.card__col_value span")
    .first()
    .innerText();

  return contentLanguage;
};

/**
 * Retrieves the browser name and version from the whoer.net page.
 *
 * This function locates the browser information by searching for a specific
 * element structure and text content. It extracts and parses the browser name
 * and version from the retrieved text.
 *
 * @param {Page} page - The Playwright `Page` instance representing the browser page.
 * @returns {Promise<{ name: string; version: string }>} A promise that resolves to an object containing the browser name and version.
 *
 * @throws Will throw an error if the browser information element cannot be found or is not visible.
 */
const retrieveBrowserInfo = async (
  page: Page
): Promise<{ name: string; version: string }> => {
  const browserInfo = await page
    .locator(".ip-data__row", {
      has: page.getByText("Browser:", { exact: true }),
    })
    .locator(".ip-data__col.ip-data__col_value span")
    .innerText();

  const name = browserInfo.trim().split(" ")[0];
  const version = browserInfo.trim().split(" ")[1];

  return { name, version };
};

/**
 * Explicitly denies cookies on whoer.net by interacting with the cookie consent UI.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<void>} A promise that resolves when the cookie denial process is complete.
 */
const explicitlyDenyWhoerCookies = async (page: Page): Promise<void> => {
  await waitForSelectorByTextAndClick(page, "Manage options");

  // TODO: Confirm choices for now. Can be improved to turn off all cookies.
  const confirmChoicesButton = await page
    .getByText("Confirm choices", {
      exact: true,
    })
    .first();
  await confirmChoicesButton.waitFor({ state: "attached" });
  await confirmChoicesButton.waitFor({ state: "visible" });
  await confirmChoicesButton.click();
  deniedCookiesAlready = true;
};

/**
 * Retrieves the DNS information from a web page using Playwright.
 *
 * This function locates the DNS value on the page by searching for a specific
 * element structure and text content. It ensures the element is attached,
 * scrolled into view, and visible before extracting its inner text.
 *
 * @param {Page} page - The Playwright `Page` instance representing the browser page.
 * @returns {Promise<string>} A promise that resolves to the DNS value as a string.
 *
 * @throws Will throw an error if the DNS element cannot be found or is not visible.
 */
const retrieveDns = async (page: Page): Promise<string> => {
  const dnsLocator = await page
    .locator(".ip-data__row", {
      has: page.getByText("DNS", { exact: true }),
    })
    .locator(".ip-data__col.ip-data__col_value .cont.dns_br_ip.max_ip span")
    .last();
  await dnsLocator.waitFor({ state: "attached" });
  await dnsLocator.scrollIntoViewIfNeeded();
  await dnsLocator.waitFor({ state: "visible" });

  const dns = await dnsLocator.innerText();
  return dns;
};

/**
 * Retrieves data for a specific text selector on the page.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @param {string} textSelector - The text selector to locate the data.
 * @returns {Promise<string>} A promise that resolves to the retrieved data as a string.
 */
const retrieveDataForTextSelector = async (
  page: Page,
  textSelector: string
): Promise<string> => {
  const specificClassName = ".card__row";

  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText(textSelector),
  });

  let retrievedData: string;

  const timeout = 15000; // High timeout

  try {
    retrievedData = await parentLocator
      .locator(".card__col.card__col_value span")
      .first()
      .innerText({ timeout });
  } catch (error) {
    retrievedData = await parentLocator
      .locator(".card__col.card__col_value")
      .first()
      .innerText({ timeout });
  }

  return retrievedData;
};

/**
 * Retrieves location-related fingerprint data from whoer.net.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataLocationType>} A promise that resolves to an object containing location data.
 */
const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  await waitForSelectorAndClick(page, "#tab-ext span");

  const country = await retrieveDataForTextSelector(page, "Country:");
  const region = await retrieveDataForTextSelector(page, "Region:");
  const city = await retrieveDataForTextSelector(page, "City:");
  const timeZone = await retrieveDataForTextSelector(page, "Zone:");

  const postalCode = parseInt(await retrieveDataForTextSelector(page, "ZIP:"));

  const latitude = parseFloat(
    await retrieveDataForTextSelector(page, "Latitude:")
  );
  const longitude = parseFloat(
    await retrieveDataForTextSelector(page, "Longitude:")
  );

  const locationData: FingerprintDataLocationType = {
    location: { country, region, city },
    latitude,
    longitude,
    postalCode,
    timeZone,
  };

  return locationData;
};

/**
 * Retrieves network-related fingerprint data from whoer.net.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataNetworkType>} A promise that resolves to an object containing network data.
 */
const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  const dns = await retrieveDns(page);

  await waitForSelectorAndClick(page, "#tab-ext span");

  const ip = await retrieveDataForTextSelector(page, "IP address");
  const webRTC = await retrieveDataForTextSelector(page, "WebRTC");
  const isp = await retrieveDataForTextSelector(page, "ISP");

  const httpData: { [key: string]: string } = {};

  await waitForSelectorAndClick(page, "#tab-fingerprint span");

  let dntActive: boolean | null;

  try {
    dntActive = !!parseInt(
      await retrieveDataForTextSelector(page, "doNotTrack")
    );
  } catch (error) {
    dntActive = null;
  }

  const networkData: FingerprintDataNetworkType = {
    ip,
    dns,
    webRTC,
    isp,
    httpData,
    dntActive,
  };

  return networkData;
};

/**
 * Retrieves browser-related fingerprint data from whoer.net.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataBrowserType>} A promise that resolves to an object containing browser data.
 */
const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  const { name, version } = await retrieveBrowserInfo(page);

  await waitForSelectorAndClick(page, "#tab-ext span");

  const contentLanguage = await retrieveContentLanguage(page);

  await waitForSelectorAndClick(page, "#tab-fingerprint span");

  const userAgent = await retrieveDataForTextSelector(page, "userAgent");

  const javascriptEnabled =
    (await retrieveDataForTextSelector(page, "JavaScript:")) === "enabled";
  const activeXEnabled =
    (await retrieveDataForTextSelector(page, "ActiveX:")) === "enabled";
  const flashEnabled =
    (await retrieveDataForTextSelector(page, "Flash:")) === "enabled";
  const cookiesEnabled =
    (await retrieveDataForTextSelector(page, "cookieEnabled")) === "true";

  const browserData: FingerprintDataBrowserType = {
    name,
    version,
    userAgent,
    extensions: null, // Not provided by whoer.net.
    javascriptEnabled,
    activeXEnabled,
    flashEnabled,
    cookiesEnabled,
    contentLanguage,
    fonts: null, // Not provided by whoer.net.
    webGLData: null, // Not specifically provided by whoer.net. Other info is provided below.
    incognitoEnabled: null, // Not provided by whoer.net.
  };

  return browserData;
};

/**
 * Retrieves hardware-related fingerprint data from whoer.net.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataHardwareType>} A promise that resolves to an object containing hardware data.
 */
const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  await waitForSelectorAndClick(page, "#tab-fingerprint span");

  const width = parseInt(await retrieveDataForTextSelector(page, "width"));
  const height = parseInt(await retrieveDataForTextSelector(page, "height"));
  const screenResolution: ViewportType = { height, width };

  const availableWidth = parseInt(
    await retrieveDataForTextSelector(page, "availWidth")
  );
  const availableHeight = parseInt(
    await retrieveDataForTextSelector(page, "availHeight")
  );
  const availableScreenSize: ViewportType = {
    height: availableHeight,
    width: availableWidth,
  };

  const colorDepth = parseInt(
    await retrieveDataForTextSelector(page, "colorDepth")
  );
  const concurrency = parseInt(
    await retrieveDataForTextSelector(page, "hardwareConcurrency")
  );
  const touchScreenEnabled = !!parseInt(
    await retrieveDataForTextSelector(page, "maxTouchPoints")
  );

  // DeviceMemory does not show up on Firefox?
  let deviceMemory: number | null;
  try {
    deviceMemory = parseInt(
      await retrieveDataForTextSelector(page, "deviceMemory")
    );
  } catch (error) {
    deviceMemory = null;
  }

  const hardwareData: FingerprintDataHardwareType = {
    screenResolution,
    availableScreenSize,
    colorDepth,
    deviceMemory,
    concurrency,
    cpuCores: null, // Not provided by whoer.net.
    graphicsCard: null, // Not provided by whoer.net.
    touchScreenEnabled,
  };

  return hardwareData;
};

/**
 * Retrieves fingerprint data from whoer.net.
 *
 * @param {FingerprintSiteOptionsType} options - The options for the fingerprint site, including the page and site URL.
 * @returns {Promise<FingerprintDataType>} A promise that resolves to the fingerprint data.
 *
 * @example
 * ```typescript
 * const options: FingerprintSiteOptionsType = {
 *   page: browserPage,
 *   siteUrl: "https://www.whoer.net"
 * };
 * const fingerprintData = await retrieveWhoerFingerprintData(options);
 * console.log(fingerprintData);
 * ```
 */
const retrieveWhoerFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;
  console.log("Retrieving fingerprint data from whoer.net...");

  await properlyNavigateToURL(page, siteUrl);

  if (!deniedCookiesAlready) {
    await explicitlyDenyWhoerCookies(page);
  }

  const locationData = await retrieveLocationData(page);
  const networkData = await retrieveNetworkData(page);
  const browserData = await retrieveBrowserData(page);
  const hardwareData = await retrieveHardwareData(page);

  const whoerData: FingerprintDataType = {
    operatingSystem: "TODO: Update.",
    location: locationData,
    network: networkData,
    browser: browserData,
    hardware: hardwareData,
  };

  console.log("Retrieved fingerprint data from whoer.net!\n");
  return whoerData;
};

export { retrieveWhoerFingerprintData };
