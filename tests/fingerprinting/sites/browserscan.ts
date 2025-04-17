import { Locator, Page } from "@playwright/test";
import {
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataLocationType,
  LocationType,
  FingerprintDataNetworkType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
} from "../types";
import {
  navigateToWebsiteThroughSearchEngine,
  waitForSelectorByTextAndClick,
} from "../../../utils/general-utils";

let deniedCookiesAlready = false; // Can't deny cookies twice on same browser.

/**
 * Explicitly denies consent for cookies on the Browserscan site by clicking the "Do not consent" button.
 *
 * @param {Page} page - The Playwright `Page` instance representing the browser page.
 * @returns {Promise<void>} A promise that resolves once the action is completed.
 */
const explicitlyDenyBrowserscanCookies = async (page: Page): Promise<void> => {
  await waitForSelectorByTextAndClick(page, "Do not consent");
  deniedCookiesAlready = true;
};

/**
 * Parses a coordinate string in the format "DDD°MM′SS.SS″[NE]" and converts it to a decimal number.
 *
 * @param {string} unparsed - The coordinate string to parse. The format should be "DDD°MM′SS.SS″[NE]".
 *                   Note: We are only working with North & East, so no need for checking to multiply by -1.
 * @returns {number} The decimal representation of the coordinate.
 */
const parseCoordinates = (unparsed: string): number => {
  const regex = /(\d+)°(\d+)′([\d.]+)″([NE])/;
  const matches = unparsed.match(regex) as RegExpMatchArray;
  const { degrees, minutes, seconds } = {
    degrees: parseFloat(matches[1]),
    minutes: parseFloat(matches[2]),
    seconds: parseFloat(matches[3]),
  };

  return degrees + minutes / 60 + seconds / 3600;
};

/**
 * Parses a resolution string and returns an object with width and height properties.
 *
 * @param {string} unparsed - The resolution string to parse, expected to be in the format "width×height" or "widthxheight".
 * @returns {width: number; height: number} An object containing the parsed width and height as numbers.
 */
const parseResolution = (
  unparsed: string
): { width: number; height: number } => {
  const regex = /(\d+)[×x](\d+)/;
  const matches = unparsed.match(regex) as RegExpMatchArray;
  const { width, height } = {
    width: parseInt(matches[1]),
    height: parseInt(matches[2]),
  };

  return { width, height };
};

/**
 * Retrieves the DNS leak information from the specified page.
 *
 * @param {Page} page - The Playwright `Page` object representing the browser page to interact with.
 * @returns {Promise<string>} A promise that resolves to the inner text of the DNS leak link.
 */
const retrieveDns = async (page: Page): Promise<string> => {
  const specificSelector = "div._19b73pb";
  const parentLocator = await page.locator(specificSelector, {
    has: page.getByText("DNS Leak:", { exact: true }),
  });
  return await parentLocator.locator('a[href="/dns-leak"]').first().innerText();
};

/**
 * Expands the font list to maximum and retrieves the fonts from browserscan.net.
 *
 * @param {Page} page - The playwright page object.
 * @returns {Promise<string[]>} A list of all the fonts.
 */
const retrieveFonts = async (page: Page): Promise<string[]> => {
  const displayAllFontsAnchorSelector = "a._y75f99";
  const displayAllFontsAnchor = await page.locator(
    displayAllFontsAnchorSelector,
    { has: page.getByText(/Show all fonts\(\d*\)/, { exact: true }) }
  );

  await displayAllFontsAnchor.waitFor({ state: "attached" });
  await displayAllFontsAnchor.scrollIntoViewIfNeeded();
  await displayAllFontsAnchor.waitFor({ state: "visible", timeout: 5000 });
  await displayAllFontsAnchor.click();

  const specificClassName = "._11xj7yu";
  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText("Fonts list", { exact: true }),
  });
  const fontLocators = await parentLocator.locator("ul li").all();

  let fonts: string[] = [];
  for (const font of fontLocators) {
    fonts.push(await font.innerText());
  }
  return fonts;
};

/**
 * Retrieves the WebGL Data from browserscan.net
 *
 * @param {Page} page - The playwright page object.
 * @returns {Promise<{ [key: string]: string }>} The WebGL data extracted.
 */
