import path from "path";
import { getExtensionCombinations } from "./extensions-utils";

// Browsers
export enum BrowsersEnum {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
}
export type BrowsersType = `${BrowsersEnum}`;
export const BROWSERS_NAMES: BrowsersType[] = Object.values(BrowsersEnum);

// Search Engines
export enum SearchEngineEnum {
  GOOGLE = "google",
  BING = "bing",
  STARTPAGE = "startpage",
  DUCKDUCKGO = "duckduckgo",
  YAHOO = "yahoo",
  BRAVE = "search.brave",
  MOJEEK = "mojeek",
  QWANT = "qwant",
}
export type SearchEngineType = `${SearchEngineEnum}`;
export const SEARCH_ENGINES: SearchEngineType[] =
  Object.values(SearchEngineEnum);

// Extensions
export const EXTENSIONS = [
  "uBlockOrigin",
  "PrivacyBadger",
  "Ghostery",
  "CanvasBlocker",
  "ClearURLs",
] as const;
export type ExtensionType = (typeof EXTENSIONS)[number];
export const EXTENSION_PATHS: Map<ExtensionType, string> = new Map([
  ["uBlockOrigin", path.join(__dirname, `../extensions/uBlockOrigin`)],
  ["PrivacyBadger", path.join(__dirname, `../extensions/PrivacyBadger`)],
  ["Ghostery", path.join(__dirname, `../extensions/Ghostery`)],
  ["CanvasBlocker", path.join(__dirname, `../extensions/CanvasBlocker`)],
  ["ClearURLs", path.join(__dirname, `../extensions/ClearURLs`)],
]);
export const EXTENSION_COMBINATIONS: ReadonlyArray<
  ReadonlyArray<ExtensionType>
> = getExtensionCombinations();
