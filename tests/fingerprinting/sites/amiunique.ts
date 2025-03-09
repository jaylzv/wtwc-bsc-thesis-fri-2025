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
import { properlyNavigateToURL } from "../../../utils/general-utils";

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

const retrieveAmIUniqueFingerprintData = async (
  options: FingerprintSiteOptionsType
): Promise<FingerprintDataType> => {
  const { page, siteUrl } = options;

  await properlyNavigateToURL(page, siteUrl);

  return DUMMY_FINGERPRINT_DATA;
};

export { retrieveAmIUniqueFingerprintData };
