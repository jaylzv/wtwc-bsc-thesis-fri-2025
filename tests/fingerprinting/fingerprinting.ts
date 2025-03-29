import { Page } from "@playwright/test";
import {
  ArgumentsType,
  CurrentArgumentsType,
  TestOptionsType,
} from "../../utils/types";
import { DUMMY_FINGERPRINT_DATA, FingerprintDataType } from "./types";
import {
  retrieveBrowserScanFingerprintData,
  retrieveWhoerFingerprintData,
  retrieveAmIUniqueFingerprintData,
  retrieveDeviceInfoFingerprintData,
} from "./sites";

const FINGERPRINTING_SITES_URLS: string[] = [
  "https://www.browserscan.net/",
  "https://whoer.net/",
  "https://www.amiunique.org/fingerprint",
  "https://www.deviceinfo.me/",
];

const displayFingerprintData = (
  fingerprintData: Map<string, FingerprintDataType>,
  args: CurrentArgumentsType
) => {
  console.log("Current arguments:");
  const { browser, searchEngine, extensions } = args;
  console.log(`Browser: ${browser}`);
  console.log(`Search engine: ${searchEngine}`);
  console.log(
    `Extensions: ${extensions.map((extension) => extension).join(", ")}`
  );

  console.log("\nFingerprint data retrieved from the following sites:");
  for (const [site, fingerprint] of fingerprintData) {
    console.log(`Site: ${site}`);
    console.log(`Fingerprint: ${JSON.stringify(fingerprint)}\n`);
  }
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
    default:
      console.error(`Unknown site URL: ${siteUrl}`);
      return DUMMY_FINGERPRINT_DATA; // TODO: Should this be updated?
  }
};

/**
 * Tests fingerprinting by retrieving fingerprint data from a list of sites and comparing the results.
 *
 * @param {TestOptionsType} testOptions - The options for the test, including the page to use and the test combination.
 * @returns {Promise<void>} A promise that resolves when the fingerprinting test is complete.
 */
const testFingerprinting = async (
  testOptions: TestOptionsType
): Promise<void> => {
  console.log("\nTesting fingerprinting...");

  const { page, currentArgs } = testOptions;
  let fingerprintData: Map<string, FingerprintDataType> = new Map();

  for (const site of FINGERPRINTING_SITES_URLS) {
    if (
      currentArgs.websites.some((website) => site.includes(website)) ||
      currentArgs.websites.some((website) => site.includes("all"))
    ) {
      const fingerprint: FingerprintDataType = await retrieveFingerprintData(
        page,
        site
      );
      fingerprintData.set(site, fingerprint);
    }
  }

  displayFingerprintData(fingerprintData, currentArgs);
};

export { testFingerprinting };
