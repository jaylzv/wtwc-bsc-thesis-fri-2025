import Options, { GLOBAL_PAUSE_ID } from '../store/options.js';
import { addListener } from '../utils/options-observer.js';
import store from '../npm/hybrids/src/store.js';

const PAUSED_ALARM_PREFIX = "options:revoke";
const PAUSED_RULE_PRIORITY = 1e7;
const ALL_RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "media",
  "websocket",
  "webtransport",
  "webbundle",
  "other"
];
addListener("paused", async (paused, prevPaused) => {
  const alarms = (await chrome.alarms.getAll()).filter(
    ({ name }) => name.startsWith(PAUSED_ALARM_PREFIX)
  );
  const revokeHostnames = Object.entries(paused).filter(
    ([, { revokeAt }]) => revokeAt
  );
  alarms.forEach(({ name }) => {
    if (!revokeHostnames.find(([id]) => name === `${PAUSED_ALARM_PREFIX}:${id}`)) {
      chrome.alarms.clear(name);
    }
  });
  if (revokeHostnames.length) {
    revokeHostnames.filter(([id]) => !alarms.some(({ name }) => name === id)).forEach(([id, { revokeAt }]) => {
      chrome.alarms.create(`${PAUSED_ALARM_PREFIX}:${id}`, {
        when: revokeAt
      });
    });
  }
  if (prevPaused || (await store.resolve(Options)).managed) {
    const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules()).filter(({ id }) => id <= 3).map(({ id }) => id);
    const hostnames = Object.keys(paused);
    let globalPause = false;
    if (hostnames.includes(GLOBAL_PAUSE_ID)) {
      globalPause = true;
    }
    if (hostnames.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: PAUSED_RULE_PRIORITY,
            action: { type: "allow" },
            condition: {
              initiatorDomains: globalPause ? void 0 : hostnames,
              resourceTypes: ALL_RESOURCE_TYPES
            }
          },
          {
            id: 2,
            priority: PAUSED_RULE_PRIORITY,
            action: { type: "allow" },
            condition: {
              requestDomains: globalPause ? void 0 : hostnames,
              resourceTypes: ALL_RESOURCE_TYPES
            }
          },
          {
            id: 3,
            priority: PAUSED_RULE_PRIORITY,
            action: { type: "allowAllRequests" },
            condition: {
              initiatorDomains: globalPause ? void 0 : hostnames,
              resourceTypes: ["main_frame", "sub_frame"]
            }
          }
        ],
        removeRuleIds
      });
      console.log("[dnr] Pause rules updated");
    } else if (removeRuleIds.length) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds
      });
      console.log("[dnr] Pause rules cleared");
    }
  }
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith(PAUSED_ALARM_PREFIX)) {
    const id = alarm.name.slice(PAUSED_ALARM_PREFIX.length + 1);
    store.set(Options, { paused: { [id]: null } });
  }
});
