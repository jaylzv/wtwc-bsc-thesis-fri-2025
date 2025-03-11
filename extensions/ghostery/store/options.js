import { DEFAULT_REGIONS } from '../utils/regions.js';
import { isOpera } from '../utils/browser-info.js';
import { execute } from '../utils/options-observer.js';
import CustomFilters from './custom-filters.js';
import store from '../npm/hybrids/src/store.js';

const UPDATE_OPTIONS_ACTION_NAME = "updateOptions";
const GLOBAL_PAUSE_ID = "<all_urls>";
const SYNC_OPTIONS = [
  "blockAds",
  "blockTrackers",
  "blockAnnoyances",
  "regionalFilters",
  "customFilters",
  "experimentalFilters",
  "trackerWheel",
  "trackerCount",
  "wtmSerpReport",
  "serpTrackingPrevention",
  "panel"
];
const ENGINES = [
  { name: "ads", key: "blockAds" },
  { name: "tracking", key: "blockTrackers" },
  { name: "annoyances", key: "blockAnnoyances" }
];
const OPTIONS_VERSION = 3;
const Options = {
  // Main features
  blockAds: true,
  blockTrackers: true,
  blockAnnoyances: true,
  // Regional filters
  regionalFilters: {
    enabled: DEFAULT_REGIONS.length > 0,
    regions: DEFAULT_REGIONS.length ? DEFAULT_REGIONS : [String]
  },
  // Advanced features
  customFilters: {
    enabled: false,
    trustedScriptlets: false
  },
  experimentalFilters: false,
  filtersUpdatedAt: 0,
  // Browser toolbar icon
  trackerWheel: false,
  ...{ trackerCount: true } ,
  // SERP
  wtmSerpReport: true,
  serpTrackingPrevention: true,
  // Onboarding
  terms: false,
  feedback: true,
  onboarding: {
    shown: 0,
    ...isOpera() ? { serpShownAt: 0, serpShown: 0 } : {}
  },
  installDate: "",
  // Panel
  panel: { statsType: "graph" },
  // Pause
  paused: store.record({ revokeAt: 0 }),
  // Sync
  sync: true,
  revision: 0,
  // Managed
  managed: false,
  [store.connect]: {
    async get() {
      let { options = {}, optionsVersion } = await chrome.storage.local.get([
        "options",
        "optionsVersion"
      ]);
      if (!optionsVersion) {
        chrome.storage.local.set({ optionsVersion: OPTIONS_VERSION });
      } else if (optionsVersion < OPTIONS_VERSION) {
        await migrate(options, optionsVersion);
      }
      {
        return manage(options);
      }
    },
    async set(_, options) {
      options = options || {};
      await chrome.storage.local.set({
        options: (
          // Firefox does not serialize correctly objects with getters
          options
        )
      });
      chrome.runtime.sendMessage({
        action: UPDATE_OPTIONS_ACTION_NAME
      }).catch(() => {
      });
      return options;
    },
    observe: (_, options, prevOptions) => {
      execute(options, prevOptions);
    }
  }
};
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_OPTIONS_ACTION_NAME) {
    store.clear(Options, false);
    store.get(Options);
  }
});
async function migrate(options, optionsVersion) {
  if (optionsVersion < 2) {
    if (options.paused) {
      options.paused = options.paused.reduce((acc, { id, revokeAt }) => {
        acc[id] = { revokeAt };
        return acc;
      }, {});
    }
    console.debug("[options] Migrated to version 2:", options);
  }
  if (optionsVersion < 3) {
    const { text } = await store.resolve(CustomFilters);
    if (text) {
      options.customFilters = {
        ...options.customFilters,
        enabled: true
      };
    }
    console.debug("[options] Migrated to version 3:", options);
  }
  await chrome.storage.local.set({
    options,
    optionsVersion: OPTIONS_VERSION
  });
}
let managed = isOpera() ? false : null;
async function manage(options) {
  if (managed === false) return options;
  if (managed === null) {
    try {
      managed = await chrome.storage.managed.get(null);
      managed = Object.keys(managed).length > 0 ? managed : false;
    } catch {
      managed = false;
    }
  }
  if (managed) {
    console.debug(`[options] Applying managed options...`, managed);
    if (managed.disableOnboarding === true) {
      options.terms = true;
      options.onboarding = { shown: 1 };
    }
    if (managed.disableUserControl === true) {
      options.managed = true;
      options.sync = false;
      options.paused = {};
    }
    if (Array.isArray(managed.trustedDomains)) {
      managed.trustedDomains.forEach((domain) => {
        options.paused ||= {};
        options.paused[domain] = { revokeAt: 0 };
      });
    }
  }
  return options;
}
function isPaused(options, hostname = "") {
  if (options.paused[GLOBAL_PAUSE_ID]) return true;
  return !!hostname && Object.keys(options.paused).some((id) => hostname.endsWith(id));
}

export { ENGINES, GLOBAL_PAUSE_ID, SYNC_OPTIONS, Options as default, isPaused };