const retrieveWebGLData = async (
  page: Page
): Promise<{ [key: string]: string }> => {
  const webGLData: { [key: string]: string } = {
    WebGL: await retrieveDataForTextSelector(page, "WebGL"),
    WebGLReport: await retrieveDataForTextSelector(page, "WebGL Report"),
    Audio: await retrieveDataForTextSelector(page, "Audio"),
    ClientRects: await retrieveDataForTextSelector(page, "Client Rects"),
    WebGPUReport: await retrieveDataForTextSelector(page, "WebGPU Report"),
  };

  return webGLData;
};

/**
 * Retrieves a data value from a text selector within a parent element.
 * The parent element is located by a specific class name, and the child element is located by its tag name.
 * The function will first attempt to locate a paragraph element, and if that fails, it will attempt to locate an anchor element.
 * The inner text of the located child element is then returned.
 * If neither a paragraph nor an anchor element is found, an error is thrown.
 * The function logs the retrieval process and the retrieved data.
 * The function is browserscan.net specific.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @param {string} textSelector - The text selector to locate the parent element.
 * @returns {Promise<string>} A promise that resolves to the inner text of the located child element.
 *
 * @example
 * ```typescript
 * const text = await retrieveDataForTextSelector(page, "OS");
 * console.log(text); // Outputs 'Windows 11'
 * ```
 */
const retrieveDataForTextSelector = async (
  page: Page,
  textSelector: string
): Promise<string> => {
  const specificClassName = "._11xj7yu";
  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText(textSelector, { exact: true }),
  });

  let childLocator: Locator;

  const timeout = 15000; // Increased timeouts because of webkit.

  try {
    await parentLocator
      .locator("p")
      .last()
      .waitFor({ state: "attached", timeout });
    childLocator = await parentLocator.locator("p").last();
  } catch (error) {
    await parentLocator
      .locator("a")
      .last()
      .waitFor({ state: "attached", timeout });
    childLocator = await parentLocator.locator("a").last();
  }

  const retrievedData = await childLocator.innerText();
  return retrievedData;
};

/**
 * Retrieves location data from browserscan.net.
 *
 * This function extracts various location-related information from the page,
 * including country, region, city, latitude, longitude, postal code, and time zone.
 *
 * @param {Page} page - The Playwright Page object from which to retrieve the location data.
 * @returns {Promise<FingerprintDataLocationType>} A promise that resolves to an object containing the location data.
 */
const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  const country = await retrieveDataForTextSelector(page, "Country");
  const region = await retrieveDataForTextSelector(page, "Region");
  const city = await retrieveDataForTextSelector(page, "City");
  const location: LocationType = { country, region, city };

  const unparsedLatitude = await retrieveDataForTextSelector(page, "Latitude");
  const latitude = parseCoordinates(unparsedLatitude);
  const unparsedLongitude = await retrieveDataForTextSelector(
    page,
    "Longitude"
  );
  const longitude = parseCoordinates(unparsedLongitude);

  const postalCode = parseInt(
    await retrieveDataForTextSelector(page, "Postal Code")
  );
  const timeZone = await retrieveDataForTextSelector(page, "Time Zone");

  const locationData: FingerprintDataLocationType = {
    location,
    latitude,
    longitude,
    postalCode,
    timeZone,
  };

  return locationData;
};

/**
 * Retrieves network-related fingerprint data from browserscan.net.
 *
 * @param {Page} page - The Playwright page object to retrieve data from.
 * @returns {Promise<FingerprintDataNetworkType>} A promise that resolves to an object containing network fingerprint data.
 */
const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  const ip = await retrieveDataForTextSelector(page, "IP");
  const webRTC = await retrieveDataForTextSelector(page, "WebRTC");
  const isp = await retrieveDataForTextSelector(page, "ISP");

  // Unorthodox handling for next types
  const dntActive: boolean = !!parseInt(
    await retrieveDataForTextSelector(page, "Do Not Track")
  );
  const dns = await retrieveDns(page);

  const networkData: FingerprintDataNetworkType = {
    ip,
    dns,
    webRTC,
    isp,
    httpData: null,
    dntActive,
  };

  return networkData;
};

/**
 * Retrieves browser data from browserscan.net.
 *
 * @param {Page} page - The Playwright Page object to retrieve data from.
 * @returns {Promise<FingerprintDataBrowserType>} A promise that resolves to an object containing browser fingerprint data.
 */
