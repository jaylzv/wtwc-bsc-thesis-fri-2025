import '../npm/@ghostery/adblocker/dist/esm/data-view.js';
import '../npm/@ghostery/adblocker/dist/esm/fetch.js';
import CosmeticFilter from '../npm/@ghostery/adblocker/dist/esm/filters/cosmetic.js';
import { detectFilterType, FilterType, parseFilters } from '../npm/@ghostery/adblocker/dist/esm/lists.js';
import '../npm/@ghostery/adblocker/dist/esm/request.js';
import '../npm/@remusao/small/dist/esm/index.js';
import '../npm/@ghostery/adblocker/dist/esm/filters/network.js';
import '../npm/@ghostery/adblocker/dist/esm/preprocessor.js';
import { createOffscreenConverter } from '../utils/dnr-converter.js';
import { init, create, CUSTOM_ENGINE, FIXES_ENGINE } from '../utils/engines.js';
import { addListener } from '../utils/options-observer.js';
import Options from '../store/options.js';
import CustomFilters from '../store/custom-filters.js';
import { setup, reloadMainEngine } from './adblocker.js';
import store from '../npm/hybrids/src/store.js';

const convert = createOffscreenConverter() ;
class TrustedScriptletError extends Error {
}
function fixScriptlet(filter, trustedScriptlets) {
  const cosmeticFilter = CosmeticFilter.parse(filter);
  if (!cosmeticFilter || !cosmeticFilter.isScriptInject() || !cosmeticFilter.selector) {
    return null;
  }
  const parsedScript = cosmeticFilter.parseScript();
  if (!parsedScript || !parsedScript.name) {
    return null;
  }
  if (!trustedScriptlets && (parsedScript.name === "rpnt" || parsedScript.name === "replace-node-text" || parsedScript.name.startsWith("trusted-"))) {
    throw new TrustedScriptletError();
  }
  const [front] = filter.split(`#+js(${parsedScript.name}`);
  const args = parsedScript.args.map((arg) => encodeURIComponent(arg));
  return `${front}#+js(${[parsedScript.name, ...args].join(", ")})`;
}
function normalizeFilters(text = "", { trustedScriptlets }) {
  const rows = text.split("\n").map((f) => f.trim());
  return rows.reduce(
    (filters, filter, index) => {
      if (!filter) return filters;
      const filterType = detectFilterType(filter, {
        extendedNonSupportedTypes: true
      });
      if (filterType === FilterType.NETWORK) {
        filters.networkFilters.add(filter);
      } else if (filterType === FilterType.COSMETIC) {
        try {
          const scriptlet = fixScriptlet(filter, trustedScriptlets);
          filters.cosmeticFilters.add(scriptlet || filter);
        } catch (e) {
          if (e instanceof TrustedScriptletError) {
            filters.errors.push(
              `Trusted scriptlets are not allowed (${index + 1}): ${filter}`
            );
          } else {
            console.error(e);
          }
        }
      } else if (filterType === FilterType.NOT_SUPPORTED || filterType === FilterType.NOT_SUPPORTED_ADGUARD) {
        filters.errors.push(`Filter not supported (${index + 1}): ${filter}`);
      }
      return filters;
    },
    {
      networkFilters: /* @__PURE__ */ new Set(),
      cosmeticFilters: /* @__PURE__ */ new Set(),
      errors: []
    }
  );
}
async function updateDNRRules(dnrRules) {
  const dynamicRules = (await chrome.declarativeNetRequest.getDynamicRules()).filter(({ id }) => id >= 1e6 && id < 2e6).map(({ id }) => id);
  if (dynamicRules.length) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: dynamicRules
      // ids between 1 and 2 million are reserved for dynamic rules
    });
  }
  if (dnrRules.length) {
    dnrRules = dnrRules.map((rule, index) => ({
      ...rule,
      id: 1e6 + index
    }));
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: dnrRules
    });
    console.info(`[custom filters] DNR updated with rules: ${dnrRules.length}`);
  }
  return dnrRules;
}
async function updateEngine(text) {
  const { networkFilters, cosmeticFilters, preprocessors } = parseFilters(text);
  create(CUSTOM_ENGINE, {
    cosmeticFilters,
    networkFilters,
    preprocessors,
    config: (await init(FIXES_ENGINE)).config
  });
  console.info(
    `[custom filters] Engine updated with network filters: ${networkFilters.length}, cosmetic filters: ${cosmeticFilters.length}`
  );
  return {
    networkFilters: networkFilters.length,
    cosmeticFilters: cosmeticFilters.length
  };
}
async function update(text, { trustedScriptlets }) {
  setup.pending && await setup.pending;
  const { networkFilters, cosmeticFilters, errors } = normalizeFilters(text, {
    trustedScriptlets
  });
  const result = await updateEngine(
    [
      ...[],
      ...cosmeticFilters
    ].join("\n")
  );
  result.errors = errors;
  await reloadMainEngine();
  {
    const dnrResult = await Promise.allSettled(
      [...networkFilters].map((filter) => convert(filter))
    );
    const dnrRules = [];
    for (const result2 of dnrResult) {
      if (result2.value.errors?.length) {
        errors.push(...result2.value.errors);
      }
      for (const rule of result2.value.rules) {
        if (rule.condition.regexFilter) {
          const { isSupported, reason } = await chrome.declarativeNetRequest.isRegexSupported({
            regex: rule.condition.regexFilter
          });
          if (!isSupported) {
            errors.push(
              `Could not apply a custom filter as "${rule.condition.regexFilter}" is a not supported regexp due to: ${reason}`
            );
            continue;
          }
        }
        dnrRules.push(rule);
      }
    }
    result.dnrRules = await updateDNRRules(dnrRules);
  }
  return result;
}
addListener("customFilters", async (value, lastValue) => {
  const { enabled, trustedScriptlets } = value;
  if (!lastValue) {
    if (!enabled) return;
    if (!await init(CUSTOM_ENGINE)) {
      await update((await store.resolve(CustomFilters)).text, {
        trustedScriptlets
      });
    }
  } else {
    if (lastValue.enabled === enabled) {
      return;
    }
    await update(enabled ? (await store.resolve(CustomFilters)).text : "", {
      trustedScriptlets
    });
  }
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "customFilters:update") {
    store.resolve(Options).then((options) => {
      update(msg.input, options.customFilters).then(sendResponse);
    });
    return true;
  }
});
