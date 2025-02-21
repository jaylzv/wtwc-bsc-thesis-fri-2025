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
