import { DEBUG_BUILD } from '../debug-build.js';
import { WINDOW } from '../helpers.js';
import { defineIntegration } from '../../../../../core/build/esm/integration.js';
import { logger } from '../../../../../core/build/esm/utils-hoist/logger.js';
import { startSession, captureSession } from '../../../../../core/build/esm/exports.js';
import { addHistoryInstrumentationHandler } from '../../../../../../@sentry-internal/browser-utils/build/esm/instrument/history.js';

/**
 * When added, automatically creates sessions which allow you to track adoption and crashes (crash free rate) in your Releases in Sentry.
 * More information: https://docs.sentry.io/product/releases/health/
 *
 * Note: In order for session tracking to work, you need to set up Releases: https://docs.sentry.io/product/releases/
 */
const browserSessionIntegration = defineIntegration(() => {
  return {
    name: 'BrowserSession',
    setupOnce() {
      if (typeof WINDOW.document === 'undefined') {
        DEBUG_BUILD &&
          logger.warn('Using the `browserSessionIntegration` in non-browser environments is not supported.');
        return;
      }

      // The session duration for browser sessions does not track a meaningful
      // concept that can be used as a metric.
      // Automatically captured sessions are akin to page views, and thus we
      // discard their duration.
      startSession({ ignoreDuration: true });
      captureSession();

      // We want to create a session for every navigation as well
      addHistoryInstrumentationHandler(({ from, to }) => {
        // Don't create an additional session for the initial route or if the location did not change
        if (from !== undefined && from !== to) {
          startSession({ ignoreDuration: true });
          captureSession();
        }
      });
    },
  };
});

export { browserSessionIntegration };
