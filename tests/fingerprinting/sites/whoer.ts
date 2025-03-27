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
} from "../../../utils/general-utils";

const retrieveDataForTextSelector = async (
  page: Page,
  textSelector: string
): Promise<string> => {
  console.log(`Retrieving data for ${textSelector}...`);

  const specificClassName = ".card__row";

  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText(textSelector),
  });

  const retrievedData = await parentLocator
    .locator(".card__col.card__col_value span")
    .first()
    .innerText();

  console.log(`Retrieved data for ${textSelector}: ${retrievedData}`);
  return retrievedData;
};

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
    await retrieveDataForTextSelector(page, "Longtitude:")
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

const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  const dns = await page
    .locator(".ip-data__row", {
      has: page.getByText("DNS", { exact: true }),
    })
    .locator(".ip-data__col.ip-data__col_value .cont.dns_br_ip.max_ip span")
    .innerText();

  await waitForSelectorAndClick(page, "#tab-ext span");

  const ip = await retrieveDataForTextSelector(page, "IP address");
  const webRTC = await retrieveDataForTextSelector(page, "WebRTC");
  const isp = await retrieveDataForTextSelector(page, "ISP");

  const httpData: { [key: string]: string } = {};

  await waitForSelectorAndClick(page, "#tab-fingerprint span");
  const dntActive = !!parseInt(
    await retrieveDataForTextSelector(page, "doNotTrack")
  );

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

const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  const browserInfo = await page
    .locator(".ip-data__row", {
      has: page.getByText("Browser:", { exact: true }),
    })
    .locator(".ip-data__col.ip-data__col_value span")
    .innerText();

  const name = browserInfo.trim().split(" ")[0];
  const version = browserInfo.trim().split(" ")[1];

  await waitForSelectorAndClick(page, "#tab-ext span");

  // TODO: Move specific retrieval of selectors like so in seperate file.
  //       Like for example, ./specific-utils.ts
  const contentLanguageParent = await page
    .locator(".card__row", {
      has: page.getByText("JavaScript:"),
    })
    .nth(1);

  const contentLanguage = await contentLanguageParent
    .locator(".card__col.card__col_value span")
    .first()
    .innerText();

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
  const deviceMemory = parseInt(
    await retrieveDataForTextSelector(page, "deviceMemory")
  );
  const concurrency = parseInt(
    await retrieveDataForTextSelector(page, "hardwareConcurrency")
  );

  const touchScreenEnabled = !!parseInt(
    await retrieveDataForTextSelector(page, "maxTouchPoints")
  );

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

const retrieveWhoerFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;
  console.log("Retrieving fingerprint data from whoer.net...");

  await properlyNavigateToURL(page, siteUrl);

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
