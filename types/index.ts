import { Page } from "@playwright/test";
import { BrowsersType } from "../utils/browsers/types";
import { SearchEngineType } from "../utils/search-engines/types";

export enum TestEnum {
  LINK_DECORATING = "link_decorating",
  FINGERPRINTING = "fingerprinting",
  BOUNCE_TRACKING = "bounce_tracking",
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

export interface ArgumentsType {
  tests: TestType[];
  browsers: BrowsersType[];
  searchEngines: SearchEngineType[];
  extensions: string[];
  websites: string[];
  debug: boolean;
}
