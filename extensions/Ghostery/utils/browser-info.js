import Bowser from '../npm/bowser/src/bowser.js';

let ua;
function getUA() {
  if (ua) {
    return ua;
  }
  ua = Bowser.parse(navigator.userAgent);
  return ua;
}
async function getExtendedBrowserInfo() {
  try {
    return chrome.runtime.getBrowserInfo();
  } catch {
    return null;
  }
}
function getPlatformInfo() {
  if (typeof chrome.runtime.getPlatformInfo === "function") {
    return new Promise((resolve) => {
      chrome.runtime.getPlatformInfo((info) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(info);
      });
    });
  }
  return Promise.resolve(null);
}
function getOS() {
  const ua2 = getUA();
  const platform = ua2.os?.name?.toLowerCase() || "";
  if (platform.includes("mac")) {
    return "mac";
  } else if (platform.includes("win")) {
    return "win";
  } else if (platform.includes("android")) {
    return "android";
  } else if (platform.includes("ios")) {
    return "ios";
  } else if (platform.includes("chromium os")) {
    return "cros";
  } else if (platform.includes("bsd")) {
    return "openbsd";
  } else if (platform.includes("linux")) {
    return "linux";
  }
  return "other";
}
function getOSVersion() {
  const ua2 = getUA();
  return ua2.os.version;
}
function isAndroid() {
  return getOS() === "android";
}
function getBrowser() {
  const ua2 = getUA();
  return ua2.browser.name.toLowerCase();
}
function isFirefox() {
  const browser = getBrowser();
  return browser.includes("firefox");
}
function isEdge() {
  const browser = getBrowser();
  return browser.includes("edge");
}
function isOpera() {
  const browser = getBrowser();
  return browser.includes("opera");
}
function getBrowserName() {
  {
    if (isOpera()) return "opera";
    if (isEdge()) {
      return isAndroid() ? "edge:android" : "edge:desktop";
    }
    return "chrome";
  }
}
async function getBrowserInfo() {
  const BROWSER_INFO = {
    displayName: "",
    name: "",
    token: "",
    os: "",
    osVersion: "",
    version: ""
  };
  const browser = getBrowser();
  if (browser.includes("edge")) {
    BROWSER_INFO.displayName = "Edge";
    BROWSER_INFO.name = "edge";
    BROWSER_INFO.token = "ed";
  } else if (browser.includes("opera")) {
    BROWSER_INFO.displayName = "Opera";
    BROWSER_INFO.name = "opera";
    BROWSER_INFO.token = "op";
  } else if (browser.includes("chrome")) {
    BROWSER_INFO.displayName = "Chrome";
    BROWSER_INFO.name = "chrome";
    BROWSER_INFO.token = "ch";
  } else if (browser.includes("firefox")) {
    BROWSER_INFO.displayName = "Firefox";
    BROWSER_INFO.name = "firefox";
    BROWSER_INFO.token = "ff";
  } else if (browser.includes("yandex")) {
    BROWSER_INFO.displayName = "Yandex";
    BROWSER_INFO.name = "yandex";
    BROWSER_INFO.token = "yx";
  } else if (browser.includes("safari")) {
    BROWSER_INFO.displayName = "Safari";
    BROWSER_INFO.name = "safari";
    BROWSER_INFO.token = "sf";
  }
  BROWSER_INFO.os = getOS();
  BROWSER_INFO.osVersion = getOSVersion();
  BROWSER_INFO.version = parseInt(getUA().browser.version.toString(), 10);
  const browserInfo2 = await getExtendedBrowserInfo();
  if (browserInfo2 && browserInfo2.name === "Ghostery") {
    if (BROWSER_INFO.os === "android") {
      BROWSER_INFO.displayName = "Ghostery Android Browser";
      BROWSER_INFO.name = "ghostery_android";
      BROWSER_INFO.token = "ga";
      BROWSER_INFO.version = browserInfo2.version;
    } else {
      BROWSER_INFO.displayName = "Ghostery Desktop Browser";
      BROWSER_INFO.name = "ghostery_desktop";
      BROWSER_INFO.token = "gd";
      BROWSER_INFO.version = browserInfo2.version.split(".").join("");
    }
  }
  const platformInfo = await getPlatformInfo();
  if (platformInfo && platformInfo.os === "ios" && BROWSER_INFO.os === "mac") {
    BROWSER_INFO.os = "ipados";
  }
  return BROWSER_INFO;
}
let browserInfo;
async function cachedGetBrowserInfo() {
  if (browserInfo) {
    return browserInfo;
  }
  browserInfo = await getBrowserInfo();
  return browserInfo;
}
cachedGetBrowserInfo.isAndroid = isAndroid;
cachedGetBrowserInfo.isFirefox = isFirefox;
cachedGetBrowserInfo.isEdge = isEdge;
cachedGetBrowserInfo.isGhosteryBrowser = async () => {
  const browserInfo2 = await cachedGetBrowserInfo();
  if (!browserInfo2.name) {
    return false;
  }
  return browserInfo2.name.includes("ghostery");
};
cachedGetBrowserInfo.getRawBrowserInfo = async () => {
  const ua2 = getUA();
  const browserInfo2 = await getExtendedBrowserInfo();
  const info = {};
  if (browserInfo2?.name === "Ghostery") {
    info.browser = browserInfo2?.displayName || "Ghostery";
    info.version = browserInfo2?.version ?? null;
  } else {
    info.browser = ua2.browser?.name || null;
    info.version = ua2.browser?.version || null;
  }
  info.os = ua2.os?.name || null;
  info.platform = ua2.platform?.type || null;
  return info;
};

export { cachedGetBrowserInfo as default, getBrowserName, isEdge, isFirefox, isOpera };
