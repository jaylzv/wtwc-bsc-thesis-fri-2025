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
  operatingSystem: string;
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

// TODO: Remove. Dummy constant. AI Generated.
const DUMMY_FINGERPRINT_DATA: FingerprintDataType = {
  operatingSystem: "Windows",
  location: {
    location: { country: "USA", region: "California", city: "San Francisco" },
    latitude: 37.7749,
    longitude: -122.4194,
    postalCode: 94103,
    timeZone: "PST",
  },
  network: {
    ip: "192.168.1.1",
    dns: "8.8.8.8",
    webRTC: "enabled",
    isp: "ISP Name",
    httpData: { "User-Agent": "Mozilla/5.0" },
    dntActive: false,
  },
  browser: {
    name: "Chrome",
    version: "91.0.4472.124",
    userAgent: "Mozilla/5.0",
    extensions: [],
    javascriptEnabled: true,
    activeXEnabled: false,
    flashEnabled: false,
    cookiesEnabled: true,
    contentLanguage: "en-US",
    fonts: ["Arial", "Helvetica"],
    webGLData: { Vendor: "Google Inc.", Renderer: "ANGLE" },
    incognitoEnabled: false,
  },
  hardware: {
    screenResolution: { width: 1920, height: 1080 },
    availableScreenSize: { width: 1920, height: 1040 },
    colorDepth: 24,
    deviceMemory: 8,
    concurrency: 4,
    cpuCores: 4,
    graphicsCard: "NVIDIA GTX 1080",
    touchScreenEnabled: false,
  },
};

export { DUMMY_FINGERPRINT_DATA };
