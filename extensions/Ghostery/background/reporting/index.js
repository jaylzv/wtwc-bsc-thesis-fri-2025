import '../../npm/@whotracksme/reporting/reporting/src/patterns.js';
import { setLogLevel, describeLoggers } from '../../npm/@whotracksme/reporting/reporting/src/logger.js';
import '../../npm/tldts-core/dist/es6/src/options.js';
import '../../npm/@whotracksme/reporting/reporting/src/pages.js';
import '../../npm/@whotracksme/reporting/reporting/src/http.js';
import '../../npm/linkedom/esm/cached.js';
import '../../npm/@whotracksme/reporting/npm/idb/build/index.js';
import '../../npm/@whotracksme/reporting/reporting/src/md5.js';
import '../../npm/@whotracksme/reporting/reporting/src/request/hash/index.js';
import asyncSetup from '../../utils/setup.js';
import debug from '../../utils/debug.js';
import { addListener } from '../../utils/options-observer.js';
import { isFirefox } from '../../utils/browser-info.js';
import config from './config.js';
import communication from './communication.js';
import urlReporter from './url-reporter.js';
import webRequestReporter from './webrequest-reporter.js';

(async () => {
  try {
    const key = "ghosteryReportingLoggerConfig";
    const { [key]: config2 } = await chrome.storage.local.get(key) || {};
    if (config2) {
      for (const { level, prefix = "*" } of config2) {
        setLogLevel(level, { prefix });
      }
    } else {
      setLogLevel("off");
    }
  } catch (e) {
    console.warn("Failed to apply logger overwrites", e);
  }
})();
const setup = asyncSetup("reporting", [
  addListener(async function reporting({ terms }) {
    if (terms && !isFirefox()) {
      if (webRequestReporter) {
        webRequestReporter.init().catch((e) => {
          console.warn(
            "Failed to initialize request reporting. Leaving the module disabled and continue.",
            e
          );
        });
      }
      await urlReporter.init().catch((e) => {
        console.warn(
          "Failed to initialize reporting. Leaving the module disabled and continue.",
          e
        );
      });
    } else {
      try {
        urlReporter.unload();
      } catch (e) {
        console.error(e);
      }
      try {
        webRequestReporter?.unload();
      } catch (e) {
        console.error(e);
      }
    }
  })
]);
async function onLocationChange(details) {
  try {
    setup.pending && await setup.pending;
  } catch (e) {
    console.warn("Reporting is unavailable:", e);
    return;
  }
  if (!urlReporter.isActive) return;
  const { url, frameId, tabId } = details;
  if (frameId !== 0 || url === "about:blank" || url.startsWith("chrome://")) {
    return;
  }
  const tab = await chrome.tabs.get(tabId).catch(() => null);
  if (!tab) {
    return;
  }
  if (tab.incognito) {
    return;
  }
  try {
    await urlReporter.analyzeUrl(url);
  } catch (e) {
    console.warn("Unexpected error in reporting module:", e);
  }
}
chrome.webNavigation.onCommitted.addListener(onLocationChange);
{
  chrome.webNavigation.onHistoryStateUpdated.addListener(onLocationChange);
}
debug.WTM = {
  communication,
  urlReporter,
  config,
  webRequestReporter,
  extensionStartedAt: /* @__PURE__ */ new Date(),
  logging: {
    setLogLevel,
    describeLoggers
  }
};
