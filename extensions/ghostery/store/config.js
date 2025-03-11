import store from '../npm/hybrids/src/store.js';

const ACTION_DISABLE_AUTOCONSENT = "disable-autoconsent";
const ACTION_DISABLE_ANTITRACKING_MODIFICATION = "disable-antitracking-modification";
const ACTION_ASSIST = "assist";
const Config = {
  enabled: true,
  updatedAt: 0,
  domains: store.record({
    actions: [String]
  }),
  flags: store.record({
    percentage: 0,
    enabled: false
  }),
  // Helper methods
  hasAction({ domains, enabled }) {
    const hostnames = /* @__PURE__ */ new Map();
    return (hostname, action) => {
      if (!enabled || !hostname) return;
      let actions = hostnames.get(hostname);
      if (!actions) {
        actions = /* @__PURE__ */ new Map();
        hostnames.set(hostname, actions);
      }
      if (!actions.has(action)) {
        const domain = Object.keys(domains).find((d) => hostname.endsWith(d));
        const value = !!domain && domains[domain].actions.includes(action);
        actions.set(action, value);
        return value;
      }
      return actions.get(action);
    };
  },
  hasFlag({ flags, enabled }) {
    return (flag) => enabled && !!(flag && flags[flag]?.enabled);
  },
  [store.connect]: {
    async get() {
      const { config = {} } = await chrome.storage.local.get(["config"]);
      return config;
    },
    async set(_, values) {
      values ||= {};
      await chrome.storage.local.set({
        config: values
      });
      return values;
    }
  }
};
chrome.storage.onChanged.addListener((changes) => {
  if (changes["config"]) store.clear(Config, false);
});

export { ACTION_ASSIST, ACTION_DISABLE_ANTITRACKING_MODIFICATION, ACTION_DISABLE_AUTOCONSENT, Config as default };
