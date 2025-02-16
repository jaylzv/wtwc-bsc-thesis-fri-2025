// Browsers
export enum BrowsersEnum {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
}
export type BrowsersType = `${BrowsersEnum}`;
export const BROWSERS_NAMES: BrowsersType[] = Object.values(BrowsersEnum);

// Search Engines
export enum SearchEnginesUrlsEnum {
  GOOGLE = "https://www.google.com/",
  BING = "https://www.bing.com/",
  STARTPAGE = "https://www.startpage.com/",
  DUCKDUCKGO = "https://duckduckgo.com/",
  YAHOO = "https://www.yahoo.com/",
  BRAVE = "https://search.brave.com/",
  MOJEEK = "https://www.mojeek.com/",
  QWANT = "https://www.qwant.com/",
}
export type SearchEnginesUrlsType = `${SearchEnginesUrlsEnum}`;
export const SEARCH_ENGINES_URLS: SearchEnginesUrlsType[] = Object.values(
  SearchEnginesUrlsEnum
);
