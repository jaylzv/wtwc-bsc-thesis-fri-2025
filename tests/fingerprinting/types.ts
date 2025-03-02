import { Page } from "@playwright/test";
import { ExtensionType } from "../../utils/extensions/types";

// TODO: INTRODUCE NULLS. SINCE NOT EVERY SITE PROVIDES EVERYTHING.

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
  geolocationOffset: number | null;
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
  name: string;
  version: string;
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
  screenResolution: ViewportType | null;
  availableScreenSize: ViewportType | null;
  colorDepth: number;
  deviceMemory: number;
  concurrency: number; // What is 'concurrency'?
  cpuCores: number;
  graphicsCard: string;
  touchScreenEnabled: boolean;
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
    geolocationOffset: -8,
  },
  network: {
    ip: "192.168.1.1",
    dns: "8.8.8.8",
    webRTC: "enabled",
    isp: "ISP Name",
    httpData: undefined,
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
    cookieEnabled: true,
    contentLanguage: "en-US",
    fonts: ["Arial", "Helvetica"],
    webGLData: undefined,
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
