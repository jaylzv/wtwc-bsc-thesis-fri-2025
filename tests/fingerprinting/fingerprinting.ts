import { Page } from "@playwright/test";
import { CurrentArgumentsType, TestOptionsType } from "../../utils/types";
import { FingerprintDataType } from "./types";
import {
  retrieveBrowserScanFingerprintData,
  retrieveWhoerFingerprintData,
  retrieveAmIUniqueFingerprintData,
  retrieveDeviceInfoFingerprintData,
} from "./sites";
import { FINGERPRINTING_SITES_URLS } from "./consts";

import chalk from "chalk";
import Table from "cli-table3";

/**
 * Displays fingerprint data and current arguments in a formatted and readable manner.
 *
 * This function logs the current arguments (browser, search engine, and extensions)
 * and iterates through the provided fingerprint data to display a summary table
 * and the full JSON representation of the fingerprint for each site.
 *
 * @param {FingerprintDataType} fingerprintData - A `Map` where the keys are site names (strings) and the values
 * are objects of type `FingerprintDataType` containing detailed fingerprint information.
 *
 * @param {CurrentArgumentsType} args - An object of type `CurrentArgumentsType` containing the current arguments
 * such as the browser, search engine, and extensions being used.
 *
 * Example Output:
 * - Current Arguments:
 *   - Browser: Chrome
 *   - Search Engine: Google
 *   - Extensions: AdBlock, Grammarly
 * - Fingerprint Data Retrieved:
 *   - Site: example.com
 *     - OS: Windows
 *     - IP: 192.168.1.1
 *     - ISP: ExampleISP
 *     - Browser: Chrome
 *     - User Agent: Mozilla/5.0 ...
 *     - Screen Resolution: 1920 x 1080
 *     - Cookies Enabled: Yes
 *     - WebRTC: Enabled
 *     - Touchscreen: No
 *   - Full Fingerprint Data: { ...JSON representation... }
 *
 * @remarks
 * This function uses the `chalk` library for colored console output and the `Table`
 * library for rendering tabular data in the terminal.
 */
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

/**
 * Retrieves fingerprint data from a specified website by navigating to the site
 * and extracting the relevant information using the appropriate handler.
 *
 * @param {Page} page - The Playwright `Page` instance used to interact with the website.
 * @param {string} siteUrl - The URL of the website to retrieve fingerprint data from.
 *                   Supported URLs:
 *                   - "https://www.browserscan.net/"
 *                   - "https://whoer.net/"
 *                   - "https://www.amiunique.org/"
 *                   - "https://www.deviceinfo.me/"
 * @returns A promise that resolves to the fingerprint data of type `FingerprintDataType`.
 * @throws {ReferenceError} If the provided `siteUrl` is not recognized or supported.
 */
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
      throw new ReferenceError(`Unknown site URL: ${siteUrl}`);
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
      currentArgs.websites.some((_) => site.includes("all"))
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
