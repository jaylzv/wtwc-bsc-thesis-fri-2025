import { Page } from "@playwright/test";
import { ExtensionType } from "../../utils/extensions/types";

interface LocationType {
  country: string | null;
  region: string | null;
  city: string | null;
}

interface ViewportType {
  width: number;
  height: number;
}

export { LocationType, ViewportType };

interface FingerprintSiteOptionsType {
  page: Page;
  siteUrl: string;
}

interface FingerprintDataLocationType {
  location: LocationType | null;
  latitude: number | null;
  longitude: number | null;
  postalCode: number | null;
  timeZone: string | null;
}

interface FingerprintDataNetworkType {
  ip: string | null;
  dns: string | null;
  webRTC: string | null;
  isp: string | null;
  httpData: { [key: string]: string } | null;
  dntActive: boolean | null;
}

interface FingerprintDataBrowserType {
  name: string | null;
  version: string | null;
  userAgent: string | null;
  extensions: ExtensionType[] | null;
  javascriptEnabled: boolean | null;
  activeXEnabled: boolean | null;
  flashEnabled: boolean | null;
  cookiesEnabled: boolean | null;
  contentLanguage: string | null;
  fonts: string[] | null;
  webGLData: { [key: string]: string } | null;
  incognitoEnabled: boolean | null;
}

interface FingerprintDataHardwareType {
  screenResolution: ViewportType | null;
  availableScreenSize: ViewportType | null;
  colorDepth: number | null;
  deviceMemory: number | null;
  concurrency: number | null;
  cpuCores: number | null;
  graphicsCard: string | null;
  touchScreenEnabled: boolean | null;
}

interface FingerprintDataType {
  operatingSystem: string | null;
  location: FingerprintDataLocationType;
  network: FingerprintDataNetworkType;
  browser: FingerprintDataBrowserType;
  hardware: FingerprintDataHardwareType;
}

export {
  FingerprintSiteOptionsType,
  FingerprintDataLocationType,
  FingerprintDataNetworkType,
  FingerprintDataBrowserType,
  FingerprintDataHardwareType,
  FingerprintDataType,
};
