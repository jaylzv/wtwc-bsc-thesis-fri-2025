import { getBrowserName } from '../../../utils/browser-info.js';
import protection from '../illustrations/protection.js';
import pinExtensionChrome from '../assets/pin-extension-chrome.jpg.js';
import pinExtensionEdge from '../assets/pin-extension-edge.jpg.js';
import pinExtensionOpera from '../assets/pin-extension-opera.jpg.js';
import { html } from '../../../npm/hybrids/src/template/index.js';

/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */


const PIN_EXTENSION_IMAGES = {
  chrome: pinExtensionChrome,
  'edge:desktop': pinExtensionEdge,
  opera: pinExtensionOpera,
};

const Success = {
  browser: getBrowserName,
  render: ({ browser }) => html`
    <template layout="column gap">
      <ui-card data-qa="view:success">
        <section layout="block:center column gap:2">
          <div layout="row center">${protection}</div>
          <ui-text type="display-s">Setup Successful</ui-text>
          <ui-text>
            Ghostery is all set to stop trackers in their tracks and protect
            your privacy while browsing!
          </ui-text>
        </section>
      </ui-card>
      ${PIN_EXTENSION_IMAGES[browser] &&
      html`
        <ui-card>
          <section layout="column gap:2">
            <ui-text type="display-xs" layout="block:center">
              What’s next?
            </ui-text>
            <img
              src="${PIN_EXTENSION_IMAGES[browser]}"
              layout="width:::full"
              style="border-radius:8px; overflow:hidden;"
            />
            <div layout="row items:center gap">
              <ui-icon
                name="extension-${browser}"
                layout="block inline size:3"
                color="gray-400"
              ></ui-icon>
              <ui-text type="label-m">Pin Extension for easy access</ui-text>
            </div>
            <ui-text>
              Click the puzzle icon next to the search bar and pin Ghostery to
              your toolbar.
            </ui-text>
            <ui-text>
              Ghostery will show how many trackers were blocked on a page.
              Clicking on the Ghostery icon reveals more detailed information.
            </ui-text>
          </section>
        </ui-card>
        <onboarding-pin-it browser="${browser}">
          Pin it here
        </onboarding-pin-it>
      `}
    </template>
  `,
};

export { Success as default };
