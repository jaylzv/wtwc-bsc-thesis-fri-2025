import { Locator, Page } from "@playwright/test";
import {
  DUMMY_FINGERPRINT_DATA,
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataLocationType,
  LocationType,
  FingerprintDataNetworkType,
  FingerprintDataBrowserType,
} from "../types";

let deniedCookiesAlready = false;

const parseCoordinates = (unparsed: string): number => {
  // TODO: Include this note in the function docs later.
  // Note: We are only working with North & East, so no need for checking to multiply by -1.
  const regex = /(\d+)°(\d+)′([\d.]+)″([NE])/;
  const matches = unparsed.match(regex) as RegExpMatchArray;
  const { degrees, minutes, seconds } = {
    degrees: parseFloat(matches[1]),
    minutes: parseFloat(matches[2]),
    seconds: parseFloat(matches[3]),
  };

  return degrees + minutes / 60 + seconds / 3600;
};

const retrieveDataForTextSelector = async (
  page: Page,
  textSelector: string
): Promise<string> => {
  console.log(`Retrieving data for text selector: ${textSelector}...`);

  // TODO: Improve names rather than parentLocator and childLocator.
  // TODO: Or improve docs.
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
  console.log(`Retrieved data for ${textSelector}: ${retrievedData}\n`);
  return retrievedData;
};

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
  const geolocationOffset = null; // browserscan.net requires an extra step for this. Skipping for now.

  const locationData: FingerprintDataLocationType = {
    location,
    latitude,
    longitude: longitude,
    postalCode,
    timeZone,
    geolocationOffset,
  };

  console.log("Retrieved location data!\n");

  return locationData;
};

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
  const webGLData = {}; // TODO: Implement.

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

  const locationData = await retrieveLocationData(page);
  const networkData = await retrieveNetworkData(page);
  const browserData = await retrieveBrowserData(page);
  // TODO: Revert this, this is just for now.
  DUMMY_FINGERPRINT_DATA.location = locationData;
  DUMMY_FINGERPRINT_DATA.network = networkData;
  DUMMY_FINGERPRINT_DATA.browser = browserData;

  return DUMMY_FINGERPRINT_DATA;
};

// TODO: Change these sort of exports to default somehow? Even if importing from ./index.ts?
export { retrieveBrowserScanFingerprintData };
