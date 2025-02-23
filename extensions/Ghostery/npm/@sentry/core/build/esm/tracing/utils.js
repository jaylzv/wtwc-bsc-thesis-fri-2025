const SCOPE_ON_START_SPAN_FIELD = '_sentryScope';
const ISOLATION_SCOPE_ON_START_SPAN_FIELD = '_sentryIsolationScope';

/**
 * Grabs the scope and isolation scope off a span that were active when the span was started.
 */
function getCapturedScopesOnSpan(span) {
  return {
    scope: (span )[SCOPE_ON_START_SPAN_FIELD],
    isolationScope: (span )[ISOLATION_SCOPE_ON_START_SPAN_FIELD],
  };
}

export { getCapturedScopesOnSpan };
