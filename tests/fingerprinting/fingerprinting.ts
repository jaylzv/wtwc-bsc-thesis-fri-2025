import { Page } from "@playwright/test";
import { CurrentArgumentsType, TestOptionsType } from "../../utils/types";
import { DUMMY_FINGERPRINT_DATA, FingerprintDataType } from "./types";
import {
  retrieveBrowserScanFingerprintData,
  retrieveWhoerFingerprintData,
  retrieveAmIUniqueFingerprintData,
  retrieveDeviceInfoFingerprintData,
} from "./sites";

import chalk from "chalk";
import Table from "cli-table3";

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
  console.log(chalk.bold.blue("🌐 Current Arguments:"));
  console.log(`${chalk.green("Browser:")} ${args.browser}`);
  console.log(`${chalk.green("Search Engine:")} ${args.searchEngine}`);
  console.log(`${chalk.green("Extensions:")} ${args.extensions.join(", ")}`);

  console.log(chalk.bold.blue("\n🔎 Fingerprint Data Retrieved:"));

  for (const [site, fingerprint] of fingerprintData) {
    console.log(chalk.bold.yellow(`\nSite: ${site}`));

    // Summary table
    const table = new Table({
      head: [chalk.cyan("Category"), chalk.cyan("Details")],
      colWidths: [20, 80],
      wordWrap: true,
    });

    table.push(
      ["OS", fingerprint.operatingSystem],
      ["IP", fingerprint.network?.ip || "N/A"],
      ["ISP", fingerprint.network?.isp || "N/A"],
      ["Browser", fingerprint.browser?.name || "N/A"],
      ["User Agent", fingerprint.browser?.userAgent || "N/A"],
      [
        "Screen Resolution",
        fingerprint.hardware?.screenResolution
          ? `${fingerprint.hardware.screenResolution.width} x ${fingerprint.hardware.screenResolution.height}`
          : "N/A",
      ],
      ["Cookies Enabled", fingerprint.browser?.cookiesEnabled ? "Yes" : "No"],
      ["WebRTC", fingerprint.network?.webRTC || "N/A"],
      ["Touchscreen", fingerprint.hardware?.touchScreenEnabled ? "Yes" : "No"]
    );

    console.log(table.toString());

    // Full JSON output
    console.log(chalk.bold.magenta("📝 Full Fingerprint Data:"));
    console.log(chalk.gray(JSON.stringify(fingerprint, null, 2)));
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
