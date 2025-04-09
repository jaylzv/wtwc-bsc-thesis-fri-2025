import { Page } from "@playwright/test";
import {
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
  LocationType,
  ViewportType,
} from "../types";
import { properlyNavigateToURL } from "../../../utils/general-utils";

/**
 * Retrieves the browser version from the given page by extracting text associated with the "Browser:" label.
 *
 * @param {Page} page - The Playwright `Page` instance representing the browser page to extract the version from.
 * @returns {Promise<string | null>} A promise that resolves to the browser version as a string if found, or `null` if not found.
 */
const retrieveBrowserVersion = async (page: Page): Promise<string | null> => {
  const versionText = await retrieveDataForTextSelector(page, "Browser:");
  const versionMatch = versionText
    .split(" ")
    .find((_, index, arr) => arr[index - 1] === "version");
  return versionMatch || null;
};

/**
 * Retrieves the screen resolution of a device by extracting and parsing
 * the resolution text from the specified page.
 *
 * @param {Page} page - The Playwright `Page` instance to interact with.
 * @returns {Promise<ViewportType>} A promise that resolves to an object containing the screen resolution
 *             as a `ViewportType` with `width` and `height` properties.
 */
const retrieveScreenResolution = async (page: Page): Promise<ViewportType> => {
  const unparsedResolution = await retrieveDataForTextSelector(
    page,
    "Resolution:"
  );
  const width = parseInt(unparsedResolution.split(" ")[0]);
  const height = parseInt(unparsedResolution.split(" ")[2]);
  return { width, height } as ViewportType;
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
  const specificClassName = ".vdzye";
  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText(textSelector, { exact: true }),
  });

  const childLocator = await parentLocator.locator(".czbdh").last();
  const retrievedData = await childLocator.innerText();

  return retrievedData;
};

/**
 * Retrieves location-related fingerprint data from deviceinfo.me.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataLocationType>} A promise that resolves to an object containing location data.
 */
const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  const country = await retrieveDataForTextSelector(page, "Country:");
  const region = await retrieveDataForTextSelector(page, "Region:");
  const city = await retrieveDataForTextSelector(page, "City:");
  const location: LocationType = { country, region, city };

  const timeZone = await retrieveDataForTextSelector(page, "Local Time Zone:");

  const unparsedCoordinates = (
    (await retrieveDataForTextSelector(page, "Latitude & Longitude:")) as string
  ).split(", ");
  const latitude = parseFloat(unparsedCoordinates[0]);
  const longitude = parseFloat(unparsedCoordinates[1]);

  const locationData: FingerprintDataLocationType = {
    location,
    latitude,
    longitude,
    timeZone,
    postalCode: null, // Not provided by deviceinfo.me
  };

  return locationData;
};

/**
 * Retrieves network-related fingerprint data from deviceinfo.me.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataNetworkType>} A promise that resolves to an object containing network data.
 */
const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  const ip = await retrieveDataForTextSelector(page, "IP Address (WAN):");
  const webRTC = await retrieveDataForTextSelector(page, "WebRTC:");
  const isp = await retrieveDataForTextSelector(page, "ISP:");
  const dntActive =
    (await retrieveDataForTextSelector(page, "Do Not Track:")) === "Enabled";

  const httpData: { [key: string]: string } = {
    accept: await retrieveDataForTextSelector(page, "Accept:"),
    acceptEncoding: await retrieveDataForTextSelector(page, "Accept-Encoding:"),
    acceptLanguage: await retrieveDataForTextSelector(page, "Accept-Language:"),
    connection: await retrieveDataForTextSelector(page, "Connection:"),
    host: await retrieveDataForTextSelector(page, "Host:"),
    userAgent: await retrieveDataForTextSelector(page, "User-Agent:"),
  };

  const networkData: FingerprintDataNetworkType = {
    ip,
    dns: null, // Not provided by deviceinfo.me
    webRTC,
    isp,
    httpData,
    dntActive,
  };

  return networkData;
};

/**
 * Retrieves browser-related fingerprint data from deviceinfo.me.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataBrowserType>} A promise that resolves to an object containing browser data.
 */
