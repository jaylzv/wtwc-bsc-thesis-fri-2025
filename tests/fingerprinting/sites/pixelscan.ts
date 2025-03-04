import { Page } from "@playwright/test";
import {
  DUMMY_FINGERPRINT_DATA,
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
} from "../types";

const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  return DUMMY_FINGERPRINT_DATA.location;
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

const retrievePixelScanFingerprintData = async (
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

export { retrievePixelScanFingerprintData };
