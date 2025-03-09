import { properlyNavigateToURL } from "../../utils/general-utils";
import { TestOptionsType } from "../../utils/types";

const testBounceTracking = async (
  testOptions: TestOptionsType
): Promise<void> => {
  const { page, currentArgs } = testOptions;
  const mainWebsiteURL = "https://bounce-tracking-demo.glitch.me/";
  console.log("Testing bounce tracking...");

  const storage = await page.context().storageState();
  const initialCookies = storage.cookies;
  const initialLocalStorage = storage.origins[0].localStorage;

  await properlyNavigateToURL(page, mainWebsiteURL);
};

export { testBounceTracking };
