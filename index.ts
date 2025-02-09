import { Page, chromium, firefox, webkit } from "@playwright/test";

const runChromium = async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://example.com");
  await page.waitForTimeout(60000);
  await browser.close();
};

const main = async () => {
  await runChromium();
};

main();
