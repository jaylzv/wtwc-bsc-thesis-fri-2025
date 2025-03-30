import { Page } from "@playwright/test";
import {
  FingerprintDataType,
  FingerprintSiteOptionsType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
} from "../types";
import { properlyNavigateToURL } from "../../../utils/general-utils";

// TODO: Implement.

const explicitlyDenyCookies = async (page: Page): Promise<void> => {
  const rejectCookiesButton = await page.getByText("Reject", { exact: true });

  await rejectCookiesButton.waitFor({ state: "attached" });
  await rejectCookiesButton.scrollIntoViewIfNeeded();
  await rejectCookiesButton.waitFor({ state: "visible", timeout: 5000 });
  await rejectCookiesButton.click();
};

const retrieveLocationData = async (
  page: Page
): Promise<FingerprintDataLocationType> => {
  return {
    location: null,
    latitude: null,
    longitude: null,
    postalCode: null,
    timeZone: null,
  };
};

const retrieveNetworkData = async (
  page: Page
): Promise<FingerprintDataNetworkType> => {
  return {
    ip: null,
    dns: null,
    webRTC: null,
    isp: null,
    httpData: null,
    dntActive: null,
  };
};

const retrieveBrowserData = async (
  page: Page
): Promise<FingerprintDataBrowserType> => {
  return {
    name: null,
    version: null,
    userAgent: null,
    extensions: null,
    javascriptEnabled: null,
    activeXEnabled: null,
    flashEnabled: null,
    cookiesEnabled: null,
    contentLanguage: null,
    fonts: null,
    webGLData: null,
    incognitoEnabled: null,
  };
};

const retrieveHardwareData = async (
  page: Page
): Promise<FingerprintDataHardwareType> => {
  return {
    screenResolution: null,
    availableScreenSize: null,
    colorDepth: null,
    deviceMemory: null,
    concurrency: null,
    cpuCores: null,
    graphicsCard: null,
    touchScreenEnabled: null,
  };
};

const retrieveAmIUniqueFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;

  await properlyNavigateToURL(page, siteUrl);

  const operatingSystem = null;
  const locationData = await retrieveLocationData(page);
  const networkData = await retrieveNetworkData(page);
  const browserData = await retrieveBrowserData(page);
  const hardwareData = await retrieveHardwareData(page);

  const amIUniqueData: FingerprintDataType = {
    operatingSystem,
    location: locationData,
    network: networkData,
    browser: browserData,
    hardware: hardwareData,
  };

  return amIUniqueData;
};

export { retrieveAmIUniqueFingerprintData };
