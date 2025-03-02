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

const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  return DUMMY_FINGERPRINT_DATA.location; // TODO: Placeholder, remove!
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
