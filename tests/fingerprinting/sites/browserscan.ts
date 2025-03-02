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

let deniedCookiesAlready = false; // Can't deny cookies twice on same browser.

/**
 * Parses a coordinate string in the format "DDD°MM′SS.SS″[NE]" and converts it to a decimal number.
 *
 * @param {string} unparsed - The coordinate string to parse. The format should be "DDD°MM′SS.SS″[NE]".
 *                   Note: We are only working with North & East, so no need for checking to multiply by -1.
 * @returns {number} The decimal representation of the coordinate.
 *
 * @example
 * ```typescript
 * const coordinate = parseCoordinates("45°30′15.5″N");
 * console.log(coordinate); // Output: 45.50430555555556
 * ```
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
 *
 * @example
 * ```typescript
 * const resolution = parseResolution("1920×1080");
 * console.log(resolution); // { width: 1920, height: 1080 }
 * ```
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
 * @throws Will throw an error if neither a paragraph nor an anchor element is found within the parent element.
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
  console.log(`Retrieving data for text selector: ${textSelector}...`);

  const specificClassName = "._11xj7yu";
  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText(textSelector, { exact: true }),
  });

  let childLocator: Locator;

  try {
    await parentLocator
      .locator("p")
      .last()
      .waitFor({ state: "attached", timeout: 1000 });
    childLocator = await parentLocator.locator("p").last();
  } catch (error) {
    await parentLocator
      .locator("a")
      .last()
      .waitFor({ state: "attached", timeout: 1000 });
    childLocator = await parentLocator.locator("a").last();
  }

  const retrievedData = await childLocator.innerText();
  console.log(`Retrieved data for ${textSelector}: ${retrievedData}`);
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
  console.log("Retrieving location data...");

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
    longitude: longitude,
    postalCode,
    timeZone,
  };

  console.log("Retrieved location data!\n");

  return locationData;
};

/**
 * Retrieves network-related fingerprint data from browserscan.net.
 *
 * @param {Page} page - The Playwright page object to retrieve data from.
 * @returns {Promise<FingerprintDataNetworkType>} A promise that resolves to an object containing network fingerprint data.
 *
 * The function retrieves the following network data:
 * - IP address
 * - WebRTC information
 * - ISP (Internet Service Provider)
 * - Do Not Track status (converted to a boolean)
 * - DNS information (currently handled unorthodoxly, marked for fixing)
 * - HTTP data (currently set to null as it is not provided by browserscan.net)
 */
const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  console.log("Retrieving network data...");

  const ip = await retrieveDataForTextSelector(page, "IP");
  const webRTC = await retrieveDataForTextSelector(page, "WebRTC");
  const isp = await retrieveDataForTextSelector(page, "ISP");

  // Unorthodox handling for next types
  const dntActive: boolean = !!parseInt(
    await retrieveDataForTextSelector(page, "Do Not Track")
  );
  const dns = await page.locator('a[href="/dns-leak"]').last().innerText(); // TODO: Fix
  const httpData = null; // Unprovided in browserscan.net

  const networkData: FingerprintDataNetworkType = {
    ip,
    dns,
    webRTC,
    isp,
    httpData,
    dntActive,
  };

  console.log("Retrieved network data!\n");

  return networkData;
};

/**
 * Retrieves browser data from browserscan.net.
 *
 * @param {Page} page - The Playwright Page object to retrieve data from.
 * @returns {Promise<FingerprintDataBrowserType>} A promise that resolves to an object containing browser fingerprint data.
 *
 * The function retrieves the following browser data:
 * - Browser name
 * - Browser version
 * - User agent string
 * - Extensions (currently set to null as it is not provided by browserscan.net)
 * - JavaScript enabled status (converted to a boolean)
 * - Flash enabled status (converted to a boolean)
 * - ActiveX enabled status (converted to a boolean)
 * - Cookies enabled status (converted to a boolean)
 * - Content language
 * - Incognito mode enabled status (converted to a boolean)
 * - Fonts
 * - WebGL data
 */
const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  console.log("Retrieving browser data...");

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

  const fonts = ["TODO: ", "Implement."]; // TODO: Implement.
  const webGLData = {}; // TODO: Implement. It's under hardware.

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

  console.log("Retrieved browser data!\n");

  return browserData;
};

/**
 * Retrieves hardware data from browserscan.net.
 *
 * @param {Page} page - The Playwright page instance to retrieve data from.
 * @returns {Promise<FingerprintDataHardwareType>} A promise that resolves to an object containing hardware fingerprint data.
 *
 * The function retrieves the following hardware data:
 * - Color Depth
 * - Device Memory
 * - Hardware Concurrency
 * - Graphics Card (Unmasked Renderer)
 * - Touch Screen Support
 * - Screen Resolution
 * - Available Screen Size
 *
 * Note: The CPU cores data is not provided by browserscan.net and is set to null.
 */
const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  console.log("Retrieving hardware data...");

  const colorDepth = parseInt(
    await retrieveDataForTextSelector(page, "Color Depth")
  );
  const deviceMemory = parseInt(
    await retrieveDataForTextSelector(page, "Device Memory")
  );
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

  console.log("Retrieved hardware data!\n");

  return hardwareData;
};

/**
 * Retrieves fingerprint data from browserscan.net.
 *
 * @param {FingerprintSiteOptionsType} options - The options for the fingerprint site, including the page and site URL.
 * @returns {Promise<FIngerprintDataType>} A promise that resolves to the fingerprint data.
 *
 * @remarks
 * This function navigates to the specified site URL, waits for the page to load completely,
 * and then retrieves various pieces of fingerprint data including operating system, location,
 * network, browser, and hardware information.
 *
 * @example
 * ```typescript
 * const options: FingerprintSiteOptionsType = {
 *   page: browserPage,
 *   siteUrl: "https://www.browserscan.net"
 * };
 * const fingerprintData = await retrieveBrowserScanFingerprintData(options);
 * console.log(fingerprintData);
 * ```
 */
const retrieveBrowserScanFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;

  await page.goto(siteUrl);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // TODO: This is deprecated, remove later.

  if (!deniedCookiesAlready) {
    const rejectCookiesButton = await page.getByText("Do not consent", {
      exact: true,
    });
    await rejectCookiesButton.waitFor({ state: "attached" });
    await rejectCookiesButton.waitFor({ state: "visible" });
    await rejectCookiesButton.click();
    deniedCookiesAlready = true;
  }

  const operatingSystem = await retrieveDataForTextSelector(page, "OS");
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

  return browserScanData;
};

// TODO: Change these sort of exports to default somehow? Even if importing from ./index.ts?
export { retrieveBrowserScanFingerprintData };