const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  const name = await retrieveDataForTextSelector(page, "Browser");
  const version = await retrieveDataForTextSelector(page, "Browser Version");
  const userAgent = await retrieveDataForTextSelector(page, "Header");
  const extensions = null; // Unprovided in browserscan.net
  const javascriptEnabled =
    (await retrieveDataForTextSelector(page, "Javascript")) === "Enabled";
  const flashEnabled =
    (await retrieveDataForTextSelector(page, "Flash")) === "Enabled";
  const activeXEnabled =
    (await retrieveDataForTextSelector(page, "ActiveX")) === "Enabled";
  const cookiesEnabled =
    (await retrieveDataForTextSelector(page, "Cookie")) === "Enabled";
  const contentLanguage = await retrieveDataForTextSelector(page, "Languages");
  const incognitoEnabled =
    (await retrieveDataForTextSelector(page, "Incognito mode")) === "Yes";

  const fonts: string[] = await retrieveFonts(page);
  const webGLData = await retrieveWebGLData(page);

  const browserData: FingerprintDataBrowserType = {
    name,
    version,
    userAgent,
    extensions,
    javascriptEnabled,
    activeXEnabled,
    flashEnabled,
    cookiesEnabled,
    contentLanguage,
    fonts,
    webGLData,
    incognitoEnabled,
  };

  return browserData;
};

/**
 * Retrieves hardware data from browserscan.net.
 *
 * @param {Page} page - The Playwright page instance to retrieve data from.
 * @returns {Promise<FingerprintDataHardwareType>} A promise that resolves to an object containing hardware fingerprint data.
 */
const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  const colorDepth = parseInt(
    await retrieveDataForTextSelector(page, "Color Depth")
  );

  // Device Memory doesn't show up for firefox and webkit?
  let deviceMemory: number;
  try {
    deviceMemory = parseInt(
      await retrieveDataForTextSelector(page, "Device Memory")
    );
  } catch (error) {
    deviceMemory = -1;
  }

  const concurrency = parseInt(
    await retrieveDataForTextSelector(page, "Hardware Concurrency")
  );
  const cpuCores = null; // Unprovided in browserscan.net
  const graphicsCard = await retrieveDataForTextSelector(
    page,
    "Unmasked Renderer"
  );
  const touchScreenEnabled =
    (await retrieveDataForTextSelector(page, "Touch Support")) !==
    "not support"; // I am not using === since I don't know if it's just "support" for where it is supported.

  const screenResolution = parseResolution(
    await retrieveDataForTextSelector(page, "Screen Resolution")
  );
  const availableScreenSize = parseResolution(
    await retrieveDataForTextSelector(page, "Available Screen Size")
  );

  const hardwareData: FingerprintDataHardwareType = {
    screenResolution,
    availableScreenSize,
    colorDepth,
    deviceMemory,
    concurrency,
    cpuCores,
    graphicsCard,
    touchScreenEnabled,
  };

  return hardwareData;
};

/**
 * Retrieves fingerprint data from browserscan.net.
 *
 * @param {FingerprintSiteOptionsType} options - The options for the fingerprint site, including the page and site URL.
 * @returns {Promise<FIngerprintDataType>} A promise that resolves to the fingerprint data.
 */
const retrieveBrowserScanFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, searchEngine, websiteURL } = options;
  console.log("Retrieving fingerprint data from browserscan.net...");

  await navigateToWebsiteThroughSearchEngine(page, searchEngine, websiteURL);

  if (!deniedCookiesAlready) {
    await explicitlyDenyBrowserscanCookies(page);
  }

  let operatingSystem: string | null;
  try {
    operatingSystem = await retrieveDataForTextSelector(page, "OS");
  } catch (error) {
    operatingSystem = null;
  }

  const locationData = await retrieveLocationData(page);
  const networkData = await retrieveNetworkData(page);
  const browserData = await retrieveBrowserData(page);
  const hardwareData = await retrieveHardwareData(page);

  const browserScanData: FingerprintDataType = {
    operatingSystem,
    location: locationData,
    network: networkData,
    browser: browserData,
    hardware: hardwareData,
  };

  console.log("Retrieved fingerprint data from browserscan.net!\n");
  return browserScanData;
};

export { retrieveBrowserScanFingerprintData };
