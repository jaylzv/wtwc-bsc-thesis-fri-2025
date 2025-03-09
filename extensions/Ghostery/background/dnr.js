import { isPaused, ENGINES } from '../store/options.js';
import { addListener } from '../utils/options-observer.js';

{
  const DNR_RESOURCES = chrome.runtime.getManifest().declarative_net_request.rule_resources.filter(({ enabled }) => !enabled).map(({ id }) => id);
  addListener(async function dnr(options) {
    const globalPause = isPaused(options);
    const ids = ENGINES.map(({ name, key }) => {
      return !globalPause && options.terms && options[key] ? name : "";
    }).filter((id) => id && DNR_RESOURCES.includes(id));
    if (ids.length) {
      ids.push("fixes");
      if (options.regionalFilters.enabled) {
        ids.push(
          ...options.regionalFilters.regions.map((id) => `lang-${id}`).filter((id) => DNR_RESOURCES.includes(id))
        );
      }
    }
    const enabledRulesetIds = await chrome.declarativeNetRequest.getEnabledRulesets() || [];
    const enableRulesetIds = [];
    const disableRulesetIds = [];
    for (const id of ids) {
      if (!enabledRulesetIds.includes(id)) {
        enableRulesetIds.push(id);
      }
    }
    for (const id of enabledRulesetIds) {
      if (!ids.includes(id)) {
        disableRulesetIds.push(id);
      }
    }
    if (enableRulesetIds.length || disableRulesetIds.length) {
      try {
        await chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds,
          disableRulesetIds
        });
        console.info("[dnr] Updated with rulesets:", ids.join(", "));
      } catch (e) {
        console.error(`[dnr] Error while updating rulesets:`, e);
      }
    }
  });
}
