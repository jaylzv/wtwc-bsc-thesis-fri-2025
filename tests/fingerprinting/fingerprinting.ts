import { Page } from "@playwright/test";
import { ArgumentsType, TestOptionsType } from "../../types";
import { DUMMY_FINGERPRINT_DATA, FingerprintDataType } from "./types";
import {
  retrieveBrowserScanFingerprintData,
  retrieveWhoerFingerprintData,
  retrieveAmIUniqueFingerprintData,
  retrieveDeviceInfoFingerprintData,
  retrievePixelScanFingerprintData,
} from "./sites";

const compareFingerprintData = (
  fingerprintData: Map<string, FingerprintDataType>,
  args: ArgumentsType
) => {
  // TODO: Implement.
};

const retrieveFingerprintData = async (
  page: Page,
  siteUrl: string
): Promise<FingerprintDataType> => {
  switch (siteUrl) {
    case "https://www.browserscan.net/":
      return await retrieveBrowserScanFingerprintData({ page, siteUrl });
    case "https://whoer.net/":
      return await retrieveWhoerFingerprintData({ page, siteUrl });
    case "https://www.amiunique.org/":
      return await retrieveAmIUniqueFingerprintData({ page, siteUrl });
    case "https://www.deviceinfo.me/":
      return await retrieveDeviceInfoFingerprintData({ page, siteUrl });
    case "https://pixelscan.net/":
      return await retrievePixelScanFingerprintData({ page, siteUrl });
    default:
      console.error(`Unknown site URL: ${siteUrl}`);
      return DUMMY_FINGERPRINT_DATA;
  }
};

const FINGERPRINTING_SITES_URLS: string[] = [
  "https://www.browserscan.net/",
  "https://whoer.net/",
  "https://www.amiunique.org/",
  "https://www.deviceinfo.me/",
  "https://pixelscan.net/",
];

/**
 * Tests fingerprinting by retrieving fingerprint data from a list of sites and comparing the results.
 *
 * @param {TestOptionsType} testOptions - The options for the test, including the page to use and the test combination.
 * @returns {Promise<void>} A promise that resolves when the fingerprinting test is complete.
 */
const testFingerprinting = async (
  testOptions: TestOptionsType
): Promise<void> => {
  let fingerprintData: Map<string, FingerprintDataType> = new Map();

  for (const site of FINGERPRINTING_SITES_URLS) {
    const fingerprint: FingerprintDataType = await retrieveFingerprintData(
      testOptions.page,
      site
    );
    fingerprintData.set(site, fingerprint);
  }

  compareFingerprintData(fingerprintData, testOptions.args);
};

export { testFingerprinting };
