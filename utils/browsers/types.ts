export enum BrowsersEnum {
  CHROMIUM = "chromium",
  FIREFOX = "firefox",
  WEBKIT = "webkit",
}
export type BrowsersType = `${BrowsersEnum}`;
export const BROWSERS_NAMES: BrowsersType[] = Object.values(BrowsersEnum);
