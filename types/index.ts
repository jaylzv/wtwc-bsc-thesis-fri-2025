import { Page } from "@playwright/test";
import { BrowsersType } from "../utils/browsers/types";
import { SearchEngineType } from "../utils/search-engines/types";

export enum TestEnum {
  LINK_DECORATING = "linkDecorating",
  FINGERPRINTING = "fingerprinting",
  BOUNCE_TRACKING = "bounceTracking",
}
export type TestType = `${TestEnum}`;

export interface TestCombinationType {
  browser: BrowsersType;
  searchEngine: SearchEngineType;
  extensionsCombination?: string[];
}

export interface TestOptionsType {
  page: Page;
  testCombination: TestCombinationType;
}
