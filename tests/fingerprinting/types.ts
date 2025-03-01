import { Page } from "@playwright/test";
import { ExtensionType } from "../../utils/extensions/types";

interface FingerprintSiteOptionsType {
  page: Page;
  siteUrl: string;
}

export { FingerprintSiteOptionsType };

interface FingerprintDataLocationType {
  location: { country: string; region: string; city: string };
  locationLatitude: number;
  locationLongtitude: number;
  postalCode: number;
  timeZone: string;
  geolocationOffset: number;
}

interface FingerprintDataNetworkType {
  ip: string;
  dns: string;
  webRTC: string;
  isp: string;
  httpData: undefined; // TODO: type: HttpDataType; How to go on about this?
  dntActive: boolean;
}

interface FingerprintDataBrowserType {
  browserName: string;
  browserVersion: string;
  userAgent: string;
  extensions: ExtensionType[];
  javascriptEnabled: boolean;
  activeXEnabled: boolean;
  flashEnabled: boolean;
  cookieEnabled: boolean;
  contentLanguage: string;
  fonts: string[];
  webGLData: undefined; // TODO: type: WebGLDataType; How to go on about this?
  incognitoEnabled: boolean;
}

interface FingerprintDataHardwareType {
  screenResolution: { width: number; height: number };
  availableScreenSize: { width: number; height: number };
  colorDepth: number;
  touchSupportEnabled: number;
  deviceMemory: number;
  concurrency: number; // What is 'concurrency'?
  cpuCores: number;
  graphicsCardName: string;
  touchScreenEnabled: boolean;
}

interface FingerprintDataType {
  operatingSystem: string;
  location: FingerprintDataLocationType;
  network: FingerprintDataNetworkType;
  browser: FingerprintDataBrowserType;
  hardware: FingerprintDataHardwareType;
}

export { FingerprintDataType };
