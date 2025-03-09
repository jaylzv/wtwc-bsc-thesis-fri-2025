import { Page } from "@playwright/test";
import {
  completelyWaitForPageLoad,
  properlyNavigateToURL,
} from "../../utils/general-utils";
import { TestOptionsType } from "../../utils/types";
import {
  AnchorHrefType,
  AnchorHrefEnum,
  loadingSelector,
  CookiesType,
  LocalStorageType,
  DisplayResultsType,
} from "./consts";

const waitForBounceTrackingPageToLoad = async (page: Page): Promise<void> => {
  await page.locator(loadingSelector).waitFor({
    state: "attached",
  });
  await page.waitForTimeout(1000); // TODO: Is this necessary?
};

const redirect = async (
  page: Page,
  anchorHrefSelector: AnchorHrefType
): Promise<void> => {
  await page.locator(anchorHrefSelector).waitFor({ state: "attached" });
  await page.locator(anchorHrefSelector).waitFor({ state: "visible" });
  await page.locator(anchorHrefSelector).click();

  await completelyWaitForPageLoad(page);
  await waitForBounceTrackingPageToLoad(page);
};

const displayResults = (results: DisplayResultsType) => {
  const {
    currentArgs,
    initialCookies,
    initialLocalStorage,
    finalCookies,
    finalLocalStorage,
  } = results;
  console.log("Results for 'Bounce Tracking' test:");
  console.log("-----------------------------------------");
  console.log("- Browser:", currentArgs.browser);
  console.log("- Extensions:", currentArgs.extensions.join(", "));
  console.log("-----------------------------------------");

  console.log("Initial Cookies:");
  console.table(initialCookies);

  console.log("Initial Local Storage:");
  console.table(initialLocalStorage);

  console.log("Final Cookies:");
  console.table(finalCookies);

  console.log("Final Local Storage:");
  console.table(finalLocalStorage);
};

const testBounceTracking = async (
  testOptions: TestOptionsType
): Promise<void> => {
  const { page, currentArgs } = testOptions;
  const mainWebsiteURL = "https://bounce-tracking-demo.glitch.me/";
  console.log("Testing bounce tracking...");

  const initialStorage = await page.context().storageState();
  const initialCookies: CookiesType = initialStorage.cookies;
  const initialLocalStorage: LocalStorageType =
    initialStorage.origins[0].localStorage;

  await properlyNavigateToURL(page, mainWebsiteURL);
  await waitForBounceTrackingPageToLoad(page);

  await redirect(page, AnchorHrefEnum.SERVER_WITH_COOKIES);
  await redirect(page, AnchorHrefEnum.CLIENT_WITH_LOCAL_STORAGE);

  const finalStorage = await page.context().storageState();
  const finalCookies: CookiesType = finalStorage.cookies;
  const finalLocalStorage: LocalStorageType =
    finalStorage.origins[0].localStorage;

  const results: DisplayResultsType = {
    currentArgs,
    initialCookies,
    initialLocalStorage,
    finalCookies,
    finalLocalStorage,
  };

  displayResults(results);
};

export { testBounceTracking };
