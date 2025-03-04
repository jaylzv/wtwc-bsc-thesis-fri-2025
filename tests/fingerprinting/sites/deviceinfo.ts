import { Page } from "@playwright/test";
import {
  DUMMY_FINGERPRINT_DATA,
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
  LocationType,
} from "../types";

const retrieveDataForTextSelector = async (
  page: Page,
  textSelector: string
): Promise<string> => {
  console.log(`Retrieving data for text selector: ${textSelector}...`);

  const specificClassName = ".vdzye";
  const parentLocator = await page.locator(specificClassName, {
    has: page.getByText(textSelector, { exact: true }),
  });

  const childLocator = await parentLocator.locator(".czbdh").last();
  const retrievedData = await childLocator.innerText();
  console.log(`Retrieved data for ${textSelector}: ${retrievedData}`);
  return retrievedData;
};

const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  console.log("Retrieving location data...");

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

const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  return DUMMY_FINGERPRINT_DATA.network;
};

const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  return DUMMY_FINGERPRINT_DATA.browser;
};

const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  return DUMMY_FINGERPRINT_DATA.hardware;
};

const retrieveDeviceInfoFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;

  await page.goto(siteUrl);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle"); // TODO: This is deprecated, remove later.

  const operatingSystem = "TODO: Implement.";
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

  return deviceInfoData;
};

export { retrieveDeviceInfoFingerprintData };
