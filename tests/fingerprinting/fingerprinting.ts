import { Page } from "@playwright/test";
import { TestOptionsType, TestCombinationType } from "../../types";
import { FingerprintDataType } from "./types";
import {
  retrieveBrowserScanFingerprintData,
  retrieveWhoerFingerprintData,
  retrieveAmIUniqueFingerprintData,
  retrieveDeviceInfoFingerprintData,
  retrievePixelScanFingerprintData,
} from "./sites";

const compareFingerprintData = (
  testCombination: TestCombinationType,
  fingerprintData: Map<string, FingerprintDataType>
) => {
  // TODO: Implement.
};

const retrieveFingerprintData = async (
  page: Page,
  siteUrl: string
): Promise<FingerprintDataType> => {
  await page.goto(siteUrl);
  await page.waitForTimeout(1000); // TODO: Put here just in case. Could be removed later.

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
      break;
  }

  // TODO: Implement.

  return { TODO: "Implement" };
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

  compareFingerprintData(testOptions.testCombination, fingerprintData);
};

export { testFingerprinting };
