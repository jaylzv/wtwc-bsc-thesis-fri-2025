// Browsers
export enum BrowsersEnum {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
}
export type BrowsersType = `${BrowsersEnum}`;
export const BROWSERS_NAMES: BrowsersType[] = Object.values(BrowsersEnum);

// Search Engines
export enum SearchEngineUrlEnum {
  GOOGLE = "https://www.google.com/",
  BING = "https://www.bing.com/",
  STARTPAGE = "https://www.startpage.com/",
  DUCKDUCKGO = "https://duckduckgo.com/",
  YAHOO = "https://www.yahoo.com/",
  BRAVE = "https://search.brave.com/",
  MOJEEK = "https://www.mojeek.com/",
  QWANT = "https://www.qwant.com/",
}
export type SearchEngineUrlType = `${SearchEngineUrlEnum}`;
export const SEARCH_ENGINES_URLS: SearchEngineUrlType[] = Object.values(
  SearchEngineUrlEnum
);
