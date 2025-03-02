import { Page } from "@playwright/test";
import {
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  DUMMY_FINGERPRINT_DATA,
} from "../types";

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
    .innerText();

  console.log(`Retrieved data for ${textSelector}: ${retrievedData}`);
  return retrievedData;
};

const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  const country = await retrieveDataForTextSelector(page, "Country:");
  const region = await retrieveDataForTextSelector(page, "Region:");
  const city = await retrieveDataForTextSelector(page, "City:");
  const postalCode = parseInt(await retrieveDataForTextSelector(page, "ZIP:"));

  const locationData: FingerprintDataLocationType = {
    location: { country, region, city },
    latitude: null, // Not provided by whoer.net.
    longitude: null, // Not provided by whoer.net.
    postalCode,
    timeZone: null, // Not provided by whoer.net.
    geolocationOffset: null, // Not provided by whoer.net.
  };

  return locationData;
};

const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  return DUMMY_FINGERPRINT_DATA.network; // TODO: Placeholder, remove!
};

const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  return DUMMY_FINGERPRINT_DATA.browser; // TODO: Placeholder, remove!
};

const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  return DUMMY_FINGERPRINT_DATA.hardware; // TODO: Placeholder, remove!
};

const retrieveWhoerFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;

  await page.goto(siteUrl);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // TODO: This is deprecated, remove later.

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

  return whoerData;
};

export { retrieveWhoerFingerprintData };