const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  const name = await retrieveDataForTextSelector(page, "Browser:");
  const userAgent = await retrieveDataForTextSelector(page, "User Agent:");
  const extensions = [await retrieveDataForTextSelector(page, "Extensions:")];
  const contentLanguage = await retrieveDataForTextSelector(page, "Languages:");

  const javascriptEnabled =
    (await retrieveDataForTextSelector(page, "JavaScript:")) === "Enabled";
  const activeXEnabled =
    (await retrieveDataForTextSelector(page, "ActiveX:")) === "Supported";
  const cookiesEnabled =
    (await retrieveDataForTextSelector(page, "Cookies:")) === "Enabled";

  const version = await retrieveBrowserVersion(page);

  const webGLData: { [key: string]: string } = {
    extensionsEnabled: "Extensions",
  };

  const browserData: FingerprintDataBrowserType = {
    name,
    version,
    userAgent,
    extensions,
    javascriptEnabled,
    activeXEnabled,
    flashEnabled: null, // Not supported by deviceinfo.me
    cookiesEnabled,
    contentLanguage,
    fonts: null, // TODO: Implement later.
    webGLData,
    incognitoEnabled: null, // Not supported by deviceinfo.me
  };

  return browserData;
};

/**
 * Retrieves hardware-related fingerprint data from deviceinfo.me.
 *
 * @param {Page} page - The Playwright Page object representing the browser page.
 * @returns {Promise<FingerprintDataHardwareType>} A promise that resolves to an object containing hardware data.
 */
const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  const screenResolution: ViewportType = await retrieveScreenResolution(page);

  const colorDepthUnparsed = await retrieveDataForTextSelector(
    page,
    "Color Depth:"
  );
  const colorDepth = parseInt(colorDepthUnparsed.replace("-bit", ""));

  const deviceMemory = parseInt(
    await retrieveDataForTextSelector(page, "Memory (RAM):")
  );
  const cpuCores = parseInt(
    await retrieveDataForTextSelector(page, "Number of cores:")
  );

  const graphicsCard = await retrieveDataForTextSelector(
    page,
    "Graphics Card Name / Driver:"
  );

  const touchScreenEnabled =
    (await retrieveDataForTextSelector(page, "Touchscreen:")) === "Yes";

  const hardwareData: FingerprintDataHardwareType = {
    screenResolution,
    availableScreenSize: null, // Not provided by deviceinfo.me
    colorDepth,
    deviceMemory,
    concurrency: null, // Not provided by deviceinfo.me
    cpuCores,
    graphicsCard,
    touchScreenEnabled,
  };

  return hardwareData;
};

/**
 * Retrieves fingerprint data from deviceinfo.me.
 *
 * @param {FingerprintSiteOptionsType} options - The options for the fingerprint site, including the page and site URL.
 * @returns {Promise<FingerprintDataType>} A promise that resolves to the fingerprint data.
 *
 * @example
 * ```typescript
 * const options: FingerprintSiteOptionsType = {
 *   page: browserPage,
 *   siteUrl: "https://deviceinfo.me"
 * };
 * const fingerprintData = await retrieveDeviceInfoFingerprintData(options);
 * console.log(fingerprintData);
 * ```
 */
const retrieveDeviceInfoFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;
  console.log("Retrieving fingerprint data from deviceinfo.me...");

  await properlyNavigateToURL(page, siteUrl);

  const operatingSystem = await retrieveDataForTextSelector(
    page,
    "Operating System:"
  );
  const locationData = await retrieveLocationData(page);
  const networkData = await retrieveNetworkData(page);
  const browserData = await retrieveBrowserData(page);
  const hardwareData = await retrieveHardwareData(page);

  const deviceInfoData: FingerprintDataType = {
    operatingSystem,
    location: locationData,
    network: networkData,
    browser: browserData,
    hardware: hardwareData,
  };

  console.log("Retrieved fingerprint data from deviceinfo.me!\n");
  return deviceInfoData;
};

export { retrieveDeviceInfoFingerprintData };
