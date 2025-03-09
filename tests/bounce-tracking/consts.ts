import { CurrentArgumentsType } from "../../utils/types";

const loadingSelector = 'div#loading[style="display: none;"]';

export { loadingSelector };

enum AnchorHrefEnum {
  SERVER_WITH_COOKIES = "https://bounce-tracking-demo-tracker-server.glitch.me/bounce",
  CLIENT_WITH_LOCAL_STORAGE = "https://bounce-tracking-demo-tracker-2.glitch.me/client-bounce.html",
}
type AnchorHrefType = `${AnchorHrefEnum}`;

export { AnchorHrefEnum, AnchorHrefType };

type LocalStorageType = {
  name: string;
  value: string;
}[];

type CookiesType = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}[];

type DisplayResultsType = {
  currentArgs: CurrentArgumentsType;
  initialCookies: CookiesType;
  initialLocalStorage: LocalStorageType;
  finalCookies: CookiesType;
  finalLocalStorage: LocalStorageType;
};

export { LocalStorageType, CookiesType, DisplayResultsType };
