import '../npm/@ghostery/adblocker/dist/esm/data-view.js';
import '../npm/@ghostery/adblocker/dist/esm/fetch.js';
import '../npm/@ghostery/adblocker/dist/esm/filters/cosmetic.js';
import { parseFilter } from '../npm/@ghostery/adblocker/dist/esm/lists.js';
import '../npm/@ghostery/adblocker/dist/esm/request.js';
import '../npm/@remusao/small/dist/esm/index.js';
import '../npm/@ghostery/adblocker/dist/esm/filters/network.js';
import '../npm/@ghostery/adblocker/dist/esm/preprocessor.js';
import { addListener } from '../utils/options-observer.js';
import { getTracker } from '../utils/trackerdb.js';
import { createOffscreenConverter } from '../utils/dnr-converter.js';

let exceptions = {};
chrome.storage.local.get(["exceptions"]).then(({ exceptions: value }) => {
  exceptions = value || {};
});
chrome.storage.onChanged.addListener((records) => {
  if (records.exceptions) {
    exceptions = records.exceptions.newValue || {};
    {
      updateFilters();
    }
  }
});
function getException(id) {
  return exceptions[id];
}
const convert = createOffscreenConverter() ;
async function updateFilters() {
  const rules = [];
  for (const exception of Object.values(exceptions)) {
    if (exception.blocked && exception.trustedDomains.length === 0) {
      continue;
    }
    const tracker = await getTracker(exception.id) || {
      domains: [exception.id],
      filters: []
    };
    const filters = tracker.filters.concat(tracker.domains.map((domain) => `||${domain}^`)).map((f) => parseFilter(f)).filter((filter) => filter.isNetworkFilter()).map((filter) => `@@${filter.toString()}`);
    const domains = exception.blocked ? exception.trustedDomains : void 0;
    const excludedDomains = !exception.blocked && exception.blockedDomains.length ? exception.blockedDomains : void 0;
    for (const filter of filters) {
      try {
        const result = (await convert(filter.toString())).rules;
        for (const rule of result) {
          if (rule.condition.regexFilter) {
            const { isSupported, reason } = await chrome.declarativeNetRequest.isRegexSupported({
              regex: rule.condition.regexFilter
            });
            if (!isSupported) {
              console.error(
                `Could not add an exception for "${tracker.name}" as filter "${filter.toString()}" is a not supported regexp due to: ${reason}`
              );
              continue;
            }
          }
          rules.push({
            ...rule,
            condition: {
              ...rule.condition,
              // Add domain condition to the rule
              ...false ? {
                domains: domains && domains.map((d) => `*${d}`).concat(rule.condition.domains || []),
                excludedDomains: excludedDomains && excludedDomains.map((d) => `*${d}`).concat(rule.condition.excludedDomains || [])
              } : {
                initiatorDomains: domains && domains.concat(rule.condition.initiatorDomains || []),
                excludedInitiatorDomains: excludedDomains && excludedDomains.concat(
                  rule.condition.excludedInitiatorDomains || []
                )
              }
            },
            // Internal prefix + priority
            priority: 2e6 + rule.priority
          });
        }
      } catch (e) {
        console.error("[exceptions] Error while converting filter:", e);
      }
    }
  }
  const addRules = rules.map((rule, index) => ({
    ...rule,
    id: 2e6 + index
  }));
  const removeRuleIds = (await chrome.declarativeNetRequest.getDynamicRules()).filter(({ id }) => id >= 2e6).map(({ id }) => id);
  if (addRules.length || removeRuleIds.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules,
      removeRuleIds
    });
    console.info("[exceptions] Updated DNR rules");
  }
}
{
  addListener(
    "filtersUpdatedAt",
    async function updateExceptions(value, lastValue) {
      if (lastValue !== void 0 && value !== 0) {
        await updateFilters();
      }
    }
  );
}

export { getException };
