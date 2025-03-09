import { __exports as perf_hooks } from '../../../virtual/perf_hooks2.js';
import require$$0 from '../../../virtual/___vite-browser-external.js';

/* c8 ignore start */

var hasRequiredPerf_hooks;

function requirePerf_hooks () {
	if (hasRequiredPerf_hooks) return perf_hooks;
	hasRequiredPerf_hooks = 1;
	try {
	  const {performance} = require$$0;
	  perf_hooks.performance = performance;
	}
	catch (fallback) {
	  perf_hooks.performance = {now() { return +new Date; }};
	}
	/* c8 ignore stop */
	return perf_hooks;
}

export { requirePerf_hooks as __require };
